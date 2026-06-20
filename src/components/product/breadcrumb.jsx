import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumb({ items, currentPage, nextHref }) {
  return (
    <div className="flex items-center justify-between py-3 overflow-x-auto">
      <nav className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 whitespace-nowrap">
        {items.map((item, index) => (
          <span key={index} className="flex items-center gap-1">
            <Link href={item.href} className="hover:text-brand-black transition-colors">
              {item.name}
            </Link>
            <ChevronRight size={12} className="text-gray-400" />
          </span>
        ))}
        <span className="text-gray-700 font-medium truncate max-w-[200px] sm:max-w-[400px] lg:max-w-none">
          {currentPage}
        </span>
      </nav>
      {nextHref && (
        <Link
          href={nextHref}
          className="hidden sm:flex items-center gap-1 text-sm text-gray-500 hover:text-brand-black transition-colors ml-4 flex-shrink-0"
        >
          NEXT <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}
