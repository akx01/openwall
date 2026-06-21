import { useEffect, useState } from "react";
import { useUserStore } from "./store/userStore";
import { useUIStore } from "./store/uiStore";
import { useChatStore } from "./store/chatStore";
import { useRoomStore } from "./store/roomStore";
import { useSocket } from "./hooks/useSocket";

import Feed from "./components/Feed/Feed";
import PostModal from "./components/Feed/PostModal";
import QuickCompose from "./components/Feed/CreatePost";
import SettingsPage from "./pages/SettingsPage";
import RoomListSection from "./components/Rooms/RoomListSection";
import RoomOverlay from "./components/Rooms/RoomOverlay";
import CommentModal from "./components/Feed/CommentModal";
import BottomNav from "./components/Mobile/BottomNav";
import ToastContainer from "./components/UI/Toast";
import GEditNotepad from "./components/Notepad/GEditNotepad";
import Avatar from "./components/UI/Avatar";
import OnlinePresence from "./components/UI/OnlinePresence";
import EmojiReactionBurst from "./components/UI/EmojiReactionBurst";
import BrandLogo from "./components/UI/BrandLogo";
import { motion, AnimatePresence } from "framer-motion";
import { Home, MessageSquare, FileText, Edit3, Sun, Moon } from "lucide-react";

// ─── Animated Theme Toggle ───────────────────
function ThemeToggle({ darkMode, onToggle }) {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-navy-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5 shadow-sm transition-colors cursor-pointer"
      title={darkMode ? "Switch to Light" : "Switch to Dark"}
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={darkMode ? "dark" : "light"}
          initial={{ y: -10, opacity: 0, rotate: -40 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 10, opacity: 0, rotate: 40 }}
          transition={{ duration: 0.15 }}
          className="flex items-center justify-center"
        >
          {darkMode ? <Moon size={18} className="text-yellow-400" /> : <Sun size={18} className="text-orange-500" />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}

// ─── Auth Gate (Login + Register) ─────────────
function AuthGate({ onSuccess }) {
  const { username, register, verifyPassword, hasAccount } = useUserStore();
  const { showToast } = useUIStore();

  // Determine mode: if username + passwordHash exist → login mode, else → register
  const [mode, setMode] = useState(hasAccount() ? "login" : "register");
  const [form, setForm] = useState({ username: username || "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setError(""); };

  const handleSubmit = async () => {
    setError("");
    if (!form.username.trim()) return setError("Username is required");
    if (!form.password) return setError("Password is required");
    setLoading(true);
    try {
      if (mode === "register") {
        if (form.password.length < 4) return setError("Password must be at least 4 characters");
        if (form.password !== form.confirm) return setError("Passwords don't match");
        await register(form.username.trim(), form.password);
        showToast(`Welcome, ${form.username.trim()}! 🎉`, "success");
        onSuccess();
      } else {
        // Login: username must match stored, password must match
        const storedUser = useUserStore.getState().username;
        if (form.username.trim().toLowerCase() !== storedUser.toLowerCase()) {
          return setError("Username not found. Register instead?");
        }
        const ok = await verifyPassword(form.password);
        if (!ok) return setError("Wrong password");
        showToast(`Welcome back, ${storedUser}! 👋`, "success");
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  const keyDown = (e) => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div className="min-h-screen aurora-bg flex items-center justify-center p-4">
      <div className="bg-white/92 dark:bg-navy-800/92 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl w-full max-w-sm border border-white/40 dark:border-white/8 animate-scale-in overflow-hidden">
        {/* Header gradient banner */}
        <div className="h-2 bg-gradient-to-r from-violet-600 via-purple-500 to-cyan-500" />

        <div className="p-8">
          {/* Logo & Title branding Animation */}
          <div className="flex flex-col items-center mb-8">
            <BrandLogo size="lg" className="scale-125 origin-center mb-2" />
            <p className="text-gray-400 dark:text-gray-500 text-xs text-center">
              Anonymous public writing & real-time chat
            </p>
          </div>

          {/* Mode switcher tabs */}
          <div className="flex bg-gray-100 dark:bg-navy-700 rounded-2xl p-1 mb-6">
            {["register", "login"].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); }}
                className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                  mode === m
                    ? "bg-white dark:bg-navy-600 text-brand shadow-sm"
                    : "text-gray-400 dark:text-gray-500 hover:text-gray-600"
                }`}
              >
                {m === "register" ? "✨ Register" : "🔐 Login"}
              </button>
            ))}
          </div>

          {/* Form fields */}
          <div className="space-y-3">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">👤</span>
              <input
                value={form.username}
                onChange={(e) => update("username", e.target.value)}
                onKeyDown={keyDown}
                placeholder={mode === "login" ? "Your username" : "Choose a username"}
                maxLength={30}
                autoFocus
                autoComplete="username"
                className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-navy-700 text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all text-gray-800 dark:text-gray-100"
              />
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔑</span>
              <input
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                onKeyDown={keyDown}
                placeholder="Password"
                maxLength={100}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="w-full pl-10 pr-12 py-3.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-navy-700 text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all text-gray-800 dark:text-gray-100"
              />
              <button
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm"
              >
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>

            {mode === "register" && (
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">✅</span>
                <input
                  type={showPw ? "text" : "password"}
                  value={form.confirm}
                  onChange={(e) => update("confirm", e.target.value)}
                  onKeyDown={keyDown}
                  placeholder="Confirm password"
                  maxLength={100}
                  autoComplete="new-password"
                  className="w-full pl-10 pr-4 py-3.5 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-navy-700 text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-all text-gray-800 dark:text-gray-100"
                />
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium animate-scale-in">
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full mt-5 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-2xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-brand/25 hover:shadow-brand/40 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
            ) : mode === "register" ? (
              "Create Account →"
            ) : (
              "Sign In →"
            )}
          </button>

          {/* Switch hint */}
          <p className="text-center text-xs text-gray-400 mt-4">
            {mode === "login" ? (
              <>New here?{" "}
                <button onClick={() => { setMode("register"); setError(""); }} className="text-brand font-semibold hover:underline">
                  Create an account
                </button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => { setMode("login"); setError(""); }} className="text-brand font-semibold hover:underline">
                  Sign in
                </button>
              </>
            )}
          </p>

          <p className="text-center text-[10px] text-gray-300 dark:text-gray-600 mt-3">
            Posts auto-delete after 7 days · Anonymous by default
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Desktop Nav Link ─────────────────────────
function NavLink({ active, onClick, children }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${
        active
          ? "text-brand"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
      }`}
    >
      {active && (
        <motion.div
          layoutId="activeTabIndicatorDesktop"
          className="absolute inset-0 bg-brand/8 dark:bg-brand/15 rounded-xl"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-1.5">{children}</span>
    </motion.button>
  );
}

// ─── Main App ─────────────────────────────────
export default function App() {
  const { username, color, darkMode, toggleDarkMode, hasAccount } = useUserStore();
  const { activeModal, closeModal, openModal } = useUIStore();
  const { loadRooms } = useChatStore();
  const { activeRoom } = useRoomStore();

  // Entered = has a valid account AND username set
  const [entered, setEntered] = useState(() => {
    const store = useUserStore.getState();
    return !!store.username && !!store.passwordHash;
  });
  const [mobileTab, setMobileTab] = useState("home");
  const [showSettings, setShowSettings] = useState(false);

  useSocket();

  useEffect(() => {
    loadRooms();
    document.documentElement.classList.toggle("dark", darkMode);
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  if (!entered || !username) {
    return <AuthGate onSuccess={() => setEntered(true)} />;
  }

  return (
    <div className="min-h-screen aurora-bg text-gray-800 dark:text-gray-100 flex flex-col transition-colors duration-300">

      {/* ─── Emoji Burst Layer ──────────────────── */}
      <EmojiReactionBurst />

      {/* ─── Header ─────────────────────────────── */}
      <header className="sticky top-0 z-30 glass-effect border-b border-gray-100/80 dark:border-white/5 px-5 py-3 flex items-center justify-between gap-3">
        {/* Logo + Online badge */}
        <div className="flex items-center gap-3 shrink-0">
          <button onClick={() => setMobileTab("home")} className="cursor-pointer">
            <BrandLogo size="sm" />
          </button>
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1 ml-4">
          <NavLink active={mobileTab === "home"} onClick={() => setMobileTab("home")}>
            <Home size={15} /> Home
          </NavLink>
          <NavLink active={mobileTab === "rooms"} onClick={() => setMobileTab("rooms")}>
            <MessageSquare size={15} /> Rooms
          </NavLink>
          <NavLink active={mobileTab === "notepad"} onClick={() => setMobileTab("notepad")}>
            <FileText size={15} /> Notepad
          </NavLink>
          <motion.button
            onClick={() => openModal("createPost")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="ml-2 px-4 py-2 bg-brand text-white text-sm font-bold rounded-xl hover:bg-brand-dark transition-all shadow-md shadow-brand/25 flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 size={14} /> Write
          </motion.button>
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Live presence */}
          <OnlinePresence />

          {/* Theme toggle */}
          <ThemeToggle darkMode={darkMode} onToggle={toggleDarkMode} />

          {/* Profile button */}
          <motion.button
            onClick={() => setShowSettings(true)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 bg-gray-50 dark:bg-navy-800 border border-gray-100 dark:border-white/5 p-1.5 pr-3.5 rounded-2xl transition-all hover:bg-gray-100 dark:hover:bg-navy-700 cursor-pointer"
          >
            <Avatar username={username} color={color} size="sm" />
            <span className="text-sm font-bold text-gray-700 dark:text-gray-200 hidden sm:inline truncate max-w-[100px] hover:text-brand transition-colors">
              {username}
            </span>
          </motion.button>
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
      {activeModal === "createPost" && <QuickCompose onClose={closeModal} />}
      {activeModal === "postDetail" && <PostModal />}
      {activeModal === "comments" && <CommentModal />}
      {showSettings && <SettingsPage onClose={() => setShowSettings(false)} />}

      {/* ─── Bottom Nav (Mobile) ─────────────────── */}
      <BottomNav
        activeTab={mobileTab}
        onChangeTab={(tabId) => {
          if (tabId === "write") {
            openModal("createPost");
          } else {
            setMobileTab(tabId);
          }
        }}
        hasActiveRoom={!!activeRoom}
      />

      <ToastContainer />
    </div>
  );
}