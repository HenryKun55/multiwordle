'use client';

import { useMemo } from 'react';
import type { Player } from '@/types/game';
import { calculateProgress, comparePlayerProgress } from '@/lib/game-logic';

interface PlayerRankingProps {
  players: Player[];
  currentPlayerId: string | null;
  winner: string | null;
}

export default function PlayerRanking({ players, currentPlayerId, winner }: PlayerRankingProps) {
  // Ordenar jogadores por ranking
  const rankedPlayers = useMemo(() => {
    return [...players]
      .map(player => ({
        ...player,
        progress: calculateProgress(player.guesses),
      }))
      .sort((a, b) =>
        comparePlayerProgress(
          { won: a.gameStatus === 'won', attempts: a.attempts, progress: a.progress },
          { won: b.gameStatus === 'won', attempts: b.attempts, progress: b.progress }
        )
      );
  }, [players]);

  if (players.length === 0) {
    return (
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-full flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Aguardando jogadores...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Ranking ({players.length} jogador{players.length !== 1 ? 'es' : ''})
      </h2>

      <div className="space-y-2">
        {rankedPlayers.map((player, index) => {
          const isCurrentPlayer = player.id === currentPlayerId;
          const isWinner = player.id === winner;
          const position = index + 1;

          return (
            <div
              key={player.id}
              className={`
                relative p-3 rounded-lg border-2 transition-all
                ${isCurrentPlayer
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
                }
                ${isWinner ? 'ring-2 ring-yellow-400' : ''}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Posição */}
                  <div
                    className={`
                      flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                      ${position === 1 ? 'bg-yellow-400 text-yellow-900' : ''}
                      ${position === 2 ? 'bg-gray-300 text-gray-700' : ''}
                      ${position === 3 ? 'bg-orange-400 text-orange-900' : ''}
                      ${position > 3 ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300' : ''}
                    `}
                  >
                    {isWinner ? '👑' : position}
                  </div>

                  {/* Informações do jogador */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">
                        {player.name}
                        {isCurrentPlayer && (
                          <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">(você)</span>
                        )}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex items-center gap-2 mb-2">
                      {player.gameStatus === 'won' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          ✓ Acertou
                        </span>
                      )}
                      {player.gameStatus === 'lost' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          ✗ Perdeu
                        </span>
                      )}
                      {player.gameStatus === 'playing' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          ⏱ Jogando
                        </span>
                      )}
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {player.attempts}/{6} tentativas
                      </span>
                    </div>

                    {/* Barra de progresso */}
                    {player.gameStatus === 'playing' && player.progress > 0 && (
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${player.progress}%` }}
                        />
                      </div>
                    )}

                    {/* Última palavra digitada (se jogando) */}
                    {player.gameStatus === 'playing' && player.currentGuess && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-mono">
                        Digitando: {player.currentGuess}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
