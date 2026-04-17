import { useState } from "react";
import { useUIStore } from "../../store/uiStore";
import { useUserStore } from "../../store/userStore";
import Avatar from "../UI/Avatar";
import { timeAgo, copyToClipboard } from "../../utils/helpers";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "/api";

export default function PostModal() {
  const { selectedPost, closeModal, showToast } = useUIStore();
  const { username, color, sessionId } = useUserStore();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(selectedPost?.comments || []);

  if (!selectedPost) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={closeModal}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Avatar username={selectedPost.author} color={selectedPost.authorColor} />
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-100">{selectedPost.author}</p>
              <p className="text-xs text-gray-400">{timeAgo(selectedPost.createdAt)}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCopy} className="text-sm px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-brand/10 hover:text-brand transition">
              📋 Copy
            </button>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-50 mb-3">{selectedPost.title}</h2>
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{selectedPost.content}</p>

        {selectedPost.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {selectedPost.tags.map((tag) => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-brand/10 text-brand rounded-full">#{tag}</span>
            ))}
          </div>
        )}

        {/* Comments */}
        <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-4">
          <h3 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-3">
            Comments ({comments.length})
          </h3>
          <div className="space-y-3 max-h-48 overflow-y-auto mb-4">
            {comments.map((c, i) => (
              <div key={i} className="flex gap-2">
                <Avatar username={c.author} color={c.authorColor} size="sm" />
                <div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{c.author}</span>
                  <p className="text-sm text-gray-700 dark:text-gray-400">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleComment()}
              placeholder={username ? "Add a comment..." : "Set a username to comment"}
              disabled={!username}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:border-brand"
            />
            <button
              onClick={handleComment}
              disabled={!comment.trim() || !username}
              className="px-4 py-2 bg-brand text-white rounded-xl text-sm font-medium disabled:opacity-40"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}