import { useEffect } from "react";
import { usePostStore } from "../store/postStore";

// Hook to load posts and reset on filter change
export const usePosts = () => {
  const { posts, loading, hasMore, sort, search, tag, fetchPosts, setSort, setSearch, setTag } =
    usePostStore();

  useEffect(() => {
    fetchPosts(true); // reset + load fresh
  }, [sort, search, tag]);

  return { posts, loading, hasMore, fetchPosts, setSort, setSearch, setTag };
};