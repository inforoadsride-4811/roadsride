'use client';

import { List, LayoutGrid, SlidersHorizontal } from 'lucide-react';

export default function TopToolbar({ pagination, filters, updateFilter, viewMode, setViewMode, openMobileFilters }) {
  const { total, page, limit } = pagination;
  
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 mb-6 shadow-sm">
      <div className="text-sm text-gray-500 font-medium">
        {total === 0 ? (
          <span>No products found</span>
        ) : (
          <span>Showing <span className="text-brand-black">{start}-{end}</span> of <span className="text-brand-black">{total}</span> Products</span>
        )}
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
        {/* Mobile Filter Button */}
        <button 
          onClick={openMobileFilters}
          className="lg:hidden flex items-center gap-2 text-sm font-semibold text-brand-black px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <SlidersHorizontal size={16} />
          Filters
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 hidden sm:block">Sort By:</label>
            <select 
              value={filters.sort || 'newest'} 
              onChange={(e) => updateFilter('sort', e.target.value)}
              className="text-sm border border-gray-300 rounded-lg p-2 outline-none focus:ring-1 focus:ring-brand-yellow focus:border-brand-yellow bg-white w-[160px]"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>

          <div className="hidden sm:flex items-center bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-brand-black' : 'text-gray-500 hover:text-brand-black'}`}
              title="Grid View"
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-brand-black' : 'text-gray-500 hover:text-brand-black'}`}
              title="List View"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
