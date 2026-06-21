'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Pagination({ pagination, updateFilter }) {
  const { page, totalPages } = pagination;

  if (totalPages <= 1) return null;

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    updateFilter('page', newPage.toString());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers to show (e.g. 1 2 3 ... 10)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, page - 2);
      let end = Math.min(totalPages, start + maxVisible - 1);
      
      if (end === totalPages) {
        start = Math.max(1, end - maxVisible + 1);
      }
      
      for (let i = start; i <= end; i++) pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-12 mb-8">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(page - 1)}
        disabled={page <= 1}
        className="h-10 px-4"
      >
        <ChevronLeft size={16} className="mr-1" /> Prev
      </Button>
      
      <div className="flex items-center gap-1 hidden sm:flex">
        {getPageNumbers().map(p => (
          <button
            key={p}
            onClick={() => handlePageChange(p)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
              p === page 
                ? 'bg-brand-yellow text-brand-black shadow-sm' 
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      
      <div className="sm:hidden flex items-center px-4 font-medium text-gray-600">
        Page {page} of {totalPages}
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handlePageChange(page + 1)}
        disabled={page >= totalPages}
        className="h-10 px-4"
      >
        Next <ChevronRight size={16} className="ml-1" />
      </Button>
    </div>
  );
}
