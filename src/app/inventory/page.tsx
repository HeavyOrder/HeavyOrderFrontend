'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/context/AuthContext';
import { Skeleton } from '@/components/ui';

// 역할별 재고 페이지로 리다이렉트
export default function InventoryRedirect() {
  const { isLoggedIn, isLoading, role } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isLoggedIn) { window.location.href = '/auth/login'; return; }

    if (role === 'REPAIR_SHOP') window.location.href = '/repair-shop/inventory';
    else if (role === 'SUPPLIER') window.location.href = '/supplier/inventory';
    else window.location.href = '/';
  }, [isLoading, isLoggedIn, role]);

  return <div className="min-h-[60vh] flex items-center justify-center"><Skeleton variant="card" count={1} /></div>;
}
