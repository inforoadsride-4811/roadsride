'use client';

import { useState, useCallback, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import FilterSidebar from './FilterSidebar';
import TopToolbar from './TopToolbar';
import ProductCard from './ProductCard';
import Pagination from './Pagination';
import { X, SlidersHorizontal, PackageSearch } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ShopPageClient({ initialProducts, pagination, filterMetadata, initialFilters }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [isPending, startTransition] = useTransition();

  // Update filters in URL
  const updateFilter = useCallback((key, value) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset to page 1 if changing a filter (other than page itself)
    if (key !== 'page') {
      params.set('page', '1');
    }

    // Since we handle /category/[slug] via route, if we change category in the sidebar,
    // we should redirect appropriately, but for simplicity we keep it as a URL query param ?categorySlug=...
    // If the user is on /category/xyz, and changes category, it's better to navigate to /shop?categorySlug=new
    if (key === 'categorySlug' && pathname.startsWith('/category/')) {
      if (value) {
        startTransition(() => router.push(`/category/${value}?${params.toString()}`, { scroll: false }));
      } else {
        startTransition(() => router.push(`/shop?${params.toString()}`, { scroll: false }));
      }
      return;
    }

    startTransition(() => router.push(`${pathname}?${params.toString()}`, { scroll: false }));
  }, [searchParams, pathname, router]);

  const clearFilters = () => {
    startTransition(() => {
      if (pathname.startsWith('/category/')) {
        router.push('/shop', { scroll: false });
      } else {
        router.push(pathname, { scroll: false });
      }
    });
    setIsMobileFiltersOpen(false);
  };

  // Close mobile filter drawer when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileFiltersOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="bg-[#f8f8f8] min-h-screen pt-6 pb-20">
      <div className="max-w-[1440px] mx-auto px-5 md:px-16">

        {/* Breadcrumb / Title */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-brand-black tracking-tight mb-2">
            {initialFilters.categorySlug
              ? filterMetadata.categories.find(c => c.slug === initialFilters.categorySlug)?.name || 'Products'
              : initialFilters.q
                ? `Search results for "${initialFilters.q}"`
                : 'All Products'}
          </h1>
          <p className="text-gray-500">Discover our premium collection of automotive accessories and care products.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
              <FilterSidebar
                filters={initialFilters}
                updateFilter={updateFilter}
                clearFilters={clearFilters}
                filterMetadata={filterMetadata}
              />
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <TopToolbar
              pagination={pagination}
              filters={initialFilters}
              updateFilter={updateFilter}
              viewMode={viewMode}
              setViewMode={setViewMode}
              openMobileFilters={() => setIsMobileFiltersOpen(true)}
            />

            {initialProducts.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 flex flex-col items-center justify-center text-center shadow-sm h-[50vh]">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                  <PackageSearch size={40} className="text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-brand-black mb-2">No Products Found</h3>
                <p className="text-gray-500 mb-8 max-w-md">We couldn't find any products matching your current filters. Try adjusting your search or clearing filters.</p>
                <Button onClick={clearFilters} className="bg-brand-yellow text-brand-black hover:bg-brand-yellow-hover font-bold px-8">
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <>
                <div className={
                  viewMode === 'grid'
                    ? "grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
                    : "flex flex-col gap-6"
                }>
                  {isPending ? (
                    [...Array(8)].map((_, i) => <ProductSkeleton key={i} viewMode={viewMode} />)
                  ) : (
                    initialProducts.map(product => (
                      <ProductCard key={product.id} product={product} viewMode={viewMode} />
                    ))
                  )}
                </div>
                <Pagination pagination={pagination} updateFilter={updateFilter} />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer Overlay */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileFiltersOpen(false)} />
          <div className="relative w-[85%] max-w-sm h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <SlidersHorizontal size={18} /> Filters
              </h2>
              <button onClick={() => setIsMobileFiltersOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50/50">
              <FilterSidebar
                filters={initialFilters}
                updateFilter={updateFilter}
                clearFilters={clearFilters}
                filterMetadata={filterMetadata}
                isMobile={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductSkeleton({ viewMode }) {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col sm:flex-row gap-4 p-4 animate-pulse">
        <div className="relative w-full sm:w-48 aspect-square bg-gray-200 rounded-lg shrink-0"></div>
        <div className="flex flex-col flex-1 py-2">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-auto"></div>
          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col animate-pulse">
      <div className="aspect-square bg-gray-200"></div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="h-3 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="h-5 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-5 bg-gray-200 rounded w-2/3 mb-4"></div>
        <div className="mt-auto pt-3 flex flex-col gap-2">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
}
