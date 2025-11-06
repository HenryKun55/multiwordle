// Lista curada de palavras válidas de 5 letras em português
const VALID_WORDS = [
  // Palavras comuns
  'ABRIR', 'ACIMA', 'AGORA', 'AINDA', 'AJUDA', 'ALUNO', 'AMIGO', 'AMOR', 'ANTES', 'APOIO',
  'TESTE', 'CARRO', 'TERMO', 'JOGO', 'LIVRE', 'TEMPO', 'CASA', 'MESA', 'PORTA', 'JANELA',
  // ... (adicione mais palavras conforme necessário)
];

// Palavras que podem ser sorteadas
const TARGET_WORDS = [
  'ABRIR', 'AGORA', 'AINDA', 'AJUDA', 'ALUNO', 'AMIGO', 'TESTE', 'CARRO', 'TERMO', 'JOGO',
];

// Função para normalizar palavras (remover acentos)
function normalizeWord(word) {
  return word
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Verificar se palavra é válida
function isValidWord(word) {
  const normalized = normalizeWord(word);
  return VALID_WORDS.includes(normalized) || TARGET_WORDS.includes(normalized);
}

// Selecionar palavra aleatória para o jogo
function getRandomWord() {
  return TARGET_WORDS[Math.floor(Math.random() * TARGET_WORDS.length)];
}

module.exports = {
  VALID_WORDS,
  TARGET_WORDS,
  normalizeWord,
  isValidWord,
  getRandomWord,
};
