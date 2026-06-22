import { useEffect } from "react";
import socket from "../socket";
import { useChatStore } from "../store/chatStore";
import { useUserStore } from "../store/userStore";
import { useDmStore } from "../store/dmStore";

// Connects socket and binds all real-time event handlers
export const useSocket = () => {
  const { username, color, sessionId } = useUserStore();
  const {
    currentRoom, addMessage, deleteMessage,
    updateReaction, setTyping, setOnlineCount, loadMessages,
  } = useChatStore();

  const { receiveDm, loadFriends } = useDmStore();

  useEffect(() => {
    if (!username) return;

    socket.connect();

    // Join the current room
    socket.emit("join_room", { room: currentRoom, username, color, sessionId });

    // Join personal direct messaging room
    socket.emit("join_user_dm", { username });

    // Load existing messages from DB
    loadMessages(currentRoom);

    // Load initial friends lists and requests
    loadFriends();

    // Bind incoming events
    socket.on("new_message", addMessage);
    socket.on("message_deleted", ({ messageId }) => deleteMessage(messageId));
    socket.on("message_reaction", ({ messageId, reactions }) => updateReaction(messageId, reactions));
    socket.on("typing", ({ username: u }) => setTyping(u, true));
    socket.on("stop_typing", ({ username: u }) => setTyping(u, false));
    socket.on("online_count", setOnlineCount);

    // Direct Messages & Friends live updates
    socket.on("new_direct_message", receiveDm);
    socket.on("friend_request_received", loadFriends);
    socket.on("friend_request_accepted", loadFriends);

    return () => {
      socket.off("new_message", addMessage);
      socket.off("message_deleted");
      socket.off("message_reaction");
      socket.off("typing");
      socket.off("stop_typing");
      socket.off("online_count");
      socket.off("new_direct_message", receiveDm);
      socket.off("friend_request_received", loadFriends);
      socket.off("friend_request_accepted", loadFriends);
      socket.disconnect();
    };
  }, [username, currentRoom]);
};