import { useState, useEffect } from "react";
import { useChatStore } from "../../store/chatStore";
import { useRoomStore } from "../../store/roomStore";
import { useUserStore } from "../../store/userStore";
import CreateRoomModal from "./CreateRoomModal";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "/api";

export default function RoomBrowser({ onClose }) {
  const { rooms, loadRooms } = useChatStore();
  const { openRoom, markVerified, isVerified } = useRoomStore();
  const { username } = useUserStore();
  const [showCreate, setShowCreate] = useState(false);
  const [passwordInput, setPasswordInput] = useState({});
  const [error, setError] = useState({});
  const [filter, setFilter] = useState("");

  useEffect(() => {
    loadRooms();
  }, []);

  const filtered = rooms.filter((r) =>
    r.name.toLowerCase().includes(filter.toLowerCase())
  );

  const handleJoin = async (room) => {
    if (!room.isPrivate || isVerified(room.name)) {
      openRoom(room);
      onClose?.();
      return;
    }
    const pw = passwordInput[room.name] || "";
    if (!pw) {
      setError({ ...error, [room.name]: "Password required" });
      return;
    }
    try {
      await axios.post(`${API}/rooms/${room.name}/verify`, { password: pw });
      markVerified(room.name, pw);
      openRoom(room, pw);
      onClose?.();
    } catch {
      setError({ ...error, [room.name]: "Wrong password" });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-lg text-gray-900 dark:text-gray-50">Rooms</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreate(true)}
              className="text-xs px-3 py-1.5 bg-brand text-white rounded-xl font-medium hover:bg-brand-dark transition"
            >
              + New Room
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 py-2">
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search rooms..."
            className="w-full px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-brand/20 transition"
          />
        </div>

        {/* Room list */}
        <div className="overflow-y-auto flex-1 px-2 pb-4">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">No rooms found</p>
          ) : (
            filtered.map((room) => (
              <div
                key={room._id}
                className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-2xl mb-1 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold text-sm ${
                        room.isPrivate ? "bg-amber-500" : "bg-brand"
                      }`}
                    >
                      {room.isPrivate ? "🔒" : "#"}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">
                        {room.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {room.description ||
                          (room.isPrivate ? "Private room" : "Public room")}{" "}
                        · {room.memberCount || 0} online
                      </p>
                    </div>
                  </div>
                  {!room.isPrivate || isVerified(room.name) ? (
                    <button
                      onClick={() => handleJoin(room)}
                      className="text-xs px-3 py-1.5 bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand-light rounded-xl font-semibold hover:bg-brand/25 transition"
                    >
                      Join
                    </button>
                  ) : (
                    <button
                      onClick={() =>
                        setPasswordInput((p) => ({
                          ...p,
                          [room.name]: p[room.name] === undefined ? "" : undefined,
                        }))
                      }
                      className="text-xs px-3 py-1.5 bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 rounded-xl font-semibold hover:bg-amber-500/20 transition"
                    >
                      Unlock
                    </button>
                  )}
                </div>

                {/* Password field for private rooms */}
                {room.isPrivate &&
                  passwordInput[room.name] !== undefined &&
                  !isVerified(room.name) && (
                    <div className="mt-2 flex gap-2">
                      <input
                        type="password"
                        value={passwordInput[room.name] || ""}
                        onChange={(e) =>
                          setPasswordInput((p) => ({
                            ...p,
                            [room.name]: e.target.value,
                          }))
                        }
                        onKeyDown={(e) => e.key === "Enter" && handleJoin(room)}
                        placeholder="Room password"
                        className="flex-1 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm outline-none focus:border-brand"
                      />
                      <button
                        onClick={() => handleJoin(room)}
                        className="px-3 py-1.5 bg-brand text-white rounded-xl text-xs font-semibold hover:bg-brand-dark transition"
                      >
                        Enter
                      </button>
                    </div>
                  )}
                {error[room.name] && (
                  <p className="text-xs text-red-500 mt-1 ml-1">
                    {error[room.name]}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
