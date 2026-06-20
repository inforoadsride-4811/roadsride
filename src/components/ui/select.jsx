'use client';

import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({ className = '', label, error, options = [], placeholder, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={`w-full px-4 py-2.5 text-sm border border-brand-border rounded-lg bg-white text-brand-black appearance-none focus:outline-none focus:ring-2 focus:ring-brand-yellow/30 focus:border-brand-yellow transition-all duration-200 cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed ${error ? 'border-brand-danger' : ''} ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
      {error && <p className="mt-1 text-xs text-brand-danger">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export { Select };
