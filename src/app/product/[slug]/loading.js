export default function ProductLoading() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-[1400px]">
      {/* Breadcrumb Skeleton */}
      <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-8"></div>

      <div className="flex flex-col lg:flex-row gap-8 xl:gap-12 relative">
        {/* Gallery Skeleton */}
        <div className="w-full lg:w-[45%] xl:w-[42%] shrink-0">
          <div className="aspect-square bg-gray-100 rounded-2xl animate-pulse"></div>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 w-16 bg-gray-100 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>

        {/* Info Skeleton */}
        <div className="flex-1 max-w-[600px]">
          <div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse mb-6"></div>
          
          <div className="h-12 w-1/3 bg-brand-yellow/20 rounded animate-pulse mb-8"></div>
          
          <div className="space-y-4 mb-8">
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
            <div className="h-4 w-full bg-gray-100 rounded animate-pulse"></div>
            <div className="h-4 w-2/3 bg-gray-100 rounded animate-pulse"></div>
          </div>

          <div className="h-14 w-full bg-gray-200 rounded-full animate-pulse mb-4"></div>
          <div className="h-14 w-full bg-brand-yellow/30 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
