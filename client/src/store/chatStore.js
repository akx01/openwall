import { create } from "zustand";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "/api";

export const useChatStore = create((set, get) => ({
  messages: [],
  rooms: [],
  currentRoom: "global",
  typingUsers: [],
  onlineCount: 0,

  setCurrentRoom: (room) => set({ currentRoom: room, messages: [] }),
  setOnlineCount: (n) => set({ onlineCount: n }),

  loadRooms: async () => {
    const { data } = await axios.get(`${API}/rooms`);
    set({ rooms: data });
  },

  loadMessages: async (room) => {
    const { data } = await axios.get(`${API}/messages/${room}`);
    set({ messages: data });
  },

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  deleteMessage: (messageId) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m._id === messageId ? { ...m, content: "[message deleted]", deleted: true } : m
      ),
    })),

  updateReaction: (messageId, reactions) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m._id === messageId ? { ...m, reactions } : m
      ),
    })),

  setTyping: (username, isTyping) =>
    set((s) => ({
      typingUsers: isTyping
        ? [...new Set([...s.typingUsers, username])]
        : s.typingUsers.filter((u) => u !== username),
    })),

  createRoom: async (name, description, createdBy) => {
    const { data } = await axios.post(`${API}/rooms`, { name, description, createdBy });
    set((s) => ({ rooms: [...s.rooms, data] }));
    return data;
  },
}));