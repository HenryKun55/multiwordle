'use client';

import { useEffect, useState } from 'react';
import type { Guess } from '@/types/game';
import { WORD_LENGTH, MAX_ATTEMPTS } from '@/lib/game-logic';

interface GameGridProps {
  guesses: Guess[];
  currentGuess: string;
  isCurrentPlayer?: boolean;
  shake?: boolean;
}

export default function GameGrid({ guesses, currentGuess, isCurrentPlayer = false, shake = false }: GameGridProps) {
  const [animatingRow, setAnimatingRow] = useState<number | null>(null);

  // Criar array de 6 tentativas
  const rows = Array.from({ length: MAX_ATTEMPTS }, (_, i) => {
    if (i < guesses.length) {
      return guesses[i];
    }
    if (i === guesses.length && isCurrentPlayer) {
      // Linha atual sendo digitada
      const letters = currentGuess.split('').map(char => ({
        char,
        status: 'empty' as const,
      }));
      while (letters.length < WORD_LENGTH) {
        letters.push({ char: '', status: 'empty' as const });
      }
      return { word: currentGuess, letters };
    }
    // Linhas vazias
    return {
      word: '',
      letters: Array.from({ length: WORD_LENGTH }, () => ({
        char: '',
        status: 'empty' as const,
      })),
    };
  });

  // Animar nova linha quando uma tentativa é adicionada
  useEffect(() => {
    if (guesses.length > 0) {
      setAnimatingRow(guesses.length - 1);
      const timer = setTimeout(() => {
        setAnimatingRow(null);
      }, 600 * WORD_LENGTH); // Duração da animação de flip
      return () => clearTimeout(timer);
    }
  }, [guesses.length]);

  return (
    <div className="flex flex-col gap-1.5">
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={`flex gap-1.5 ${
            shake && rowIndex === guesses.length ? 'shake' : ''
          }`}
        >
          {row.letters.map((letter, colIndex) => {
            const isAnimating = animatingRow === rowIndex;
            const delay = isAnimating ? colIndex * 100 : 0;

            return (
              <div
                key={colIndex}
                className={`tile ${letter.char ? 'filled' : ''} ${letter.status}`}
                data-animation={isAnimating ? 'flip' : undefined}
                style={{
                  animationDelay: isAnimating ? `${delay}ms` : undefined,
                }}
              >
                {letter.char}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
