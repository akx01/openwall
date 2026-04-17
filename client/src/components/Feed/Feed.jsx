import Masonry from "react-masonry-css";
import PostCard from "./PostCard";
import SkeletonCard from "../UI/SkeletonCard";
import { usePosts } from "../../hooks/usePosts";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { debounce } from "../../utils/helpers";
import { useRef } from "react";

const BREAKPOINTS = { default: 3, 1100: 2, 700: 1 };
const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "liked", label: "Most Liked" },
  { value: "trending", label: "Trending" },
];

export default function Feed() {
  const { posts, loading, hasMore, fetchPosts, setSort, setSearch, setTag } = usePosts();
  const sentinelRef = useInfiniteScroll(fetchPosts, hasMore);
  const searchDebounced = useRef(debounce(setSearch, 400)).current;

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 mb-4 items-center">
        <input
          onChange={(e) => searchDebounced(e.target.value)}
          placeholder="🔍 Search posts..."
          className="flex-1 min-w-[180px] px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none focus:border-brand"
        />
        <select
          onChange={(e) => setSort(e.target.value)}
          className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm outline-none"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Masonry grid */}
      <Masonry breakpointCols={BREAKPOINTS} className="masonry-grid" columnClassName="masonry-grid-col">
        {posts.map((post) => (
          <div key={post._id} className="mb-4">
            <PostCard post={post} />
          </div>
        ))}
        {loading && Array.from({ length: 6 }).map((_, i) => (
          <div key={`skel-${i}`} className="mb-4"><SkeletonCard /></div>
        ))}
      </Masonry>

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-8" />
      {!hasMore && posts.length > 0 && (
        <p className="text-center text-sm text-gray-400 py-4">You've reached the end ✨</p>
      )}
      {!loading && posts.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-2">📝</p>
          <p>No posts yet. Be the first to write something!</p>
        </div>
      )}
    </div>
  );
}