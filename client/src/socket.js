import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
  autoConnect: false,
  transports: ["websocket", "polling"], // try websocket first, fall back to polling
  withCredentials: true,
});

export default socket;
