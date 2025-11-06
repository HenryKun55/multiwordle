export type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

export interface Letter {
  char: string;
  status: LetterStatus;
}

export interface Guess {
  word: string;
  letters: Letter[];
}

export interface Player {
  id: string;
  name: string;
  guesses: Guess[];
  currentGuess: string;
  gameStatus: 'playing' | 'won' | 'lost';
  attempts: number;
  lastUpdate: number;
}

export interface Room {
  id: string;
  word: string;
  players: Map<string, Player>;
  winner: string | null;
  gameEnded: boolean;
  createdAt: number;
}

export interface GameState {
  roomId: string;
  players: Player[];
  winner: string | null;
  gameEnded: boolean;
}

export interface ClientToServerEvents {
  'join:room': (data: { roomId: string; playerName: string }) => void;
  'game:guess': (data: { roomId: string; word: string }) => void;
  'game:letter': (data: { roomId: string; letter: string }) => void;
  'game:backspace': (data: { roomId: string }) => void;
}

export interface ServerToClientEvents {
  'room:joined': (data: { playerId: string; gameState: GameState }) => void;
  'room:error': (data: { message: string }) => void;
  'game:updated': (data: GameState) => void;
  'game:guess:result': (data: {
    playerId: string;
    guess: Guess;
    isValid: boolean;
    message?: string;
  }) => void;
  'game:ended': (data: {
    winner: Player;
    word: string;
    finalState: GameState;
  }) => void;
  'player:updated': (data: { playerId: string; currentGuess: string }) => void;
}
