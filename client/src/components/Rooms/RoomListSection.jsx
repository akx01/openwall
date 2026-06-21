import { useState, useEffect } from "react";
import { useChatStore } from "../../store/chatStore";
import { useRoomStore } from "../../store/roomStore";
import { useUserStore } from "../../store/userStore";
import CreateRoomModal from "./CreateRoomModal";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "/api";

export default function RoomListSection() {
  const { rooms, loadRooms } = useChatStore();
  const { openRoom, activeRoom } = useRoomStore();
  const { username, pinnedRooms, pinRoom, unpinRoom } = useUserStore();
  const [showCreate, setShowCreate] = useState(false);
  const [passwordInput, setPasswordInput] = useState({});
  const [error, setError] = useState({});
  const [search, setSearch] = useState("");
  const [unlocking, setUnlocking] = useState({});

  useEffect(() => { loadRooms(); }, []);

  const handleJoin = async (room) => {
    // Public rooms: join directly
    if (!room.isPrivate) { openRoom(room); return; }
    // Private rooms: ALWAYS require password
    const pw = passwordInput[room.name] || "";
    if (!pw) { setError({ ...error, [room.name]: "Password required" }); return; }
    setUnlocking({ ...unlocking, [room.name]: true });
    try {
      await axios.post(`${API}/rooms/${room.name}/verify`, { password: pw });
      setError({ ...error, [room.name]: null });
      setPasswordInput({ ...passwordInput, [room.name]: "" });
      openRoom(room);
    } catch {
      setError({ ...error, [room.name]: "Wrong password" });
    } finally {
      setUnlocking({ ...unlocking, [room.name]: false });
    }
  };

  const togglePin = (e, name) => {
    e.stopPropagation();
    pinnedRooms.includes(name) ? unpinRoom(name) : pinRoom(name);
  };

  const filteredRooms = rooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );
  const pinnedList = filteredRooms.filter((r) => pinnedRooms.includes(r.name));
  const publicList = filteredRooms.filter((r) => !r.isPrivate && !pinnedRooms.includes(r.name));
  const privateList = filteredRooms.filter((r) => r.isPrivate && !pinnedRooms.includes(r.name));

  const renderRoomCard = (room, i) => {
    const isPinned = pinnedRooms.includes(room.name);
    const isActive = activeRoom?.name === room.name;

    return (
      <div
        key={room._id}
        onClick={() => handleJoin(room)}
        className={`room-card-glow glass-card p-4 rounded-2xl flex flex-col justify-between cursor-pointer animate-slide-up stagger-${Math.min(i+1,6)} ${
          isActive
            ? "border-brand/30 dark:border-brand/40 bg-brand/5 dark:bg-brand/10 shadow-glow-brand"
            : "border-gray-100 dark:border-white/5"
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-bold shrink-0 shadow-sm ${
                room.isPrivate
                  ? "bg-amber-500/15 text-amber-500"
                  : "bg-brand/12 text-brand dark:bg-brand/25 dark:text-brand-light"
              }`}
            >
              {room.isPrivate ? "🔒" : "#"}
            </div>
            <div className="truncate">
              <h3 className="font-bold text-sm text-gray-900 dark:text-gray-50 truncate leading-snug">
                {room.name}
              </h3>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                <p className="text-[10px] text-gray-400 dark:text-gray-500">{room.memberCount || 0} online</p>
              </div>
            </div>
          </div>

          {/* Pin toggle */}
          <button
            onClick={(e) => togglePin(e, room.name)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition text-lg ${
              isPinned
                ? "text-amber-500 bg-amber-500/10 scale-110"
                : "text-gray-300 dark:text-gray-700 hover:text-amber-400 hover:bg-amber-500/10"
            }`}
            title={isPinned ? "Unpin Room" : "Pin Room"}
          >
            ★
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 flex-1 min-h-[2.5rem] leading-relaxed">
          {room.description || (room.isPrivate ? "🔒 Private channel" : "No description yet.")}
        </p>

        {/* Password input for ALL private rooms — always shown */}
        {room.isPrivate ? (
          <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
            <div className="flex gap-1.5">
              <input
                type="password"
                placeholder="Enter room password"
                value={passwordInput[room.name] || ""}
                onChange={(e) => setPasswordInput({ ...passwordInput, [room.name]: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleJoin(room)}
                className="flex-1 px-3 py-1.5 text-xs bg-gray-50 dark:bg-navy-700 rounded-xl border border-gray-200 dark:border-white/8 outline-none focus:border-amber-500 transition"
              />
              <button
                onClick={() => handleJoin(room)}
                disabled={unlocking[room.name]}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-bold transition active:scale-95 shadow-sm disabled:opacity-60"
              >
                {unlocking[room.name] ? "..." : "Unlock"}
              </button>
            </div>
            {error[room.name] && (
              <p className="text-[10px] text-red-500 ml-1">{error[room.name]}</p>
            )}
          </div>
        ) : (
          <div className="flex justify-between items-center text-[11px]">
            <span className="text-gray-400">by {room.createdBy}</span>
            <span className={`font-bold transition ${isActive ? "text-green-500" : "text-brand hover:underline"}`}>
              {isActive ? "✓ In Room" : "Join →"}
            </span>
          </div>
        )}
      </div>
    );
  };

  const SectionLabel = ({ icon, label, count }) => (
    <h2 className="text-[11px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-[0.12em] flex items-center gap-2 ml-1">
      {icon} {label}
      {count > 0 && (
        <span className="px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/8 text-gray-500 dark:text-gray-500 font-bold normal-case tracking-normal text-[10px]">
          {count}
        </span>
      )}
    </h2>
  );

  return (
    <div className="w-full space-y-8 animate-fade-slide">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 glass-card p-4 rounded-3xl">
        <div className="relative flex-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search channels..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-navy-700/60 rounded-2xl outline-none border border-transparent focus:border-brand/30 focus:ring-2 focus:ring-brand/10 transition-all text-gray-800 dark:text-gray-100 placeholder-gray-400"
          />
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="py-2.5 px-5 bg-brand hover:bg-brand-dark text-white rounded-2xl text-sm font-bold shadow-md shadow-brand/20 transition active:scale-95 shrink-0 hover:shadow-brand/40"
        >
          + Create Channel
        </button>
      </div>

      {/* Pinned */}
      {pinnedList.length > 0 && (
        <div className="space-y-3">
          <SectionLabel icon="📌" label="Pinned" count={pinnedList.length} />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {pinnedList.map((r, i) => renderRoomCard(r, i))}
          </div>
        </div>
      )}

      {/* Public */}
      <div className="space-y-3">
        <SectionLabel icon="🌐" label="Public Channels" count={publicList.length} />
        {publicList.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 ml-1">No public channels found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {publicList.map((r, i) => renderRoomCard(r, i))}
          </div>
        )}
      </div>

      {/* Private */}
      <div className="space-y-3">
        <SectionLabel icon="🔒" label="Private Channels" count={privateList.length} />
        {privateList.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 ml-1">No private channels found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {privateList.map((r, i) => renderRoomCard(r, i))}
          </div>
        )}
      </div>

      {showCreate && <CreateRoomModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
