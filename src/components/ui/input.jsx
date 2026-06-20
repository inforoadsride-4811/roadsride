'use client';

import { forwardRef } from 'react';

const Input = forwardRef(({ className = '', label, error, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        ref={ref}
        className={`w-full px-4 py-2.5 text-sm border border-brand-border rounded-lg bg-white text-brand-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30 focus:border-brand-yellow transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed ${error ? 'border-brand-danger focus:ring-brand-danger/30 focus:border-brand-danger' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-brand-danger">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export { Input };
