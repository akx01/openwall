import RoomList from "../Chat/RoomList";
import { useUserStore } from "../../store/userStore";
import { useChatStore } from "../../store/chatStore";
import Avatar from "../UI/Avatar";

export default function Sidebar() {
  const { username, color, darkMode, toggleDarkMode } = useUserStore();
  const { onlineCount } = useChatStore();

  return (
    <div className="w-56 flex-shrink-0 border-r border-gray-100 dark:border-gray-800 flex flex-col bg-white dark:bg-gray-900 h-full">
      {/* Brand */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800">
        <h1 className="text-xl font-bold text-brand">OpenWall</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          🟢 {onlineCount} online
        </p>
      </div>

      {/* User info */}
      {username && (
        <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <Avatar username={username} color={color} size="sm" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{username}</span>
        </div>
      )}

      {/* Room list */}
      <div className="flex-1 overflow-y-auto">
        <RoomList />
      </div>

      {/* Dark mode toggle */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition py-1"
        >
          {darkMode ? "☀️ Light mode" : "🌙 Dark mode"}
        </button>
      </div>
    </div>
  );
}