import { useState } from "react";
import { useChatStore } from "../../store/chatStore";
import { useUserStore } from "../../store/userStore";
import { useUIStore } from "../../store/uiStore";

export default function CreateRoomModal({ onClose }) {
  const { createRoom } = useChatStore();
  const { username } = useUserStore();
  const { showToast } = useUIStore();
  
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    // Clean name: lower-case, dashed
    const cleanName = name.toLowerCase().trim().replace(/\s+/g, "-");
    if (cleanName.length < 3) {
      showToast("Room name must be at least 3 characters", "error");
      return;
    }

    if (isPrivate && !password) {
      showToast("Password required for private rooms", "error");
      return;
    }

    setLoading(true);
    try {
      await createRoom(cleanName, desc.trim(), username || "anonymous", isPrivate, password);
      showToast(`Room #${cleanName} created!`, "success");
      onClose();
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to create room", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-sm p-6 shadow-2xl border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-50">Create Room</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1 block">Room Name</label>
            <input
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. design-chat"
              maxLength={30}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:border-brand text-gray-850 dark:text-gray-100"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1 block">Description</label>
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="What is this room about?"
              maxLength={150}
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:border-brand text-gray-850 dark:text-gray-100 resize-none"
            />
          </div>

          {/* Toggle Private */}
          <div className="flex items-center justify-between py-2 border-t border-b border-gray-100 dark:border-gray-800">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Private Room</p>
              <p className="text-xs text-gray-400">Require password to join</p>
            </div>
            <button
              type="button"
              onClick={() => setIsPrivate(v => !v)}
              className={`w-10 h-6 rounded-full transition-colors relative flex items-center ${isPrivate ? "bg-amber-500" : "bg-gray-300 dark:bg-gray-700"}`}
            >
              <span className={`block w-4 h-4 bg-white rounded-full shadow transform transition-transform mx-1 ${isPrivate ? "translate-x-4" : ""}`} />
            </button>
          </div>

          {isPrivate && (
            <div>
              <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1 block">Room Password</label>
              <input
                required
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter room password"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:border-brand text-gray-850 dark:text-gray-100"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand text-white rounded-xl font-bold hover:bg-brand-dark transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Room"}
          </button>
        </form>
      </div>
    </div>
  );
}
