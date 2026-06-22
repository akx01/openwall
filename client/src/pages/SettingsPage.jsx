import { useState } from "react";
import { useUserStore } from "../store/userStore";
import { useUIStore } from "../store/uiStore";
import Avatar from "../components/UI/Avatar";
import { generateColor } from "../utils/helpers";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "/api";
const COLORS = ["#7C3AED", "#2563EB", "#DC2626", "#16A34A", "#D97706", "#DB2777", "#0891B2"];

export default function SettingsPage({ onClose }) {
  const {
    username, passwordHash, color, mutedUsers, isPrivate,
    setUsername, setColor, unmuteUser, togglePrivacy,
    toggleNotifications, notifications, clearSession,
  } = useUserStore();
  const { showToast } = useUIStore();
  const [draft, setDraft] = useState(username);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!draft.trim()) { showToast("Username cannot be empty", "error"); return; }
    setSaving(true);
    try {
      // Sync change to backend to verify username isn't taken and save private toggle/color
      await axios.post(`${API}/users/sync`, {
        username: draft.trim(),
        passwordHash,
        color,
        isPrivate,
      });

      setUsername(draft.trim());
      showToast("Profile settings saved and synced! ✨", "success");
      onClose?.();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        {/* Avatar preview */}
        <div className="flex items-center gap-3 mb-5">
          <Avatar username={draft} color={color} size="lg" />
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{draft || "Anonymous"}</p>
            <p className="text-xs text-gray-400">Your public identity</p>
          </div>
        </div>

        {/* Username */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Username</label>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={30}
            placeholder="Enter username"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:border-brand"
          />
        </div>

        {/* Color picker */}
        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Avatar color</label>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${color === c ? "ring-2 ring-offset-2 ring-brand scale-110" : "hover:scale-110"}`}
                style={{ backgroundColor: c }}
              />
            ))}
            <button
              onClick={() => setColor(generateColor())}
              className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 hover:scale-110 transition-transform"
              title="Random color"
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Notifications</span>
          <button
            onClick={toggleNotifications}
            className={`w-10 h-6 rounded-full transition-colors ${notifications ? "bg-brand" : "bg-gray-300 dark:bg-gray-600"} cursor-pointer`}
          >
            <span className={`block w-4 h-4 bg-white rounded-full shadow transform transition-transform mx-1 ${notifications ? "translate-x-4" : ""}`} />
          </button>
        </div>

        {/* Private Account */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col text-left">
            <span className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Private Account</span>
            <span className="text-[10px] text-gray-400">Only friends can view your posts and chat</span>
          </div>
          <button
            onClick={togglePrivacy}
            className={`w-10 h-6 rounded-full transition-colors ${isPrivate ? "bg-brand" : "bg-gray-300 dark:bg-gray-600"} cursor-pointer`}
          >
            <span className={`block w-4 h-4 bg-white rounded-full shadow transform transition-transform mx-1 ${isPrivate ? "translate-x-4" : ""}`} />
          </button>
        </div>

        {/* Muted users */}
        {mutedUsers.length > 0 && (
          <div className="mb-4">
            <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">Muted users</label>
            <div className="space-y-1">
              {mutedUsers.map((u) => (
                <div key={u} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 dark:text-gray-300">{u}</span>
                  <button onClick={() => unmuteUser(u)} className="text-xs text-red-400 hover:text-red-600">Unmute</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clear local data */}
        <button
          onClick={() => { clearSession(); showToast("Session cleared", "info"); onClose?.(); }}
          className="w-full text-sm text-red-400 hover:text-red-600 py-2 mt-1 transition cursor-pointer"
        >
          🗑️ Clear local data & reset session
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full mt-3 py-3 bg-brand text-white rounded-xl font-semibold hover:bg-brand-dark transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {saving ? "Saving changes..." : "Save changes"}
        </button>
      </div>
    </div>
  );
}