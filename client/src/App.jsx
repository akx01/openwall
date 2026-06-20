import { useEffect, useState } from "react";
import { useUserStore } from "./store/userStore";
import { useUIStore } from "./store/uiStore";
import { useChatStore } from "./store/chatStore";
import { useRoomStore } from "./store/roomStore";
import { useSocket } from "./hooks/useSocket";

import Feed from "./components/Feed/Feed";
import CreatePost from "./components/Feed/CreatePost";
import PostModal from "./components/Feed/PostModal";
import SettingsPage from "./pages/SettingsPage";
import RoomBrowser from "./components/Rooms/RoomBrowser";
import RoomOverlay from "./components/Rooms/RoomOverlay";
import BottomNav from "./components/Mobile/BottomNav";
import ToastContainer from "./components/UI/Toast";
import GEditNotepad from "./components/Notepad/GEditNotepad";
import Avatar from "./components/UI/Avatar";

// Username entry screen shown if no username is set
function UsernameGate({ onSet }) {
  const [name, setName] = useState("");
  const { setUsername } = useUserStore();
  const { showToast } = useUIStore();
  
  const handle = () => {
    if (!name.trim()) return;
    setUsername(name.trim());
    showToast(`Welcome back, ${name.trim()}!`, "success");
    onSet();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 bg-premium-gradient">
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-[2.5rem] shadow-xl p-8 w-full max-w-sm text-center border border-white/20 dark:border-gray-800">
        <h1 className="text-3xl font-extrabold text-brand mb-1 tracking-tight">OpenWall</h1>
        <p className="text-gray-400 text-sm mb-6">Anonymous public writing & real-time chat.</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handle()}
          placeholder="Choose a username"
          maxLength={30}
          autoFocus
          className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-center text-sm outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand mb-4 transition-all"
        />
        <button
          onClick={handle}
          className="w-full py-3.5 bg-brand text-white rounded-2xl font-bold hover:bg-brand-dark transition-all transform active:scale-95 shadow-lg shadow-brand/10 hover:shadow-brand/20"
        >
          Enter OpenWall →
        </button>
        <p className="text-xs text-gray-400 mt-4">All posts automatically delete after 7 days.</p>
      </div>
    </div>
  );
}

export default function App() {
  const { username, color, darkMode, toggleDarkMode } = useUserStore();
  const { activeModal, openModal, closeModal, onlineCount } = useUIStore();
  const { loadRooms } = useChatStore();
  const { activeRoom, closeRoom } = useRoomStore();

  const [entered, setEntered] = useState(!!username);
  const [mobileTab, setMobileTab] = useState("home");
  const [showRoomsBrowser, setShowRoomsBrowser] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Connect Socket.IO
  useSocket();

  useEffect(() => {
    loadRooms();
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  if (!entered || !username) {
    return <UsernameGate onSet={() => setEntered(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 bg-premium-gradient flex flex-col transition-colors duration-300">
      
      {/* Header — Desktop & Mobile top bar */}
      <header className="sticky top-0 z-30 glass-effect border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-brand tracking-tight cursor-pointer" onClick={() => setMobileTab("home")}>
            OpenWall
          </h1>
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 border border-green-200 dark:border-green-500/20">
            🟢 Online
          </span>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-3">
          {/* Navigation links for Desktop */}
          <nav className="hidden md:flex items-center gap-2 mr-4">
            <button
              onClick={() => setMobileTab("home")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                mobileTab === "home" ? "bg-brand/10 text-brand dark:bg-brand/20" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => { setShowRoomsBrowser(true); }}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              Rooms
            </button>
            <button
              onClick={() => setMobileTab("notepad")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                mobileTab === "notepad" ? "bg-brand/10 text-brand dark:bg-brand/20" : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              Notepad
            </button>
          </nav>

          {/* Theme toggler */}
          <button
            onClick={toggleDarkMode}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-150/50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition"
            title="Toggle Theme"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>

          {/* User profile / Settings trigger */}
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800 p-1.5 pr-3 rounded-xl transition"
          >
            <Avatar username={username} color={color} size="sm" />
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 hidden sm:inline truncate max-w-[100px]">
              {username}
            </span>
          </button>
        </div>
      </header>

      {/* Main body content container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 pb-24 md:pb-8 flex flex-col md:flex-row gap-6">
        
        {/* Left container: Home Feed, Notepad, etc. */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Home view */}
          {mobileTab === "home" && (
            <div className="space-y-6">
              {/* Header card with input trigger */}
              <div className="glass-card p-5 rounded-3xl flex items-center gap-4">
                <Avatar username={username} color={color} size="md" />
                <button
                  onClick={() => openModal("createPost")}
                  className="flex-1 px-5 py-3 rounded-2xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-left text-sm text-gray-400 dark:text-gray-300 font-medium transition cursor-pointer border border-gray-100 dark:border-gray-750"
                >
                  Write an anonymous note...
                </button>
              </div>

              {/* Feed Card Grid */}
              <Feed />
            </div>
          )}

          {/* Collaborative Notepad View */}
          {mobileTab === "notepad" && <GEditNotepad />}

          {/* Rooms List page for mobile when clicked rooms tab */}
          {mobileTab === "rooms" && (
            <div className="glass-card p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Chat Channels</h2>
                <button
                  onClick={() => setShowRoomsBrowser(true)}
                  className="text-xs px-3 py-2 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark transition"
                >
                  Browse Rooms
                </button>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Select a channel from the browser to chat live with other users.
              </p>
              {activeRoom ? (
                <div className="p-4 bg-brand/5 border border-brand/10 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-brand">Currently in #{activeRoom.name}</p>
                    <p className="text-xs text-gray-400">{activeRoom.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal("chat")}
                      className="text-xs px-3 py-1.5 bg-brand text-white rounded-xl font-semibold"
                    >
                      Open Chat
                    </button>
                    <button
                      onClick={closeRoom}
                      className="text-xs px-3 py-1.5 border border-gray-250 dark:border-gray-700 rounded-xl font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      Leave
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-3xl mb-1">💬</p>
                  <p className="text-sm">No active room. Choose a room to get started!</p>
                </div>
              )}
            </div>
          )}

          {/* Mobile settings page tab */}
          {mobileTab === "settings" && <SettingsPage onClose={() => setMobileTab("home")} />}
        </div>
      </main>

      {/* Floating RoomOverlay DM-style active room chat */}
      {activeRoom && <RoomOverlay />}

      {/* Modals & Dialogs */}
      {activeModal === "createPost" && <CreatePost onClose={closeModal} />}
      {activeModal === "postDetail" && <PostModal />}
      {showRoomsBrowser && <RoomBrowser onClose={() => setShowRoomsBrowser(false)} />}
      {showSettings && <SettingsPage onClose={() => setShowSettings(false)} />}

      {/* Bottom Nav for Mobile view users */}
      <BottomNav
        activeTab={mobileTab}
        onChangeTab={(tab) => setMobileTab(tab)}
        hasActiveRoom={!!activeRoom}
      />

      <ToastContainer />
    </div>
  );
}