'use client';

import { forwardRef } from 'react';

const Textarea = forwardRef(({ className = '', label, error, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`w-full px-4 py-2.5 text-sm border border-brand-border rounded-lg bg-white text-brand-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30 focus:border-brand-yellow transition-all duration-200 resize-y min-h-[80px] disabled:bg-gray-50 disabled:cursor-not-allowed ${error ? 'border-brand-danger' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-brand-danger">{error}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export { Textarea };
