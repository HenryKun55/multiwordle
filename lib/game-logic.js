const { normalizeWord } = require('./words');

const MAX_ATTEMPTS = 6;
const WORD_LENGTH = 5;

/**
 * Valida se uma palavra tem o formato correto
 */
function validateWordFormat(word) {
  const normalized = normalizeWord(word);

  if (normalized.length !== WORD_LENGTH) {
    return { valid: false, message: `A palavra deve ter ${WORD_LENGTH} letras` };
  }

  if (!/^[A-Z]+$/.test(normalized)) {
    return { valid: false, message: 'A palavra deve conter apenas letras' };
  }

  return { valid: true };
}

/**
 * Verifica cada letra da tentativa contra a palavra correta
 */
function checkGuess(guess, targetWord) {
  const normalizedGuess = normalizeWord(guess);
  const normalizedTarget = normalizeWord(targetWord);

  const letters = [];
  const targetLetters = normalizedTarget.split('');
  const guessLetters = normalizedGuess.split('');

  // Array para rastrear quais letras da palavra alvo já foram usadas
  const used = new Array(WORD_LENGTH).fill(false);

  // Primeiro passo: marcar letras corretas (posição correta)
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      letters[i] = {
        char: guessLetters[i],
        status: 'correct',
      };
      used[i] = true;
    } else {
      letters[i] = {
        char: guessLetters[i],
        status: 'absent',
      };
    }
  }

  // Segundo passo: marcar letras presentes (letra existe mas posição errada)
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (letters[i].status === 'correct') continue;

    for (let j = 0; j < WORD_LENGTH; j++) {
      if (!used[j] && guessLetters[i] === targetLetters[j]) {
        letters[i].status = 'present';
        used[j] = true;
        break;
      }
    }
  }

  return {
    word: normalizedGuess,
    letters,
  };
}

/**
 * Verifica se o jogador ganhou
 */
function isWinningGuess(guess) {
  return guess.letters.every(letter => letter.status === 'correct');
}

/**
 * Calcula progresso do jogador
 */
function calculateProgress(guesses) {
  if (guesses.length === 0) return 0;

  const lastGuess = guesses[guesses.length - 1];
  const correctLetters = lastGuess.letters.filter(l => l.status === 'correct').length;

  return (correctLetters / WORD_LENGTH) * 100;
}

/**
 * Sanitiza input do usuário
 */
function sanitizeInput(input) {
  return input.trim().slice(0, 100);
}

/**
 * Valida nome do jogador
 */
function validatePlayerName(name) {
  const sanitized = sanitizeInput(name);

  if (sanitized.length === 0) {
    return { valid: false, message: 'Nome não pode estar vazio' };
  }

  if (sanitized.length < 2) {
    return { valid: false, message: 'Nome deve ter pelo menos 2 caracteres' };
  }

  if (sanitized.length > 20) {
    return { valid: false, message: 'Nome deve ter no máximo 20 caracteres' };
  }

  if (!/^[a-zA-Z0-9\s\-_]+$/.test(sanitized)) {
    return { valid: false, message: 'Nome contém caracteres inválidos' };
  }

  return { valid: true };
}

/**
 * Valida ID da sala
 */
function validateRoomId(roomId) {
  const sanitized = sanitizeInput(roomId);

  if (sanitized.length === 0) {
    return { valid: false, message: 'ID da sala não pode estar vazio' };
  }

  if (sanitized.length < 3) {
    return { valid: false, message: 'ID da sala deve ter pelo menos 3 caracteres' };
  }

  if (sanitized.length > 30) {
    return { valid: false, message: 'ID da sala deve ter no máximo 30 caracteres' };
  }

  if (!/^[a-zA-Z0-9\-]+$/.test(sanitized)) {
    return { valid: false, message: 'ID da sala contém caracteres inválidos' };
  }

  return { valid: true };
}

module.exports = {
  MAX_ATTEMPTS,
  WORD_LENGTH,
  validateWordFormat,
  checkGuess,
  isWinningGuess,
  calculateProgress,
  sanitizeInput,
  validatePlayerName,
  validateRoomId,
};
