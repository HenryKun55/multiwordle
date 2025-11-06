const { io } = require('socket.io-client');

// Configurações do teste
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const ROOM_ID = process.env.ROOM_ID || 'teste-carga';
const NUM_PLAYERS = parseInt(process.env.NUM_PLAYERS || '1000');
const DELAY_BETWEEN_CONNECTIONS = parseInt(process.env.DELAY || '10'); // ms entre cada conexão
const TEST_DURATION = parseInt(process.env.DURATION || '60000'); // ms de duração do teste (padrão: 60s)

// Palavras de teste para enviar
const TEST_WORDS = ['TESTE', 'CARRO', 'TERMO', 'JOGO', 'LIVRE', 'TEMPO'];

// Estatísticas
const stats = {
  connected: 0,
  disconnected: 0,
  errors: 0,
  joined: 0,
  guesses: 0,
  messagesSent: 0,
  messagesReceived: 0,
  startTime: Date.now(),
  connectionTimes: [],
  joinTimes: [],
  responseTimes: [],
  peakMemory: 0,
};

// Array para armazenar os sockets
const sockets = [];

console.log(`
===================================
TESTE DE CARGA - MultiWordle
===================================
Servidor: ${SERVER_URL}
Sala: ${ROOM_ID}
Jogadores: ${NUM_PLAYERS}
Delay: ${DELAY_BETWEEN_CONNECTIONS}ms
Duração: ${TEST_DURATION / 1000}s
===================================
`);

// Monitor de memória
setInterval(() => {
  const memUsage = process.memoryUsage();
  const memMB = (memUsage.heapUsed / 1024 / 1024).toFixed(2);
  stats.peakMemory = Math.max(stats.peakMemory, parseFloat(memMB));
}, 1000);

// Criar um jogador simulado
function createPlayer(index) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const playerName = `Player${index}`;
      const connectStart = Date.now();

      const socket = io(SERVER_URL, {
        transports: ['websocket', 'polling'],
        reconnection: false,
      });

      socket.on('connect', () => {
        const connectTime = Date.now() - connectStart;
        stats.connectionTimes.push(connectTime);
        stats.connected++;

        if (stats.connected % 100 === 0 || stats.connected === NUM_PLAYERS) {
          console.log(`[${stats.connected}/${NUM_PLAYERS}] ${playerName} conectado (${connectTime}ms)`);
        }

        // Entrar na sala
        const joinStart = Date.now();
        socket.emit('join:room', {
          roomId: ROOM_ID,
          playerName,
        });
        stats.messagesSent++;
      });

      socket.on('room:joined', ({ playerId }) => {
        const joinTime = Date.now() - connectStart;
        stats.joinTimes.push(joinTime);
        stats.joined++;
        stats.messagesReceived++;

        if (stats.joined % 100 === 0 || stats.joined === NUM_PLAYERS) {
          console.log(`✓ ${playerName} entrou na sala (${stats.joined}/${NUM_PLAYERS}) - ${joinTime}ms`);
        }

        // Simular jogo: enviar algumas tentativas aleatoriamente
        const numGuesses = Math.floor(Math.random() * 3) + 1;
        let guessCount = 0;

        const sendGuess = () => {
          if (guessCount >= numGuesses) return;

          const word = TEST_WORDS[Math.floor(Math.random() * TEST_WORDS.length)];
          const guessStart = Date.now();

          // Simular digitação letra por letra
          for (let i = 1; i <= word.length; i++) {
            setTimeout(() => {
              socket.emit('game:letter', {
                roomId: ROOM_ID,
                letter: word.slice(0, i),
              });
              stats.messagesSent++;
            }, i * 100);
          }

          // Enviar tentativa
          setTimeout(() => {
            socket.emit('game:guess', {
              roomId: ROOM_ID,
              word,
            });
            stats.messagesSent++;
            stats.guesses++;
          }, (word.length + 1) * 100);

          guessCount++;
          setTimeout(sendGuess, Math.random() * 2000 + 1000);
        };

        // Começar a enviar tentativas após um delay aleatório
        setTimeout(sendGuess, Math.random() * 3000 + 1000);
      });

      // Monitorar todas as mensagens recebidas
      socket.onAny(() => {
        stats.messagesReceived++;
      });

      socket.on('room:error', ({ message }) => {
        stats.errors++;
        console.error(`✗ ${playerName} erro: ${message}`);
      });

      socket.on('disconnect', () => {
        stats.disconnected++;
      });

      socket.on('connect_error', (error) => {
        stats.errors++;
        console.error(`✗ ${playerName} erro de conexão:`, error.message);
      });

      sockets.push(socket);
      resolve();
    }, index * DELAY_BETWEEN_CONNECTIONS);
  });
}

// Executar teste
async function runLoadTest() {
  console.log('Iniciando teste de carga...\n');

  // Criar todos os jogadores
  const promises = [];
  for (let i = 0; i < NUM_PLAYERS; i++) {
    promises.push(createPlayer(i));
  }

  await Promise.all(promises);

  console.log('\nTodos os jogadores foram criados. Aguardando estabilização...\n');

  // Exibir progresso em tempo real
  const progressInterval = setInterval(() => {
    const elapsed = ((Date.now() - stats.startTime) / 1000).toFixed(0);
    const memMB = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2);
    console.log(`[${elapsed}s] Conectados: ${stats.connected} | Na sala: ${stats.joined} | Tentativas: ${stats.guesses} | Mem: ${memMB}MB`);
  }, 5000);

  // Aguardar um tempo para o jogo acontecer
  await new Promise(resolve => setTimeout(resolve, TEST_DURATION));

  clearInterval(progressInterval);

  // Calcular estatísticas
  const totalTime = (Date.now() - stats.startTime) / 1000;
  const successRate = ((stats.joined / NUM_PLAYERS) * 100).toFixed(2);
  const avgGuessesPerPlayer = stats.joined > 0 ? (stats.guesses / stats.joined).toFixed(2) : 0;

  const avgConnectionTime = stats.connectionTimes.length > 0
    ? (stats.connectionTimes.reduce((a, b) => a + b, 0) / stats.connectionTimes.length).toFixed(2)
    : 0;

  const avgJoinTime = stats.joinTimes.length > 0
    ? (stats.joinTimes.reduce((a, b) => a + b, 0) / stats.joinTimes.length).toFixed(2)
    : 0;

  const maxConnectionTime = stats.connectionTimes.length > 0
    ? Math.max(...stats.connectionTimes).toFixed(2)
    : 0;

  const maxJoinTime = stats.joinTimes.length > 0
    ? Math.max(...stats.joinTimes).toFixed(2)
    : 0;

  const messagesPerSecond = (stats.messagesSent / totalTime).toFixed(2);
  const throughput = ((stats.messagesReceived + stats.messagesSent) / totalTime).toFixed(2);

  // Exibir estatísticas
  console.log(`
===================================
RESULTADOS DO TESTE DE CARGA
===================================

📊 CONEXÕES
- Tentativas: ${NUM_PLAYERS}
- Conectados: ${stats.connected} (${((stats.connected / NUM_PLAYERS) * 100).toFixed(2)}%)
- Entraram na sala: ${stats.joined} (${successRate}%)
- Erros: ${stats.errors}
- Desconexões: ${stats.disconnected}

⏱️  LATÊNCIA
- Tempo médio de conexão: ${avgConnectionTime}ms
- Tempo máximo de conexão: ${maxConnectionTime}ms
- Tempo médio para entrar: ${avgJoinTime}ms
- Tempo máximo para entrar: ${maxJoinTime}ms

🎮 GAMEPLAY
- Tentativas enviadas: ${stats.guesses}
- Média por jogador: ${avgGuessesPerPlayer}
- Total de mensagens enviadas: ${stats.messagesSent}
- Total de mensagens recebidas: ${stats.messagesReceived}

⚡ PERFORMANCE
- Mensagens/segundo: ${messagesPerSecond}
- Throughput total: ${throughput} msg/s
- Pico de memória: ${stats.peakMemory}MB
- Tempo total: ${totalTime.toFixed(2)}s

===================================
  `);

  // Avaliação de performance
  console.log('📈 AVALIAÇÃO:');

  if (parseFloat(successRate) >= 99) {
    console.log('✅ EXCELENTE - Sistema suporta esta carga perfeitamente!');
  } else if (parseFloat(successRate) >= 95) {
    console.log('✅ BOM - Sistema suporta esta carga com pequenas perdas');
  } else if (parseFloat(successRate) >= 90) {
    console.log('⚠️  ACEITÁVEL - Sistema está no limite para esta carga');
  } else {
    console.log('❌ CRÍTICO - Sistema não suporta esta carga adequadamente');
  }

  if (parseFloat(avgConnectionTime) < 100) {
    console.log('✅ Latência de conexão excelente');
  } else if (parseFloat(avgConnectionTime) < 500) {
    console.log('✅ Latência de conexão boa');
  } else if (parseFloat(avgConnectionTime) < 1000) {
    console.log('⚠️  Latência de conexão aceitável');
  } else {
    console.log('❌ Latência de conexão alta');
  }

  console.log(`\n💡 RECOMENDAÇÃO:`);
  if (parseFloat(successRate) >= 95 && parseFloat(avgConnectionTime) < 500) {
    console.log(`   Sistema suporta ${NUM_PLAYERS} jogadores com facilidade!`);
    console.log(`   Você pode tentar aumentar para ${NUM_PLAYERS * 2} jogadores.`);
  } else if (parseFloat(successRate) >= 90) {
    console.log(`   Sistema está no limite com ${NUM_PLAYERS} jogadores.`);
    console.log(`   Para escalar, considere otimizações ou upgrade de servidor.`);
  } else {
    console.log(`   Sistema não suporta ${NUM_PLAYERS} jogadores adequadamente.`);
    console.log(`   Tente reduzir para ${Math.floor(NUM_PLAYERS * 0.7)} jogadores.`);
  }

  // Desconectar todos
  console.log('\nDesconectando todos os jogadores...');
  sockets.forEach(socket => socket.disconnect());

  console.log('Teste concluído!');
  process.exit(0);
}

// Tratamento de erros
process.on('uncaughtException', (error) => {
  console.error('Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Promise rejeitada:', error);
  process.exit(1);
});

// Executar
runLoadTest().catch((error) => {
  console.error('Erro no teste:', error);
  process.exit(1);
});
