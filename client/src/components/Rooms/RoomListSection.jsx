import { useState, useEffect } from "react";
import { useChatStore } from "../../store/chatStore";
import { useRoomStore } from "../../store/roomStore";
import { useUserStore } from "../../store/userStore";
import CreateRoomModal from "./CreateRoomModal";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "/api";

export default function RoomListSection() {
  const { rooms, loadRooms } = useChatStore();
  const { openRoom, markVerified, isVerified, activeRoom } = useRoomStore();
  const { username, pinnedRooms, pinRoom, unpinRoom } = useUserStore();
  const [showCreate, setShowCreate] = useState(false);
  const [passwordInput, setPasswordInput] = useState({});
  const [error, setError] = useState({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadRooms();
  }, []);

  const handleJoin = async (room) => {
    if (!room.isPrivate || isVerified(room.name)) {
      openRoom(room);
      return;
    }
    const pw = passwordInput[room.name] || "";
    if (!pw) {
      setError({ ...error, [room.name]: "Password required" });
      return;
    }
    try {
      await axios.post(`${API}/rooms/${room.name}/verify`, { password: pw });
      markVerified(room.name);
      setError({ ...error, [room.name]: null });
      openRoom(room);
    } catch {
      setError({ ...error, [room.name]: "Wrong password" });
    }
  };

  const togglePin = (e, name) => {
    e.stopPropagation();
    if (pinnedRooms.includes(name)) {
      unpinRoom(name);
    } else {
      pinRoom(name);
    }
  };

  // Filter based on search query
  const filteredRooms = rooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  // Group rooms
  const pinnedList = filteredRooms.filter((r) => pinnedRooms.includes(r.name));
  const publicList = filteredRooms.filter((r) => !r.isPrivate && !pinnedRooms.includes(r.name));
  const privateList = filteredRooms.filter((r) => r.isPrivate && !pinnedRooms.includes(r.name));

  const renderRoomCard = (room) => {
    const isPinned = pinnedRooms.includes(room.name);
    const isUnlocked = !room.isPrivate || isVerified(room.name);
    const isActive = activeRoom?.name === room.name;

    return (
      <div
        key={room._id}
        onClick={() => handleJoin(room)}
        className={`glass-card p-4 rounded-2xl flex flex-col justify-between cursor-pointer transition-all duration-300 hover:-translate-y-0.5 border ${
          isActive 
            ? "border-brand bg-brand/5 dark:bg-brand/10 shadow-md shadow-brand/5" 
            : "border-gray-100 dark:border-gray-800"
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          {/* Channel badge */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                room.isPrivate 
                  ? (isUnlocked ? "bg-amber-500/10 text-amber-500" : "bg-amber-500 text-white shadow-sm") 
                  : "bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/25"
              }`}
            >
              {room.isPrivate ? (isUnlocked ? "🔓" : "🔒") : "#"}
            </div>
            <div className="truncate">
              <h3 className="font-bold text-sm text-gray-900 dark:text-gray-50 truncate leading-snug">
                {room.name}
              </h3>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                🟢 {room.memberCount || 0} online
              </p>
            </div>
          </div>

          {/* Pin toggle */}
          <button
            onClick={(e) => togglePin(e, room.name)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition ${
              isPinned ? "text-amber-500 scale-105" : "text-gray-300 hover:text-gray-500 dark:text-gray-600"
            }`}
            title={isPinned ? "Unpin Room" : "Pin Room"}
          >
            ★
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 mb-3 flex-1 min-h-[2rem]">
          {room.description || (room.isPrivate ? "Private channel" : "No description provided")}
        </p>

        {/* Action input or unlock message */}
        {room.isPrivate && !isVerified(room.name) ? (
          <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-1.5">
              <input
                type="password"
                placeholder="Enter password"
                value={passwordInput[room.name] || ""}
                onChange={(e) =>
                  setPasswordInput({ ...passwordInput, [room.name]: e.target.value })
                }
                onKeyDown={(e) => e.key === "Enter" && handleJoin(room)}
                className="flex-1 px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 outline-none focus:border-amber-500 transition"
              />
              <button
                onClick={() => handleJoin(room)}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-bold transition"
              >
                Unlock
              </button>
            </div>
            {error[room.name] && (
              <p className="text-[10px] text-red-500 ml-1">{error[room.name]}</p>
            )}
          </div>
        ) : (
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-gray-400">Created by {room.createdBy}</span>
            <span className="font-semibold text-brand hover:underline">
              {isActive ? "Viewing Chat" : "Join Chat →"}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-8 animate-fade-slide">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between glass-card p-4 rounded-3xl">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-2.5 text-gray-400 text-sm">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search channels by name..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-850 rounded-2xl outline-none border border-transparent focus:border-brand/20 transition-all text-gray-850 dark:text-gray-50 placeholder-gray-400"
          />
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="py-2.5 px-5 bg-brand hover:bg-brand-dark text-white rounded-2xl text-sm font-bold shadow-md shadow-brand/10 transition active:scale-95 shrink-0"
        >
          + Create Channel
        </button>
      </div>

      {/* Pinned Section */}
      {pinnedList.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
            📌 Pinned Channels
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {pinnedList.map(renderRoomCard)}
          </div>
        </div>
      )}

      {/* Public Section */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
          🌐 Public Channels
        </h2>
        {publicList.length === 0 ? (
          <p className="text-sm text-gray-400 py-3 ml-1">No public channels found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {publicList.map(renderRoomCard)}
          </div>
        )}
      </div>

      {/* Private Section */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
          🔒 Private Channels
        </h2>
        {privateList.length === 0 ? (
          <p className="text-sm text-gray-400 py-3 ml-1">No private channels found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {privateList.map(renderRoomCard)}
          </div>
        )}
      </div>

      {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
