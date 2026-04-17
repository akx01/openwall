import { useEffect } from "react";
import socket from "../socket";
import { useChatStore } from "../store/chatStore";
import { useUserStore } from "../store/userStore";

// Connects socket and binds all real-time event handlers
export const useSocket = () => {
  const { username, color, sessionId } = useUserStore();
  const {
    currentRoom, addMessage, deleteMessage,
    updateReaction, setTyping, setOnlineCount, loadMessages,
  } = useChatStore();

  useEffect(() => {
    if (!username) return;

    socket.connect();

    // Join the current room
    socket.emit("join_room", { room: currentRoom, username, color, sessionId });

    // Load existing messages from DB
    loadMessages(currentRoom);

    // Bind incoming events
    socket.on("new_message", addMessage);
    socket.on("message_deleted", ({ messageId }) => deleteMessage(messageId));
    socket.on("message_reaction", ({ messageId, reactions }) => updateReaction(messageId, reactions));
    socket.on("typing", ({ username: u }) => setTyping(u, true));
    socket.on("stop_typing", ({ username: u }) => setTyping(u, false));
    socket.on("online_count", setOnlineCount);

    return () => {
      socket.off("new_message", addMessage);
      socket.off("message_deleted");
      socket.off("message_reaction");
      socket.off("typing");
      socket.off("stop_typing");
      socket.off("online_count");
      socket.disconnect();
    };
  }, [username, currentRoom]);
};