import { create } from "zustand";

export const useUIStore = create((set) => ({
  toasts: [],
  activeModal: null, // "createPost" | "postDetail" | "settings" | null
  selectedPost: null,

  showToast: (message, type = "info") => {
    const id = Date.now();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3000);
  },

  openModal: (modal, data = null) => set({ activeModal: modal, selectedPost: data }),
  closeModal: () => set({ activeModal: null, selectedPost: null }),
}));