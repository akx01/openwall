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
const PREMIUM_THEMES = new Set(["starfield", "glitch", "polaroid"]);

export default function PostCard({ post, index = 0 }) {
  const { sessionId } = useUserStore();
  const { toggleLike } = usePostStore();
  const { showToast, openModal, openProfile } = useUIStore();
  const [copying, setCopying] = useState(false);
  const [localReacts, setLocalReacts] = useState(post.quickReacts || {});
  const [showReactBar, setShowReactBar] = useState(false);
  const [reactingEmoji, setReactingEmoji] = useState(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const liked = post.likedBy?.includes(sessionId);
  const postTheme = getTheme(post.theme);
  const isPremium = PREMIUM_THEMES.has(post.theme);
  const isStyled = post.theme && post.theme !== "default";
  const isCentered = postTheme.align === "center";

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleCopy = (e) => {
    e.stopPropagation();
    setCopying(true);
    copyToClipboard(`${post.title}\n\n${post.content}`);
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
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX || (e.touches && e.touches[0]?.clientX) || (e.changedTouches && e.changedTouches[0]?.clientX) || (rect.left + rect.width / 2);
    const y = e.clientY || (e.touches && e.touches[0]?.clientY) || (e.changedTouches && e.changedTouches[0]?.clientY) || (rect.top + rect.height / 2);
    
    fireEmojiReaction(emoji, x, y);
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
      onMouseMove={handleMouseMove}
      className={`group/card relative w-full max-w-lg aspect-[4/5] md:aspect-[3/4] rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-500 animate-slide-up ${staggerClass} ${postTheme.css} ${
        !isStyled
          ? "bg-gradient-to-br from-gray-900 via-gray-950 to-navy-950 text-white border border-white/10 shadow-2xl hover:border-white/20"
          : "text-white shadow-2xl"
      }`}
    >
      {/* Spotlight overlay (cyber-warm red/yellow glowing cursor spotlight) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-20"
        style={{
          background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, rgba(245, 158, 11, 0.08), transparent 80%)`,
        }}
      />

      {/* Dynamic theme layer (stars, glitch lines, etc.) */}
      {isPremium && <PostThemeLayer theme={post.theme} />}

      {/* Ambient gradient overlay for text readability at the bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40 pointer-events-none z-10" />

      {/* Top Capsule Theme Badge */}
      {isStyled && (
        <div className="absolute top-5 left-5 z-20 flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
          <span>{postTheme.icon}</span>
          <span>{postTheme.label}</span>
        </div>
      )}

      {/* Quick react emoji bar (floats next to React button) */}
      {showReactBar && (
        <div className="absolute right-20 bottom-44 bg-black/85 backdrop-blur-lg border border-white/10 rounded-2xl p-2 flex gap-2 z-30 animate-scale-in shadow-xl" onClick={(e) => e.stopPropagation()}>
          {QUICK_REACTS.map((emoji) => (
            <button
              key={emoji}
              onClick={(e) => handleQuickReact(e, emoji)}
              className="text-lg hover:scale-125 transition-transform active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Main card body container */}
      <div className="absolute inset-0 p-6 flex flex-col justify-between z-10" style={fontStyle}>
        
        {/* Top spacer (pushes content down) */}
        <div className="h-12" />

        {/* Content area: Title + Body */}
        <div className="flex-1 flex flex-col justify-center pr-16 overflow-hidden py-4" style={textAlign}>
          <h3
            className={`font-black tracking-tight mb-3 leading-tight post-title ${
              isPremium ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
            }`}
            style={fontStyle}
          >
            {post.title}
          </h3>
          <p
            className={`leading-relaxed post-body opacity-90 line-clamp-6 md:line-clamp-none ${
              isPremium ? "text-base md:text-lg" : "text-sm md:text-base"
            }`}
            style={{ ...fontStyle, whiteSpace: "pre-wrap" }}
          >
            {post.content}
          </p>
        </div>

        {/* Bottom Profile Row */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            openProfile(post.author);
          }}
          className="flex items-center gap-3 pr-16 cursor-pointer hover:opacity-90 transition group/author"
        >
          <div className="relative shrink-0">
            {/* Glowing avatar ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-brand to-yellow-500 blur-sm opacity-70 animate-pulse group-hover/author:scale-105 transition-all" />
            <div className="relative">
              <Avatar username={post.author} color={post.authorColor} size="md" />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-sm text-white truncate post-title group-hover/author:text-brand transition-colors">
                {post.author}
              </p>
              <span className="text-[10px] text-white/50">•</span>
              <p className="text-[10px] text-white/50 truncate post-meta">
                {timeAgo(post.createdAt)}
              </p>
            </div>
            {/* Tags row */}
            {post.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-medium text-brand-light hover:underline"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Floating Action Sidebar (Right-aligned) */}
      <div className="absolute right-4 bottom-6 flex flex-col items-center gap-4 z-20" onClick={(e) => e.stopPropagation()}>
        {/* Like */}
        <div className="flex flex-col items-center">
          <button
            onClick={handleLike}
            className={`w-11 h-11 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-90 border ${
              liked
                ? "bg-red-500/20 border-red-500 text-red-500"
                : "bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
            }`}
          >
            {liked ? "❤️" : "🤍"}
          </button>
          <span className="text-[10px] font-bold text-white/70 mt-1 shadow-sm">{post.likes}</span>
        </div>

        {/* Comment */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => openModal("comments", post)}
            className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 hover:scale-105 active:scale-95 transition-all shadow-lg cursor-pointer"
          >
            💬
          </button>
          <span className="text-[10px] font-bold text-white/70 mt-1 shadow-sm">{post.comments?.length || 0}</span>
        </div>

        {/* Quick React Emoji Trigger */}
        <div className="flex flex-col items-center">
          <button
            onClick={(e) => { e.stopPropagation(); setShowReactBar(v => !v); }}
            className={`w-11 h-11 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg border ${
              showReactBar
                ? "bg-brand/20 border-brand text-brand"
                : "bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
            }`}
          >
            😊
          </button>
          <span className="text-[10px] font-bold text-white/70 mt-1 shadow-sm">React</span>
        </div>

        {/* Copy */}
        <button
          onClick={handleCopy}
          className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-white/20 hover:scale-105 active:scale-95 transition-all shadow-lg"
          title="Copy content"
        >
          {copying ? "✓" : "📋"}
        </button>

        {/* Report */}
        <button
          onClick={handleReport}
          className="w-11 h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/60 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500 hover:text-red-500 hover:scale-105 active:scale-95 transition-all shadow-lg"
          title="Report post"
        >
          🚩
        </button>
      </div>

    </div>
  );
}