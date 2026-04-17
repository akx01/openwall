import { create } from "zustand";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "/api";

export const usePostStore = create((set, get) => ({
  posts: [],
  page: 1,
  hasMore: true,
  loading: false,
  sort: "latest",
  search: "",
  tag: "",
  room: "",

  setSort: (sort) => set({ sort, posts: [], page: 1, hasMore: true }),
  setSearch: (search) => set({ search, posts: [], page: 1, hasMore: true }),
  setTag: (tag) => set({ tag, posts: [], page: 1, hasMore: true }),
  setRoom: (room) => set({ room, posts: [], page: 1, hasMore: true }),

  fetchPosts: async (reset = false) => {
    const { page, sort, search, tag, room, loading, hasMore } = get();
    if (loading || (!hasMore && !reset)) return;
    set({ loading: true });

    try {
      const params = new URLSearchParams({ page: reset ? 1 : page, limit: 20, sort });
      if (search) params.set("search", search);
      if (tag) params.set("tag", tag);
      if (room) params.set("room", room);

      const { data } = await axios.get(`${API}/posts?${params}`);
      set((s) => ({
        posts: reset ? data.posts : [...s.posts, ...data.posts],
        page: reset ? 2 : s.page + 1,
        hasMore: data.page < data.pages,
        loading: false,
      }));
    } catch {
      set({ loading: false });
    }
  },

  addPost: (post) => set((s) => ({ posts: [post, ...s.posts] })),

  toggleLike: async (postId, sessionId) => {
    const { data } = await axios.post(`${API}/posts/${postId}/like`, { sessionId });
    set((s) => ({
      posts: s.posts.map((p) =>
        p._id === postId ? { ...p, likes: data.likes } : p
      ),
    }));
  },
}));