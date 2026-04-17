import { useState } from "react";
import Avatar from "../UI/Avatar";
import EmojiPicker from "../UI/EmojiPicker";
import { timeAgo, copyToClipboard } from "../../utils/helpers";
import { useUserStore } from "../../store/userStore";
import socket from "../../socket";
import { useChatStore } from "../../store/chatStore";
import { useUIStore } from "../../store/uiStore";

export default function ChatMessage({ message }) {
  const { sessionId, mutedUsers } = useUserStore();
  const { currentRoom } = useChatStore();
  const { showToast } = useUIStore();
  const [showEmoji, setShowEmoji] = useState(false);

  // Don't render muted users' messages
  if (mutedUsers.includes(message.author)) return null;

  const isOwn = message.sessionId === sessionId;

  const handleDelete = () => {
    socket.emit("delete_message", { messageId: message._id, sessionId, room: currentRoom });
  };

  const handleReact = (emoji) => {
    socket.emit("react_message", { messageId: message._id, emoji, sessionId, room: currentRoom });
  };

  const handleCopy = () => {
    copyToClipboard(message.content);
    showToast("Message copied!", "success");
  };

  return (
    <div className={`flex gap-2 group px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${isOwn ? "flex-row-reverse" : ""}`}>
      <Avatar username={message.author} color={message.authorColor} size="sm" />
      <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
        <span className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
          {message.author} · {timeAgo(message.createdAt)}
        </span>
        <div
          className={`px-3 py-2 rounded-2xl text-sm ${
            isOwn
              ? "bg-brand text-white rounded-tr-sm"
              : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tl-sm"
          }`}
        >
          {message.content}
        </div>

        {/* Reactions */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {Object.entries(message.reactions).map(([emoji, users]) =>
              users.length > 0 ? (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className="text-xs bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  {emoji} {users.length}
                </button>
              ) : null
            )}
          </div>
        )}
      </div>

      {/* Action buttons — shown on hover */}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 self-center relative">
        <button
          onClick={() => setShowEmoji((v) => !v)}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
          title="React"
        >😊</button>
        <button
          onClick={handleCopy}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
          title="Copy message"
        >📋</button>
        {isOwn && (
          <button
            onClick={handleDelete}
            className="text-red-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-sm"
            title="Delete"
          >🗑️</button>
        )}
        {showEmoji && <EmojiPicker onSelect={handleReact} onClose={() => setShowEmoji(false)} />}
      </div>
    </div>
  );
}