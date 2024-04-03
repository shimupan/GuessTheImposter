import { useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext';

export const Room = () => {
   const { roomId } = useParams();
   const Socket = useContext(SocketContext);

   useEffect(() => {
      if (roomId) {
         console.log(roomId);
         Socket?.socket?.emit('join-room', roomId);
      }
   }, [roomId]);

   return <div>{roomId}</div>;
};
