// Importar dicionário completo
const { wordleDictionaryNoAccents } = require('./dictionary');

// Lista completa de palavras válidas (10.000+ palavras) - converter para maiúsculas
const VALID_WORDS = wordleDictionaryNoAccents.map(w => w.toUpperCase());

// Palavras que podem ser sorteadas (curadoria específica - apenas 5 letras)
const TARGET_WORDS = [
  // Substantivos comuns - Objetos e casa
  'CARRO', 'PORTA', 'PRATO', 'GARFO', 'BANHO', 'DENTE', 'CORPO', 'BRAÇO', 'OLHOS',
  'LIVRO', 'PAPEL', 'LAPIS', 'CORDA', 'CHAVE', 'COFRE', 'BOLSA', 'CAIXA', 'VIDRO',
  'FERRO', 'PRATA', 'COBRE', 'COURO', 'LINHA', 'BOTAO', 'ZIPER', 'ROUPA', 'FOLHA',
  'GALHO', 'FRUTO', 'GRAMA',

  // Comida e bebida
  'ARROZ', 'CARNE', 'PEIXE', 'LEITE', 'TORTA', 'VINHO', 'PIZZA', 'MASSA', 'MELAO', 'LIMAO',

  // Pessoas
  'AMIGO', 'MAMAE', 'PAPAI', 'FILHO', 'FILHA', 'IRMAO', 'PRIMO', 'PRIMA', 'GENTE',
  'GRUPO', 'TURMA', 'CASAL', 'NOIVO', 'NOIVA',

  // Lugares
  'PRAIA', 'CAMPO', 'LUGAR', 'PRACA', 'BANCO', 'FEIRA', 'CLUBE', 'HOTEL', 'SITIO',
  'PONTE', 'PORTO', 'MORRO', 'SERRA',

  // Verbos
  'ABRIR', 'FAZER', 'COMER', 'BEBER', 'ANDAR', 'PULAR', 'SUBIR', 'FICAR', 'FALAR',
  'DIZER', 'OUVIR', 'OLHAR', 'PEGAR', 'LEVAR', 'SABER', 'PODER', 'DEVER', 'ODIAR',
  'VIVER', 'MUDAR', 'VIRAR', 'PARAR', 'PEDIR',

  // Adjetivos
  'FELIZ', 'BRAVO', 'CALMO', 'CHATO', 'LEGAL', 'BAIXO', 'LARGO', 'GORDO', 'MAGRO',
  'FORTE', 'FRACO', 'LENTO', 'VELHO', 'JOVEM', 'LIMPO', 'CLARO', 'CHEIO', 'VAZIO',
  'POBRE', 'FACIL',

  // Cores
  'VERDE', 'PRETO', 'CINZA',

  // Quantidades
  'CINCO', 'MUITO', 'POUCO', 'ALGUM',

  // Conceitos
  'MORTE', 'SONHO', 'IDEIA', 'PLANO', 'RAZAO', 'CULPA', 'DEVER', 'HONRA', 'FORCA',
  'PODER', 'MAGIA', 'SORTE', 'CONTO', 'CAUSA', 'ORDEM',

  // Natureza e animais
  'PORCO', 'NUVEM', 'BRISA',

  // Atividades
  'FESTA', 'DANCA', 'CANTO', 'FILME', 'REGRA', 'SALTO',

  // Trabalho e estudo
  'GRANA', 'MOEDA', 'PROVA', 'ALUNO', 'TEXTO', 'LETRA', 'FRASE', 'AUTOR',

  // Comunicação
  'CARTA', 'AVISO', 'SINAL',

  // Tempo e medidas
  'EPOCA', 'METRO', 'QUILO', 'GRAMA', 'LITRO', 'FATIA', 'PARTE',

  // Cotidiano
  'TERMO', 'TESTE', 'EXAME', 'MEDIA', 'TOTAL', 'AJUDA', 'APOIO', 'FAVOR', 'PONTO',
  'JOGO',
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
