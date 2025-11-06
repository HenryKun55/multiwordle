'use client';

import { useEffect, useMemo } from 'react';
import type { Guess, LetterStatus } from '@/types/game';

interface KeyboardProps {
  guesses: Guess[];
  onKeyPress: (key: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  disabled?: boolean;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];

export default function Keyboard({ guesses, onKeyPress, onEnter, onBackspace, disabled = false }: KeyboardProps) {
  // Calcular status de cada tecla baseado nas tentativas
  const keyStatuses = useMemo(() => {
    const statuses: Record<string, LetterStatus> = {};

    guesses.forEach(guess => {
      guess.letters.forEach(letter => {
        const currentStatus = statuses[letter.char];

        // Prioridade: correct > present > absent
        if (letter.status === 'correct') {
          statuses[letter.char] = 'correct';
        } else if (letter.status === 'present' && currentStatus !== 'correct') {
          statuses[letter.char] = 'present';
        } else if (letter.status === 'absent' && !currentStatus) {
          statuses[letter.char] = 'absent';
        }
      });
    });

    return statuses;
  }, [guesses]);

  // Lidar com teclas físicas
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        onEnter();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        onBackspace();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        onKeyPress(e.key.toUpperCase());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, onKeyPress, onEnter, onBackspace]);

  const handleClick = (key: string) => {
    if (disabled) return;

    if (key === 'ENTER') {
      onEnter();
    } else if (key === 'BACKSPACE') {
      onBackspace();
    } else {
      onKeyPress(key);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full max-w-lg">
      {KEYBOARD_ROWS.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-0 justify-center">
          {rowIndex === 1 && <div className="flex-[0.5]" />}
          {row.map(key => {
            const status = keyStatuses[key];
            const isWide = key === 'ENTER' || key === 'BACKSPACE';

            return (
              <button
                key={key}
                onClick={() => handleClick(key)}
                disabled={disabled}
                className={`keyboard-key ${isWide ? 'wide' : ''} ${status || ''}`}
                aria-label={key === 'BACKSPACE' ? 'Apagar' : key === 'ENTER' ? 'Enviar' : key}
              >
                {key === 'BACKSPACE' ? '⌫' : key}
              </button>
            );
          })}
          {rowIndex === 1 && <div className="flex-[0.5]" />}
        </div>
      ))}
    </div>
  );
}
