'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSocket } from '@/lib/use-socket';
import { useGameStore } from '@/lib/game-store';
import GameGrid from '@/components/GameGrid';
import Keyboard from '@/components/Keyboard';
import PlayerRanking from '@/components/PlayerRanking';
import GameEndModal from '@/components/GameEndModal';
import { WORD_LENGTH } from '@/lib/game-logic';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { socket, isConnected } = useSocket();

  // State local
  const [roomId, setRoomId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [shake, setShake] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showEndModal, setShowEndModal] = useState(false);
  const [gameEndData, setGameEndData] = useState<any>(null);

  // Store
  const {
    players,
    currentPlayerId,
    winner,
    gameEnded,
    setCurrentPlayerId,
    setGameState,
    updatePlayer,
    reset,
  } = useGameStore();

  // Pegar parâmetros da URL
  useEffect(() => {
    const room = searchParams.get('room');
    if (room) {
      setRoomId(room);
    }
  }, [searchParams]);

  // Configurar listeners do socket
  useEffect(() => {
    if (!socket) return;

    // Entrou na sala com sucesso
    socket.on('room:joined', ({ playerId, gameState }) => {
      console.log('Entrou na sala:', playerId);
      setCurrentPlayerId(playerId);
      setGameState(gameState);
      setIsJoined(true);
      setErrorMsg('');
    });

    // Erro ao entrar na sala
    socket.on('room:error', ({ message }) => {
      console.error('Erro:', message);
      setErrorMsg(message);
    });

    // Estado do jogo atualizado
    socket.on('game:updated', (gameState) => {
      console.log('Jogo atualizado:', gameState);
      setGameState(gameState);
    });

    // Resultado da tentativa
    socket.on('game:guess:result', ({ playerId, guess, isValid, message }) => {
      if (!isValid && message) {
        setErrorMsg(message);
        setShake(true);
        setTimeout(() => setShake(false), 500);
      } else if (isValid) {
        setCurrentInput('');
        setErrorMsg('');
      }
    });

    // Jogador atualizado
    socket.on('player:updated', ({ playerId, currentGuess }) => {
      updatePlayer(playerId, { currentGuess });
    });

    // Jogo terminou
    socket.on('game:ended', ({ winner: winnerPlayer, word, finalState }) => {
      console.log('Jogo terminou! Vencedor:', winnerPlayer.name);
      setGameState(finalState);
      setGameEndData({ winner: winnerPlayer, word });
      setShowEndModal(true);
    });

    return () => {
      socket.off('room:joined');
      socket.off('room:error');
      socket.off('game:updated');
      socket.off('game:guess:result');
      socket.off('player:updated');
      socket.off('game:ended');
    };
  }, [socket, setCurrentPlayerId, setGameState, updatePlayer]);

  // Entrar na sala
  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socket || !roomId.trim() || !playerName.trim()) return;

    socket.emit('join:room', {
      roomId: roomId.trim(),
      playerName: playerName.trim(),
    });
  };

  // Digitar letra
  const handleKeyPress = useCallback((key: string) => {
    if (!isJoined || gameEnded || currentInput.length >= WORD_LENGTH) return;

    const newInput = currentInput + key;
    setCurrentInput(newInput);

    if (socket) {
      socket.emit('game:letter', { roomId, letter: newInput });
    }
  }, [isJoined, gameEnded, currentInput, socket, roomId]);

  // Backspace
  const handleBackspace = useCallback(() => {
    if (!isJoined || gameEnded || currentInput.length === 0) return;

    const newInput = currentInput.slice(0, -1);
    setCurrentInput(newInput);

    if (socket) {
      socket.emit('game:backspace', { roomId });
    }
  }, [isJoined, gameEnded, currentInput, socket, roomId]);

  // Enter (enviar tentativa)
  const handleEnter = useCallback(() => {
    if (!isJoined || gameEnded || currentInput.length !== WORD_LENGTH || !socket) return;

    socket.emit('game:guess', { roomId, word: currentInput });
  }, [isJoined, gameEnded, currentInput, socket, roomId]);

  // Pegar jogador atual
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const isCurrentPlayerWinner = winner === currentPlayerId;

  // Tela de entrada
  if (!isJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              MultiWordle
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Termo multiplayer em tempo real
            </p>
          </div>

          <form onSubmit={handleJoinRoom} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ID da Sala
              </label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Digite o ID da sala"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
                minLength={3}
                maxLength={30}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Seu Nome
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Digite seu nome"
                className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
                minLength={2}
                maxLength={20}
              />
            </div>

            {errorMsg && (
              <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={!isConnected || !roomId.trim() || !playerName.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {isConnected ? 'Entrar na Sala' : 'Conectando...'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Status: {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Tela do jogo
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              MultiWordle
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sala: <span className="font-mono">{roomId}</span>
            </p>
          </div>
          {currentPlayer && (
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Jogador</p>
              <p className="font-semibold text-gray-900 dark:text-white">{currentPlayer.name}</p>
            </div>
          )}
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-120px)]">
          {/* Área do jogo */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center gap-6">
            {currentPlayer && (
              <>
                <GameGrid
                  guesses={currentPlayer.guesses}
                  currentGuess={currentInput}
                  isCurrentPlayer={true}
                  shake={shake}
                />

                {errorMsg && (
                  <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-4 py-2 rounded-lg">
                    {errorMsg}
                  </div>
                )}

                <Keyboard
                  guesses={currentPlayer.guesses}
                  onKeyPress={handleKeyPress}
                  onEnter={handleEnter}
                  onBackspace={handleBackspace}
                  disabled={currentPlayer.gameStatus !== 'playing' || gameEnded}
                />
              </>
            )}
          </div>

          {/* Ranking */}
          <div className="lg:col-span-1 h-full">
            <PlayerRanking
              players={players}
              currentPlayerId={currentPlayerId}
              winner={winner}
            />
          </div>
        </div>
      </main>

      {/* Modal de fim de jogo */}
      {showEndModal && gameEndData && (
        <GameEndModal
          winner={gameEndData.winner}
          word={gameEndData.word}
          isWinner={isCurrentPlayerWinner}
          onClose={() => setShowEndModal(false)}
        />
      )}
    </div>
  );
}
