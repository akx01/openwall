import { create } from "zustand";

// NOTE: verifiedRooms intentionally NOT persisted —
// private rooms require password every time they are entered
export const useRoomStore = create(
  (set, get) => ({
    activeRoom: null,
    roomMembers: [],

    openRoom: (room) => set({ activeRoom: room, roomMembers: [] }),
    closeRoom: () => set({ activeRoom: null, roomMembers: [] }),
    setRoomMembers: (members) => set({ roomMembers: members }),
  })
);
