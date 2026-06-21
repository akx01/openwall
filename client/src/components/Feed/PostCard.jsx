import { useState } from "react";
import Avatar from "../UI/Avatar";
import { timeAgo, copyToClipboard } from "../../utils/helpers";
import { useUserStore } from "../../store/userStore";
import { usePostStore } from "../../store/postStore";
import { useUIStore } from "../../store/uiStore";
import { getTheme } from "../../utils/postThemes";
import { fireEmojiReaction } from "../UI/EmojiReactionBurst";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "/api";

const QUICK_REACTS = ["👍", "❤️", "😂", "😮", "🔥", "🎉", "😍"];

// Themes that use Instagram-style square ratio
const INSTAGRAM_THEMES = new Set(["shayari", "neon", "cosmic", "vintage", "minimal"]);

export default function PostCard({ post, index = 0 }) {
  const { sessionId } = useUserStore();
  const { toggleLike } = usePostStore();
  const { showToast, openModal } = useUIStore();
  const [copying, setCopying] = useState(false);
  const [localReacts, setLocalReacts] = useState(post.quickReacts || {});
  const [showReactBar, setShowReactBar] = useState(false);
  const [reactingEmoji, setReactingEmoji] = useState(null);

  const liked = post.likedBy?.includes(sessionId);
  const postTheme = getTheme(post.theme);
  const isInstagram = INSTAGRAM_THEMES.has(post.theme);
  const isStyled = post.theme && post.theme !== "default";

  const handleCopy = async (e) => {
    e.stopPropagation();
    setCopying(true);
    await copyToClipboard(`${post.title}\n\n${post.content}`);
    showToast("Copied to clipboard!", "success");
    setTimeout(() => setCopying(false), 1500);
  };

  const handleLike = (e) => {
    e.stopPropagation();
    toggleLike(post._id, sessionId);
  };

  const handleReport = async (e) => {
    e.stopPropagation();
    await axios.post(`${API}/reports`, { targetType: "post", targetId: post._id, reportedBy: sessionId });
    showToast("Post reported", "info");
  };

  const handleQuickReact = async (e, emoji) => {
    e.stopPropagation();
    // Fire the burst animation from the click position
    fireEmojiReaction(emoji, e.clientX, e.clientY);
    setReactingEmoji(emoji);
    setTimeout(() => setReactingEmoji(null), 600);

    try {
      const { data } = await axios.post(`${API}/posts/${post._id}/react`, { emoji, sessionId });
      setLocalReacts(data.quickReacts || {});
    } catch {
      // optimistic update
      setLocalReacts((prev) => ({
        ...prev,
        [emoji]: (prev[emoji] || 0) + 1,
      }));
    }
    setShowReactBar(false);
  };

  const staggerClass = `stagger-${Math.min((index % 6) + 1, 6)}`;

  // Font override for themed posts
  const fontStyle = postTheme.font ? { fontFamily: postTheme.font } : {};

  return (
    <div
      onClick={() => openModal("postDetail", post)}
      className={`group/card ${postTheme.css} ${isInstagram ? "post-instagram-ratio" : ""} rounded-2xl overflow-hidden cursor-pointer border transition-all duration-300 animate-slide-up ${staggerClass} ${
        !isStyled
          ? "border-gray-100 dark:border-white/5 shadow-sm hover:shadow-card-hover dark:hover:shadow-dark-card-hover"
          : post.theme === "neon"
          ? "hover:-translate-y-1"
          : "border-transparent shadow-md hover:shadow-xl hover:-translate-y-1"
      }`}
      style={fontStyle}
    >
      <div className={`p-4 relative z-10 ${isInstagram ? "h-full flex flex-col justify-between" : ""}`}>

        {/* Author row */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar username={post.author} color={post.authorColor} size="sm" />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold post-title truncate ${isStyled ? "" : "text-gray-800 dark:text-gray-100"}`}>
              {post.author}
            </p>
            <p className={`text-[11px] post-meta ${isStyled ? "" : "text-gray-400"}`}>
              {timeAgo(post.createdAt)}
            </p>
          </div>
          {/* Theme badge */}
          {isStyled && (
            <span className="text-sm shrink-0 px-1.5 py-0.5 rounded-lg" title={postTheme.label}>{postTheme.icon}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3
            className={`font-bold mb-1.5 line-clamp-2 leading-snug post-title ${
              isStyled ? "" : "text-gray-900 dark:text-gray-50"
            } ${isInstagram ? "text-lg" : ""}`}
            style={fontStyle}
          >
            {post.title}
          </h3>
          <p
            className={`text-sm line-clamp-3 leading-relaxed post-body ${
              isStyled ? "" : "text-gray-600 dark:text-gray-300"
            } ${isInstagram ? "line-clamp-5 text-base" : ""}`}
            style={fontStyle}
          >
            {post.content}
          </p>

          {/* Shayari decoration */}
          {post.theme === "shayari" && (
            <div className="post-theme-deco">✒️</div>
          )}
        </div>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className={`post-tag text-[11px] px-2 py-0.5 rounded-full font-medium ${
                  isStyled ? "" : "bg-brand/8 dark:bg-brand/15 text-brand dark:text-brand-light"
                }`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Quick react summary badges */}
        {Object.keys(localReacts).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(localReacts).map(([emoji, count]) =>
              count > 0 ? (
                <span
                  key={emoji}
                  className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 transition-all ${
                    reactingEmoji === emoji ? "scale-125" : ""
                  } ${
                    isStyled
                      ? "bg-white/15 text-white"
                      : "bg-gray-100 dark:bg-white/8 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {emoji} {count}
                </span>
              ) : null
            )}
          </div>
        )}

        {/* Actions row */}
        <div className={`flex items-center justify-between mt-3 pt-3 post-divider ${
          isStyled ? "border-t border-white/10" : "border-t border-gray-100 dark:border-white/5"
        }`}>
          <div className="flex items-center gap-3">
            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-sm transition-all active:scale-90 ${
                liked ? "text-red-500" : isStyled ? "text-white/60 hover:text-red-400" : "text-gray-400 hover:text-red-400"
              }`}
            >
              {liked ? "❤️" : "🤍"} <span className="text-xs font-semibold">{post.likes}</span>
            </button>
            {/* Comments */}
            <span className={`flex items-center gap-1 text-xs ${isStyled ? "text-white/50" : "text-gray-400"}`}>
              💬 {post.comments?.length || 0}
            </span>
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {/* Quick react toggle */}
            <button
              onClick={(e) => { e.stopPropagation(); setShowReactBar(v => !v); }}
              className={`text-sm px-2 py-1 rounded-lg transition ${
                showReactBar
                  ? "bg-brand/10 text-brand"
                  : isStyled
                    ? "text-white/50 hover:bg-white/10 hover:text-white"
                    : "text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 hover:text-brand"
              }`}
              title="Quick React"
            >
              😊
            </button>
            {/* Copy */}
            <button
              onClick={handleCopy}
              className={`text-xs px-2 py-1 rounded-lg transition ${
                isStyled
                  ? "text-white/50 hover:bg-white/10 hover:text-white"
                  : "bg-gray-100 dark:bg-white/8 text-gray-500 dark:text-gray-400 hover:bg-brand/10 hover:text-brand"
              }`}
            >
              {copying ? "✓" : "📋"}
            </button>
            {/* Report */}
            <button
              onClick={handleReport}
              className={`text-xs transition opacity-0 group-hover/card:opacity-100 px-1 rounded hover:text-red-400 ${
                isStyled ? "text-white/30" : "text-gray-300"
              }`}
              title="Report"
            >
              🚩
            </button>
          </div>
        </div>

        {/* Quick react emoji bar — more emojis */}
        <div className={`react-bar mt-2 ${showReactBar ? "show" : ""}`}>
          {QUICK_REACTS.map((emoji) => (
            <button
              key={emoji}
              onClick={(e) => handleQuickReact(e, emoji)}
              className={`react-btn ${reactingEmoji === emoji ? "scale-125" : ""}`}
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}