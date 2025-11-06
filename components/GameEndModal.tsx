'use client';

import { useEffect, useState } from 'react';
import type { Player } from '@/types/game';

interface GameEndModalProps {
  winner: Player;
  word: string;
  isWinner: boolean;
  onClose: () => void;
}

export default function GameEndModal({ winner, word, isWinner, onClose }: GameEndModalProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Pequeno delay para animação
    const timer = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300
        ${show ? 'bg-black/50 backdrop-blur-sm' : 'bg-black/0'}
      `}
      onClick={onClose}
    >
      <div
        className={`
          bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all duration-300
          ${show ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Emoji e título */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">
            {isWinner ? '🎉' : '😢'}
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isWinner ? 'Você Venceu!' : 'Fim de Jogo'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {isWinner
              ? `Parabéns! Você descobriu a palavra em ${winner.attempts} tentativa${winner.attempts !== 1 ? 's' : ''}!`
              : `${winner.name} descobriu a palavra primeiro!`
            }
          </p>
        </div>

        {/* Palavra correta */}
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center">
            A palavra era:
          </p>
          <div className="flex justify-center gap-2">
            {word.split('').map((letter, index) => (
              <div
                key={index}
                className="tile correct"
                style={{
                  animation: `flip 0.6s ease-in-out ${index * 100}ms`,
                }}
              >
                {letter}
              </div>
            ))}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">Vencedor</p>
            <p className="text-lg font-bold text-blue-900 dark:text-blue-100 truncate">
              {winner.name}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <p className="text-sm text-green-600 dark:text-green-400 mb-1">Tentativas</p>
            <p className="text-lg font-bold text-green-900 dark:text-green-100">
              {winner.attempts}/6
            </p>
          </div>
        </div>

        {/* Botão de fechar */}
        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
        >
          Ver Ranking Final
        </button>
      </div>
    </div>
  );
}
