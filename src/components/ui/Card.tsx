'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export default function Card({
  children,
  title,
  subtitle,
  className = '',
  onClick,
  hoverable = false,
}: CardProps) {
  return (
    <div
      className={`
        bg-white border border-[#e2e8f0] rounded-2xl overflow-hidden shadow-sm
        ${hoverable ? 'hover:border-[#1d4ed8]/30 hover:shadow-md transition-all duration-200 cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {(title || subtitle) && (
        <div className="px-6 py-5 border-b border-[#f1f3f5]">
          {title && <h3 className="text-lg font-bold text-[#0f172a]">{title}</h3>}
          {subtitle && <p className="text-base text-[#475569] mt-1">{subtitle}</p>}
        </div>
      )}
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}
