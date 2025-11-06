import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents } from '@/types/game';

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: TypedSocket | null = null;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);

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
      });

      socket.on('disconnect', () => {
        console.log('Socket desconectado');
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        console.error('Erro de conexão:', error);
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
    disconnect,
  };
}

export function getSocket(): TypedSocket | null {
  return socket;
}
