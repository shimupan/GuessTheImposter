import ActiveRooms from '../models/ActiveRooms.js';

export let RoomtoUsers = new Map();
export let UsertoRoom = new Map();
export let SocketIDtoUsername = new Map();

export const RoomSocket = (socket, io) => {
   const createRoom = async () => {
      let roomID = await generateRoomID();

      try {
         await ActiveRooms.create({ RoomID: roomID });
         console.log('\nRoom added to the database', roomID);
      } catch (err) {
         console.log('Error adding room to the database', err);
      }
      RoomtoUsers.set(roomID, new Set());
      socket.emit('room-created', { roomID: roomID });
   };

   const joinRoom = async (id) => {
      if (!(await checkID(id))) {
         socket.emit('room-not-found', { roomID: id });
         return;
      }
      socket.join(id);
      RoomtoUsers.get(id).add(socket.id);
      UsertoRoom.set(socket.id, id);
      console.log('\nRoom joined', id);
      console.log('UsertoRoom', UsertoRoom);
      console.log('RoomtoUsers', RoomtoUsers);

      // Send the set of users back to the users in the room
      const usersInRoom = Array.from(RoomtoUsers.get(id)).map((id) =>
         SocketIDtoUsername.get(id)
      );
      io.to(id).emit('users-in-room', usersInRoom);
   };

   socket.on('create-room', createRoom);
   socket.on('join-room', joinRoom);
};

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
      return !!room;
   } catch (err) {
      console.log('Error checking room ID', err);
      return false;
   }
};
