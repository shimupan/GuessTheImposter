import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import {
   RoomSocket,
   RoomtoUsers,
   UsertoRoom,
   SocketIDtoUsername,
} from './RoomSocket.js';
import ActiveRooms from '../models/ActiveRooms.js';

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
   cors: {
      origin: '*',
   },
});

io.on('connection', (socket) => {
   SocketIDtoUsername.set(socket.id, socket.handshake.query.username);
   console.log('\na user connected', socket.id);
   console.log('SocketIDtoUsername', SocketIDtoUsername);
   console.log('RoomtoUsers', RoomtoUsers);
   console.log('UsertoRoom', UsertoRoom);

   RoomSocket(socket, io);

   socket.on('disconnect', async () => {
      const room = UsertoRoom.get(socket.id);
      const userSet = RoomtoUsers.get(room);
      console.log(userSet)
      if (userSet) {
         userSet.delete(socket.id);

         if (userSet.size === 0) {
            RoomtoUsers.delete(room);
            await ActiveRooms.deleteOne({ RoomID: room });
         } else {
            io.to(room).emit(
               'users-in-room',
               Array.from(userSet).map((id) => SocketIDtoUsername.get(id))
            );
         }
      }
      SocketIDtoUsername.delete(socket.id);
      UsertoRoom.delete(socket.id);
      console.log('\na user disconnected', socket.id);
      console.log('SocketIDtoUsername', SocketIDtoUsername);
      console.log('RoomtoUsers', RoomtoUsers);
      console.log('UsertoRoom', UsertoRoom);
   });
});

export { app, io, server };
