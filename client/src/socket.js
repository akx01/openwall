import { io } from "socket.io-client";

// Dynamically determine the socket server URL:
// 1. First choice: Environment variable VITE_SOCKET_URL
// 2. Second choice: If we are in the browser, fallback to the current laptop/PC host IP on port 5000 (allows testing on phone over local Wi-Fi!)
// 3. Fallback: localhost:5000
const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (typeof window !== "undefined") {
    // If accessing from phone, window.location.hostname will be the laptop's local IP (e.g., 192.168.x.x)
    return `${window.location.protocol}//${window.location.hostname}:5000`;
  }
  return "http://localhost:5000";
};

const socket = io(getSocketUrl(), {
  autoConnect: false,
  transports: ["websocket", "polling"],
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

export default socket;
