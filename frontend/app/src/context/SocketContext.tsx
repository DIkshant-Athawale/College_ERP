import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

// Get the backend URL from the environment or use default
// When VITE_API_URL is empty, socket.io connects to the same origin (proxied by Vite)
const getSocketUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) return apiUrl.replace(/\/api$/, '');
    // Empty = same origin; undefined at build time means return undefined so socket.io uses current origin
    return undefined as unknown as string;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const socketInstance = io(getSocketUrl(), {
            withCredentials: true,
            transports: ['websocket', 'polling'], // Fallback to polling if websocket fails
        });

        socketInstance.on('connect', () => {
            console.log('Socket.io connected:', socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('Socket.io disconnected');
            setIsConnected(false);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};
