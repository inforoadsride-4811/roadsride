'use client';

import { forwardRef } from 'react';

const Input = forwardRef(({ className = '', label, error, leftAddon, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="flex w-full">
        {leftAddon && (
          <div className="flex items-center px-3 text-sm text-gray-600 bg-gray-100 border border-r-0 border-brand-border rounded-l-lg select-none">
            {leftAddon}
          </div>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-2.5 text-sm border border-brand-border bg-white text-brand-black placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-yellow/30 focus:border-brand-yellow transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed ${error ? 'border-brand-danger focus:ring-brand-danger/30 focus:border-brand-danger' : ''} ${leftAddon ? 'rounded-r-lg' : 'rounded-lg'} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-brand-danger">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
export { Input };
