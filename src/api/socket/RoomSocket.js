import ActiveRooms from '../models/ActiveRooms.js';

export let RoomtoUsers = new Map();
export let UsertoRoom = new Map();
export let SocketIDtoUsername = new Map();

export const RoomSocket = (socket, io) => {

   const createRoom = async () => {
      // Create a room with ID and add to the database along with the user
      
      let roomID = await generateRoomID();
      
      try {
         await ActiveRooms.create({ RoomID: roomID });
         console.log('\nRoom added to the database', roomID);
      } catch (err) {
         console.log('Error adding room to the database', err);
      }
      // If the user is already in a room, remove them from the room
      if (UsertoRoom.get(socket.id) !== undefined) {
         const room = UsertoRoom.get(socket.id);
         const userSet = RoomtoUsers.get(room);
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

      RoomtoUsers.set(roomID, new Set());
      socket.emit('room-created', { roomID: roomID });
   };

   const joinRoom = async (id) => {
      if (!(await checkID(id))) {
         socket.emit('room-not-found', { roomID: id });
         return;
      }

      // Check if the user is already in a room

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

   const loadWord = (id) => {
      const players = Array.from(RoomtoUsers.get(id));
      const category = 'video game';
      const word = ["Valorant","CSGO","Minecraft","Crab Game"];
      
      const randomPlayer = Math.floor(Math.random() * players.length);
      const randomWord = Math.floor(Math.random() * word.length);

      // Emit the category to the random player
      io.to(players[randomPlayer]).emit('category', category);

      // Emit the random word to everyone else
      players.forEach((player) => {
         if (player !== players[randomPlayer]) {
            io.to(player).emit('word', word[randomWord]);
         }
      });
   };

   socket.on('create-room', createRoom);
   socket.on('join-room', joinRoom);
   socket.on('load-word', loadWord);
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
