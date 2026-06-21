import { useState, useEffect } from "react";
import { useUserStore } from "../../store/userStore";
import { useUIStore } from "../../store/uiStore";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "/api";
const STORY_THEMES = [
  { id: "fire", label: "🔥 Fire", bg: "bg-gradient-to-tr from-red-600 via-orange-500 to-yellow-400" },
  { id: "sun", label: "☀️ Sun", bg: "bg-gradient-to-tr from-amber-500 to-yellow-300" },
  { id: "magma", label: "🌋 Magma", bg: "bg-gradient-to-tr from-stone-900 via-red-950 to-red-800" },
  { id: "neon", label: "🚨 Neon", bg: "bg-gradient-to-tr from-rose-500 via-red-500 to-amber-400" },
];

export default function CreateStoryModal({ onClose, onPublished }) {
  const { username, color } = useUserStore();
  const { showToast } = useUIStore();
  const [content, setContent] = useState("");
  const [theme, setTheme] = useState("fire");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    if (!username) {
      showToast("Please log in first", "warning");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/stories`, {
        content: content.trim(),
        author: username,
        authorColor: color,
        theme,
      });
      showToast("Story shared! 🌟", "success");
      onPublished?.();
      onClose();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to share story", "error");
    } finally {
      setLoading(false);
    }
  };

  const selectedTheme = STORY_THEMES.find((t) => t.id === theme) || STORY_THEMES[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-slide"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-white dark:bg-navy-800 p-6 space-y-4 border border-gray-100 dark:border-white/5 shadow-2xl animate-scale-in"
      >
        <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-white/5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50 flex items-center gap-1.5">
            <span>✨</span> Create a Story
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none">
            ✕
          </button>
        </div>

        {/* Live Preview */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Story Preview</p>
          <div
            className={`w-full aspect-[9/16] rounded-2xl ${selectedTheme.bg} p-6 flex flex-col justify-between shadow-inner relative overflow-hidden`}
          >
            {/* Soft Ambient Overlay */}
            <div className="absolute inset-0 bg-black/10 pointer-events-none" />
            
            {/* Header info */}
            <div className="flex items-center gap-2 relative z-10">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm border border-white/20"
                style={{ background: color || "#EF4444" }}
              >
                {username?.[0]?.toUpperCase() || "Y"}
              </div>
              <div>
                <p className="font-bold text-xs text-white drop-shadow">{username || "You"}</p>
                <p className="text-[9px] text-white/80 drop-shadow">Now</p>
              </div>
            </div>

            {/* Content Text */}
            <div className="flex-1 flex items-center justify-center relative z-10 py-6">
              <p className="text-white text-center font-display text-lg font-extrabold leading-snug drop-shadow-md break-words max-h-full overflow-y-auto no-scrollbar w-full px-2">
                {content || "Type something cool..."}
              </p>
            </div>

            {/* Bottom watermark */}
            <div className="text-center relative z-10">
              <p className="text-[10px] text-white/40 tracking-wider font-bold font-display uppercase">Openwall Stories</p>
            </div>
          </div>
        </div>

        {/* Story Text Input */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value.slice(0, 200))}
          placeholder="What's your story? Keep it short & clean..."
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-navy-800/80 text-gray-900 dark:text-gray-100 outline-none focus:border-brand/40 text-sm resize-none"
        />
        <div className="flex justify-between text-xs text-gray-400 px-1">
          <span>Expiring in 24 hours</span>
          <span className={content.length >= 180 ? "text-amber-500 font-medium" : ""}>
            {content.length}/200
          </span>
        </div>

        {/* Theme Picker */}
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Gradient Theme</p>
          <div className="grid grid-cols-4 gap-2">
            {STORY_THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`py-2 rounded-xl text-center text-xs font-bold text-white shadow-sm border transition-all ${t.bg} ${
                  theme === t.id ? "ring-2 ring-brand scale-105 border-white" : "border-transparent opacity-80 hover:opacity-100"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-white/5">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-300 rounded-xl font-bold text-xs hover:bg-gray-100 dark:hover:bg-navy-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !content.trim()}
            className="px-5 py-2 bg-brand text-white rounded-xl font-bold text-xs hover:bg-brand-dark transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {loading ? "Publishing..." : "Share Story 🚀"}
          </button>
        </div>
      </div>
    </div>
  );
}
