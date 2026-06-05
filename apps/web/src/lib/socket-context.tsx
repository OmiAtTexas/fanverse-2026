'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@clerk/nextjs';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({ socket: null, isConnected: false });

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { getToken } = useAuth();

  useEffect(() => {
    let mounted = true;
    const initSocket = async () => {
      const token = await getToken();
      if (!token || !mounted) return;

      const s = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
      });

      s.on('connect', () => mounted && setIsConnected(true));
      s.on('disconnect', () => mounted && setIsConnected(false));

      if (mounted) setSocket(s);
    };

    initSocket();
    return () => {
      mounted = false;
      socket?.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
