import { useState } from "react";
import { useUIStore } from "../../store/uiStore";
import { useUserStore } from "../../store/userStore";
import Avatar from "../UI/Avatar";
import { timeAgo, copyToClipboard } from "../../utils/helpers";
import { getTheme } from "../../utils/postThemes";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "/api";

export default function PostModal() {
  const { selectedPost, closeModal, showToast } = useUIStore();
  const { username, color, sessionId } = useUserStore();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(selectedPost?.comments || []);

  if (!selectedPost) return null;

  const postTheme = getTheme(selectedPost.theme);
  const isThemed = selectedPost.theme && selectedPost.theme !== "default";

  const handleComment = async () => {
    if (!comment.trim() || !username) return;
    const { data } = await axios.post(`${API}/posts/${selectedPost._id}/comment`, {
      author: username, authorColor: color, content: comment,
    });
    setComments(data);
    setComment("");
  };

  const handleCopy = () => {
    copyToClipboard(`${selectedPost.title}\n\n${selectedPost.content}`);
    showToast("Copied!", "success");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-slide"
      onClick={closeModal}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl shadow-2xl animate-scale-in"
      >
        {/* Themed header area */}
        <div className={`${postTheme.css} p-6 relative rounded-t-3xl`}>
          {/* Theme badge */}
          {isThemed && (
            <div className={`absolute top-4 right-4 flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${isThemed ? "bg-white/20 text-white" : "bg-brand/10 text-brand"}`}>
              {postTheme.icon} {postTheme.label}
            </div>
          )}

          {/* Author */}
          <div className="flex items-center gap-3 mb-4">
            <Avatar username={selectedPost.author} color={selectedPost.authorColor} size="md" />
            <div>
              <p className={`font-bold post-title ${isThemed ? "" : "text-gray-900 dark:text-gray-50"}`}>
                {selectedPost.author}
              </p>
              <p className={`text-xs post-meta ${isThemed ? "" : "text-gray-400"}`}>
                {timeAgo(selectedPost.createdAt)}
              </p>
            </div>
          </div>

          <h2 className={`text-xl font-black leading-snug mb-3 post-title ${isThemed ? "" : "text-gray-900 dark:text-gray-50"}`}>
            {selectedPost.title}
          </h2>
          <p className={`text-sm leading-relaxed whitespace-pre-wrap post-body ${isThemed ? "" : "text-gray-700 dark:text-gray-300"}`}>
            {selectedPost.content}
          </p>

          {selectedPost.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {selectedPost.tags.map((tag) => (
                <span key={tag} className="post-tag text-xs px-2.5 py-0.5 rounded-full font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className={`flex gap-2 mt-4 pt-4 border-t post-divider ${isThemed ? "border-white/15" : "border-gray-100 dark:border-gray-800"}`}>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition ${
                isThemed
                  ? "bg-white/15 text-white hover:bg-white/25"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-brand/10 hover:text-brand"
              }`}
            >
              📋 Copy
            </button>
            <button
              onClick={closeModal}
              className={`ml-auto px-3 py-1.5 rounded-xl text-sm font-medium transition ${
                isThemed
                  ? "bg-white/15 text-white hover:bg-white/25"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800"
              }`}
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Comments section — always white/dark */}
        <div className="bg-white dark:bg-navy-800 rounded-b-3xl p-6 border-t border-gray-100 dark:border-white/5">
          <h3 className="font-bold text-sm text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
            💬 Comments
            <span className="text-xs bg-gray-100 dark:bg-white/8 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">
              {comments.length}
            </span>
          </h3>

          <div className="space-y-3 max-h-52 overflow-y-auto mb-4 pr-1">
            {comments.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No comments yet. Be the first!</p>
            )}
            {comments.map((c, i) => (
              <div key={i} className="flex gap-3 animate-slide-up">
                <Avatar username={c.author} color={c.authorColor} size="sm" />
                <div className="bg-gray-50 dark:bg-navy-700 rounded-2xl px-3 py-2 flex-1">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-200">{c.author}</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{c.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Avatar username={username} color={color} size="sm" />
            <div className="flex-1 flex gap-2">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleComment()}
                placeholder={username ? "Add a comment..." : "Set a username to comment"}
                disabled={!username}
                className="flex-1 px-4 py-2 rounded-2xl border border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-navy-700 text-sm outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all text-gray-800 dark:text-gray-100"
              />
              <button
                onClick={handleComment}
                disabled={!comment.trim() || !username}
                className="px-4 py-2 bg-brand text-white rounded-2xl text-sm font-bold disabled:opacity-40 transition-all active:scale-95 hover:bg-brand-dark"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}