import { create } from "zustand";

// NOTE: verifiedRooms intentionally NOT persisted —
// private rooms require password every time they are entered
export const useRoomStore = create(
  (set, get) => ({
    activeRoom: null,
    roomMembers: [],
    verifiedRoomPasswords: {},

    isVerified: (roomName) => !!get().verifiedRoomPasswords[roomName],
    markVerified: (roomName, password) => set((s) => ({
      verifiedRoomPasswords: { ...s.verifiedRoomPasswords, [roomName]: password || true }
    })),
    openRoom: (room, password) => set((s) => {
      const pw = password || s.verifiedRoomPasswords[room.name];
      return {
        activeRoom: room,
        roomMembers: [],
        verifiedRoomPasswords: pw
          ? { ...s.verifiedRoomPasswords, [room.name]: pw }
          : s.verifiedRoomPasswords
      };
    }),
    closeRoom: () => set({ activeRoom: null, roomMembers: [] }),
    setRoomMembers: (members) => set({ roomMembers: members }),
  })
);
