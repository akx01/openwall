import { useEffect, useState } from "react";
import { useUserStore } from "./store/userStore";
import { useUIStore } from "./store/uiStore";
import { useChatStore } from "./store/chatStore";
import { useRoomStore } from "./store/roomStore";
import { useSocket } from "./hooks/useSocket";

import Feed from "./components/Feed/Feed";
import PostModal from "./components/Feed/PostModal";
import SettingsPage from "./pages/SettingsPage";
import RoomListSection from "./components/Rooms/RoomListSection";
import RoomOverlay from "./components/Rooms/RoomOverlay";
import BottomNav from "./components/Mobile/BottomNav";
import ToastContainer from "./components/UI/Toast";
import GEditNotepad from "./components/Notepad/GEditNotepad";
import Avatar from "./components/UI/Avatar";
import OnlinePresence from "./components/UI/OnlinePresence";

// ─── Animated Theme Toggle ───────────────────
function ThemeToggle({ darkMode, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="theme-toggle-track shrink-0"
      title={darkMode ? "Switch to Light" : "Switch to Dark"}
      aria-label="Toggle theme"
    >
      <div className="theme-toggle-knob">
        {darkMode ? "🌙" : "☀️"}
      </div>
    </button>
  );
}

// ─── Username Gate ────────────────────────────
function UsernameGate({ onSet }) {
  const [name, setName] = useState("");
  const { setUsername } = useUserStore();
  const { showToast } = useUIStore();

  const handle = () => {
    if (!name.trim()) return;
    setUsername(name.trim());
    showToast(`Welcome, ${name.trim()}! 🎉`, "success");
    onSet();
  };

  return (
    <div className="min-h-screen aurora-bg flex items-center justify-center p-4">
      <div className="bg-white/90 dark:bg-navy-800/90 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 w-full max-w-sm text-center border border-white/40 dark:border-white/8 animate-scale-in">
        {/* Logo mark */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-brand flex items-center justify-center shadow-lg shadow-brand/30 animate-float">
          <span className="text-3xl">✏️</span>
        </div>
        <h1 className="text-4xl font-black text-brand tracking-tight mb-1" style={{ fontFamily: "Outfit, sans-serif" }}>
          OpenWall
        </h1>
        <p className="text-gray-400 dark:text-gray-500 text-sm mb-7">
          Anonymous public writing &amp; real-time chat.
        </p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handle()}
          placeholder="Choose a username"
          maxLength={30}
          autoFocus
          className="w-full px-5 py-3.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-navy-700 text-center text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand mb-4 transition-all text-gray-800 dark:text-gray-100"
        />
        <button
          onClick={handle}
          className="w-full py-3.5 bg-brand text-white rounded-2xl font-bold hover:bg-brand-dark transition-all active:scale-95 shadow-lg shadow-brand/25 hover:shadow-brand/40"
        >
          Enter OpenWall →
        </button>
        <p className="text-[11px] text-gray-400 mt-4">All posts auto-delete after 7 days.</p>
      </div>
    </div>
  );
}

// ─── Desktop Nav Link ─────────────────────────
function NavLink({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all relative ${
        active
          ? "bg-brand/10 dark:bg-brand/20 text-brand nav-pill-active"
          : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Main App ─────────────────────────────────
export default function App() {
  const { username, color, darkMode, toggleDarkMode } = useUserStore();
  const { activeModal, closeModal } = useUIStore();
  const { loadRooms } = useChatStore();
  const { activeRoom } = useRoomStore();

  const [entered, setEntered] = useState(!!username);
  const [mobileTab, setMobileTab] = useState("home");
  const [showSettings, setShowSettings] = useState(false);

  useSocket();

  useEffect(() => {
    loadRooms();
    document.documentElement.classList.toggle("dark", darkMode);
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  if (!entered || !username) {
    return <UsernameGate onSet={() => setEntered(true)} />;
  }

  return (
    <div className="min-h-screen aurora-bg text-gray-800 dark:text-gray-100 flex flex-col transition-colors duration-300">

      {/* ─── Header ─────────────────────────────── */}
      <header className="sticky top-0 z-30 glass-effect border-b border-gray-100/80 dark:border-white/5 px-5 py-3 flex items-center justify-between gap-3">
        {/* Logo + Online badge */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setMobileTab("home")}
            className="text-2xl font-black text-brand tracking-tight"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            OpenWall
          </button>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1 ml-4">
          <NavLink active={mobileTab === "home"} onClick={() => setMobileTab("home")}>🏠 Home</NavLink>
          <NavLink active={mobileTab === "rooms"} onClick={() => setMobileTab("rooms")}>💬 Rooms</NavLink>
          <NavLink active={mobileTab === "notepad"} onClick={() => setMobileTab("notepad")}>📝 Notepad</NavLink>
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Live presence */}
          <OnlinePresence />

          {/* Theme toggle */}
          <ThemeToggle darkMode={darkMode} onToggle={toggleDarkMode} />

          {/* Profile button */}
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-white/5 p-1.5 pr-3 rounded-2xl transition-all group"
          >
            <Avatar username={username} color={color} size="sm" />
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 hidden sm:inline truncate max-w-[100px] group-hover:text-brand transition-colors">
              {username}
            </span>
          </button>
        </div>
      </header>

      {/* ─── Main content ────────────────────────── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 pb-24 md:pb-10">
        <div
          key={mobileTab}
          className="animate-fade-slide"
        >
          {mobileTab === "home" && <Feed />}
          {mobileTab === "notepad" && <GEditNotepad />}
          {mobileTab === "rooms" && <RoomListSection />}
          {mobileTab === "settings" && <SettingsPage onClose={() => setMobileTab("home")} />}
        </div>
      </main>

      {/* ─── Overlays & Modals ───────────────────── */}
      {activeRoom && <RoomOverlay />}
      {activeModal === "postDetail" && <PostModal />}
      {showSettings && <SettingsPage onClose={() => setShowSettings(false)} />}

      {/* ─── Bottom Nav (Mobile) ─────────────────── */}
      <BottomNav
        activeTab={mobileTab}
        onChangeTab={setMobileTab}
        hasActiveRoom={!!activeRoom}
      />

      <ToastContainer />
    </div>
  );
}