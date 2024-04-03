import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import { Username } from '../components/Username';
import { RoomNotFound } from '../components/RoomNotFound';

export const Room = () => {
   const { roomId } = useParams();
   const Socket = useContext(SocketContext);
   const Auth = useContext(AuthContext);
   const [room, setRoom] = useState(true);
   const [users, setUsers] = useState<string[]>([]);

   if (!localStorage.getItem('username')) {
      return <Username />;
   } else {
      Auth?.setUsername(localStorage.getItem('username') || '');
   }

   useEffect(() => {
      if (roomId && Socket?.socket) {
         console.log('Joining room', roomId);
         Socket.socket.emit('join-room', roomId);

         Socket.socket.on('room-not-found', () => {
            setRoom(false);
         });

         Socket.socket.on('users-in-room', (users) => {
            console.log('Users in room:', users);
            setUsers(users);
         });
      }
   }, [roomId, Socket?.socket]);

   return room ? (
      <>
         <div>{users}</div>
      </>
   ) : (
      <RoomNotFound />
   );
};
