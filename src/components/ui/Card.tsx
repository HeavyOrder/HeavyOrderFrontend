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
        bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden
        ${hoverable ? 'hover:border-[#333] transition-colors duration-150 cursor-pointer' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {(title || subtitle) && (
        <div className="px-5 py-4 border-b border-[#2a2a2a]">
          {title && <h3 className="text-base font-semibold text-[#f5f5f5]">{title}</h3>}
          {subtitle && <p className="text-sm text-[#a0a0a0] mt-0.5">{subtitle}</p>}
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}
