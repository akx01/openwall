import { useState } from "react";
import Avatar from "../UI/Avatar";
import { timeAgo, copyToClipboard } from "../../utils/helpers";
import { useUserStore } from "../../store/userStore";
import { usePostStore } from "../../store/postStore";
import { useUIStore } from "../../store/uiStore";
import { getTheme } from "../../utils/postThemes";
import { fireEmojiReaction } from "../UI/EmojiReactionBurst";
import PostThemeLayer from "../UI/PostThemeLayer";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "/api";

const QUICK_REACTS = ["👍", "❤️", "😂", "😮", "🔥", "🎉", "😍"];

// Themes that use 4:3 aspect ratio (premium templates)
const PREMIUM_THEMES = new Set(["burning", "starfield", "neon-sign", "liquid", "hologram", "glitch", "polaroid", "ink"]);

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
  const isPremium = PREMIUM_THEMES.has(post.theme);
  const isStyled = post.theme && post.theme !== "default";
  const isCentered = postTheme.align === "center";

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
    fireEmojiReaction(emoji, e.clientX, e.clientY);
    setReactingEmoji(emoji);
    setTimeout(() => setReactingEmoji(null), 600);

    try {
      const { data } = await axios.post(`${API}/posts/${post._id}/react`, { emoji, sessionId });
      setLocalReacts(data.quickReacts || {});
    } catch {
      setLocalReacts((prev) => ({ ...prev, [emoji]: (prev[emoji] || 0) + 1 }));
    }
    setShowReactBar(false);
  };

  const staggerClass = `stagger-${Math.min((index % 6) + 1, 6)}`;
  const fontStyle = postTheme.font ? { fontFamily: postTheme.font } : {};
  const textAlign = isCentered ? { textAlign: "center" } : {};

  return (
    <div
      onClick={() => openModal("postDetail", post)}
      className={`group/card ${postTheme.css} ${isPremium ? "post-43-ratio" : ""} rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 animate-slide-up ${staggerClass} ${
        !isStyled
          ? "border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-card-hover dark:hover:shadow-dark-card-hover"
          : isPremium
          ? "hover:-translate-y-1 hover:scale-[1.01]"
          : "border border-transparent shadow-md hover:shadow-xl hover:-translate-y-1"
      }`}
    >
      {/* Dynamic theme layer (stars, fire embers, liquid blobs, etc.) */}
      {isPremium && <PostThemeLayer theme={post.theme} />}

      {/* Content wrapper */}
      <div
        className={isPremium ? "post-inner" : "p-4"}
        data-title={post.title}
        style={{ ...fontStyle, ...textAlign }}
      >
        {/* Author row */}
        <div className={`flex items-center gap-2 mb-3 ${isCentered ? "justify-center" : ""}`}>
          <Avatar username={post.author} color={post.authorColor} size="sm" />
          <div className={isCentered ? "text-center" : "flex-1 min-w-0"}>
            <p className={`text-sm font-semibold post-title truncate ${isStyled ? "" : "text-gray-800 dark:text-gray-100"}`}>
              {post.author}
            </p>
            <p className={`text-[11px] post-meta ${isStyled ? "" : "text-gray-400"}`}>
              {timeAgo(post.createdAt)}
            </p>
          </div>
          {isStyled && !isCentered && (
            <span className="text-sm shrink-0 ml-auto" title={postTheme.label}>{postTheme.icon}</span>
          )}
        </div>

        {/* Theme icon for centered layouts */}
        {isStyled && isCentered && (
          <div className="text-xl mb-1 opacity-70">{postTheme.icon}</div>
        )}

        {/* Content */}
        <div className="flex-1">
          <h3
            className={`font-bold mb-2 leading-snug post-title ${
              isStyled ? "" : "text-gray-900 dark:text-gray-50"
            } ${isPremium ? "text-lg" : "line-clamp-2"}`}
            style={fontStyle}
          >
            {post.title}
          </h3>
          <p
            className={`text-sm leading-relaxed post-body ${
              isStyled ? "" : "text-gray-600 dark:text-gray-300"
            } ${isPremium ? "line-clamp-4 text-[15px]" : "line-clamp-3"}`}
            style={fontStyle}
          >
            {post.content}
          </p>
        </div>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-3 ${isCentered ? "justify-center" : ""}`}>
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

        {/* Quick react summary */}
        {Object.keys(localReacts).length > 0 && (
          <div className={`flex flex-wrap gap-1 mt-2 ${isCentered ? "justify-center" : ""}`}>
            {Object.entries(localReacts).map(([emoji, count]) =>
              count > 0 ? (
                <span
                  key={emoji}
                  className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 transition-all ${
                    reactingEmoji === emoji ? "scale-125" : ""
                  } ${
                    isStyled ? "bg-white/15 text-white" : "bg-gray-100 dark:bg-white/8 text-gray-700 dark:text-gray-300"
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
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-sm transition-all active:scale-90 ${
                liked ? "text-red-500" : isStyled ? "text-white/60 hover:text-red-400" : "text-gray-400 hover:text-red-400"
              }`}
            >
              {liked ? "❤️" : "🤍"} <span className="text-xs font-semibold">{post.likes}</span>
            </button>
            <span className={`flex items-center gap-1 text-xs ${isStyled ? "text-white/50" : "text-gray-400"}`}>
              💬 {post.comments?.length || 0}
            </span>
          </div>

          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowReactBar(v => !v); }}
              className={`text-sm px-2 py-1 rounded-lg transition ${
                showReactBar ? "bg-brand/10 text-brand" :
                isStyled ? "text-white/50 hover:bg-white/10 hover:text-white" :
                "text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8 hover:text-brand"
              }`}
              title="React"
            >😊</button>
            <button
              onClick={handleCopy}
              className={`text-xs px-2 py-1 rounded-lg transition ${
                isStyled ? "text-white/50 hover:bg-white/10 hover:text-white" :
                "bg-gray-100 dark:bg-white/8 text-gray-500 dark:text-gray-400 hover:bg-brand/10 hover:text-brand"
              }`}
            >{copying ? "✓" : "📋"}</button>
            <button
              onClick={handleReport}
              className={`text-xs transition opacity-0 group-hover/card:opacity-100 px-1 rounded hover:text-red-400 ${
                isStyled ? "text-white/30" : "text-gray-300"
              }`}
              title="Report"
            >🚩</button>
          </div>
        </div>

        {/* Quick react emoji bar */}
        <div className={`react-bar mt-2 ${showReactBar ? "show" : ""} ${isCentered ? "justify-center" : ""}`}>
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