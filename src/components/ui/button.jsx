'use client';

import { forwardRef } from 'react';

const variants = {
  primary: 'bg-brand-yellow hover:bg-brand-yellow-hover text-brand-black font-semibold',
  secondary: 'bg-brand-black hover:bg-gray-800 text-white font-semibold',
  outline: 'border border-brand-border hover:bg-gray-50 text-brand-black font-medium',
  ghost: 'hover:bg-gray-100 text-brand-black font-medium',
  danger: 'bg-brand-danger hover:bg-red-600 text-white font-semibold',
  success: 'bg-brand-success hover:bg-green-600 text-white font-semibold',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-5 py-2.5 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-lg',
  xl: 'px-8 py-4 text-lg rounded-xl',
  icon: 'p-2 rounded-lg',
};

const Button = forwardRef(
  ({ className = '', variant = 'primary', size = 'md', disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
