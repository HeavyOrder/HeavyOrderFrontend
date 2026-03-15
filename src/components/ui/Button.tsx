'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'amber';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  // 노년층 기준: 라이트 배경 고대비 색상 (WCAG AAA)
  const variants = {
    primary: 'bg-[#1d4ed8] text-white hover:bg-[#1e40af] focus:ring-[#1d4ed8]/40',
    secondary: 'bg-white text-[#1e293b] border border-[#e2e8f0] hover:bg-[#f8f9fa] hover:border-[#cbd5e1] focus:ring-[#94a3b8]/20',
    outline: 'border-2 border-[#1d4ed8] text-[#1d4ed8] bg-transparent hover:bg-[#1d4ed8]/5 focus:ring-[#1d4ed8]/20',
    danger: 'bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca] hover:bg-[#fee2e2] focus:ring-[#b91c1c]/20',
    ghost: 'bg-transparent text-[#475569] hover:bg-[#f1f3f5] hover:text-[#1e293b] focus:ring-[#94a3b8]/20',
    amber: 'bg-[#fffbeb] text-[#b45309] border border-[#fde68a] hover:bg-[#fef3c7] focus:ring-[#b45309]/20',
  };

  // 노년층 기준: 최소 48px 높이 보장
  const sizes = {
    sm: 'px-4 py-3 text-base',       // 높이 ~48px
    md: 'px-5 py-3.5 text-lg',       // 높이 ~56px
    lg: 'px-6 py-4 text-xl font-semibold', // 높이 ~60px
  };

  return (
    <button
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        rounded-lg font-medium transition-all duration-150
        focus:outline-none focus:ring-2
        disabled:opacity-40 disabled:cursor-not-allowed
        inline-flex items-center justify-center gap-2
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}
