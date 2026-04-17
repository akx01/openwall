// Skeleton loading card for the feed
export default function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-4" />
      <div className="flex gap-2">
        <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-5 w-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
    </div>
  );
}