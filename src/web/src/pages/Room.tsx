import { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';
import { Username } from '../components/Username';
import { RoomNotFound } from '../components/RoomNotFound';
import { UserProfile } from '../components/UserProfile';

export const Room = () => {
   const { roomId } = useParams();
   const Socket = useContext(SocketContext);
   const Auth = useContext(AuthContext);
   const [room, setRoom] = useState(true);
   const [users, setUsers] = useState<string[]>([]);
   const [controls, setControls] = useState<string>("Start Game");
   const [word, setWord] = useState<string>('Waiting for leader to start game...');

   // Check for Login
   if (!localStorage.getItem('username')) {
      return <Username />;
   } else {
      Auth?.setUsername(localStorage.getItem('username') || '');
   }

   // Join Socket Room
   useEffect(() => {
      if (roomId && Socket?.socket) {
         console.log('Joining room', roomId);
         Socket.socket.emit('join-room', roomId);

         Socket.socket.on('room-not-found', () => {
            setRoom(false);
         });

         Socket.socket.on('users-in-room', (users) => {
            console.log('Users in room:', users[0]);
            setUsers(users);
         });

         // Listen for the 'category' event
         Socket.socket.on('category', (category) => {
            console.log('Category:', category);
            setWord(category);
         });

         // Listen for the 'word' event
         Socket.socket.on('word', (word) => {
            console.log('Word:', word);
            setWord(word);
         });
      }
   }, [roomId, Socket?.socket]);

   const handleGameState = () => {
      setControls('Next Round');
      Socket?.socket?.emit('load-word', roomId);
   };

   return room ? (
      <>
         <div className='bg-[#0077B6] h-screen w-screen md:flex'>
            <div className="bg-[#03045E] relative h-3/5 w-full lg:w-3/4 flex flex-col justify-center items-center text-center">
               <div className='w-1/2 max-w-lg mx-auto bg-white rounded-lg p-32'>
                  <h1>
                     {word}
                  </h1>
               </div>
               {users[0] === Auth?.username && (
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-12" onClick={handleGameState}>
                     {controls}
                  </button>
               )}
            </div>
            <div className='w-1/4 md:overflow-auto'>
               {users.map((user) => {
                  if(user === users[0]) {
                     return <UserProfile key={user} username={user} leader={true} />;
                  } else {
                     return <UserProfile key={user} username={user} leader={false}/>;
                  }
               })}
            </div>
         </div>
      </>
   ) : (
      <RoomNotFound />
   );
};
