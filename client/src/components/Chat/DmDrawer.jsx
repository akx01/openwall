import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDmStore } from "../../store/dmStore";
import { useUserStore } from "../../store/userStore";
import { useUIStore } from "../../store/uiStore";
import {
  X,
  Search,
  UserPlus,
  Check,
  ArrowLeft,
  Send,
  MessageCircle,
  Clock,
  Trash2,
  Users
} from "lucide-react";
import Avatar from "../UI/Avatar";

export default function DmDrawer() {
  const { username } = useUserStore();
  const { showToast } = useUIStore();
  const {
    dmOpen,
    setDmOpen,
    friends,
    pendingRequests,
    sentRequests,
    searchResults,
    activeDmUser,
    setActiveDmUser,
    conversations,
    loadingFriends,
    loadingChat,
    loadFriends,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    loadDms,
    sendDm
  } = useDmStore();

  const [activeTab, setActiveTab] = useState("chats"); // "chats" | "requests"
  const [searchQuery, setSearchQuery] = useState("");
  const [msgInput, setMsgInput] = useState("");
  const chatEndRef = useRef(null);

  // Load friends and requests whenever drawer opens
  useEffect(() => {
    if (dmOpen) {
      loadFriends();
    }
  }, [dmOpen]);

  // Load chat history when active conversation changes
  useEffect(() => {
    if (activeDmUser) {
      loadDms(activeDmUser);
    }
  }, [activeDmUser]);

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeDmUser]);

  // Handle user search debouncing
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers(searchQuery);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSend = () => {
    if (!msgInput.trim() || !activeDmUser) return;
    sendDm(activeDmUser, msgInput);
    setMsgInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleAddFriend = async (targetUser) => {
    try {
      await sendFriendRequest(targetUser);
      showToast(`Friend request sent to ${targetUser}! ✉️`, "success");
      if (searchQuery) searchUsers(searchQuery);
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to send request", "error");
    }
  };

  const handleAcceptRequest = async (targetUser) => {
    try {
      await acceptFriendRequest(targetUser);
      showToast(`You are now friends with ${targetUser}! 🎉`, "success");
      if (searchQuery) searchUsers(searchQuery);
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to accept request", "error");
    }
  };

  const handleDeclineRequest = async (targetUser) => {
    try {
      await declineFriendRequest(targetUser);
      showToast(`Request declined.`, "info");
      if (searchQuery) searchUsers(searchQuery);
    } catch (err) {
      showToast(err.response?.data?.error || "Failed to decline request", "error");
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <AnimatePresence>
      {dmOpen && (
        <>
          {/* Backdrop for desktop/tablet */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setDmOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 cursor-pointer"
          />

          {/* Drawer container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[440px] bg-white dark:bg-navy-900 border-l border-gray-200 dark:border-white/5 shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-navy-950/50 backdrop-blur-md sticky top-0 z-10 shrink-0">
              <div className="flex items-center gap-2">
                {activeDmUser ? (
                  <button
                    onClick={() => setActiveDmUser(null)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-navy-800 transition text-gray-500 dark:text-gray-400"
                  >
                    <ArrowLeft size={18} />
                  </button>
                ) : (
                  <MessageCircle className="text-brand" size={20} />
                )}
                <h2 className="text-lg font-black text-gray-900 dark:text-white tracking-tight">
                  {activeDmUser ? `${activeDmUser}` : "Direct Messages"}
                </h2>
              </div>
              <button
                onClick={() => setDmOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-800 transition text-gray-500 dark:text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            {/* Conversation Mode */}
            {activeDmUser ? (
              <div className="flex-1 flex flex-col overflow-hidden bg-gray-50 dark:bg-navy-950/40">
                {/* Message list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                  {loadingChat ? (
                    <div className="h-full flex items-center justify-center">
                      <span className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (conversations[activeDmUser] || []).length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 dark:text-gray-500 space-y-2">
                      <MessageCircle size={36} className="opacity-40 animate-pulse text-brand" />
                      <p className="text-sm font-semibold">No messages yet</p>
                      <p className="text-xs max-w-[200px]">Say hello to start the conversation!</p>
                    </div>
                  ) : (
                    (conversations[activeDmUser] || []).map((msg) => {
                      const isMe = msg.sender === username;
                      return (
                        <div
                          key={msg._id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"} animate-scale-in`}
                        >
                          <div
                            className={`max-w-[75%] rounded-[1.25rem] px-4 py-2.5 text-sm shadow-sm relative group ${
                              isMe
                                ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-tr-none"
                                : "bg-white dark:bg-navy-800 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-white/5 rounded-tl-none"
                            }`}
                          >
                            <p className="leading-relaxed break-words whitespace-pre-line">{msg.content}</p>
                            <span
                              className={`text-[9px] block text-right mt-1 opacity-70 ${
                                isMe ? "text-violet-200" : "text-gray-400 dark:text-gray-500"
                              }`}
                            >
                              {formatTime(msg.createdAt)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Message input bar */}
                <div className="p-4 border-t border-gray-200 dark:border-white/5 bg-white dark:bg-navy-900 flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={msgInput}
                    onChange={(e) => setMsgInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Message..."
                    className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 dark:border-white/8 bg-gray-50 dark:bg-navy-850 text-sm outline-none focus:ring-2 focus:ring-brand/35 transition-all text-gray-800 dark:text-gray-100"
                  />
                  <motion.button
                    onClick={handleSend}
                    disabled={!msgInput.trim()}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-11 h-11 bg-brand text-white rounded-2xl flex items-center justify-center hover:bg-brand-dark transition-all disabled:opacity-40 disabled:scale-100 cursor-pointer shadow-md shadow-brand/20"
                  >
                    <Send size={16} />
                  </motion.button>
                </div>
              </div>
            ) : (
              /* Lists Mode (Friends list / requests) */
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-gray-100 dark:border-white/5 p-1 bg-gray-50/50 dark:bg-navy-950/20 shrink-0">
                  <button
                    onClick={() => setActiveTab("chats")}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      activeTab === "chats"
                        ? "bg-white dark:bg-navy-800 text-brand shadow-sm border border-gray-100 dark:border-white/5"
                        : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                  >
                    <MessageCircle size={14} /> Friends
                  </button>
                  <button
                    onClick={() => setActiveTab("requests")}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 relative ${
                      activeTab === "requests"
                        ? "bg-white dark:bg-navy-800 text-brand shadow-sm border border-gray-100 dark:border-white/5"
                        : "text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                    }`}
                  >
                    <Users size={14} /> Requests
                    {pendingRequests.length > 0 && (
                      <span className="w-2 h-2 rounded-full bg-red-500 absolute top-2 right-4 animate-ping" />
                    )}
                  </button>
                </div>

                {/* Subview container */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                  {activeTab === "chats" && (
                    <>
                      {/* Search / Add Friends Section */}
                      <div className="space-y-3">
                        <div className="relative">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search and add friends..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-navy-800 text-xs outline-none focus:border-brand/40 transition-all text-gray-800 dark:text-gray-200"
                          />
                        </div>

                        {/* Search Results */}
                        {searchQuery.trim() && (
                          <div className="bg-gray-50 dark:bg-navy-950/40 rounded-2xl p-2 border border-gray-100 dark:border-white/5 space-y-2 animate-scale-in">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 pt-1">
                              Search Results
                            </p>
                            {searchResults.length === 0 ? (
                              <p className="text-xs text-gray-400 px-2 py-1 text-center">No users found</p>
                            ) : (
                              searchResults.map((user) => (
                                <div
                                  key={user.username}
                                  className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-navy-800 border border-gray-100/50 dark:border-white/5"
                                >
                                  <div className="flex items-center gap-2">
                                    <Avatar username={user.username} color={user.color} size="sm" />
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                                      {user.username}
                                    </span>
                                  </div>

                                  {user.isFriend ? (
                                    <button
                                      onClick={() => {
                                        setSearchQuery("");
                                        setActiveDmUser(user.username);
                                      }}
                                      className="px-2.5 py-1 bg-brand/10 hover:bg-brand/20 text-brand rounded-lg text-[10px] font-extrabold transition-all"
                                    >
                                      Chat
                                    </button>
                                  ) : user.isSent ? (
                                    <span className="text-[10px] font-bold text-gray-400 px-2">Sent</span>
                                  ) : user.isPending ? (
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => handleAcceptRequest(user.username)}
                                        className="p-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                                      >
                                        <Check size={12} />
                                      </button>
                                      <button
                                        onClick={() => handleDeclineRequest(user.username)}
                                        className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                                      >
                                        <X size={12} />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => handleAddFriend(user.username)}
                                      className="p-1.5 bg-brand text-white rounded-lg hover:bg-brand-dark transition-all"
                                      title="Add Friend"
                                    >
                                      <UserPlus size={12} />
                                    </button>
                                  )}
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>

                      {/* Friends List */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                          All Friends ({friends.length})
                        </p>
                        {loadingFriends ? (
                          <div className="py-8 flex items-center justify-center">
                            <span className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                          </div>
                        ) : friends.length === 0 ? (
                          <div className="text-center py-12 text-gray-400 dark:text-gray-500 space-y-2">
                            <Users size={32} className="mx-auto opacity-30" />
                            <p className="text-xs font-bold">No friends yet</p>
                            <p className="text-[10px] max-w-[200px] mx-auto">
                              Search for other users to build your friends list and chat privately!
                            </p>
                          </div>
                        ) : (
                          friends.map((friend) => (
                            <motion.div
                              key={friend}
                              onClick={() => setActiveDmUser(friend)}
                              whileHover={{ x: 3 }}
                              className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 dark:bg-navy-800/40 dark:hover:bg-navy-800/80 border border-gray-100/50 dark:border-white/5 transition-all cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    useUIStore.getState().openProfile(friend);
                                  }}
                                  className="hover:scale-105 transition-transform"
                                  title="View Profile"
                                >
                                  <Avatar username={friend} size="md" />
                                </div>
                                <div className="text-left">
                                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                                    {friend}
                                  </p>
                                  <p className="text-[10px] text-gray-400 dark:text-gray-500">
                                    Click to direct message
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Unread counts badge */}
                                {useDmStore.getState().unreadCounts[friend] > 0 && (
                                  <span className="w-5 h-5 rounded-full bg-red-500 text-white font-black text-[10px] flex items-center justify-center animate-bounce">
                                    {useDmStore.getState().unreadCounts[friend]}
                                  </span>
                                )}
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </>
                  )}

                  {activeTab === "requests" && (
                    <div className="space-y-4">
                      {/* Received Requests */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                          Received ({pendingRequests.length})
                        </p>
                        {pendingRequests.length === 0 ? (
                          <p className="text-xs text-gray-400 dark:text-gray-500 italic py-2 px-1">
                            No pending invitations
                          </p>
                        ) : (
                          pendingRequests.map((requester) => (
                            <div
                              key={requester}
                              className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-navy-800/40 border border-gray-100/50 dark:border-white/5"
                            >
                              <div className="flex items-center gap-2.5">
                                <Avatar username={requester} size="sm" />
                                <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                  {requester}
                                </span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAcceptRequest(requester)}
                                  className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-[10px] font-bold transition flex items-center gap-1 shadow-sm shadow-green-500/10 cursor-pointer"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleDeclineRequest(requester)}
                                  className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-[10px] font-bold transition flex items-center gap-1 shadow-sm shadow-red-500/10 cursor-pointer"
                                >
                                  Decline
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Sent Requests */}
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">
                          Sent ({sentRequests.length})
                        </p>
                        {sentRequests.length === 0 ? (
                          <p className="text-xs text-gray-400 dark:text-gray-500 italic py-2 px-1">
                            No sent invitations
                          </p>
                        ) : (
                          sentRequests.map((recipient) => (
                            <div
                              key={recipient}
                              className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-navy-800/40 border border-gray-100/50 dark:border-white/5"
                            >
                              <div className="flex items-center gap-2.5">
                                <Avatar username={recipient} size="sm" />
                                <span className="text-xs font-bold text-gray-850 dark:text-gray-250">
                                  {recipient}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-gray-400 px-2">Pending</span>
                                <button
                                  onClick={() => handleDeclineRequest(recipient)}
                                  className="p-1.5 bg-gray-200 dark:bg-navy-700 hover:bg-red-500 dark:hover:bg-red-500 hover:text-white rounded-lg text-gray-500 dark:text-gray-450 transition duration-150 cursor-pointer"
                                  title="Cancel Request"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
