const { io } = require('socket.io-client');

// Configurações
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const ROOM_ID = process.env.ROOM_ID || 'salajogo';
const NUM_PLAYERS = parseInt(process.env.NUM_PLAYERS || '50');
const DELAY_BETWEEN_CONNECTIONS = parseInt(process.env.DELAY || '100');

// Palavras para tentar (mix de válidas e inválidas)
const TEST_WORDS = [
  'TESTE', 'CARRO', 'TERMO', 'JOGO', 'LIVRE',
  'TEMPO', 'CASA', 'MESA', 'PORTA', 'JANELA',
  'BARBA', 'MORTE', 'BEIJO', 'VERDE', 'BRAVO',
  'CLARO', 'DOIDO', 'FALAR', 'GENTE', 'LIMPO',
  'MAIOR', 'NOBRE', 'PERDA', 'QUEDA', 'RITMO'
];

console.log(`
╔════════════════════════════════════════════════════════════╗
║        TESTE AO VIVO - Sala com Múltiplos Jogadores       ║
╚════════════════════════════════════════════════════════════╝

📍 Servidor:  ${SERVER_URL}
🎮 Sala:      ${ROOM_ID}
👥 Jogadores: ${NUM_PLAYERS}
⏱️  Delay:     ${DELAY_BETWEEN_CONNECTIONS}ms entre conexões

🎯 INSTRUÇÕES:
1. Abra o jogo no navegador
2. Entre na sala: "${ROOM_ID}"
3. Digite seu nome
4. Observe o ranking e performance da UI
5. Os bots vão começar a entrar e jogar automaticamente

Iniciando em 3 segundos...
`);

// Estatísticas
const stats = {
  connected: 0,
  playing: 0,
  guesses: 0,
  errors: 0,
};

// Array de sockets
const players = [];

// Aguardar 3 segundos antes de começar
setTimeout(() => {
  console.log('\n🚀 Iniciando simulação...\n');
  startSimulation();
}, 3000);

function startSimulation() {
  for (let i = 1; i <= NUM_PLAYERS; i++) {
    setTimeout(() => {
      createPlayer(i);
    }, i * DELAY_BETWEEN_CONNECTIONS);
  }

  // Monitor de status a cada 5 segundos
  setInterval(() => {
    console.log(`
╔════════════════════════════════════════╗
║         STATUS DA SIMULAÇÃO            ║
╠════════════════════════════════════════╣
║ Conectados:  ${stats.connected.toString().padStart(3)} / ${NUM_PLAYERS}       ║
║ Jogando:     ${stats.playing.toString().padStart(3)} / ${NUM_PLAYERS}       ║
║ Tentativas:  ${stats.guesses.toString().padStart(3)}               ║
║ Erros:       ${stats.errors.toString().padStart(3)}               ║
╚════════════════════════════════════════╝
    `);
  }, 5000);
}

function createPlayer(index) {
  const playerName = `Bot${index}`;

  const socket = io(SERVER_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
  });

  socket.on('connect', () => {
    stats.connected++;
    console.log(`✓ ${playerName} conectado (${stats.connected}/${NUM_PLAYERS})`);

    // Entrar na sala
    socket.emit('join:room', {
      roomId: ROOM_ID,
      playerName,
    });
  });

  socket.on('room:joined', ({ playerId }) => {
    stats.playing++;
    console.log(`🎮 ${playerName} entrou na sala (${stats.playing}/${NUM_PLAYERS})`);

    // Simular jogo: digitar letras e enviar tentativas
    startPlaying(socket, playerName);
  });

  socket.on('room:error', ({ message }) => {
    stats.errors++;
    console.error(`❌ ${playerName} erro: ${message}`);
  });

  socket.on('game:guess:result', ({ isValid, message }) => {
    if (isValid) {
      stats.guesses++;
    }
  });

  socket.on('game:ended', ({ winner }) => {
    console.log(`🏆 Jogo terminou! Vencedor: ${winner.name}`);
  });

  socket.on('disconnect', () => {
    stats.connected--;
    stats.playing--;
  });

  socket.on('connect_error', (error) => {
    stats.errors++;
  });

  players.push({ socket, name: playerName });
}

function startPlaying(socket, playerName) {
  // Aguardar um tempo aleatório antes de começar a jogar
  const initialDelay = Math.random() * 3000;

  setTimeout(() => {
    playTurn(socket, playerName);
  }, initialDelay);
}

function playTurn(socket, playerName) {
  // Escolher palavra aleatória
  const word = TEST_WORDS[Math.floor(Math.random() * TEST_WORDS.length)];

  // Simular digitação letra por letra
  let currentWord = '';

  for (let i = 0; i < word.length; i++) {
    setTimeout(() => {
      currentWord += word[i];
      socket.emit('game:letter', {
        roomId: ROOM_ID,
        letter: currentWord,
      });
    }, i * 200); // 200ms entre cada letra
  }

  // Enviar tentativa após digitar todas as letras
  setTimeout(() => {
    socket.emit('game:guess', {
      roomId: ROOM_ID,
      word: word,
    });

    // Aguardar um pouco e jogar novamente
    setTimeout(() => {
      // 70% de chance de jogar novamente
      if (Math.random() < 0.7) {
        playTurn(socket, playerName);
      }
    }, 2000 + Math.random() * 3000); // 2-5 segundos
  }, word.length * 200 + 500);
}

// Capturar Ctrl+C para desconectar todos
process.on('SIGINT', () => {
  console.log('\n\n🛑 Encerrando simulação...');
  console.log('Desconectando todos os jogadores...');

  players.forEach(({ socket, name }) => {
    socket.disconnect();
  });

  setTimeout(() => {
    console.log('\n✅ Todos os jogadores desconectados.');
    console.log(`
╔════════════════════════════════════════╗
║         ESTATÍSTICAS FINAIS            ║
╠════════════════════════════════════════╣
║ Total de tentativas: ${stats.guesses.toString().padStart(3)}          ║
║ Total de erros:      ${stats.errors.toString().padStart(3)}          ║
╚════════════════════════════════════════╝
    `);
    process.exit(0);
  }, 1000);
});

// Manter o script rodando
process.stdin.resume();
