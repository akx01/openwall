import { create } from "zustand";
import axios from "axios";
import { useUserStore } from "./userStore";
import socket from "../socket";

const API = import.meta.env.VITE_API_URL || "/api";

export const useDmStore = create((set, get) => ({
  friends: [],
  pendingRequests: [],
  sentRequests: [],
  conversations: {}, // friendUsername -> [messages]
  unreadCounts: {},   // friendUsername -> count
  activeDmUser: null, // Friend currently chatting with
  dmOpen: false,
  searchResults: [],
  loadingFriends: false,
  loadingChat: false,

  setDmOpen: (open) => set({ dmOpen: open }),

  setActiveDmUser: async (friend) => {
    set({ activeDmUser: friend });
    if (friend) {
      // Clear unread counts for this friend
      set((s) => ({
        unreadCounts: { ...s.unreadCounts, [friend]: 0 },
      }));

      // Notify backend to mark messages from this friend as read
      try {
        const { username, passwordHash } = useUserStore.getState();
        await axios.post(
          `${API}/dms/mark-read`,
          { friend },
          {
            headers: {
              "x-username": username,
              "x-password-hash": passwordHash,
            },
          }
        );
      } catch (err) {
        console.error("Failed to mark messages as read:", err.message);
      }
    }
  },

  loadFriends: async () => {
    const { username, passwordHash } = useUserStore.getState();
    if (!username || !passwordHash) return;

    set({ loadingFriends: true });
    try {
      const { data } = await axios.get(`${API}/users/friends`, {
        headers: {
          "x-username": username,
          "x-password-hash": passwordHash,
        },
      });
      
      // Merge unread counts or calculate initial counts
      // Let's also fetch direct messages to see which ones are unread.
      // Alternatively, we can calculate unread counts dynamically as DMs are loaded,
      // but to make it fast on load, let's keep track of it.
      set({
        friends: data.friends || [],
        pendingRequests: data.friendRequests || [],
        sentRequests: data.sentRequests || [],
      });
    } catch (err) {
      console.error("Failed to load friends:", err.message);
    } finally {
      set({ loadingFriends: false });
    }
  },

  searchUsers: async (query) => {
    const { username, passwordHash } = useUserStore.getState();
    if (!username || !passwordHash || !query.trim()) {
      set({ searchResults: [] });
      return;
    }

    try {
      const { data } = await axios.get(`${API}/users/search?q=${encodeURIComponent(query)}`, {
        headers: {
          "x-username": username,
          "x-password-hash": passwordHash,
        },
      });
      set({ searchResults: data });
    } catch (err) {
      console.error("Search failed:", err.message);
    }
  },

  sendFriendRequest: async (recipient) => {
    const { username, passwordHash } = useUserStore.getState();
    try {
      await axios.post(
        `${API}/users/friend-request`,
        { recipient },
        {
          headers: {
            "x-username": username,
            "x-password-hash": passwordHash,
          },
        }
      );
      await get().loadFriends();
    } catch (err) {
      console.error("Friend request error:", err.message);
      throw err;
    }
  },

  acceptFriendRequest: async (requester) => {
    const { username, passwordHash } = useUserStore.getState();
    try {
      await axios.post(
        `${API}/users/friend-request/accept`,
        { requester },
        {
          headers: {
            "x-username": username,
            "x-password-hash": passwordHash,
          },
        }
      );
      await get().loadFriends();
    } catch (err) {
      console.error("Accept friend request error:", err.message);
      throw err;
    }
  },

  declineFriendRequest: async (requester) => {
    const { username, passwordHash } = useUserStore.getState();
    try {
      await axios.post(
        `${API}/users/friend-request/decline`,
        { requester },
        {
          headers: {
            "x-username": username,
            "x-password-hash": passwordHash,
          },
        }
      );
      await get().loadFriends();
    } catch (err) {
      console.error("Decline request error:", err.message);
      throw err;
    }
  },

  loadDms: async (friend) => {
    const { username, passwordHash } = useUserStore.getState();
    if (!username || !passwordHash || !friend) return;

    set({ loadingChat: true });
    try {
      const { data } = await axios.get(`${API}/dms/${friend}`, {
        headers: {
          "x-username": username,
          "x-password-hash": passwordHash,
        },
      });
      
      set((s) => ({
        conversations: {
          ...s.conversations,
          [friend]: data,
        },
      }));
    } catch (err) {
      console.error("Failed to load DMs:", err.message);
    } finally {
      set({ loadingChat: false });
    }
  },

  sendDm: (recipient, content) => {
    const { username, passwordHash } = useUserStore.getState();
    if (!username || !passwordHash || !recipient || !content.trim()) return;

    socket.emit("send_direct_message", {
      sender: username,
      recipient,
      content: content.trim(),
      passwordHash,
    });
  },

  receiveDm: (dm) => {
    const { username, passwordHash } = useUserStore.getState();
    const otherUser = dm.sender === username ? dm.recipient : dm.sender;

    set((s) => {
      const currentMsgs = s.conversations[otherUser] || [];
      // Prevent duplicate messages
      if (currentMsgs.some((m) => m._id === dm._id)) return {};

      const updatedMsgs = [...currentMsgs, dm];
      const isCurrentlyChatting = s.activeDmUser === otherUser;
      const isIncoming = dm.sender !== username;

      const newUnreadCounts = { ...s.unreadCounts };
      if (isIncoming && !isCurrentlyChatting) {
        newUnreadCounts[otherUser] = (newUnreadCounts[otherUser] || 0) + 1;
      }

      return {
        conversations: {
          ...s.conversations,
          [otherUser]: updatedMsgs,
        },
        unreadCounts: newUnreadCounts,
      };
    });

    // If we receive a message in the active chat view from the other user, mark it as read immediately on backend
    if (get().activeDmUser === otherUser && dm.sender !== username) {
      axios.post(
        `${API}/dms/mark-read`,
        { friend: otherUser },
        {
          headers: {
            "x-username": username,
            "x-password-hash": passwordHash,
          },
        }
      ).catch(() => {});
    }
  },

  getTotalUnreadCount: () => {
    return Object.values(get().unreadCounts).reduce((sum, val) => sum + val, 0);
  },
}));
