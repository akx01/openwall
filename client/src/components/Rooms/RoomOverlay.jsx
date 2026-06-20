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
  const { username, color, sessionId } = useUserStore();
  const [input, setInput] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const bottomRef = useRef(null);
  
  const emitTypingStop = useRef(debounce(() => {
    socket.emit("typing_stop", { room: activeRoom?.name, username });
  }, 1500)).current;

  useEffect(() => {
    if (!activeRoom) return;
    loadMessages(activeRoom.name);
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeRoom} />

      {/* Chat window */}
      <div className="relative w-full sm:w-96 h-[85vh] sm:h-[75vh] bg-white dark:bg-gray-900 rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl border border-gray-100 dark:border-gray-800 sm:mr-4 sm:mb-4">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <button onClick={closeRoom} className="text-gray-400 hover:text-gray-600 text-lg mr-1">←</button>
          <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold text-sm ${activeRoom.isPrivate ? "bg-amber-500" : "bg-brand"}`}>
            {activeRoom.isPrivate ? "🔒" : "#"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-gray-50 text-sm">#{activeRoom.name}</p>
            <p className="text-xs text-gray-400">{roomMembers.length} online</p>
          </div>
          {/* Members Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowMembers(v => !v)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 font-bold"
            >
              👥
            </button>
            {showMembers && (
              <div className="absolute right-0 top-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 w-52 z-10 overflow-hidden">
                <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Members</p>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {roomMembers.map(m => (
                    <div key={m.socketId} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex items-center gap-2">
                        <Avatar username={m.username} color={m.color} size="sm" />
                        <span className="text-sm text-gray-700 dark:text-gray-200 truncate max-w-[100px]">{m.username}</span>
                        {m.username === activeRoom.leader && <span className="text-xs text-amber-500" title="Leader">★</span>}
                      </div>
                      {isLeader && m.username !== username && (
                        <div className="flex gap-1">
                          <button onClick={() => handleKick(m.username)} className="text-xs text-orange-400 hover:text-orange-600 px-1">Kick</button>
                          <button onClick={() => handleBan(m.username)} className="text-xs text-red-400 hover:text-red-600 px-1">Ban</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-2">
          {messages
            .filter(m => m.room === activeRoom.name)
            .map(msg => <ChatMessage key={msg._id} message={msg} />)}
          <TypingIndicator users={typingUsers} />
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800">
          <div className="flex gap-2 items-end bg-gray-50 dark:bg-gray-800 rounded-2xl px-3 py-2">
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
              placeholder={`Message #${activeRoom.name}`}
              className="flex-1 resize-none bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 outline-none max-h-28"
            />
            <button onClick={handleSend} disabled={!input.trim()} className="text-brand font-semibold text-sm disabled:opacity-40">Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
