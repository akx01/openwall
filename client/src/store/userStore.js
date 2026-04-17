import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateColor, generateSessionId } from "../utils/helpers";

// Persisted user store — survives page refreshes via localStorage
export const useUserStore = create(
  persist(
    (set, get) => ({
      username: "",
      color: generateColor(),
      sessionId: generateSessionId(),
      darkMode: false,
      notifications: true,
      mutedUsers: [],

      setUsername: (username) => set({ username }),
      setColor: (color) => set({ color }),
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),
      toggleNotifications: () => set((s) => ({ notifications: !s.notifications })),
      muteUser: (username) =>
        set((s) => ({ mutedUsers: [...new Set([...s.mutedUsers, username])] })),
      unmuteUser: (username) =>
        set((s) => ({ mutedUsers: s.mutedUsers.filter((u) => u !== username) })),
      clearSession: () =>
        set({ username: "", color: generateColor(), sessionId: generateSessionId() }),
    }),
    { name: "openwall-user" }
  )
);