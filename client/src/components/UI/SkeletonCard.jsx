export default function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-navy-700/60 rounded-2xl p-4 border border-gray-100 dark:border-white/5 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-full shimmer-bg shrink-0" />
        <div className="flex-1 space-y-1.5">
          <div className="h-2.5 shimmer-bg rounded w-1/3" />
          <div className="h-2 shimmer-bg rounded w-1/4" />
        </div>
      </div>
      <div className="h-4 shimmer-bg rounded w-3/4 mb-2" />
      <div className="h-3 shimmer-bg rounded w-full mb-1.5" />
      <div className="h-3 shimmer-bg rounded w-5/6 mb-1.5" />
      <div className="h-3 shimmer-bg rounded w-4/6 mb-4" />
      <div className="flex gap-2">
        <div className="h-5 w-14 shimmer-bg rounded-full" />
        <div className="h-5 w-14 shimmer-bg rounded-full" />
      </div>
    </div>
  );
}