import { useUIStore } from "../../store/uiStore";
import Avatar from "../UI/Avatar";
import { timeAgo, copyToClipboard } from "../../utils/helpers";
import { getTheme } from "../../utils/postThemes";
import { X } from "lucide-react";

export default function PostModal() {
  const { selectedPost, closeModal, showToast } = useUIStore();

  if (!selectedPost) return null;

  const postTheme = getTheme(selectedPost.theme);
  const isThemed = selectedPost.theme && selectedPost.theme !== "default";

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
        className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-3xl shadow-2xl animate-scale-in relative bg-white dark:bg-navy-800"
      >
        {/* Floating Close Button in Top Right */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 text-gray-800 dark:text-gray-200 flex items-center justify-center transition cursor-pointer z-20"
          title="Close Modal"
        >
          <X size={16} />
        </button>

        {/* Themed content area */}
        <div className={`${postTheme.css} p-6 relative rounded-3xl pr-14`}>
          {/* Theme badge, shifted left to accommodate the close button */}
          {isThemed && (
            <div className={`absolute top-4 right-14 flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${isThemed ? "bg-white/20 text-white" : "bg-brand/10 text-brand"}`}>
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
          </div>
        </div>
      </div>
    </div>
  );
}