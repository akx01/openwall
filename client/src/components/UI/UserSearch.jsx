import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Check, MessageSquare, Lock } from "lucide-react";
import Avatar from "./Avatar";
import { useUIStore } from "../../store/uiStore";
import { useDmStore } from "../../store/dmStore";
import { useUserStore } from "../../store/userStore";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "/api";

export default function UserSearch() {
  const { activeModal, closeModal, showToast } = useUIStore();
  const { username: myUsername, passwordHash } = useUserStore();
  const { sendFriendRequest, acceptFriendRequest, declineFriendRequest } = useDmStore();

  const isOpen = activeModal === "search";

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchResults = async (q) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/users/search?q=${encodeURIComponent(q)}`, {
        headers: { "x-username": myUsername, "x-password-hash": passwordHash },
      });
      setResults(data);
    } catch (err) {
      console.error("Search error", err);
      showToast("Search failed", "error");
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const handler = setTimeout(() => fetchResults(query), 300);
    return () => clearTimeout(handler);
  }, [query]);

  const handleAddFriend = async (target) => {
    try { await sendFriendRequest(target.username); showToast(`Friend request sent to ${target.username}!`, "success"); } catch (e) { showToast(e.response?.data?.error || "Request failed", "error"); }
  };
  const handleAccept = async (target) => {
    try { await acceptFriendRequest(target.username); showToast(`Accepted ${target.username}`, "success"); } catch (e) { showToast(e.response?.data?.error || "Accept failed", "error"); }
  };
  const handleDecline = async (target) => {
    try { await declineFriendRequest(target.username); showToast(`Declined ${target.username}`, "info"); } catch (e) { showToast(e.response?.data?.error || "Decline failed", "error"); }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white dark:bg-navy-900 border border-gray-150 dark:border-white/5 shadow-2xl rounded-3xl w-full max-w-lg overflow-hidden max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-navy-950/20">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Search Users</span>
            <button onClick={closeModal} className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-navy-800 transition text-gray-5">
              <X size={18} />
            </button>
          </div>
          {/* Search input */}
          <div className="p-4 border-b border-gray-100 dark:border-white/5">
            <input
              type="text"
              placeholder="Enter username..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-navy-800 text-sm outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            />
          </div>
          {/* Results */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8"><span className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              results.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400">No results</p>
              ) : (
                <ul className="space-y-3">
                  {results.map((u) => (
                    <li key={u.username} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-navy-800/40">
                      <div className="flex items-center gap-2">
                        <Avatar username={u.username} color={u.color} size="sm" />
                        <span className="font-medium text-gray-800 dark:text-gray-200">{u.username}</span>
                      </div>
                      <div>
                        {u.isFriend ? (
                          <span className="px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-xs font-bold flex items-center gap-1"><Check size={14} /> Friends</span>
                        ) : u.isPending ? (
                          <span className="px-3 py-1 bg-gray-100 dark:bg-navy-850 text-gray-500 dark:text-gray-400 rounded-full text-xs font-bold">Pending</span>
                        ) : u.isSent ? (
                          <div className="flex gap-2">
                            <button onClick={() => handleAccept(u)} className="px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs">Accept</button>
                            <button onClick={() => handleDecline(u)} className="px-2 py-1 bg-red-5…
