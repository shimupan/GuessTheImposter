import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { app, server } from './socket/socket.js';
import { rooms } from './routes/index.js';

dotenv.config();

// MONGODB
mongoose
   .connect(
      process.env.MONGO_URI || 'mongodb://admin:admin@lineupx_db:27017/LineupX'
   )
   .then(() => {
      console.log('database connected');
   })
   .catch((err) => console.log('Database connection error: ', err));


app.get('/', (req, res) => {
    res.send('server is running');
});

app.use(rooms);

const PORT = process.env.PORT || 3000; // Use environment variable for port or default to 3000
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));