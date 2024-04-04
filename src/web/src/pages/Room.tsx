import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SocketContext } from "../context/SocketContext";
import { AuthContext } from "../context/AuthContext";
import { Username } from "../components/Username";
import { RoomNotFound } from "../components/RoomNotFound";
import { UserProfile } from "../components/UserProfile";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const Room = () => {
  const { roomId } = useParams();
  const Socket = useContext(SocketContext);
  const Auth = useContext(AuthContext);
  const [room, setRoom] = useState(true);
  const [users, setUsers] = useState<string[]>([]);
  const [controls, setControls] = useState<string>("Start Game");
  const [word, setWord] = useState<string>(
    "Waiting for leader to start game..."
  );

  // Can be refactored into a separate component
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  // Check for Login
  if (!localStorage.getItem("username")) {
    return <Username />;
  } else {
    Auth?.setUsername(localStorage.getItem("username") || "");
  }

  // Join Socket Room
  useEffect(() => {
    if (roomId && Socket?.socket) {
      console.log("Joining room", roomId);
      Socket.socket.emit("join-room", roomId);

      Socket.socket.on("room-not-found", () => {
        setRoom(false);
      });

      Socket.socket.on("users-in-room", (users) => {
        console.log("Users in room:", users[0]);
        setUsers(users);
      });

      // Listen for the 'category' event
      Socket.socket.on("category", (category) => {
        console.log("Category:", category);
        setWord(category[0]);
        toast("Your Role this Round is: " + category[1]);
      });

      // Listen for the 'word' event
      Socket.socket.on("word", (word) => {
        console.log("Word:", word);
        setWord(word[0]);
        toast("Your Role this Round is: " + word[1]);
      });
    }
    return () => {
      Socket?.socket?.off("room-not-found");
      Socket?.socket?.off("users-in-room");
      Socket?.socket?.off("category");
      Socket?.socket?.off("word");
    };
  }, [roomId, Socket?.socket]);

  const handleGameState = () => {
    setControls("Next Round");
    Socket?.socket?.emit("load-word", roomId);
  };

  // can be refactored into a separate component
  const handleSendMessage = () => {
    setMessages((prevMessages) => [...prevMessages, currentMessage]);
    setCurrentMessage("");
  };

  return room ? (
    <>
      <div className="h-screen w-screen">
        <div className="md:flex">
          <div className="bg-[#03045E] h-3/5 w-full lg:w-3/4 flex flex-col justify-center items-center text-center rounded-br-xl py-28">
            <div className="w-1/2 max-w-lg bg-white rounded-lg py-32 text-center">
              <h1>{word}</h1>
            </div>
            {users[0] === Auth?.username && (
              <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-12"
                onClick={handleGameState}
              >
                {controls}
              </button>
            )}
          </div>
          <div className="md:w-1/4 md:overflow-auto">
            {users.map((user) => {
              if (user === users[0]) {
                return <UserProfile key={user} username={user} leader={true} />;
              } else {
                return (
                  <UserProfile
                    key={user}
                    username={user}
                    leader={false}
                    className={"mt-3"}
                  />
                );
              }
            })}
          </div>
        </div>

        {/* Can be refactored into a separate component */}
        <div className="w-3/4">
          <div className="overflow-auto h-64 w-full mb-4 border rounded-lg p-3">
            {messages.map((message, index) => (
              <p key={index}>{message}</p>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              className="flex-grow border rounded-lg p-2"
              placeholder="Type a message..."
            />
            <button
              onClick={handleSendMessage}
              className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Send
            </button>
          </div>
        </div>
        <ToastContainer position="top-center" />
      </div>
    </>
  ) : (
    <RoomNotFound />
  );
};
