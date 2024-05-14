import ActiveRooms from '../models/ActiveRooms.js';
import WordList from '../models/WordList.js';

export let RoomtoUsers = new Map();
export let UsertoRoom = new Map();
export let SocketIDtoUsername = new Map();

export const RoomSocket = (socket, io) => {

   // Socket catcher for room creation event
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

   // Socket catcher for room joining event
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

   // Socket catcher for word loading event
   const loadWord = async (id, specialEvent) => {
      const players = Array.from(RoomtoUsers.get(id));

      // Check for the number of categories
      const count = await WordList.countDocuments();
      const randomIndex = Math.floor(Math.random() * count);

      // Fetch random category
      const randomize = await WordList.findOne().skip(randomIndex);

      const { Category, Words } = randomize;

      
      // Make the imposter and choose word
      const randomPlayer = Math.floor(Math.random() * players.length);
      const randomWord = Math.floor(Math.random() * Words.length);
      // If specialEvent is triggered
      if (Math.random() <= specialEvent / 100) {
         const events = [false, false, false, false, false, false, false, false, false];
         const randomEvent = Math.floor(Math.random() * events.length);
         events[randomEvent] = true;
         console.log(events);
         // Event 1: Every user is an imposter
         if (events[0]) {
            players.forEach((player) => {
            io.to(player).emit('category', [Category, "", "Imposter"]);
            });
            return;
         }
         // Event 2: No user is an imposter
         else if (events[1]) {
            players.forEach((player) => {
            io.to(player).emit('word', [Category, Words[randomWord], "Normal"]);
            });
            return;
         }
         // Event 3: Everyone is an imposter except for 1 person
         else if (events[2]) {
            players.forEach((player) => {
            if (player === players[randomPlayer]) {
               io.to(player).emit('word', [Category, Words[randomWord], "Normal"]);
            } else {
               io.to(player).emit('category', [Category, "", "Imposter"]);
            }
            });
            return;
         }
         // Event 4: There are multiple imposters but less than 50% of the players
         else if (events[3]) {
            let numImposters = Math.floor(players.length / 2);
            numImposters = numImposters >= 2 ? numImposters : 1;
            const imposters = new Set();
            while (imposters.size < numImposters) {
            const randomIndex = Math.floor(Math.random() * players.length);
            imposters.add(players[randomIndex]);
            }
            players.forEach((player) => {
            if (imposters.has(player)) {
               io.to(player).emit('category', [Category, "", "Imposter"]);
            } else {
               io.to(player).emit('word', [Category, Words[randomWord], "Normal"]);
            }
            });
            return;
         }
         // Event 5: The Word Shuffle: each "normal" player is given a different word from the same category.
         else if (events[4]) {
            players.forEach((player) => {
            const randomWord = Math.floor(Math.random() * Words.length);
            if (player === players[randomPlayer]) {
               io.to(player).emit('category', [Category, "", "Imposter"]);
            } else {
               io.to(player).emit('word', [Category, Words[randomWord], "Normal"]);
            }
            });
            return;
         }
         // Event 6: The Word Swap
         else if (events[5]) {
            const randomWord2 = Math.floor(Math.random() * Words.length);
            players.forEach((player, index) => {
            if (index < players.length / 2) {
               io.to(player).emit('word', [Category, Words[randomWord], "Normal"]);
            } else {
               io.to(player).emit('word', [Category, Words[randomWord2], "Normal"]);
            }
            });
            return;
         }
         // Event 7: The Double Agent one player is selected as the "imposter", and another player is selected as the "double agent". The "double agent" knows who the imposter is and is given the word, but they must try to protect the imposter's identity while also trying to blend in with the "normal" players.
         else if (events[6]) {
            const randomPlayer2 = Math.floor(Math.random() * players.length);
            players.forEach((player) => {
            if (player === players[randomPlayer]) {
               io.to(player).emit('category', [Category, "", "Imposter"]);
            } else if (player === players[randomPlayer2]) {
               io.to(player).emit('agent', [Category, Words[randomWord], SocketIDtoUsername.get(players[randomPlayer]), "Double Agent"]);
            } else {
               io.to(player).emit('word', [Category, Words[randomWord], "Normal"]);
            }
            });
            return;
         }
         // Event 8: The Chameleon one player is selected as the "chameleon". They are given a different word from the same category
         else if (events[7]) {
            players.forEach((player) => {
            if (player === players[randomPlayer]) {
               const randomWord2 = Math.floor(Math.random() * Words.length);
               io.to(player).emit('word', [Category, Words[randomWord2], "Chameleon"]);
            } else {
               io.to(player).emit('word', [Category, Words[randomWord], "Normal"]);
            }
            });
            return;
         }
         // Event 8: The mirror must copy what another guy said but differently
         else if (events[8]) {
            const randomPlayer2 = Math.floor(Math.random() * players.length);
            players.forEach((player) => {
               if (player === players[randomPlayer]) {
                  io.to(player).emit('category', [Category, "", "Imposter"]);
               } else if (player === players[randomPlayer2]) {
                  io.to(player).emit('agent', [Category, Words[randomWord], SocketIDtoUsername.get(players[randomPlayer]), "Mirror"]);
               } else {
                  io.to(player).emit('word', [Category, Words[randomWord], "Normal"]);
               }
            });
            return;
         }
      }

      // Emit the category to the imposter
      io.to(players[randomPlayer]).emit('category', [Category, "", "Imposter"]);
      
      // Emit the random word to everyone else
      players.forEach((player) => {
         if (player !== players[randomPlayer]) {
            io.to(player).emit('word', [Category, Words[randomWord], "Normal"]);
         }
      });
   };

   socket.on('create-room', createRoom);
   socket.on('join-room', joinRoom);
   socket.on('load-word', loadWord);
};

// Helper function to generate a random room ID
// And verify that it is unique
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

// Helper function to check if a room ID exists in the database
const checkID = async (id) => {
   try {
      let room = await ActiveRooms.findOne({ RoomID: id });
      return !!room;
   } catch (err) {
      console.log('Error checking room ID', err);
      return false;
   }
};
