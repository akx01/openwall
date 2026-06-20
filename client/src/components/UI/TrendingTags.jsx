import { useEffect, useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "/api";

export default function TrendingTags({ onTagClick, activeTag }) {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    axios.get(`${API}/posts/trending-tags`).then((r) => setTags(r.data || [])).catch(() => {});
  }, []);

  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest shrink-0">
        🔥 Trending
      </span>
      {tags.slice(0, 10).map(({ tag, count }) => (
        <button
          key={tag}
          onClick={() => onTagClick(activeTag === tag ? "" : tag)}
          className={`trending-tag text-xs px-2.5 py-1 rounded-full font-semibold transition-all ${
            activeTag === tag
              ? "bg-brand text-white shadow-md shadow-brand/30"
              : "bg-brand/8 dark:bg-brand/15 text-brand dark:text-brand-light hover:bg-brand/15 dark:hover:bg-brand/25 border border-brand/10"
          }`}
        >
          #{tag}
          <span className="ml-1 opacity-60 text-[10px]">{count}</span>
        </button>
      ))}
    </div>
  );
}
