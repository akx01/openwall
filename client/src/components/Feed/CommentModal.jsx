import { useState, useEffect, useRef } from "react";
import { useUIStore } from "../../store/uiStore";
import { useUserStore } from "../../store/userStore";
import Avatar from "../UI/Avatar";
import { X, MessageSquare, Send } from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "/api";

export default function CommentModal() {
  const { selectedPost, closeModal, showToast, openProfile } = useUIStore();
  const { username, color } = useUserStore();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);
  const bottomRef = useRef(null);

  // Sync comments on mount
  useEffect(() => {
    if (selectedPost) {
      setComments(selectedPost.comments || []);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [selectedPost]);

  // Scroll to bottom when message list changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  if (!selectedPost) return null;

  const handleComment = async () => {
    if (!comment.trim() || !username) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/posts/${selectedPost._id}/comment`, {
        author: username,
        authorColor: color,
        content: comment.trim(),
      });
      setComments(data);
      setComment("");
      showToast("Comment posted!", "success");
    } catch (err) {
      showToast("Failed to post comment", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-slide"
      onClick={closeModal}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[80vh] overflow-hidden rounded-3xl shadow-2xl animate-scale-in relative bg-white dark:bg-navy-800 border border-gray-150 dark:border-white/5 flex flex-col"
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-brand" />
            <h3 className="font-display font-black text-sm text-gray-900 dark:text-gray-50 uppercase tracking-wider">
              Comments ({comments.length})
            </h3>
          </div>
          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/8 hover:bg-gray-250 dark:hover:bg-white/12 text-gray-500 dark:text-gray-400 flex items-center justify-center transition cursor-pointer"
            title="Close Comments"
          >
            <X size={16} />
          </button>
        </div>

        {/* Post Title Preview */}
        <div className="px-5 py-3.5 bg-gray-50 dark:bg-navy-900/50 border-b border-gray-100 dark:border-white/5">
          <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Commenting on</p>
          <h4 className="font-bold text-xs text-gray-700 dark:text-gray-300 truncate mt-0.5">
            {selectedPost.title}
          </h4>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 no-scrollbar">
          {comments.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <span className="text-4xl mb-2 inline-block">💬</span>
              <p className="text-xs font-semibold">No comments yet</p>
              <p className="text-[10px] mt-1">Be the first to share your thoughts!</p>
            </div>
          ) : (
            comments.map((c, i) => (
              <div key={i} className="flex gap-3 animate-slide-up">
                <div onClick={(e) => { e.stopPropagation(); openProfile(c.author); }} className="cursor-pointer hover:scale-105 transition-transform shrink-0">
                  <Avatar username={c.author} color={c.authorColor} size="sm" />
                </div>
                <div className="bg-gray-50 dark:bg-navy-700 rounded-2xl px-3 py-2 flex-1 border border-gray-100/50 dark:border-white/5">
                  <span onClick={(e) => { e.stopPropagation(); openProfile(c.author); }} className="text-xs font-bold text-gray-800 dark:text-gray-200 cursor-pointer hover:text-brand transition-colors">{c.author}</span>
                  <p className="text-xs text-gray-650 dark:text-gray-350 mt-0.5 leading-relaxed">{c.content}</p>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-navy-800">
          <div className="flex gap-2">
            <Avatar username={username} color={color} size="sm" />
            <div className="flex-1 flex gap-2 items-center bg-gray-50 dark:bg-navy-700/70 rounded-2xl px-4 py-2 border border-gray-200 dark:border-white/8 focus-within:border-brand/45 focus-within:ring-2 focus-within:ring-brand/10 transition-all">
              <input
                ref={inputRef}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleComment()}
                placeholder={username ? "Write a comment..." : "Set a username in settings to comment"}
                disabled={!username}
                className="flex-1 bg-transparent text-xs text-gray-800 dark:text-gray-100 placeholder-gray-450 dark:placeholder-gray-550 outline-none py-1"
              />
              <button
                onClick={handleComment}
                disabled={!comment.trim() || !username || loading}
                className="w-8 h-8 bg-brand text-white rounded-xl flex items-center justify-center disabled:opacity-30 transition-all active:scale-90 hover:bg-brand-dark cursor-pointer shrink-0"
              >
                <Send size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
