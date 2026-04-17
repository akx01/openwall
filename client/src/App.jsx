import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import HomePage from "./pages/HomePage";
import SettingsPage from "./pages/SettingsPage";
import ToastContainer from "./components/UI/Toast";
import { useUserStore } from "./store/userStore";
import { useUIStore } from "./store/uiStore";

// Username entry screen shown if no username is set
function UsernameGate({ onSet }) {
  const [name, setName] = useState("");
  const { setUsername } = useUserStore();
  const handle = () => {
    if (!name.trim()) return;
    setUsername(name.trim());
    onSet();
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 w-full max-w-sm text-center">
        <h1 className="text-2xl font-bold text-brand mb-1">OpenWall</h1>
        <p className="text-gray-400 text-sm mb-6">Anonymous public writing. No login needed.</p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handle()}
          placeholder="Choose a username"
          maxLength={30}
          autoFocus
          className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-center text-sm outline-none focus:border-brand mb-3"
        />
        <button
          onClick={handle}
          className="w-full py-3 bg-brand text-white rounded-xl font-semibold hover:bg-brand-dark transition"
        >
          Enter OpenWall →
        </button>
        <p className="text-xs text-gray-400 mt-3">All posts auto-delete after 7 days.</p>
      </div>
    </div>
  );
}

export default function App() {
  const { username, darkMode } = useUserStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [entered, setEntered] = useState(!!username);

  // Apply dark mode class to html element
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  if (!entered || !username) {
    return <UsernameGate onSet={() => setEntered(true)} />;
  }

  return (
    <>
      <Layout onOpenSettings={() => setSettingsOpen(true)}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </Layout>

      {settingsOpen && <SettingsPage onClose={() => setSettingsOpen(false)} />}

      {/* Floating create post button */}
      <ToastContainer />
    </>
  );
}