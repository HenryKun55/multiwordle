const { Server: SocketIOServer } = require('socket.io');
const {
  checkGuess,
  isWinningGuess,
  validateWordFormat,
  validatePlayerName,
  validateRoomId,
  sanitizeInput,
  MAX_ATTEMPTS,
} = require('../lib/game-logic');
const { isValidWord, getRandomWord } = require('../lib/words');

// Armazenamento em memória das salas
const rooms = new Map();

// Armazenamento de sessões de jogadores (para reconexão)
const playerSessions = new Map();

// Rate limiting por IP
const rateLimits = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minuto
const RATE_LIMIT_MAX = 100; // 100 ações por minuto

// Limite de jogadores por sala
const MAX_PLAYERS_PER_ROOM = 50;

// Limite GLOBAL de conexões simultâneas (para não derrubar o servidor)
const MAX_GLOBAL_CONNECTIONS = 100;
let activeConnections = 0;

// Limpeza automática de salas antigas (1 hora de inatividade)
const ROOM_TIMEOUT = 60 * 60 * 1000;

// Tempo máximo para reconexão (5 minutos)
const RECONNECT_TIMEOUT = 5 * 60 * 1000;

/**
 * Verifica rate limiting
 */
function checkRateLimit(ip) {
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
function getGameState(room) {
  return {
    roomId: room.id,
    players: Array.from(room.players.values()),
    winner: room.winner,
    gameEnded: room.gameEnded,
  };
}

/**
 * Salva sessão do jogador para possível reconexão
 */
function savePlayerSession(playerId, roomId, playerData) {
  playerSessions.set(playerId, {
    roomId,
    playerData,
    disconnectedAt: Date.now(),
  });

  // Remove sessão após timeout de reconexão
  setTimeout(() => {
    playerSessions.delete(playerId);
  }, RECONNECT_TIMEOUT);
}

/**
 * Recupera sessão do jogador
 */
function getPlayerSession(playerId) {
  return playerSessions.get(playerId);
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
function initializeSocket(httpServer) {
  const io = new SocketIOServer(httpServer, {
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

  io.on('connection', (socket) => {
    const ip = socket.handshake.address;

    // Verificar limite global de conexões
    if (activeConnections >= MAX_GLOBAL_CONNECTIONS) {
      console.log(`Conexão rejeitada por limite global: ${socket.id}`);
      socket.emit('server:full', {
        message: 'Servidor cheio! Tente novamente em alguns minutos.',
        currentConnections: activeConnections,
        maxConnections: MAX_GLOBAL_CONNECTIONS,
      });
      socket.disconnect(true);
      return;
    }

    activeConnections++;
    console.log(`Cliente conectado: ${socket.id} (IP: ${ip}) - Total: ${activeConnections}/${MAX_GLOBAL_CONNECTIONS}`);

    // Entrar em uma sala (ou reconectar)
    socket.on('join:room', ({ roomId, playerName, reconnectId }) => {
      try {
        // Rate limiting
        if (!checkRateLimit(ip)) {
          socket.emit('room:error', { message: 'Muitas requisições. Aguarde um momento.' });
          return;
        }

        // Validações
        const roomValidation = validateRoomId(roomId);
        if (!roomValidation.valid) {
          socket.emit('room:error', { message: roomValidation.message });
          return;
        }

        const nameValidation = validatePlayerName(playerName);
        if (!nameValidation.valid) {
          socket.emit('room:error', { message: nameValidation.message });
          return;
        }

        const sanitizedRoomId = sanitizeInput(roomId);
        const sanitizedName = sanitizeInput(playerName);

        // Tentar reconectar com sessão salva
        if (reconnectId) {
          const session = getPlayerSession(reconnectId);
          if (session && session.roomId === sanitizedRoomId) {
            const room = rooms.get(sanitizedRoomId);
            if (room) {
              // Restaurar jogador com novo socket ID
              const oldPlayerData = session.playerData;
              const restoredPlayer = {
                ...oldPlayerData,
                id: socket.id,
                lastUpdate: Date.now(),
              };

              room.players.set(socket.id, restoredPlayer);
              socket.join(sanitizedRoomId);

              socket.emit('room:joined', {
                playerId: socket.id,
                gameState: getGameState(room),
                reconnected: true,
              });

              io.to(sanitizedRoomId).emit('game:updated', getGameState(room));
              console.log(`Jogador ${restoredPlayer.name} reconectado na sala ${sanitizedRoomId}`);

              // Limpar sessão antiga
              playerSessions.delete(reconnectId);
              return;
            }
          }
        }

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
          console.log(`Sala ${sanitizedRoomId} criada com palavra: ${rooms.get(sanitizedRoomId).word}`);
        }

        const room = rooms.get(sanitizedRoomId);

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
        const player = {
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
        const guess = checkGuess(word, room.word);
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
              winner: player,
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
      activeConnections--;
      console.log(`Cliente desconectado: ${socket.id} - Total: ${activeConnections}/${MAX_GLOBAL_CONNECTIONS}`);

      // Salvar sessão para possível reconexão
      for (const [roomId, room] of rooms.entries()) {
        if (room.players.has(socket.id)) {
          const playerData = room.players.get(socket.id);

          // Salvar sessão apenas se o jogo ainda está ativo
          if (!room.gameEnded && playerData.gameStatus === 'playing') {
            savePlayerSession(socket.id, roomId, playerData);
            console.log(`Sessão salva para reconexão: ${playerData.name} (${socket.id})`);
          }

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

module.exports = { initializeSocket, rooms };
