import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@/types/game';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: TypedSocket | null = null;

// Salvar dados da sessão no localStorage para reconexão
const SESSION_STORAGE_KEY = 'multiwordle_session';

interface SessionData {
  socketId: string;
  roomId: string;
  playerName: string;
  timestamp: number;
}

function saveSession(socketId: string, roomId: string, playerName: string) {
  const session: SessionData = {
    socketId,
    roomId,
    playerName,
    timestamp: Date.now(),
  };
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
}

function getSession(): SessionData | null {
  try {
    const data = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!data) return null;

    const session: SessionData = JSON.parse(data);

    // Sessão expira após 5 minutos
    if (Date.now() - session.timestamp > 5 * 60 * 1000) {
      clearSession();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [serverFull, setServerFull] = useState(false);

  useEffect(() => {
    if (!socket) {
      // Conectar ao servidor
      socket = io({
        path: '/socket.io',
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      socket.on('connect', () => {
        console.log('Socket conectado:', socket?.id);
        setIsConnected(true);
        setServerFull(false);
      });

      socket.on('disconnect', () => {
        console.log('Socket desconectado');
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('Erro de conexão:', error);
        setIsConnected(false);
      });

      socket.on('server:full', ({ message, currentConnections, maxConnections }) => {
        console.warn('Servidor cheio:', message);
        setServerFull(true);
        setIsConnected(false);
      });
    }

    return () => {
      // Não desconectar no cleanup pois queremos manter a conexão
      // durante toda a sessão do usuário
    };
  }, []);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.disconnect();
      socket = null;
      setIsConnected(false);
    }
  }, []);

  return {
    socket,
    isConnected,
    serverFull,
    disconnect,
    saveSession,
    getSession,
    clearSession,
  };
}

export function getSocket(): TypedSocket | null {
  return socket;
}

export { saveSession, getSession, clearSession };
