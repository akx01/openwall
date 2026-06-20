import { create } from "zustand";

export const useRoomStore = create((set, get) => ({
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
}));
