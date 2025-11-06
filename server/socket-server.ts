import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import type { Socket } from 'socket.io';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  Player,
  Room,
  GameState,
  Guess,
} from '@/types/game';
import {
  checkGuess,
  isWinningGuess,
  validateWordFormat,
  validatePlayerName,
  validateRoomId,
  sanitizeInput,
  MAX_ATTEMPTS,
  calculateProgress,
} from '@/lib/game-logic';
import { isValidWord, getRandomWord } from '@/lib/words';

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

// Armazenamento em memória das salas
const rooms = new Map<string, Room>();

// Rate limiting por IP
const rateLimits = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const RATE_LIMIT_MAX = 100; // 100 ações por minuto

// Limite de jogadores por sala
const MAX_PLAYERS_PER_ROOM = 1000;

// Limpeza automática de salas antigas (1 hora de inatividade)
const ROOM_TIMEOUT = 60 * 60 * 1000;

/**
 * Verifica rate limiting
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimits.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimits.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (limit.count >= RATE_LIMIT_MAX) {
    return false;
  }

  limit.count++;
  return true;
}

/**
 * Converte Map de players para array
 */
function getGameState(room: Room): GameState {
  return {
    roomId: room.id,
    players: Array.from(room.players.values()),
    winner: room.winner,
    gameEnded: room.gameEnded,
  };
}

/**
 * Limpa salas antigas
 */
function cleanupOldRooms() {
  const now = Date.now();
  for (const [roomId, room] of rooms.entries()) {
    const lastActivity = Math.max(
      ...Array.from(room.players.values()).map(p => p.lastUpdate),
      room.createdAt
    );

    if (now - lastActivity > ROOM_TIMEOUT) {
      rooms.delete(roomId);
      console.log(`Sala ${roomId} removida por inatividade`);
    }
  }
}

// Executa limpeza a cada 10 minutos
setInterval(cleanupOldRooms, 10 * 60 * 1000);

/**
 * Inicializa o servidor Socket.io
 */
export function initializeSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production'
        ? process.env.NEXT_PUBLIC_APP_URL
        : 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
    // Configurações para suportar muitas conexões
    maxHttpBufferSize: 1e6, // 1MB
    pingTimeout: 60000,
    pingInterval: 25000,
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket: TypedSocket) => {
    const ip = socket.handshake.address;
    console.log(`Cliente conectado: ${socket.id} (IP: ${ip})`);

    // Entrar em uma sala
    socket.on('join:room', ({ roomId, playerName }) => {
      try {
        // Rate limiting
        if (!checkRateLimit(ip)) {
          socket.emit('room:error', { message: 'Muitas requisições. Aguarde um momento.' });
          return;
        }

        // Validações
        const roomValidation = validateRoomId(roomId);
        if (!roomValidation.valid) {
          socket.emit('room:error', { message: roomValidation.message! });
          return;
        }

        const nameValidation = validatePlayerName(playerName);
        if (!nameValidation.valid) {
          socket.emit('room:error', { message: nameValidation.message! });
          return;
        }

        const sanitizedRoomId = sanitizeInput(roomId);
        const sanitizedName = sanitizeInput(playerName);

        // Criar sala se não existir
        if (!rooms.has(sanitizedRoomId)) {
          rooms.set(sanitizedRoomId, {
            id: sanitizedRoomId,
            word: getRandomWord(),
            players: new Map(),
            winner: null,
            gameEnded: false,
            createdAt: Date.now(),
          });
          console.log(`Sala ${sanitizedRoomId} criada com palavra: ${rooms.get(sanitizedRoomId)!.word}`);
        }

        const room = rooms.get(sanitizedRoomId)!;

        // Verificar limite de jogadores
        if (room.players.size >= MAX_PLAYERS_PER_ROOM) {
          socket.emit('room:error', { message: 'Sala cheia! Máximo de jogadores atingido.' });
          return;
        }

        // Verificar se nome já existe na sala
        const nameExists = Array.from(room.players.values()).some(
          p => p.name.toLowerCase() === sanitizedName.toLowerCase()
        );

        if (nameExists) {
          socket.emit('room:error', { message: 'Esse nome já está em uso nesta sala.' });
          return;
        }

        // Criar jogador
        const player: Player = {
          id: socket.id,
          name: sanitizedName,
          guesses: [],
          currentGuess: '',
          gameStatus: room.gameEnded ? 'lost' : 'playing',
          attempts: 0,
          lastUpdate: Date.now(),
        };

        room.players.set(socket.id, player);
        socket.join(sanitizedRoomId);

        // Notificar jogador que entrou
        socket.emit('room:joined', {
          playerId: socket.id,
          gameState: getGameState(room),
        });

        // Notificar todos os jogadores sobre a atualização
        io.to(sanitizedRoomId).emit('game:updated', getGameState(room));

        console.log(`Jogador ${sanitizedName} entrou na sala ${sanitizedRoomId}`);
      } catch (error) {
        console.error('Erro ao entrar na sala:', error);
        socket.emit('room:error', { message: 'Erro ao entrar na sala' });
      }
    });

    // Processar tentativa
    socket.on('game:guess', ({ roomId, word }) => {
      try {
        // Rate limiting
        if (!checkRateLimit(ip)) {
          return;
        }

        const room = rooms.get(roomId);
        if (!room) {
          socket.emit('room:error', { message: 'Sala não encontrada' });
          return;
        }

        const player = room.players.get(socket.id);
        if (!player) {
          socket.emit('room:error', { message: 'Jogador não encontrado' });
          return;
        }

        // Verificar se o jogo já terminou
        if (room.gameEnded) {
          socket.emit('game:guess:result', {
            playerId: socket.id,
            guess: { word: '', letters: [] },
            isValid: false,
            message: 'O jogo já terminou!',
          });
          return;
        }

        // Verificar se jogador já ganhou ou perdeu
        if (player.gameStatus !== 'playing') {
          return;
        }

        // Validar formato da palavra
        const formatValidation = validateWordFormat(word);
        if (!formatValidation.valid) {
          socket.emit('game:guess:result', {
            playerId: socket.id,
            guess: { word: '', letters: [] },
            isValid: false,
            message: formatValidation.message,
          });
          return;
        }

        // Verificar se a palavra existe no dicionário
        if (!isValidWord(word)) {
          socket.emit('game:guess:result', {
            playerId: socket.id,
            guess: { word: '', letters: [] },
            isValid: false,
            message: 'Palavra não encontrada no dicionário',
          });
          return;
        }

        // Verificar tentativa
        const guess: Guess = checkGuess(word, room.word);
        const won = isWinningGuess(guess);

        player.guesses.push(guess);
        player.attempts++;
        player.currentGuess = '';
        player.lastUpdate = Date.now();

        if (won) {
          player.gameStatus = 'won';
          room.winner = socket.id;
          room.gameEnded = true;

          // Marcar todos os outros jogadores como perdedores
          for (const [id, p] of room.players.entries()) {
            if (id !== socket.id && p.gameStatus === 'playing') {
              p.gameStatus = 'lost';
            }
          }

          // Notificar todos sobre o fim do jogo
          io.to(roomId).emit('game:ended', {
            winner: player,
            word: room.word,
            finalState: getGameState(room),
          });

          console.log(`Jogador ${player.name} ganhou na sala ${roomId}!`);
        } else if (player.attempts >= MAX_ATTEMPTS) {
          player.gameStatus = 'lost';

          // Verificar se todos perderam
          const allLost = Array.from(room.players.values()).every(
            p => p.gameStatus === 'lost'
          );

          if (allLost) {
            room.gameEnded = true;
            io.to(roomId).emit('game:ended', {
              winner: player, // Tecnicamente não há vencedor, mas precisa de um player
              word: room.word,
              finalState: getGameState(room),
            });
          }
        }

        // Enviar resultado da tentativa
        socket.emit('game:guess:result', {
          playerId: socket.id,
          guess,
          isValid: true,
        });

        // Atualizar estado do jogo para todos
        io.to(roomId).emit('game:updated', getGameState(room));
      } catch (error) {
        console.error('Erro ao processar tentativa:', error);
        socket.emit('room:error', { message: 'Erro ao processar tentativa' });
      }
    });

    // Atualizar letra atual
    socket.on('game:letter', ({ roomId, letter }) => {
      try {
        const room = rooms.get(roomId);
        if (!room) return;

        const player = room.players.get(socket.id);
        if (!player || player.gameStatus !== 'playing') return;

        player.currentGuess = letter.toUpperCase().slice(0, 5);
        player.lastUpdate = Date.now();

        // Notificar todos sobre a atualização
        io.to(roomId).emit('player:updated', {
          playerId: socket.id,
          currentGuess: player.currentGuess,
        });
      } catch (error) {
        console.error('Erro ao atualizar letra:', error);
      }
    });

    // Backspace
    socket.on('game:backspace', ({ roomId }) => {
      try {
        const room = rooms.get(roomId);
        if (!room) return;

        const player = room.players.get(socket.id);
        if (!player || player.gameStatus !== 'playing') return;

        player.currentGuess = player.currentGuess.slice(0, -1);
        player.lastUpdate = Date.now();

        // Notificar todos sobre a atualização
        io.to(roomId).emit('player:updated', {
          playerId: socket.id,
          currentGuess: player.currentGuess,
        });
      } catch (error) {
        console.error('Erro ao processar backspace:', error);
      }
    });

    // Desconexão
    socket.on('disconnect', () => {
      console.log(`Cliente desconectado: ${socket.id}`);

      // Remover jogador de todas as salas
      for (const [roomId, room] of rooms.entries()) {
        if (room.players.has(socket.id)) {
          room.players.delete(socket.id);

          // Se a sala ficou vazia, remover após um tempo
          if (room.players.size === 0) {
            setTimeout(() => {
              if (rooms.get(roomId)?.players.size === 0) {
                rooms.delete(roomId);
                console.log(`Sala ${roomId} removida (vazia)`);
              }
            }, 5 * 60 * 1000); // 5 minutos
          } else {
            // Notificar outros jogadores
            io.to(roomId).emit('game:updated', getGameState(room));
          }
        }
      }
    });
  });

  console.log('Servidor Socket.io inicializado');

  return io;
}

export { rooms };
