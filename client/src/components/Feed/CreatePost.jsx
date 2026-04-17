import { useState } from "react";
import { useUserStore } from "../../store/userStore";
import { usePostStore } from "../../store/postStore";
import { useUIStore } from "../../store/uiStore";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "/api";

export default function CreatePost({ onClose }) {
  const { username, color, sessionId } = useUserStore();
  const { addPost } = usePostStore();
  const { showToast } = useUIStore();
  const [form, setForm] = useState({ title: "", content: "", tags: "" });
  const [loading, setLoading] = useState(false);

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
      });
      addPost(data); // add to feed instantly
      showToast("Post published!", "success");
      onClose?.();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to post", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">New Post</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="space-y-3">
          <input
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Title"
            maxLength={120}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-brand text-sm font-medium"
          />
          <textarea
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            placeholder="What's on your mind?"
            rows={6}
            maxLength={2000}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-brand text-sm resize-none"
          />
          <input
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            placeholder="Tags (comma separated): thoughts, writing, idea"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 outline-none focus:border-brand text-sm"
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-400">
            Posting as <span className="font-medium" style={{ color }}>{username || "anonymous"}</span>
            {" · "}Public · Deleted in 7 days
          </p>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 bg-brand text-white rounded-xl font-medium text-sm hover:bg-brand-dark transition disabled:opacity-50"
          >
            {loading ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>
    </div>
  );
}