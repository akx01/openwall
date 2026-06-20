import { useState } from "react";
import Avatar from "../UI/Avatar";
import { timeAgo, copyToClipboard } from "../../utils/helpers";
import { useUserStore } from "../../store/userStore";
import { usePostStore } from "../../store/postStore";
import { useUIStore } from "../../store/uiStore";
import { getTheme } from "../../utils/postThemes";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "/api";

const QUICK_REACTS = ["👍", "❤️", "😂", "😮", "🔥"];

export default function PostCard({ post, index = 0 }) {
  const { sessionId } = useUserStore();
  const { toggleLike } = usePostStore();
  const { showToast, openModal } = useUIStore();
  const [copying, setCopying] = useState(false);
  const [localReacts, setLocalReacts] = useState(post.quickReacts || {});
  const [showReactBar, setShowReactBar] = useState(false);

  const liked = post.likedBy?.includes(sessionId);
  const postTheme = getTheme(post.theme);

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

  return (
    <div
      onClick={() => openModal("postDetail", post)}
      className={`group/card ${postTheme.css} rounded-2xl overflow-hidden cursor-pointer border transition-all duration-300 animate-slide-up ${staggerClass} ${
        post.theme === "default" || !post.theme
          ? "border-gray-100 dark:border-white/5 shadow-sm hover:shadow-card-hover dark:hover:shadow-dark-card-hover"
          : "border-transparent shadow-md hover:shadow-xl hover:-translate-y-1"
      }`}
    >
      <div className="p-4 relative z-10">
        {/* Author row */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar username={post.author} color={post.authorColor} size="sm" />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-semibold post-title truncate ${post.theme && post.theme !== "default" ? "" : "text-gray-800 dark:text-gray-100"}`}>
              {post.author}
            </p>
            <p className={`text-[11px] post-meta ${post.theme && post.theme !== "default" ? "" : "text-gray-400"}`}>
              {timeAgo(post.createdAt)}
            </p>
          </div>
          {/* Theme badge */}
          {post.theme && post.theme !== "default" && (
            <span className="text-sm shrink-0" title={postTheme.label}>{postTheme.icon}</span>
          )}
        </div>

        {/* Content */}
        <h3 className={`font-bold mb-1.5 line-clamp-2 leading-snug post-title ${post.theme && post.theme !== "default" ? "" : "text-gray-900 dark:text-gray-50"}`}>
          {post.title}
        </h3>
        <p className={`text-sm line-clamp-3 leading-relaxed post-body ${post.theme && post.theme !== "default" ? "" : "text-gray-600 dark:text-gray-300"}`}>
          {post.content}
        </p>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className={`post-tag text-[11px] px-2 py-0.5 rounded-full font-medium ${
                  post.theme && post.theme !== "default"
                    ? ""
                    : "bg-brand/8 dark:bg-brand/15 text-brand dark:text-brand-light"
                }`}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Quick react summary */}
        {Object.keys(localReacts).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(localReacts).map(([emoji, count]) =>
              count > 0 ? (
                <span
                  key={emoji}
                  className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    post.theme && post.theme !== "default"
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
          post.theme && post.theme !== "default"
            ? "border-t border-white/10"
            : "border-t border-gray-100 dark:border-white/5"
        }`}>
          <div className="flex items-center gap-3">
            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-sm transition-all active:scale-90 ${
                liked ? "text-red-500" : post.theme && post.theme !== "default" ? "text-white/60 hover:text-red-400" : "text-gray-400 hover:text-red-400"
              }`}
            >
              {liked ? "❤️" : "🤍"} <span className="text-xs font-semibold">{post.likes}</span>
            </button>
            {/* Comments */}
            <span className={`flex items-center gap-1 text-xs ${post.theme && post.theme !== "default" ? "text-white/50" : "text-gray-400"}`}>
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
                  : post.theme && post.theme !== "default"
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
                post.theme && post.theme !== "default"
                  ? "text-white/50 hover:bg-white/10 hover:text-white"
                  : "bg-gray-100 dark:bg-white/8 text-gray-500 dark:text-gray-400 hover:bg-brand/10 hover:text-brand"
              }`}
            >
              {copying ? "✓" : "📋"}
            </button>
            {/* Report — hover only */}
            <button
              onClick={handleReport}
              className={`text-xs transition opacity-0 group-hover/card:opacity-100 px-1 rounded hover:text-red-400 ${
                post.theme && post.theme !== "default" ? "text-white/30" : "text-gray-300"
              }`}
              title="Report"
            >
              🚩
            </button>
          </div>
        </div>

        {/* Quick react emoji bar */}
        <div className={`react-bar mt-2 ${showReactBar ? "show" : ""}`}>
          {QUICK_REACTS.map((emoji) => (
            <button
              key={emoji}
              onClick={(e) => handleQuickReact(e, emoji)}
              className="react-btn"
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