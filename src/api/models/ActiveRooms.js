import mongoose from 'mongoose';

const ActiveRoomsSchema = new mongoose.Schema({
    RoomID: {
        type: String,
        required: true,
    },
});

const ActiveRooms = mongoose.model(
   'ActiveRoom',
   ActiveRoomsSchema,
   'ActiveRooms'
);

export default ActiveRooms;