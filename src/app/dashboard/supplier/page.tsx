'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRoleGuard } from '@/lib/hooks';
import { supplierApi, inventoryApi } from '@/lib/api';
import { StatCard, Skeleton } from '@/components/ui';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { SupplierOrder, InventoryResponse } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function SupplierDashboard() {
  const { isAuthorized, isLoading: authLoading, user } = useRoleGuard(['SUPPLIER']);
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [inventory, setInventory] = useState<InventoryResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthorized) return;
    const load = async () => {
      try {
        const [ordersRes, invRes] = await Promise.all([
          supplierApi.getOrders(),
          inventoryApi.getMyInventories({}),
        ]);
        setOrders(ordersRes.data.data || []);
        setInventory(invRes.data.data || []);
      } catch { /* API 에러 무시 */ }
      setLoading(false);
    };
    load();
  }, [isAuthorized]);

  if (authLoading || !isAuthorized) return <div className="min-h-[60vh] flex items-center justify-center"><Skeleton variant="card" count={4} /></div>;

  const pending = orders.filter(o => o.orderStatus === 'PENDING').length;
  const approved = orders.filter(o => o.orderStatus === 'APPROVED').length;
  const shipped = orders.filter(o => o.orderStatus === 'SHIPPED').length;
  const lowStock = inventory.filter(i => i.stock <= 5).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-[#f5f5f5]">안녕하세요, {user?.businessName || user?.email}님</h1>
        <p className="text-sm text-[#666] mt-1">부품회사 대시보드</p>
      </div>

      {/* 스탯 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard label="새 주문" value={loading ? '-' : pending} color="amber" />
        <StatCard label="승인됨" value={loading ? '-' : approved} color="blue" />
        <StatCard label="배송 완료" value={loading ? '-' : shipped} color="green" />
        <StatCard label="재고 부족" value={loading ? '-' : lowStock} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 대기중 주문 */}
        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl">
          <div className="px-5 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#f5f5f5]">대기중 주문</h2>
            <Link href="/supplier/orders" className="text-xs text-[#3b82f6] hover:text-[#60a5fa]">전체 보기</Link>
          </div>
          <div className="divide-y divide-[#2a2a2a]">
            {loading ? (
              <div className="p-5"><Skeleton variant="text" count={3} /></div>
            ) : orders.filter(o => o.orderStatus === 'PENDING').length === 0 ? (
              <div className="p-8 text-center text-sm text-[#666]">대기중인 주문이 없습니다</div>
            ) : (
              orders.filter(o => o.orderStatus === 'PENDING').slice(0, 5).map(order => (
                <div key={order.orderId} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#e5e5e5]">{order.receiverName}</p>
                    <p className="text-xs text-[#666] mt-0.5 font-mono">
                      {formatCurrency(order.items.reduce((sum, item) => sum + item.itemTotalAmount, 0))}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#666]">{formatDate(order.orderedAt)}</span>
                    <OrderStatusBadge status={order.orderStatus} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 재고 부족 품목 */}
        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl">
          <div className="px-5 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#f5f5f5]">재고 부족 품목</h2>
            <Link href="/supplier/inventory" className="text-xs text-[#3b82f6] hover:text-[#60a5fa]">전체 보기</Link>
          </div>
          <div className="divide-y divide-[#2a2a2a]">
            {loading ? (
              <div className="p-5"><Skeleton variant="text" count={3} /></div>
            ) : inventory.filter(i => i.stock <= 5).length === 0 ? (
              <div className="p-8 text-center text-sm text-[#666]">재고 부족 품목이 없습니다</div>
            ) : (
              inventory.filter(i => i.stock <= 5).slice(0, 5).map(item => (
                <div key={item.inventoryId} className="px-5 py-3 flex items-center justify-between">
                  <span className="text-sm text-[#e5e5e5]">{item.productName}</span>
                  <span className={`text-sm font-mono ${item.stock === 0 ? 'text-[#ef4444]' : 'text-[#f59e0b]'}`}>
                    {item.stock}개
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
