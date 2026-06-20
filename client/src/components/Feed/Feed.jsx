import { useState, useRef } from "react";
import Masonry from "react-masonry-css";
import PostCard from "./PostCard";
import QuickCompose from "./CreatePost";
import SkeletonCard from "../UI/SkeletonCard";
import TrendingTags from "../UI/TrendingTags";
import Confetti from "../UI/Confetti";
import { usePosts } from "../../hooks/usePosts";
import { useInfiniteScroll } from "../../hooks/useInfiniteScroll";
import { debounce } from "../../utils/helpers";

const BREAKPOINTS = { default: 3, 1100: 2, 700: 1 };
const SORT_OPTIONS = [
  { value: "latest", label: "🕐 Latest" },
  { value: "liked", label: "❤️ Most Liked" },
  { value: "trending", label: "🔥 Trending" },
];

export default function Feed() {
  const { posts, loading, hasMore, fetchPosts, setSort, setSearch, setTag } = usePosts();
  const sentinelRef = useInfiniteScroll(fetchPosts, hasMore);
  const searchDebounced = useRef(debounce(setSearch, 400)).current;
  const [activeTag, setActiveTag] = useState("");
  const [confettiActive, setConfettiActive] = useState(false);
  const [sortLabel, setSortLabel] = useState("latest");

  const handleTagClick = (tag) => {
    setActiveTag(tag);
    setTag(tag);
  };

  const handleSortChange = (e) => {
    setSortLabel(e.target.value);
    setSort(e.target.value);
  };

  const handlePublished = () => {
    setConfettiActive(true);
  };

  return (
    <div className="flex-1 space-y-4">
      <Confetti active={confettiActive} onDone={() => setConfettiActive(false)} />

      {/* Inline QuickCompose */}
      <QuickCompose onPublished={handlePublished} />

      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">🔍</span>
          <input
            onChange={(e) => searchDebounced(e.target.value)}
            placeholder="Search posts..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-navy-700/60 text-sm outline-none focus:border-brand/40 focus:ring-2 focus:ring-brand/10 transition-all text-gray-800 dark:text-gray-100 placeholder-gray-400"
          />
        </div>
        <select
          onChange={handleSortChange}
          value={sortLabel}
          className="px-3 py-2.5 rounded-2xl border border-gray-200 dark:border-white/8 bg-white dark:bg-navy-700/60 text-sm outline-none focus:border-brand/40 text-gray-700 dark:text-gray-200 transition-all"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Trending Tags */}
      <TrendingTags onTagClick={handleTagClick} activeTag={activeTag} />

      {/* Active tag filter pill */}
      {activeTag && (
        <div className="flex items-center gap-2 animate-scale-in">
          <span className="text-xs text-gray-500 dark:text-gray-400">Filtering by:</span>
          <span className="inline-flex items-center gap-1.5 text-xs bg-brand text-white px-3 py-1 rounded-full font-semibold">
            #{activeTag}
            <button
              onClick={() => handleTagClick("")}
              className="ml-1 leading-none hover:opacity-80 transition"
            >
              ✕
            </button>
          </span>
        </div>
      )}

      {/* Masonry grid */}
      {!loading && posts.length === 0 ? (
        <div className="text-center py-20 text-gray-400 animate-fade-slide">
          <p className="text-5xl mb-3">📝</p>
          <p className="font-semibold text-lg">No posts yet</p>
          <p className="text-sm mt-1">Be the first to write something above!</p>
        </div>
      ) : (
        <Masonry breakpointCols={BREAKPOINTS} className="masonry-grid" columnClassName="masonry-grid-col">
          {posts.map((post, i) => (
            <PostCard key={post._id} post={post} index={i} />
          ))}
          {loading &&
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={`skel-${i}`} />)}
        </Masonry>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-8" />
      {!hasMore && posts.length > 0 && (
        <p className="text-center text-sm text-gray-400 dark:text-gray-600 py-4">
          ✨ You've seen it all
        </p>
      )}
    </div>
  );
}