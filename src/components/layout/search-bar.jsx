'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import { formatPrice } from '@/lib/product';
import { searchPublicProducts } from '@/actions/public-search';

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef(null);

  const debouncedQuery = useDebounce(query, 400);

  useEffect(() => {
    let isMounted = true;
    const fetchResults = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const res = await searchPublicProducts(debouncedQuery);
        if (isMounted && res.success) {
          setResults(res.products);
          setIsOpen(true);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchResults();
    return () => { isMounted = false; };
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/shop?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="relative w-full group">
        <button type="submit" className="absolute inset-y-0 right-4 flex items-center text-gray-500 hover:text-brand-yellow transition-colors cursor-pointer">
          {loading ? <Loader2 size={20} className="animate-spin" /> : <Search size={22} strokeWidth={2.5} />}
        </button>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder="Search products, models, categories..."
          className="w-full h-12 pl-6 pr-12 bg-white border border-gray-300 rounded-full text-base focus:outline-none focus:border-brand-black focus:ring-1 focus:ring-brand-black transition-all"
        />
        {query && !loading && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute inset-y-0 right-12 flex items-center px-2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}
      </form>

      {/* Dropdown Results */}
      {isOpen && (debouncedQuery.trim() !== '') && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-100 overflow-hidden z-50">
          {results.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                Products
              </div>
              <ul className="max-h-[60vh] overflow-y-auto">
                {results.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/product/${product.slug}`}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 group"
                    >
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        <img
                          src={product.images?.[0]?.src || '/placeholder-product.png'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-sm font-medium text-brand-black truncate">
                          {product.name}
                        </span>
                        {product.category?.name && (
                          <span className="text-xs text-gray-500 truncate">
                            in {product.category.name}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col items-end shrink-0">
                        <span className="text-sm font-bold text-brand-black">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice > product.price && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                <button
                  onClick={handleSubmit}
                  className="w-full py-2 text-sm font-semibold text-center text-brand-black hover:text-brand-yellow transition-colors"
                >
                  View all results for "{debouncedQuery}"
                </button>
              </div>
            </div>
          ) : (
            !loading && (
              <div className="p-8 text-center text-gray-500">
                <p>No products found for "{debouncedQuery}"</p>
                <p className="text-sm mt-1">Try a different search term or category.</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
