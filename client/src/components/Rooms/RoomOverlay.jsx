import { useEffect, useRef, useState } from "react";
import { useRoomStore } from "../../store/roomStore";
import { useChatStore } from "../../store/chatStore";
import { useUserStore } from "../../store/userStore";
import ChatMessage from "../Chat/ChatMessage";
import TypingIndicator from "../Chat/TypingIndicator";
import Avatar from "../UI/Avatar";
import socket from "../../socket";
import { debounce, timeAgo } from "../../utils/helpers";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "/api";

function groupMessagesByTime(messages) {
  const groups = [];
  let lastTime = null;
  messages.forEach((msg) => {
    const msgDate = new Date(msg.createdAt);
    const label = msgDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    if (label !== lastTime) {
      groups.push({ type: "divider", label });
      lastTime = label;
    }
    groups.push({ type: "msg", msg });
  });
  return groups;
}

export default function RoomOverlay() {
  const { activeRoom, closeRoom, roomMembers, setRoomMembers } = useRoomStore();
  const { messages, typingUsers, loadMessages } = useChatStore();
  const { username, color, sessionId, pinnedRooms, pinRoom, unpinRoom } = useUserStore();
  const [input, setInput] = useState("");
  const [showMembers, setShowMembers] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [showRoomInfo, setShowRoomInfo] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  const emitTypingStop = useRef(debounce(() => {
    socket.emit("typing_stop", { room: activeRoom?.name, username });
  }, 1500)).current;

  useEffect(() => {
    if (!activeRoom) return;
    loadMessages(activeRoom.name);
    if (!socket.connected) socket.connect();
    socket.emit("join_room", { room: activeRoom.name, username, color, sessionId });
    socket.on("room_info", ({ members }) => setRoomMembers(members));
    socket.on("kicked_from_room", ({ room }) => {
      if (room === activeRoom.name) { closeRoom(); }
    });
    socket.on("banned_from_room", ({ room }) => {
      if (room === activeRoom.name) { closeRoom(); }
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
  const roomMessages = messages.filter((m) => m.room === activeRoom.name);
  const groups = groupMessagesByTime(roomMessages);

  const handleSend = () => {
    if (!input.trim()) return;
    socket.emit("send_message", {
      room: activeRoom.name,
      content: input.trim(),
      author: username,
      authorColor: color,
      sessionId,
      replyTo: replyTo ? { _id: replyTo._id, author: replyTo.author, content: replyTo.content } : null,
    });
    socket.emit("typing_stop", { room: activeRoom.name, username });
    setInput("");
    setCharCount(0);
    setReplyTo(null);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setCharCount(e.target.value.length);
    socket.emit("typing_start", { room: activeRoom.name, username });
    emitTypingStop();
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
    isPinned ? unpinRoom(activeRoom.name) : pinRoom(activeRoom.name);
  };

  return (
    <div className="fixed inset-0 z-50 flex bg-gray-50 dark:bg-navy-900 animate-fade-slide">

      {/* ─── Chat Panel ───────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <div className="h-14 shrink-0 flex items-center justify-between px-4 border-b border-gray-100 dark:border-white/5 bg-white/90 dark:bg-navy-800/90 backdrop-blur-xl">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={closeRoom}
              className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-white/8 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition text-lg font-bold shrink-0"
            >
              ←
            </button>
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                activeRoom.isPrivate ? "bg-amber-500" : "bg-brand"
              }`}
            >
              {activeRoom.isPrivate ? "🔒" : "#"}
            </div>
            <div className="min-w-0">
              <button
                onClick={() => setShowRoomInfo(!showRoomInfo)}
                className="font-bold text-sm text-gray-900 dark:text-gray-50 flex items-center gap-1 hover:text-brand transition truncate"
              >
                #{activeRoom.name}
                <span className="text-gray-400 text-xs">{showRoomInfo ? "▲" : "▾"}</span>
              </button>
              <p className="text-[10px] text-gray-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                {roomMembers.length} online
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Pin toggle */}
            <button
              onClick={togglePin}
              className={`w-8 h-8 flex items-center justify-center rounded-xl transition text-lg ${
                isPinned ? "text-amber-500 bg-amber-500/10" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8"
              }`}
              title={isPinned ? "Unpin" : "Pin"}
            >
              ★
            </button>
            {/* Members toggle */}
            <button
              onClick={() => setShowMembers((v) => !v)}
              className={`w-8 h-8 flex items-center justify-center rounded-xl transition ${
                showMembers ? "bg-brand/10 text-brand" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-white/8"
              }`}
              title="Members"
            >
              👥
            </button>
          </div>
        </div>

        {/* Room info dropdown */}
        {showRoomInfo && (
          <div className="px-4 py-3 bg-brand/5 dark:bg-brand/10 border-b border-brand/10 text-sm animate-slide-up">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {activeRoom.description || "No description provided."}
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Leader: <span className="text-brand font-semibold">{activeRoom.leader}</span>
              {" · "}Created {new Date(activeRoom.createdAt).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-3">
          {roomMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 animate-fade-slide">
              <div className="text-5xl mb-3">👋</div>
              <p className="font-bold text-base">Welcome to #{activeRoom.name}!</p>
              <p className="text-sm mt-1">Start the conversation below.</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {groups.map((item, i) =>
                item.type === "divider" ? (
                  <div key={`div-${i}`} className="flex items-center gap-3 py-3 px-4">
                    <div className="flex-1 h-px bg-gray-200 dark:bg-white/8" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest shrink-0">
                      {item.label}
                    </span>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-white/8" />
                  </div>
                ) : (
                  <ChatMessage
                    key={item.msg._id}
                    message={item.msg}
                    onReply={() => setReplyTo(item.msg)}
                  />
                )
              )}
              <TypingIndicator users={typingUsers} />
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Reply preview bar */}
        {replyTo && (
          <div className="px-4 pt-2 flex items-center gap-2 animate-slide-up">
            <div className="flex-1 reply-preview">
              <p className="text-[11px] text-brand font-bold mb-0.5">↩ Replying to {replyTo.author}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{replyTo.content}</p>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg leading-none"
            >
              ✕
            </button>
          </div>
        )}

        {/* Input area */}
        <div className="p-3 border-t border-gray-100 dark:border-white/5 bg-white/90 dark:bg-navy-800/90 backdrop-blur-xl">
          <div className="flex gap-2 items-end bg-gray-50 dark:bg-navy-700/60 rounded-2xl px-4 py-2.5 border border-gray-200 dark:border-white/8 focus-within:border-brand/40 focus-within:ring-2 focus-within:ring-brand/10 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
              placeholder={`Message #${activeRoom.name}...`}
              className="flex-1 resize-none bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-600 outline-none max-h-28 py-0.5 leading-relaxed"
              style={{ minHeight: "24px" }}
            />
            <div className="flex items-center gap-2 shrink-0">
              {charCount > 0 && (
                <span className={`text-[10px] font-medium ${charCount > 1800 ? "text-red-400" : "text-gray-400"}`}>
                  {2000 - charCount}
                </span>
              )}
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-8 h-8 bg-brand text-white rounded-xl flex items-center justify-center text-sm font-bold disabled:opacity-30 transition-all active:scale-90 hover:bg-brand-dark shadow-sm shadow-brand/20"
              >
                ↑
              </button>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 mt-1 ml-1">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>

      {/* ─── Members Sidebar ──────────────────────── */}
      <div
        className={`${
          showMembers ? "flex" : "hidden"
        } md:flex w-64 shrink-0 flex-col bg-white/95 dark:bg-navy-800/95 backdrop-blur-xl border-l border-gray-100 dark:border-white/5 absolute inset-0 z-50 md:relative md:inset-auto animate-fade-slide`}
      >
        {/* Mobile close header */}
        <div className="h-14 flex items-center justify-between px-5 border-b border-gray-100 dark:border-white/5 md:hidden">
          <span className="font-bold text-sm">Members ({roomMembers.length})</span>
          <button onClick={() => setShowMembers(false)} className="text-gray-400 hover:text-gray-600 text-xl">
            ✕
          </button>
        </div>

        {/* Room info card */}
        <div className="p-5 border-b border-gray-100 dark:border-white/5">
          <div className={`w-10 h-10 rounded-xl mb-3 flex items-center justify-center text-white font-bold ${activeRoom.isPrivate ? "bg-amber-500" : "bg-brand"}`}>
            {activeRoom.isPrivate ? "🔒" : "#"}
          </div>
          <h3 className="font-black text-sm text-gray-900 dark:text-gray-50">#{activeRoom.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            {activeRoom.description || "No description provided."}
          </p>
          <div className="text-[11px] text-gray-400 mt-2 space-y-0.5">
            <p>Leader: <span className="text-brand font-semibold">{activeRoom.leader}</span></p>
          </div>
        </div>

        {/* Members list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 py-2">
            Online — {roomMembers.length}
          </h4>
          {roomMembers.map((m) => (
            <div
              key={m.socketId}
              className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition group/member"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative">
                  <Avatar username={m.username} color={m.color} size="sm" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-navy-800" />
                </div>
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate max-w-[100px]">
                  {m.username}
                </span>
                {m.username === activeRoom.leader && (
                  <span className="text-[10px] text-amber-500 font-bold" title="Room Leader">
                    ★
                  </span>
                )}
              </div>

              {/* Moderation */}
              {isLeader && m.username !== username && (
                <div className="flex gap-1 opacity-0 group-hover/member:opacity-100 transition">
                  <button
                    onClick={() => handleKick(m.username)}
                    className="text-[10px] text-orange-400 hover:text-orange-600 font-bold px-1.5 py-0.5 rounded hover:bg-orange-500/10 transition"
                  >
                    Kick
                  </button>
                  <button
                    onClick={() => handleBan(m.username)}
                    className="text-[10px] text-red-400 hover:text-red-600 font-bold px-1.5 py-0.5 rounded hover:bg-red-500/10 transition"
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
