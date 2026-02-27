'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#a0a0a0] mb-1.5">
            {label}
            {props.required && <span className="text-[#ef4444] ml-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          className={`
            w-full px-3 py-2 rounded-lg text-sm
            bg-[#111] border text-[#e5e5e5]
            placeholder:text-[#666]
            focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30 focus:border-[#3b82f6]
            disabled:opacity-40 disabled:cursor-not-allowed
            ${error ? 'border-[#ef4444]' : 'border-[#2a2a2a]'}
            ${className}
          `}
          {...props}
        />

        {error && <p className="mt-1 text-xs text-[#ef4444]">{error}</p>}
        {helperText && !error && <p className="mt-1 text-xs text-[#666]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
