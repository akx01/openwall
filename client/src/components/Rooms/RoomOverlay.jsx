import { useEffect, useRef, useState } from "react";
import { useRoomStore } from "../../store/roomStore";
import { useChatStore } from "../../store/chatStore";
import { useUserStore } from "../../store/userStore";
import ChatMessage from "../Chat/ChatMessage";
import TypingIndicator from "../Chat/TypingIndicator";
import Avatar from "../UI/Avatar";
import socket from "../../socket";
import { debounce } from "../../utils/helpers";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "/api";

export default function RoomOverlay() {
  const { activeRoom, closeRoom, roomMembers, setRoomMembers } = useRoomStore();
  const { messages, typingUsers, loadMessages } = useChatStore();
  const { username, color, sessionId, pinnedRooms, pinRoom, unpinRoom } = useUserStore();
  const [input, setInput] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const bottomRef = useRef(null);
  
  const emitTypingStop = useRef(debounce(() => {
    socket.emit("typing_stop", { room: activeRoom?.name, username });
  }, 1500)).current;

  useEffect(() => {
    if (!activeRoom) return;
    loadMessages(activeRoom.name);
    
    if (!socket.connected) {
      socket.connect();
    }
    
    socket.emit("join_room", { room: activeRoom.name, username, color, sessionId });
    
    socket.on("room_info", ({ members }) => setRoomMembers(members));
    
    socket.on("kicked_from_room", ({ room }) => {
      if (room === activeRoom.name) {
        alert("You were kicked from this room");
        closeRoom();
      }
    });

    socket.on("banned_from_room", ({ room }) => {
      if (room === activeRoom.name) {
        alert("You are banned from this room");
        closeRoom();
      }
    });

    return () => {
      socket.off("room_info");
      socket.off("kicked_from_room");
      socket.off("banned_from_room");
    };
  }, [activeRoom?.name]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!activeRoom) return null;

  const isLeader = activeRoom.leader === username;
  const isPinned = pinnedRooms.includes(activeRoom.name);

  const handleSend = () => {
    if (!input.trim()) return;
    socket.emit("send_message", {
      room: activeRoom.name,
      content: input.trim(),
      author: username,
      authorColor: color,
      sessionId,
    });
    socket.emit("typing_stop", { room: activeRoom.name, username });
    setInput("");
  };

  const handleKick = async (target) => {
    socket.emit("kick_user", { room: activeRoom.name, targetUsername: target, leaderUsername: username });
    await axios.post(`${API}/rooms/${activeRoom.name}/kick`, { leaderUsername: username, targetUsername: target });
  };

  const handleBan = async (target) => {
    socket.emit("kick_user", { room: activeRoom.name, targetUsername: target, leaderUsername: username });
    await axios.post(`${API}/rooms/${activeRoom.name}/ban`, { leaderUsername: username, targetUsername: target });
  };

  const togglePin = () => {
    if (isPinned) {
      unpinRoom(activeRoom.name);
    } else {
      pinRoom(activeRoom.name);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-stretch bg-gray-50 dark:bg-gray-950 animate-fade-slide">
      {/* Sidebar: Chat Panel (Full layout on mobile, side-by-side on desktop) */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800">
        {/* Top Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <button
              onClick={closeRoom}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition text-lg font-bold"
            >
              ← Back
            </button>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs ${activeRoom.isPrivate ? "bg-amber-500" : "bg-brand"}`}>
              {activeRoom.isPrivate ? "🔒" : "#"}
            </div>
            <div>
              <h2 className="font-bold text-sm text-gray-900 dark:text-gray-50 flex items-center gap-1.5">
                #{activeRoom.name}
              </h2>
              <p className="text-[10px] text-gray-400">
                🟢 {roomMembers.length} users online
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Pin Toggle */}
            <button
              onClick={togglePin}
              className={`w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-850 transition ${
                isPinned ? "text-amber-500 bg-amber-500/10" : "text-gray-400 hover:text-gray-600"
              }`}
              title={isPinned ? "Unpin Room" : "Pin Room"}
            >
              ★
            </button>
            <button
              onClick={() => setShowMembers(v => !v)}
              className={`md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-850 transition ${
                showMembers ? "bg-brand/10 text-brand" : "text-gray-400"
              }`}
            >
              👥
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2 bg-gray-50/50 dark:bg-gray-950/20">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <p className="text-4xl mb-2">👋</p>
              <p className="text-sm font-semibold">Welcome to #{activeRoom.name}!</p>
              <p className="text-xs">Start the conversation by sending a message below.</p>
            </div>
          ) : (
            messages
              .filter(m => m.room === activeRoom.name)
              .map(msg => <ChatMessage key={msg._id} message={msg} />)
          )}
          <TypingIndicator users={typingUsers} />
          <div ref={bottomRef} />
        </div>

        {/* Bottom Input Area */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex gap-3 items-end bg-gray-50 dark:bg-gray-850 rounded-2xl px-4 py-3 border border-transparent focus-within:border-brand/20 transition">
            <textarea
              value={input}
              onChange={e => {
                setInput(e.target.value);
                socket.emit("typing_start", { room: activeRoom.name, username });
                emitTypingStop();
              }}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              placeholder={`Send a message in #${activeRoom.name}...`}
              className="flex-1 resize-none bg-transparent text-sm text-gray-800 dark:text-gray-150 placeholder-gray-400 outline-none max-h-24 py-0.5"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-4 py-1.5 bg-brand text-white rounded-xl text-xs font-bold disabled:opacity-40 transition"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Members & Room Info (Shown on side on desktop, toggle sheet on mobile) */}
      <div className={`${showMembers ? "flex" : "hidden"} md:flex w-full md:w-64 flex-col bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 shrink-0 absolute inset-0 z-50 md:relative md:inset-auto`}>
        {/* Mobile Header close */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 dark:border-gray-800 md:hidden shrink-0">
          <span className="font-bold text-sm">Channel Members</span>
          <button onClick={() => setShowMembers(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>

        {/* Room details */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-extrabold text-sm text-gray-900 dark:text-gray-50 mb-1">About Channel</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
            {activeRoom.description || "No description provided."}
          </p>
          <div className="text-[10px] text-gray-400 space-y-1">
            <p>Leader: <span className="font-semibold text-brand">{activeRoom.leader}</span></p>
            <p>Created: {new Date(activeRoom.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-2">
            Online Users ({roomMembers.length})
          </h4>
          {roomMembers.map(m => (
            <div key={m.socketId} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-850/50 transition">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar username={m.username} color={m.color} size="sm" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[110px]">
                  {m.username}
                </span>
                {m.username === activeRoom.leader && (
                  <span className="text-[10px] text-amber-500" title="Room Leader">★</span>
                )}
              </div>

              {/* Moderation actions */}
              {isLeader && m.username !== username && (
                <div className="flex gap-1">
                  <button
                    onClick={() => handleKick(m.username)}
                    className="text-[10px] text-orange-400 hover:text-orange-600 font-bold px-1.5 py-0.5 rounded hover:bg-orange-500/10 transition"
                  >
                    Kick
                  </button>
                  <button
                    onClick={() => handleBan(m.username)}
                    className="text-[10px] text-red-400 hover:text-red-650 font-bold px-1.5 py-0.5 rounded hover:bg-red-500/10 transition"
                  >
                    Ban
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
