import { io } from "socket.io-client";

// Connect to the backend Socket.IO server
const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
  autoConnect: false, // we connect manually when user enters username
});

export default socket;