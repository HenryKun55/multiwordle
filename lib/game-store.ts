import { create } from 'zustand';
import type { Player, GameState } from '@/types/game';

interface GameStore extends GameState {
  // Estado local
  currentPlayerId: string | null;
  currentGuess: string;
  errorMessage: string | null;
  isJoining: boolean;

  // Ações
  setCurrentPlayerId: (id: string) => void;
  setGameState: (state: GameState) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  setCurrentGuess: (guess: string) => void;
  setErrorMessage: (message: string | null) => void;
  setIsJoining: (isJoining: boolean) => void;
  reset: () => void;
}

const initialState = {
  roomId: '',
  players: [],
  winner: null,
  gameEnded: false,
  currentPlayerId: null,
  currentGuess: '',
  errorMessage: null,
  isJoining: false,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initialState,

  setCurrentPlayerId: (id) => set({ currentPlayerId: id }),

  setGameState: (state) => set({
    roomId: state.roomId,
    players: state.players,
    winner: state.winner,
    gameEnded: state.gameEnded,
  }),

  updatePlayer: (playerId, updates) => set((state) => ({
    players: state.players.map(p =>
      p.id === playerId ? { ...p, ...updates } : p
    ),
  })),

  setCurrentGuess: (guess) => set({ currentGuess: guess }),

  setErrorMessage: (message) => set({ errorMessage: message }),

  setIsJoining: (isJoining) => set({ isJoining }),

  reset: () => set(initialState),
}));

// Expor store globalmente para testes E2E (apenas em desenvolvimento/teste)
if (typeof window !== 'undefined' && (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test')) {
  (window as any).__ZUSTAND_STORE__ = useGameStore;
}
