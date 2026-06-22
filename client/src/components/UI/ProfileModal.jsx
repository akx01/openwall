import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "../../store/uiStore";
import { useUserStore } from "../../store/userStore";
import { useDmStore } from "../../store/dmStore";
import {
  X,
  UserPlus,
  Check,
  MessageSquare,
  Lock,
  FileText,
  Calendar,
  Grid,
  ShieldAlert
} from "lucide-react";
import Avatar from "./Avatar";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "/api";

export default function ProfileModal() {
  const { activeModal, profileUser, closeProfile, showToast } = useUIStore();
  const { username: myUsername, passwordHash } = useUserStore();
  const { setDmOpen, setActiveDmUser, sendFriendRequest, acceptFriendRequest, declineFriendRequest } = useDmStore();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const isOpen = activeModal === "profile" && !!profileUser;

  const fetchProfile = async () => {
    if (!profileUser) return;
    setLoadingProfile(true);
    try {
      const { data } = await axios.get(`${API}/users/profile/${profileUser}`, {
        headers: {
          "x-username": myUsername,
          "x-password-hash": passwordHash,
        },
      });
      setProfile(data);
      
      // If user has access to target posts, load them
      if (data.canViewPosts) {
        loadPosts(data.username);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error("Failed to load profile:", err.message);
      showToast("Failed to load profile details", "error");
      closeProfile();
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadPosts = async (authorName) => {
    setLoadingPosts(true);
    try {
      const { data } = await axios.get(`${API}/posts?author=${authorName}`, {
        headers: {
          "x-username": myUsername,
          "x-password-hash": passwordHash,
        },
      });
      setPosts(data.posts || []);
    } catch (err) {
      console.error("Failed to load user posts:", err.message);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    } else {
      setProfile(null);
      setPosts([]);
    }
  }, [isOpen, profileUser]);

  const handleAddFriend = async () => {
    if (actionLoading || !profile) return;
    setActionLoading(true);
    try {
      await sendFriendRequest(profile.username);
      showToast("Friend request sent! ✉️", "success");
      await fetchProfile(); // Refresh
    } catch (err) {
      showToast(err.response?.data?.error || "Request failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    if (actionLoading || !profile) return;
    setActionLoading(true);
    try {
      await acceptFriendRequest(profile.username);
      showToast(`You are now friends with ${profile.username}! 🎉`, "success");
      await fetchProfile();
    } catch (err) {
      showToast(err.response?.data?.error || "Accept failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineRequest = async () => {
    if (actionLoading || !profile) return;
    setActionLoading(true);
    try {
      await declineFriendRequest(profile.username);
      showToast("Request declined", "info");
      await fetchProfile();
    } catch (err) {
      showToast(err.response?.data?.error || "Decline failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMessage = () => {
    if (!profile) return;
    closeProfile();
    setDmOpen(true);
    setActiveDmUser(profile.username);
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
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              User Profile
            </span>
            <button
              onClick={closeProfile}
              className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-navy-800 transition text-gray-500"
            >
              <X size={18} />
            </button>
          </div>

          {loadingProfile ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <span className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-gray-400">Fetching profile details...</p>
            </div>
          ) : (
            profile && (
              <div className="flex-1 overflow-y-auto no-scrollbar">
                {/* Profile Card Banner */}
                <div className="p-6 text-center space-y-4 border-b border-gray-100 dark:border-white/5 bg-gradient-to-b from-gray-50/40 to-white dark:from-navy-950/10 dark:to-navy-900">
                  <div className="flex justify-center">
                    <div className="p-1 rounded-full bg-white dark:bg-navy-800 shadow-md">
                      <Avatar username={profile.username} color={profile.color} size="lg" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                      {profile.username}
                    </h3>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-gray-100 dark:bg-navy-850 text-gray-500 dark:text-gray-400">
                        {profile.isPrivate ? "🔒 Private Account" : "🌐 Public Account"}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-violet-50 dark:bg-violet-950/20 text-brand">
                        👥 {profile.friendCount} friends
                      </span>
                    </div>
                  </div>

                  {/* Profile Action Buttons */}
                  <div className="flex justify-center gap-2.5 pt-2">
                    {profile.username === myUsername ? (
                      <span className="text-xs text-gray-400 font-semibold italic">This is your profile card</span>
                    ) : profile.isFriend ? (
                      <>
                        <span className="px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5 select-none">
                          <Check size={14} /> Friends
                        </span>
                        <button
                          onClick={handleMessage}
                          className="px-4 py-2 bg-brand text-white rounded-xl text-xs font-bold hover:bg-brand-dark transition flex items-center gap-1.5 shadow-md shadow-brand/20 cursor-pointer"
                        >
                          <MessageSquare size={14} /> Message
                        </button>
                      </>
                    ) : profile.isPending ? (
                      <span className="px-4 py-2 bg-gray-100 dark:bg-navy-850 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-white/5 rounded-xl text-xs font-bold select-none">
                        Request Pending
                      </span>
                    ) : profile.isSent ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleAcceptRequest}
                          disabled={actionLoading}
                          className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Accept Request
                        </button>
                        <button
                          onClick={handleDeclineRequest}
                          disabled={actionLoading}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Decline
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleAddFriend}
                        disabled={actionLoading}
                        className="px-5 py-2 bg-brand text-white rounded-xl text-xs font-bold hover:bg-brand-dark transition-all flex items-center gap-1.5 shadow-md shadow-brand/25 cursor-pointer"
                      >
                        <UserPlus size={14} /> Add Friend
                      </button>
                    )}
                  </div>
                </div>

                {/* Posts Feed section */}
                <div className="p-5">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Grid size={14} /> Recent Writings
                  </h4>

                  {!profile.canViewPosts ? (
                    <div className="py-12 border border-dashed border-gray-200 dark:border-white/5 rounded-2xl flex flex-col items-center justify-center text-center p-6 bg-gray-50/50 dark:bg-navy-950/20 text-gray-400 dark:text-gray-500 space-y-2">
                      <Lock size={28} className="opacity-50 text-brand" />
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-200">This profile is Private</p>
                      <p className="text-xs max-w-[240px]">
                        Only accepted friends can view this user's public wall writings.
                      </p>
                    </div>
                  ) : loadingPosts ? (
                    <div className="py-12 flex items-center justify-center">
                      <span className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="py-12 border border-dashed border-gray-200 dark:border-white/5 rounded-2xl text-center text-gray-400 dark:text-gray-500 space-y-2">
                      <FileText size={24} className="mx-auto opacity-30" />
                      <p className="text-xs font-semibold">No writings shared yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {posts.map((post) => (
                        <div
                          key={post._id}
                          className="p-4 rounded-2xl bg-gray-50 dark:bg-navy-800/40 border border-gray-100 dark:border-white/5 text-left space-y-2 animate-scale-in"
                        >
                          <h5 className="font-extrabold text-sm text-gray-900 dark:text-white leading-tight">
                            {post.title}
                          </h5>
                          <p className="text-xs text-gray-650 dark:text-gray-300 line-clamp-3">
                            {post.content}
                          </p>
                          <div className="flex items-center gap-3 pt-1 text-[9px] text-gray-450 dark:text-gray-550 font-bold">
                            <span className="flex items-center gap-1">
                              ❤️ {post.likes} Likes
                            </span>
                            <span className="flex items-center gap-1">
                              💬 {post.comments?.length || 0} Comments
                            </span>
                            {post.room !== "global" && (
                              <span className="text-brand">
                                📍 Room: {post.room}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
