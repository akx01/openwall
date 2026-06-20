import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useRoomStore = create(
  persist(
    (set, get) => ({
      activeRoom: null,
      roomMembers: [],
      verifiedRooms: [],

      openRoom: (room) => set({ activeRoom: room, roomMembers: [] }),
      closeRoom: () => set({ activeRoom: null, roomMembers: [] }),
      setRoomMembers: (members) => set({ roomMembers: members }),
      markVerified: (roomName) =>
        set((s) => ({
          verifiedRooms: [...new Set([...s.verifiedRooms, roomName])],
        })),
      isVerified: (roomName) => get().verifiedRooms.includes(roomName),
    }),
    { 
      name: "openwall-rooms-verified",
      // Only persist verifiedRooms, don't persist activeRoom and roomMembers
      partialize: (state) => ({ verifiedRooms: state.verifiedRooms }),
    }
  )
);
