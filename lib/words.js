// Importar dicionário completo
const { wordleDictionaryNoAccents } = require('./dictionary');

// Lista completa de palavras válidas (3000+ palavras) - converter para maiúsculas
const VALID_WORDS = wordleDictionaryNoAccents.map(w => w.toUpperCase());

// Palavras que podem ser sorteadas (subset mais comum)
const TARGET_WORDS = [
  'ABRIR', 'AGORA', 'AINDA', 'AJUDA', 'ALUNO', 'AMIGO', 'TESTE', 'CARRO', 'TERMO', 'JOGO',
  'BARBA', 'MORTE', 'PORTA', 'BEIJO', 'VERDE', 'BRAVO', 'CLARO', 'DOIDO', 'FALAR', 'GENTE',
  'LIMPO', 'MAIOR', 'NOBRE', 'PERDA', 'QUEDA', 'RITMO', 'SALTO', 'TROCA', 'UNIAO', 'VAZIO',
  'ALUNO', 'BRISA', 'CAMPO', 'DENTE', 'ESCOLA', 'FELIZ', 'GRIPE', 'HEROI', 'IDEIA', 'JUNTO',
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
