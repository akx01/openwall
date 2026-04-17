import { useState } from "react";
import Avatar from "../UI/Avatar";
import { timeAgo, copyToClipboard } from "../../utils/helpers";
import { useUserStore } from "../../store/userStore";
import { usePostStore } from "../../store/postStore";
import { useUIStore } from "../../store/uiStore";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "/api";

export default function PostCard({ post }) {
  const { sessionId } = useUserStore();
  const { toggleLike } = usePostStore();
  const { showToast, openModal } = useUIStore();
  const [copying, setCopying] = useState(false);

  const liked = post.likedBy?.includes(sessionId);

  const handleCopy = async (e) => {
    e.stopPropagation();
    setCopying(true);
    await copyToClipboard(`${post.title}\n\n${post.content}`);
    showToast("Post copied to clipboard!", "success");
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

  return (
    <div
      onClick={() => openModal("postDetail", post)}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 dark:border-gray-700 group"
    >
      {/* Author */}
      <div className="flex items-center gap-2 mb-3">
        <Avatar username={post.author} color={post.authorColor} size="sm" />
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{post.author}</p>
          <p className="text-xs text-gray-400">{timeAgo(post.createdAt)}</p>
        </div>
      </div>

      {/* Content */}
      <h3 className="font-semibold text-gray-900 dark:text-gray-50 mb-1 line-clamp-2">{post.title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-4">{post.content}</p>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-brand/10 text-brand rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-3">
          {/* Like */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-sm transition ${
              liked ? "text-red-500" : "text-gray-400 hover:text-red-400"
            }`}
          >
            {liked ? "❤️" : "🤍"} {post.likes}
          </button>
          {/* Comments */}
          <span className="flex items-center gap-1 text-sm text-gray-400">
            💬 {post.comments?.length || 0}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Copy button — always visible */}
          <button
            onClick={handleCopy}
            title="Copy post"
            className="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-brand/10 hover:text-brand transition"
          >
            {copying ? "✓ Copied" : "📋 Copy"}
          </button>
          {/* Report */}
          <button
            onClick={handleReport}
            title="Report"
            className="text-xs text-gray-300 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
          >
            🚩
          </button>
        </div>
      </div>
    </div>
  );
}