import ActiveRooms from '../models/ActiveRooms.js';

const generateRoomID = async () => {
   let roomID = '';
   while (!roomID) {
      roomID = Math.random().toString(36).substring(2, 6).toUpperCase();

      try {
         let room = await ActiveRooms.findOne({ RoomID: roomID });
         if (!room) {
            return roomID;
         }
      } catch (err) {
         console.log('Error generating room ID', err);
      }
   }
};

const checkID = async (id) => {
   try {
      let room = await ActiveRooms.findOne({ RoomID: id });
      if (!room) {
         return false;
      }
      return true;
   } catch (err) {
      console.log('Error checking room ID', err);
   }
};

export const RoomSocket = (socket) => {
   const createRoom = async () => {
      let roomID = await generateRoomID();

      try {
         await ActiveRooms.create({ RoomID: roomID });
         console.log('Room added to the database', roomID);
      } catch (err) {
         console.log('Error adding room to the database', err);
      }
      socket.emit('room-created', { roomID: roomID });
   };

   const joinRoom = async (id) => {
      if (!await checkID(id)) {
         socket.emit('room-not-found', { roomID: id });
         return;
      }
      socket.join(id);
      console.log('Room joined', id);
   };

   socket.on('create-room', createRoom);
   socket.on('join-room', joinRoom);
};
