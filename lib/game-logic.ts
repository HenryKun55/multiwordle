import { Letter, LetterStatus, Guess } from '@/types/game';
import { normalizeWord } from './words';

export const MAX_ATTEMPTS = 6;
export const WORD_LENGTH = 5;

/**
 * Valida se uma palavra tem o formato correto
 */
export function validateWordFormat(word: string): { valid: boolean; message?: string } {
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
 * Retorna o status de cada letra (correct, present, absent)
 */
export function checkGuess(guess: string, targetWord: string): Guess {
  const normalizedGuess = normalizeWord(guess);
  const normalizedTarget = normalizeWord(targetWord);

  const letters: Letter[] = [];
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
export function isWinningGuess(guess: Guess): boolean {
  return guess.letters.every(letter => letter.status === 'correct');
}

/**
 * Calcula pontuação baseada no número de tentativas
 * Menos tentativas = maior pontuação
 */
export function calculateScore(attempts: number, won: boolean): number {
  if (!won) return 0;
  return (MAX_ATTEMPTS - attempts + 1) * 100;
}

/**
 * Calcula progresso do jogador (quantas letras corretas ele tem)
 */
export function calculateProgress(guesses: Guess[]): number {
  if (guesses.length === 0) return 0;

  const lastGuess = guesses[guesses.length - 1];
  const correctLetters = lastGuess.letters.filter(l => l.status === 'correct').length;

  return (correctLetters / WORD_LENGTH) * 100;
}

/**
 * Determina a posição no ranking baseado em:
 * 1. Se ganhou (prioridade máxima)
 * 2. Número de tentativas (menos tentativas = melhor)
 * 3. Progresso (mais letras corretas = melhor)
 */
export function comparePlayerProgress(
  playerA: { won: boolean; attempts: number; progress: number },
  playerB: { won: boolean; attempts: number; progress: number }
): number {
  // Se um ganhou e outro não, quem ganhou vem primeiro
  if (playerA.won && !playerB.won) return -1;
  if (!playerA.won && playerB.won) return 1;

  // Se ambos ganharam, ordenar por tentativas (menos = melhor)
  if (playerA.won && playerB.won) {
    return playerA.attempts - playerB.attempts;
  }

  // Se nenhum ganhou, ordenar por progresso (mais = melhor)
  return playerB.progress - playerA.progress;
}

/**
 * Sanitiza input do usuário
 */
export function sanitizeInput(input: string): string {
  return input.trim().slice(0, 100); // Limite de 100 caracteres
}

/**
 * Valida nome do jogador
 */
export function validatePlayerName(name: string): { valid: boolean; message?: string } {
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

  // Permitir apenas letras, números, espaços e alguns caracteres especiais
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(sanitized)) {
    return { valid: false, message: 'Nome contém caracteres inválidos' };
  }

  return { valid: true };
}

/**
 * Valida ID da sala
 */
export function validateRoomId(roomId: string): { valid: boolean; message?: string } {
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

  // Permitir apenas letras, números e hífens
  if (!/^[a-zA-Z0-9\-]+$/.test(sanitized)) {
    return { valid: false, message: 'ID da sala contém caracteres inválidos' };
  }

  return { valid: true };
}
