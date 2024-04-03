import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import { RoomSocket } from './RoomSocket.js';

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

io.on('connection', (socket) => {
    console.log('a user connected', socket.id);

    RoomSocket(socket);

    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id);
    });
});

export { app, io, server };