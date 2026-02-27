'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { Skeleton } from '@/components/ui';

// 역할별 주문 페이지로 리다이렉트
export default function OrdersRedirect() {
  const { isLoggedIn, isLoading, role } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn) { window.location.href = '/auth/login'; return; }

    if (role === 'REPAIR_SHOP') window.location.href = '/repair-shop/orders';
    else if (role === 'SUPPLIER') window.location.href = '/supplier/orders';
    else window.location.href = '/';
  }, [isLoading, isLoggedIn, role]);

  return <div className="min-h-[60vh] flex items-center justify-center"><Skeleton variant="card" count={1} /></div>;
}
