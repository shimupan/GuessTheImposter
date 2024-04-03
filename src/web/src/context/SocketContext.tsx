import { useState, useEffect, useContext , createContext, ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import io, { Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

type SocketContextType = {
    socket: Socket | null;
    onlineUsers: string[];
};

export const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketContextProvider = ({ children }: {children: ReactNode}) => {
    const navigate = useNavigate();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const Auth = useContext(AuthContext);

    const createRoom = ({roomID}: {roomID: string}) => {
        console.log('Created room', roomID);
        navigate(`/${roomID}`);
    };

    useEffect(() => {

        if ( Auth?.username !== '' ) {
            const socket = io(import.meta.env.VITE_SERVER || 'http://localhost:3000', {
                query: {
                    username: Auth?.username
                }
            });
            setSocket(socket);
            socket.on('room-created', createRoom);
        }
    }, [Auth]);

    return (
        <SocketContext.Provider value={{socket, onlineUsers}}>
            {children}
        </SocketContext.Provider>
    );
};