'use client';

import { forwardRef } from 'react';
import { Check } from 'lucide-react';

const Checkbox = forwardRef(({ className = '', label, checked, onChange, ...props }, ref) => {
  return (
    <label className={`inline-flex items-center gap-2.5 cursor-pointer select-none ${className}`}>
      <div className="relative">
        <input
          ref={ref}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
          {...props}
        />
        <div
          className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
            checked
              ? 'bg-brand-black border-brand-black'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        >
          {checked && <Check size={12} className="text-white" strokeWidth={3} />}
        </div>
      </div>
      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';
export { Checkbox };
