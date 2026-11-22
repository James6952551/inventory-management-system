export default function LoadingPage() {
  return (
    <div className="w-full">
        <div className="space-y-6 p-6">
          {/* Header skeleton */}
          <div className="h-8 w-48 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse" />
          {/* Metric cards grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-gray-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
            ))}
          </div>
          {/* Table / Chart area skeleton */}
          <div className="h-96 bg-gray-200 dark:bg-zinc-800 rounded-xl animate-pulse" />
        </div>
    </div>
  )
}