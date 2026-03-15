'use client';

import { ReactNode } from 'react';
import { OrderStatus, OrderStatusLabel } from '@/types';

// 뱃지 props
interface BadgeProps {
  children: ReactNode;
  variant: 'pending' | 'approved' | 'shipped' | 'canceled' | 'info' | 'warning' | 'success' | 'danger' | 'default';
  size?: 'sm' | 'md';
}

// 노년층 기준: 투명도 배경 → 불투명 고대비 배경 (WCAG AAA)
const variantStyles: Record<BadgeProps['variant'], string> = {
  pending:  'bg-[#fffbeb] text-[#b45309] border-[#fde68a]',
  approved: 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]',
  shipped:  'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]',
  canceled: 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]',
  info:     'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]',
  warning:  'bg-[#fffbeb] text-[#b45309] border-[#fde68a]',
  success:  'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]',
  danger:   'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]',
  default:  'bg-[#f8f9fa] text-[#475569] border-[#e2e8f0]',
};

// 노년층 기준: text-xs → text-sm으로 크기 업
const sizeStyles: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'px-2.5 py-1 text-sm',
  md: 'px-3 py-1.5 text-sm',
};

// 상태 뱃지 컴포넌트
export default function Badge({
  children,
  variant,
  size = 'sm',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center font-semibold rounded-md border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
      `}
    >
      {children}
    </span>
  );
}

// 주문 상태 전용 뱃지 헬퍼
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const variantMap: Record<OrderStatus, BadgeProps['variant']> = {
    PENDING: 'pending',
    APPROVED: 'approved',
    SHIPPED: 'shipped',
    CANCELED: 'canceled',
  };
  return <Badge variant={variantMap[status]}>{OrderStatusLabel[status]}</Badge>;
}
