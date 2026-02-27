'use client';

import { ReactNode } from 'react';
import { OrderStatus, OrderStatusLabel } from '@/types';

// 뱃지 props
interface BadgeProps {
  children: ReactNode;
  variant: 'pending' | 'approved' | 'shipped' | 'canceled' | 'info' | 'warning' | 'success' | 'danger' | 'default';
  size?: 'sm' | 'md';
}

// variant별 색상 매핑
const variantStyles: Record<BadgeProps['variant'], string> = {
  pending: 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20',
  approved: 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20',
  shipped: 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20',
  canceled: 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20',
  info: 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20',
  warning: 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20',
  success: 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20',
  danger: 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20',
  default: 'bg-[#1a1a1a] text-[#a0a0a0] border-[#2a2a2a]',
};

// 크기별 스타일
const sizeStyles: Record<NonNullable<BadgeProps['size']>, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs',
};

// 상태 뱃지 컴포넌트
// 주문 상태, 알림 등에 사용
export default function Badge({
  children,
  variant,
  size = 'sm',
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-md border
        ${variantStyles[variant]}
        ${sizeStyles[size]}
      `}
    >
      {children}
    </span>
  );
}

// 주문 상태 전용 뱃지 헬퍼
// OrderStatus를 넘기면 자동으로 한글 라벨 + 색상 매핑
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const variantMap: Record<OrderStatus, BadgeProps['variant']> = {
    PENDING: 'pending',
    APPROVED: 'approved',
    SHIPPED: 'shipped',
    CANCELED: 'canceled',
  };
  return <Badge variant={variantMap[status]}>{OrderStatusLabel[status]}</Badge>;
}
