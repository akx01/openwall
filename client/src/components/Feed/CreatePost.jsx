import { useState, useRef } from "react";
import { useUserStore } from "../../store/userStore";
import { usePostStore } from "../../store/postStore";
import { useUIStore } from "../../store/uiStore";
import Avatar from "../UI/Avatar";
import { POST_THEMES } from "../../utils/postThemes";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "/api";
const MAX_CONTENT = 2000;
const MAX_TITLE = 120;

// Character count ring SVG
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
      <circle
        cx="12" cy="12" r={r}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        className="char-ring"
      />
      {pct > 0.8 && (
        <text x="12" y="16" textAnchor="middle" fontSize="7" fill={color} fontWeight="700">
          {max - value}
        </text>
      )}
    </svg>
  );
}

export default function QuickCompose({ onPublished }) {
  const { username, color, sessionId } = useUserStore();
  const { addPost } = usePostStore();
  const { showToast } = useUIStore();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", tags: "" });
  const [theme, setTheme] = useState("default");
  const [loading, setLoading] = useState(false);
  const textareaRef = useRef(null);

  const selectedTheme = POST_THEMES.find((t) => t.id === theme) || POST_THEMES[0];

  const handleOpen = () => {
    setOpen(true);
    setTimeout(() => textareaRef.current?.focus(), 350);
  };

  const handleClose = () => {
    setOpen(false);
    setForm({ title: "", content: "", tags: "" });
    setTheme("default");
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      showToast("Title and content are required", "error");
      return;
    }
    if (!username) {
      showToast("Set a username first!", "warning");
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
      handleClose();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to post", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`glass-card rounded-3xl overflow-hidden transition-all duration-300 ${
        open ? "shadow-lg dark:shadow-dark-card" : ""
      }`}
    >
      {/* Collapsed trigger row */}
      <div className="flex items-center gap-3 p-4">
        <Avatar username={username} color={color} size="md" />
        <button
          onClick={handleOpen}
          className={`flex-1 px-4 py-2.5 rounded-2xl text-left text-sm font-medium transition-all
            ${open
              ? "bg-gray-100 dark:bg-navy-600 text-gray-900 dark:text-gray-100"
              : "bg-gray-50 dark:bg-navy-700/60 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-navy-600 border border-gray-100 dark:border-white/5"
            }`}
        >
          {open ? "✍️  Writing..." : "Write an anonymous note..."}
        </button>
        {open && (
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none transition">
            ✕
          </button>
        )}
      </div>

      {/* Expandable area */}
      <div className={`compose-expand-area ${open ? "open" : ""}`}>
        <div className="px-4 pb-4 space-y-3">

          {/* Live preview banner for themed post */}
          {theme !== "default" && (
            <div className={`rounded-2xl px-4 py-2 text-xs font-medium flex items-center gap-2 ${selectedTheme.preview} ${selectedTheme.dark ? "text-white/80" : "text-black/60"}`}>
              <span>{selectedTheme.icon}</span>
              Preview: <span className="font-bold">{selectedTheme.label}</span> theme
            </div>
          )}

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
              placeholder="What's on your mind? Share anything..."
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
            placeholder="Tags: thoughts, idea, writing (comma separated)"
            className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-navy-800/80 text-gray-900 dark:text-gray-100 outline-none focus:border-brand/40 text-sm transition-all"
          />

          {/* ─── THEME PICKER ─── */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Post Theme</p>
            <div className="flex flex-wrap gap-2">
              {POST_THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  title={t.label}
                  className={`relative group flex flex-col items-center gap-1 p-0.5 rounded-xl transition-all ${
                    theme === t.id
                      ? "ring-2 ring-brand ring-offset-2 ring-offset-white dark:ring-offset-navy-800 scale-105"
                      : "hover:scale-105"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${t.preview} border border-black/10 dark:border-white/10 flex items-center justify-center text-lg shadow-sm`}>
                    {t.icon}
                  </div>
                  <span className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 leading-none">
                    {t.label}
                  </span>
                  {theme === t.id && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand rounded-full flex items-center justify-center text-[9px] text-white font-bold">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <p className="text-xs text-gray-400">
              Posting as{" "}
              <span className="font-semibold" style={{ color }}>
                {username}
              </span>{" "}
              · Public · 7 day expiry
            </p>
            <button
              onClick={handleSubmit}
              disabled={loading || !form.title.trim() || !form.content.trim()}
              className="px-5 py-2 bg-brand text-white rounded-2xl font-bold text-sm hover:bg-brand-dark transition-all active:scale-95 shadow-md shadow-brand/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Publishing...
                </>
              ) : (
                "Publish →"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}