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
          // 노년층 기준: 큰 라벨, 고대비 색상
          <label className="block text-base font-semibold text-[#1e293b] mb-2">
            {label}
            {props.required && <span className="text-[#b91c1c] ml-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          className={`
            w-full px-4 py-3.5 rounded-lg text-lg
            bg-white border-2 text-[#1e293b]
            placeholder:text-[#94a3b8]
            focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8]
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-colors duration-150
            ${error ? 'border-[#b91c1c]' : 'border-[#e2e8f0]'}
            ${className}
          `}
          {...props}
        />

        {error && <p className="mt-1.5 text-sm text-[#b91c1c]">{error}</p>}
        {helperText && !error && <p className="mt-1.5 text-sm text-[#475569]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
