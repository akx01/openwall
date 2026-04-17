import { useEffect, useRef } from "react";

// Triggers `callback` when the sentinel element scrolls into view
export const useInfiniteScroll = (callback, hasMore) => {
  const sentinelRef = useRef(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) callback(); },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, callback]);

  return sentinelRef;
};