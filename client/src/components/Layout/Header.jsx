import { useUIStore } from "../../store/uiStore";
import { useUserStore } from "../../store/userStore";

export default function Header({ onOpenSettings }) {
  const { openModal } = useUIStore();
  const { username } = useUserStore();

  return (
    <div className="h-14 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-700 dark:text-gray-200">Feed</span>
        <span className="text-xs text-gray-400 hidden sm:block">— all posts are public</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSettings}
          className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          ⚙️ {username || "Set username"}
        </button>
        <button
          onClick={() => openModal("createPost")}
          className="bg-brand text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-brand-dark transition shadow-sm"
        >
          + Write
        </button>
      </div>
    </div>
  );
}