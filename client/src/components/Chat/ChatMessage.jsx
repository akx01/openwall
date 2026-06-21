import { useState } from "react";
import Avatar from "../UI/Avatar";
import EmojiPicker from "../UI/EmojiPicker";
import { timeAgo, copyToClipboard } from "../../utils/helpers";
import { useUserStore } from "../../store/userStore";
import socket from "../../socket";
import { useChatStore } from "../../store/chatStore";
import { useUIStore } from "../../store/uiStore";

function getSingleEmojiClass(content) {
  const str = content.trim();
  
  // Regex to check if pictographs are present (excluding basic ASCII digits and characters)
  const isEmoji = /^[\p{Extended_Pictographic}\u200d\ufe0f\u{1F3FB}-\u{1F3FF}]+$/u.test(str);
  if (!isEmoji) return null;
  
  // Count visual grapheme segments
  let segmentCount = 0;
  try {
    const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });
    const segments = [...segmenter.segment(str)];
    segmentCount = segments.length;
  } catch (e) {
    segmentCount = [...str].length;
  }

  if (segmentCount !== 1) return null;

  // Map to Telegram animated style classes
  if (str.includes("❤️") || str.includes("💖") || str === "😍" || str === "💕") {
    return "animate-tg-heart text-6xl py-2 filter drop-shadow-[0_0_15px_rgba(239,68,68,0.4)]";
  }
  if (str.includes("🔥")) {
    return "animate-tg-fire text-6xl py-2";
  }
  if (str.includes("👍") || str === "👏" || str === "🙌") {
    return "animate-tg-bounce text-6xl py-2 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.25)]";
  }
  if (str.includes("😂") || str === "🤣" || str === "😆" || str === "😜") {
    return "animate-tg-wobble text-6xl py-2";
  }
  
  return "animate-tg-wobble text-6xl py-2";
}

export default function ChatMessage({ message, onReply }) {
  const { sessionId, mutedUsers } = useUserStore();
  const { currentRoom } = useChatStore();
  const { showToast } = useUIStore();
  const [showEmoji, setShowEmoji] = useState(false);

  if (mutedUsers.includes(message.author)) return null;

  const isOwn = message.sessionId === sessionId;
  const emojiClass = getSingleEmojiClass(message.content);

  const handleDelete = () => {
    socket.emit("delete_message", { messageId: message._id, sessionId, room: currentRoom });
  };

  const handleReact = (emoji) => {
    socket.emit("react_message", { messageId: message._id, emoji, sessionId, room: currentRoom });
    setShowEmoji(false);
  };

  const handleCopy = () => {
    copyToClipboard(message.content);
    showToast("Message copied!", "success");
  };

  return (
    <div
      className={`flex gap-2 group px-4 py-1.5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors ${
        isOwn ? "flex-row-reverse" : ""
      } ${isOwn ? "animate-msg-right" : "animate-msg-left"}`}
    >
      <div className="shrink-0 mt-1">
        <Avatar username={message.author} color={message.authorColor} size="sm" />
      </div>

      <div className={`max-w-[72%] flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
        {/* Author + timestamp on hover */}
        <div className={`flex items-center gap-2 mb-0.5 ${isOwn ? "flex-row-reverse" : ""}`}>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
            {message.author}
          </span>
          <span className="msg-timestamp text-[10px] text-gray-400">
            {timeAgo(message.createdAt)}
          </span>
        </div>

        {/* Reply quote */}
        {message.replyTo && (
          <div className={`mb-1.5 max-w-full ${isOwn ? "items-end" : "items-start"}`}>
            <div className="reply-preview max-w-[240px]">
              <p className="text-[11px] text-brand font-semibold truncate">↩ {message.replyTo.author}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{message.replyTo.content}</p>
            </div>
          </div>
        )}

        {/* Bubble */}
        {emojiClass ? (
          <div className={`${emojiClass} select-none`}>
            {message.content}
          </div>
        ) : (
          <div
            className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed max-w-full break-words ${
              isOwn
                ? "bg-brand text-white rounded-tr-sm shadow-sm shadow-brand/20"
                : "bg-white dark:bg-navy-700 text-gray-900 dark:text-gray-100 rounded-tl-sm border border-gray-100 dark:border-white/5 shadow-sm"
            }`}
          >
            {message.content}
          </div>
        )}

        {/* Reactions */}
        {message.reactions && Object.keys(message.reactions).length > 0 && (
          <div className={`flex gap-1 mt-1 flex-wrap ${isOwn ? "justify-end" : ""}`}>
            {Object.entries(message.reactions).map(([emoji, users]) =>
              users.length > 0 ? (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className="text-xs bg-gray-100 dark:bg-navy-600 border border-gray-200 dark:border-white/8 rounded-full px-2 py-0.5 hover:bg-gray-200 dark:hover:bg-navy-500 transition active:scale-95"
                >
                  {emoji} {users.length}
                </button>
              ) : null
            )}
          </div>
        )}
      </div>

      {/* Hover action buttons */}
      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 self-start mt-1 relative transition-opacity">
        {/* Reply */}
        <button
          onClick={() => onReply?.(message)}
          className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-brand hover:bg-brand/10 rounded-lg text-sm transition"
          title="Reply"
        >
          ↩
        </button>
        {/* React */}
        <button
          onClick={() => setShowEmoji((v) => !v)}
          className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/8 rounded-lg text-sm transition"
          title="React"
        >
          😊
        </button>
        {/* Copy */}
        <button
          onClick={handleCopy}
          className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/8 rounded-lg text-sm transition"
          title="Copy"
        >
          📋
        </button>
        {/* Delete */}
        {isOwn && (
          <button
            onClick={handleDelete}
            className="w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm transition"
            title="Delete"
          >
            🗑️
          </button>
        )}
        {showEmoji && (
          <EmojiPicker onSelect={handleReact} onClose={() => setShowEmoji(false)} />
        )}
      </div>
    </div>
  );
}