export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`skeleton rounded-md ${className}`}
      {...props}
    />
  );
}

export function ProductSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Skeleton className="h-4 w-2/3 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="flex gap-4">
          <div className="flex flex-col gap-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="w-16 h-16 rounded-lg" />
            ))}
          </div>
          <Skeleton className="flex-1 aspect-square rounded-xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-20 w-2/3 rounded-xl" />
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
