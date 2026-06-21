import { useState, useRef, useEffect } from "react";
import { useUserStore } from "../../store/userStore";
import { usePostStore } from "../../store/postStore";
import { useUIStore } from "../../store/uiStore";
import Avatar from "../UI/Avatar";
import { POST_THEMES } from "../../utils/postThemes";
import PostThemeLayer from "../UI/PostThemeLayer";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "/api";
const MAX_CONTENT = 2000;
const MAX_TITLE = 120;

const PREMIUM_THEMES = new Set(["starfield", "glitch", "polaroid"]);

// Character count ring
function CharRing({ value, max, size = 24 }) {
  const pct = Math.min(value / max, 1);
  const r = 9;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  const color = pct > 0.9 ? "#ef4444" : pct > 0.75 ? "#f59e0b" : "#7C3AED";
  if (value === 0) return null;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="shrink-0">
      <circle cx="12" cy="12" r={r} fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-200 dark:text-gray-700" />
      <circle cx="12" cy="12" r={r} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} />
      {pct > 0.8 && (
        <text x="12" y="16" textAnchor="middle" fontSize="7" fill={color} fontWeight="700">{max - value}</text>
      )}
    </svg>
  );
}

// 4:3 WYSIWYG live preview of the selected theme
function LivePreview({ title, content, theme, username, color }) {
  const t = POST_THEMES.find((x) => x.id === theme) || POST_THEMES[0];
  const isPremium = PREMIUM_THEMES.has(theme);
  const fontStyle = t.font ? { fontFamily: t.font } : {};
  const isCentered = t.align === "center";

  if (!isPremium) return null;

  return (
    <div className="mt-3 space-y-1">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Preview · 4:3</p>
      <div
        className={`${t.css} post-43-ratio rounded-2xl overflow-hidden shadow-lg border border-transparent`}
        style={fontStyle}
      >
        {/* Dynamic theme layer */}
        <PostThemeLayer theme={theme} />

        <div className="post-inner" style={{ ...fontStyle, textAlign: isCentered ? "center" : "left" }}>
          {/* Author stub */}
          <div className={`flex items-center gap-2 mb-2 ${isCentered ? "justify-center" : ""}`}>
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
              style={{ background: color }}
            >
              {username?.[0]?.toUpperCase() || "?"}
            </div>
            <span className={`text-[10px] font-semibold post-title`}>
              {username || "You"}
            </span>
            {isCentered && <span className="ml-1 text-sm">{t.icon}</span>}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <h3 className="font-bold text-base mb-1.5 leading-snug post-title" style={fontStyle}>
              {title || "Your title here..."}
            </h3>
            <p className="text-sm leading-relaxed post-body opacity-90" style={{ ...fontStyle, whiteSpace: "pre-wrap" }}>
              {content || "Your content will appear here with the selected theme applied. Choose a template that matches your vibe!"}
            </p>
          </div>

          <div className="mt-2 pt-2 post-divider border-t border-white/10 flex items-center gap-3 text-xs post-meta">
            <span>🤍 0</span>
            <span>💬 0</span>
            <span className="ml-auto opacity-50">{t.icon} {t.label}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuickCompose({ onClose, onPublished }) {
  const { username, color, sessionId } = useUserStore();
  const { addPost } = usePostStore();
  const { showToast } = useUIStore();

  const [form, setForm] = useState({ title: "", content: "", tags: "" });
  const [theme, setTheme] = useState("default");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);

  // Focus textarea when modal opens
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      showToast("Title and content are required", "error");
      return;
    }
    if (!username) {
      showToast("Please log in first!", "warning");
      return;
    }
    setLoading(true);
    try {
      const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const { data } = await axios.post(`${API}/posts`, {
        title: form.title,
        content: form.content,
        tags,
        author: username,
        authorColor: color,
        sessionId,
        room: "global",
        theme,
      });
      addPost(data);
      showToast("Post published! 🎉", "success");
      onPublished?.();
      onClose?.();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to post", "error");
    } finally {
      setLoading(false);
    }
  };

  // Group themes: default first, then premium
  const defaultTheme = POST_THEMES.filter((t) => !PREMIUM_THEMES.has(t.id));
  const premiumThemes = POST_THEMES.filter((t) => PREMIUM_THEMES.has(t.id));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-slide"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl shadow-2xl animate-scale-in bg-white dark:bg-navy-800 p-6 space-y-4 border border-gray-100 dark:border-white/5"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-xl">✍️</span>
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">Create a New Post</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none transition"
          >
            ✕
          </button>
        </div>

        {/* Title */}
        <input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Give it a title..."
          maxLength={MAX_TITLE}
          className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-navy-800/80 text-gray-900 dark:text-gray-100 outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10 text-base font-semibold placeholder:font-normal placeholder:text-sm transition-all"
        />

        {/* Content */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            placeholder="What's on your mind? (Use Enter key for new lines)"
            rows={4}
            maxLength={MAX_CONTENT}
            className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-navy-800/80 text-gray-900 dark:text-gray-100 outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10 text-sm resize-none transition-all"
          />
          <div className="absolute bottom-3 right-3">
            <CharRing value={form.content.length} max={MAX_CONTENT} />
          </div>
        </div>

        {/* Tags */}
        <input
          value={form.tags}
          onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
          placeholder="Tags: thoughts, idea, poetry (comma separated)"
          className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-navy-800/80 text-gray-900 dark:text-gray-100 outline-none focus:border-brand/40 text-sm transition-all"
        />

        {/* ─── THEME PICKER ─── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Post Template</p>
            {PREMIUM_THEMES.has(theme) && (
              <span className="text-[9px] font-bold text-brand bg-brand/8 px-2 py-0.5 rounded-full">✨ Premium · 4:3</span>
            )}
          </div>

          {/* Default Theme Selector */}
          <div className="flex gap-2 mb-2">
            {defaultTheme.slice(0, 1).map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                title={t.label}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  theme === t.id
                    ? "bg-gray-100 dark:bg-white/10 border-brand/40 text-brand"
                    : "border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-50 dark:hover:bg-navy-700"
                }`}
              >
                {t.icon} Default
              </button>
            ))}
          </div>

          {/* Premium animated templates grid */}
          <p className="text-[9px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest mb-2">Animated Templates</p>
          <div className="grid grid-cols-3 gap-2">
            {premiumThemes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                title={t.label}
                className={`relative flex flex-col items-center gap-1 p-1 rounded-xl transition-all group ${
                  theme === t.id ? "ring-2 ring-brand scale-105" : "hover:scale-102"
                }`}
              >
                {/* Theme swatch */}
                <div
                  className="w-full h-12 rounded-xl overflow-hidden flex items-center justify-center text-xl relative"
                  style={{ background: t.preview }}
                >
                  {t.id === "starfield" && (
                    <>
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="absolute w-0.5 h-0.5 bg-white rounded-full opacity-80"
                          style={{ left: `${10 + i * 14}%`, top: `${15 + (i % 3) * 25}%` }} />
                      ))}
                    </>
                  )}
                  {t.id === "glitch" && (
                    <div className="absolute inset-0 flex flex-col justify-center gap-0.5 px-1">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-px bg-green-500/40 w-full" style={{ width: `${60 + i * 15}%` }} />
                      ))}
                    </div>
                  )}
                  {t.id === "polaroid" && (
                    <div className="absolute inset-0 border-[5px] border-white shadow-inner" />
                  )}
                  <span className="relative z-10 drop-shadow-sm">{t.icon}</span>
                </div>
                <span className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 leading-none truncate w-full text-center">
                  {t.label}
                </span>
                {theme === t.id && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand rounded-full flex items-center justify-center text-[9px] text-white font-bold z-10">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ─── WYSIWYG Live Preview ─── */}
        <LivePreview
          title={form.title}
          content={form.content}
          theme={theme}
          username={username}
          color={color}
        />

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5">
          <p className="text-xs text-gray-400">
            As{" "}
            <span className="font-semibold" style={{ color }}>
              {username}
            </span>{" "}
            · Public · 7 day expiry
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-300 rounded-2xl font-bold text-sm hover:bg-gray-100 dark:hover:bg-navy-700 transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !form.title.trim() || !form.content.trim()}
              className="px-5 py-2 bg-brand text-white rounded-2xl font-bold text-sm hover:bg-brand-dark transition-all active:scale-95 shadow-md shadow-brand/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Publishing...</>
              ) : "Publish →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}