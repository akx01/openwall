import { useState } from "react";
import { useChatStore } from "../../store/chatStore";
import { useUserStore } from "../../store/userStore";
import socket from "../../socket";

export default function RoomList() {
  const { rooms, currentRoom, setCurrentRoom, createRoom, loadMessages } = useChatStore();
  const { username, color, sessionId } = useUserStore();
  const [showCreate, setShowCreate] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");

  const switchRoom = (room) => {
    socket.emit("join_room", { room: room.name, username, color, sessionId });
    setCurrentRoom(room.name);
    loadMessages(room.name);
  };

  const handleCreate = async () => {
    if (!newRoomName.trim()) return;
    const room = await createRoom(newRoomName.trim(), "", username);
    switchRoom(room);
    setNewRoomName("");
    setShowCreate(false);
  };

  return (
    <div className="p-3">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rooms</span>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="text-xs text-brand hover:text-brand-dark font-medium"
        >
          + New
        </button>
      </div>

      {showCreate && (
        <div className="mb-2 flex gap-1">
          <input
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            placeholder="room-name"
            className="flex-1 text-xs px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 outline-none"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
          <button onClick={handleCreate} className="text-xs px-2 py-1.5 bg-brand text-white rounded-lg">
            Create
          </button>
        </div>
      )}

      <div className="space-y-0.5">
        {rooms.map((room) => (
          <button
            key={room._id}
            onClick={() => switchRoom(room)}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition ${
              currentRoom === room.name
                ? "bg-brand/10 text-brand font-medium"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            }`}
          >
            <span className="opacity-60">#</span> {room.name}
            {room.memberCount > 0 && (
              <span className="float-right text-xs text-gray-400">{room.memberCount}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}