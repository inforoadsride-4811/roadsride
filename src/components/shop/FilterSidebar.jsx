'use client';

import { useState, useEffect } from 'react';
import { Search, X, ChevronDown, ChevronUp, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/product';

export default function FilterSidebar({ filters, updateFilter, clearFilters, filterMetadata, isMobile = false }) {
  const { categories, maxPrice } = filterMetadata;

  // Local state for search to debounce
  const [localSearch, setLocalSearch] = useState(filters.q || '');

  // Sections toggle state
  const [expanded, setExpanded] = useState({
    categories: true,
    price: true,
    availability: true,
    ratings: true,
  });

  const toggleSection = (section) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== (filters.q || '')) {
        updateFilter('q', localSearch);
      }
    }, 500); // 500ms debounce
    return () => clearTimeout(timer);
  }, [localSearch, filters.q, updateFilter]);

  const handlePriceChange = (e, type) => {
    updateFilter(type, e.target.value);
  };

  const ratings = [
    { label: '4★ & Above', value: '4' },
    { label: '3★ & Above', value: '3' },
    { label: '2★ & Above', value: '2' },
  ];

  return (
    <div className={`space-y-6 ${isMobile ? 'p-4' : ''}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand-black">Filters</h2>
        <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-brand-yellow font-medium transition-colors">
          Clear All
        </button>
      </div>

      {/* Search */}
      <div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input 
            placeholder="Search products..." 
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="pl-9 bg-gray-50"
          />
          {localSearch && (
            <button 
              onClick={() => setLocalSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Categories */}
      {categories?.length > 0 && (
        <div>
          <button onClick={() => toggleSection('categories')} className="flex items-center justify-between w-full py-2 font-semibold text-brand-black">
            Categories
            {expanded.categories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          
          {expanded.categories && (
            <div className="mt-3 space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name="category"
                  checked={!filters.categorySlug}
                  onChange={() => updateFilter('categorySlug', '')}
                  className="w-4 h-4 text-brand-yellow focus:ring-brand-yellow border-gray-300"
                />
                <span className={`text-sm ${!filters.categorySlug ? 'font-semibold text-brand-black' : 'text-gray-600 group-hover:text-brand-black'}`}>
                  All Categories
                </span>
              </label>
              
              {(() => {
                const flattenTree = (cats, parentId = null, depth = 0) => {
                  let result = [];
                  const children = cats.filter(c => c.parentId === parentId).sort((a, b) => a.sortOrder - b.sortOrder);
                  for (const child of children) {
                    result.push({ ...child, depth });
                    result = result.concat(flattenTree(cats, child.id, depth + 1));
                  }
                  return result;
                };
                
                const displayedCategories = flattenTree(categories);
                
                return displayedCategories.map((cat) => (
                  <label key={cat.id} className="flex items-center justify-between cursor-pointer group" style={{ paddingLeft: `${cat.depth * 1.25}rem` }}>
                    <div className="flex items-center gap-3">
                      <input 
                        type="radio" 
                        name="category"
                        checked={filters.categorySlug === cat.slug}
                        onChange={() => updateFilter('categorySlug', cat.slug)}
                        className="w-4 h-4 text-brand-yellow focus:ring-brand-yellow border-gray-300"
                      />
                      <span className={`text-sm ${filters.categorySlug === cat.slug ? 'font-semibold text-brand-black' : 'text-gray-600 group-hover:text-brand-black'}`}>
                        {cat.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">({cat._count?.products || 0})</span>
                  </label>
                ));
              })()}
            </div>
          )}
        </div>
      )}

      <hr className="border-gray-200" />

      {/* Price Range */}
      <div>
        <button onClick={() => toggleSection('price')} className="flex items-center justify-between w-full py-2 font-semibold text-brand-black">
          Price Range
          {expanded.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {expanded.price && (
          <div className="mt-3 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Min Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                  <Input 
                    type="number" 
                    min="0"
                    placeholder="0"
                    value={filters.minPrice || ''}
                    onChange={(e) => handlePriceChange(e, 'minPrice')}
                    className="pl-7 bg-gray-50"
                  />
                </div>
              </div>
              <div className="text-gray-400 mt-5">-</div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Max Price</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                  <Input 
                    type="number" 
                    min="0"
                    placeholder={maxPrice || ''}
                    value={filters.maxPrice || ''}
                    onChange={(e) => handlePriceChange(e, 'maxPrice')}
                    className="pl-7 bg-gray-50"
                  />
                </div>
              </div>
            </div>
            {/* Quick Price Ranges */}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { updateFilter('minPrice', '0'); updateFilter('maxPrice', '1000'); }} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition-colors">Under ₹1,000</button>
              <button onClick={() => { updateFilter('minPrice', '1000'); updateFilter('maxPrice', '5000'); }} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition-colors">₹1,000 - ₹5,000</button>
              <button onClick={() => { updateFilter('minPrice', '5000'); updateFilter('maxPrice', ''); }} className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-xs text-gray-700 transition-colors">Over ₹5,000</button>
            </div>
          </div>
        )}
      </div>

      <hr className="border-gray-200" />

      {/* Availability */}
      <div>
        <button onClick={() => toggleSection('availability')} className="flex items-center justify-between w-full py-2 font-semibold text-brand-black">
          Availability
          {expanded.availability ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {expanded.availability && (
          <div className="mt-3 space-y-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={filters.inStock === 'true'}
                onChange={(e) => updateFilter('inStock', e.target.checked ? 'true' : '')}
                className="w-4 h-4 text-brand-yellow focus:ring-brand-yellow rounded border-gray-300"
              />
              <span className="text-sm text-gray-600 group-hover:text-brand-black">In Stock Only</span>
            </label>
          </div>
        )}
      </div>

      <hr className="border-gray-200" />

      {/* Ratings */}
      <div>
        <button onClick={() => toggleSection('ratings')} className="flex items-center justify-between w-full py-2 font-semibold text-brand-black">
          Customer Ratings
          {expanded.ratings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        
        {expanded.ratings && (
          <div className="mt-3 space-y-2">
            {ratings.map((rate) => (
              <label key={rate.value} className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name="rating"
                  checked={filters.rating === rate.value}
                  onChange={() => updateFilter('rating', rate.value)}
                  className="w-4 h-4 text-brand-yellow focus:ring-brand-yellow border-gray-300"
                />
                <span className="flex items-center text-sm text-gray-600 group-hover:text-brand-black">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className={i < Number(rate.value) ? "fill-brand-yellow text-brand-yellow" : "fill-gray-200 text-gray-200"} />
                  ))}
                  <span className="ml-2">& Up</span>
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {isMobile && (
        <div className="pt-6 pb-2">
          <Button onClick={clearFilters} variant="outline" className="w-full">
            Reset Filters
          </Button>
        </div>
      )}
    </div>
  );
}
