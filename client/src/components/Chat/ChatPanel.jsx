import { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import { useChatStore } from "../../store/chatStore";
import { useUserStore } from "../../store/userStore";
import socket from "../../socket";
import { debounce } from "../../utils/helpers";

export default function ChatPanel() {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);
  const { messages, typingUsers, currentRoom } = useChatStore();
  const { username, color, sessionId } = useUserStore();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Emit typing events with debounce
  const emitTypingStop = debounce(() => {
    socket.emit("typing_stop", { room: currentRoom, username });
  }, 1500);

  const handleInput = (e) => {
    setInput(e.target.value);
    socket.emit("typing_start", { room: currentRoom, username });
    emitTypingStop();
  };

  const sendMessage = () => {
    if (!input.trim() || !username) return;
    socket.emit("send_message", {
      room: currentRoom,
      content: input.trim(),
      author: username,
      authorColor: color,
      sessionId,
    });
    socket.emit("typing_stop", { room: currentRoom, username });
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        # {currentRoom}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-2 space-y-0.5">
        {messages.map((msg) => (
          <ChatMessage key={msg._id} message={msg} />
        ))}
        <TypingIndicator users={typingUsers} />
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800">
        <div className="flex gap-2 items-end bg-gray-50 dark:bg-gray-800 rounded-2xl px-3 py-2">
          <textarea
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={username ? `Message #${currentRoom}` : "Enter a username first..."}
            disabled={!username}
            className="flex-1 resize-none bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none max-h-32"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || !username}
            className="text-brand font-semibold text-sm disabled:opacity-40 hover:text-brand-dark transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}