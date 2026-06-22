import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateColor, generateSessionId } from "../utils/helpers";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "/api";

// Simple client-side password guard using Web Crypto (SHA-256)
async function hashPassword(plain) {
  const enc = new TextEncoder().encode(plain);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Persisted user store — survives page refreshes via localStorage
export const useUserStore = create(
  persist(
    (set, get) => ({
      username: "",
      passwordHash: "", // SHA-256 of user's password
      color: generateColor(),
      sessionId: generateSessionId(),
      darkMode: false,
      notifications: true,
      mutedUsers: [],
      pinnedRooms: [],

      setUsername: (username) => set({ username }),
      setColor: (color) => set({ color }),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      toggleNotifications: () => set((s) => ({ notifications: !s.notifications })),
      muteUser: (username) =>
        set((s) => ({ mutedUsers: [...new Set([...s.mutedUsers, username])] })),
      unmuteUser: (username) =>
        set((s) => ({ mutedUsers: s.mutedUsers.filter((u) => u !== username) })),
      pinRoom: (roomName) =>
        set((s) => ({ pinnedRooms: [...new Set([...s.pinnedRooms, roomName])] })),
      unpinRoom: (roomName) =>
        set((s) => ({ pinnedRooms: s.pinnedRooms.filter((r) => r !== roomName) })),
      clearSession: () =>
        set({ username: "", passwordHash: "", color: generateColor(), sessionId: generateSessionId(), pinnedRooms: [] }),

      // Register: set username + hash password and sync to backend
      register: async (username, password) => {
        const hash = await hashPassword(password);
        const color = get().color || generateColor();
        await axios.post(`${API}/users/sync`, {
          username,
          passwordHash: hash,
          color,
        });
        set({ username, passwordHash: hash, color });
      },

      // Login: verify password matches backend stored hash
      login: async (username, password) => {
        const hash = await hashPassword(password);
        const { data } = await axios.post(`${API}/users/sync`, {
          username,
          passwordHash: hash,
        });
        set({ username: data.username, passwordHash: hash, color: data.color });
        return data;
      },

      // Local fallback verify password matches stored hash
      verifyPassword: async (password) => {
        const hash = await hashPassword(password);
        return hash === get().passwordHash;
      },

      // Check if account exists (has a username + password set)
      hasAccount: () => {
        const { username, passwordHash } = get();
        return !!username && !!passwordHash;
      },
    }),
    { name: "openwall-user" }
  )
);