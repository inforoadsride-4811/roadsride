'use client';

import { forwardRef } from 'react';

const Radio = forwardRef(({ className = '', label, description, checked, onChange, name, value, ...props }, ref) => {
  return (
    <label className={`flex items-start gap-3 cursor-pointer select-none ${className}`}>
      <div className="relative mt-0.5">
        <input
          ref={ref}
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          className="sr-only"
          {...props}
        />
        <div
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
            checked
              ? 'border-brand-black'
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          {checked && (
            <div className="w-2.5 h-2.5 rounded-full bg-brand-black" />
          )}
        </div>
      </div>
      <div className="flex-1">
        {label && <span className="text-sm font-medium text-gray-800">{label}</span>}
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    </label>
  );
});

Radio.displayName = 'Radio';
export { Radio };
