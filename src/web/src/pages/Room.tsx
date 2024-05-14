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
  const [specialEvent, setSpecialEvent] = useState<number>(5);
  const [word, setWord] = useState<string>(
    "Waiting for leader to start game..."
  );
  const [imposter, setImposter] = useState<string>("");

  // Can be refactored into a separate component
  /*
  const [currentMessage, setCurrentMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  */
 
  // Check for Login
  useEffect(() => {
    // Check for Login
    const username = localStorage.getItem("username");
    if (username) {
      Auth?.setUsername(username);
    }
  }, []); // Empty dependency array means this effect runs once when the component mounts
  
  if (!localStorage.getItem("username")) {
    return <Username />;
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
        toast("Your Role this Round is: " + category[2]);
      });

      // Agent
      Socket.socket.on("agent", (Agent) => {
        console.log("Agent:", Agent);
        setWord(Agent[0] + ": " + Agent[1]);
        if(Agent[3] == "Double Agent") {
          setImposter("Protect: " + Agent[2]);
        } else if (Agent[3] == "Mirror") { 
          setImposter("Mirror: " + Agent[2]);
        }
        
        toast("Your Role this Round is: " + Agent[3]);
      });

      // Listen for the 'word' event
      Socket.socket.on("word", (word) => {
        console.log("Word:", word);
        setWord(word[0] + ": " + word[1]);
        toast("Your Role this Round is: " + word[2]);
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
    Socket?.socket?.emit("load-word", roomId, specialEvent);
  };

  // can be refactored into a separate component
  /*
  const handleSendMessage = () => {
    setMessages((prevMessages) => [...prevMessages, currentMessage]);
    setCurrentMessage("");
  };
  */

  return room ? (
    <>
      <div className="h-screen w-screen overflow-x-hidden overflow-y-auto">
        <div className="flex flex-col">
          <div className="bg-[#03045E] h-3/5 w-full flex flex-col justify-center items-center text-center rounded-br-xl py-28">
            <div className="w-1/2 max-w-lg bg-white rounded-lg py-32 text-center">
              <h1>{word}</h1>
              <h1>{imposter}</h1>
            </div>
            {users[0] === Auth?.username && (
              <>
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-12"
                  onClick={handleGameState}
                >
                  {controls}
                </button>
                {/* Choosing mutation odds */}
                <div className="mt-10 flex flex-col space-y-3 text-white">
                  <div className="flex items-center space-x-2">
                    <label htmlFor="specialEventChances" className="text-lg">Special Event Chances:</label>
                    <input
                      type="number"
                      id="specialEventChances"
                      name="specialEventChances"
                      min="0"
                      max="100"
                      value={specialEvent}
                      onChange={(e) => setSpecialEvent(Number(e.target.value))}
                      className="py-1 px-2 text-black"
                    />
                    <span className="text-lg">%</span>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="md:overflow-auto flex flex-wrap justify-start">
            {users.map((user) => {
              if (user === users[0]) {
                return <UserProfile key={user} username={user} leader={true} className={"mt-3"}/>;
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

        {
        /* Can be refactored into a separate component 
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
        */}
        <ToastContainer position="top-center" />
      </div>
    </>
  ) : (
    <RoomNotFound />
  );
};
