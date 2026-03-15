'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRoleGuard } from '@/lib/hooks';
import { supplierApi, inventoryApi } from '@/lib/api';
import { Skeleton } from '@/components/ui';
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

  if (authLoading || !isAuthorized) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Skeleton variant="card" count={4} />
    </div>
  );

  const pending = orders.filter(o => o.orderStatus === 'PENDING').length;
  const approved = orders.filter(o => o.orderStatus === 'APPROVED').length;
  const shipped = orders.filter(o => o.orderStatus === 'SHIPPED').length;
  const lowStock = inventory.filter(i => i.stock <= 5).length;

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* 인사말 카드 */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0f172a]">
                안녕하세요,<br />{user?.businessName || user?.email}님
              </h1>
              <p className="text-base text-[#475569] mt-1">오늘도 좋은 하루 되세요</p>
            </div>
            <span className="bg-[#f0fdf4] text-[#15803d] px-3 py-1.5 rounded-full text-base font-semibold">
              부품회사
            </span>
          </div>
        </div>

        {/* 통계 카드 2×2 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm p-6 min-h-[120px] flex flex-col justify-between">
            <div className="w-10 h-10 bg-[#fef3c7] rounded-xl flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-[#b45309]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#0f172a]">{loading ? '-' : pending}</div>
              <div className="text-base text-[#475569] mt-1">새 주문</div>
            </div>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm p-6 min-h-[120px] flex flex-col justify-between">
            <div className="w-10 h-10 bg-[#dbeafe] rounded-xl flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-[#1d4ed8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#0f172a]">{loading ? '-' : approved}</div>
              <div className="text-base text-[#475569] mt-1">승인됨</div>
            </div>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm p-6 min-h-[120px] flex flex-col justify-between">
            <div className="w-10 h-10 bg-[#dcfce7] rounded-xl flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-[#15803d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#0f172a]">{loading ? '-' : shipped}</div>
              <div className="text-base text-[#475569] mt-1">배송 완료</div>
            </div>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm p-6 min-h-[120px] flex flex-col justify-between">
            <div className="w-10 h-10 bg-[#fee2e2] rounded-xl flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-[#b91c1c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#0f172a]">{loading ? '-' : lowStock}</div>
              <div className="text-base text-[#475569] mt-1">재고 부족</div>
            </div>
          </div>
        </div>

        {/* 빠른 메뉴 */}
        <div className="grid grid-cols-3 gap-3">
          <Link href="/supplier/orders" className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-[#1d4ed8]/40 hover:shadow-sm transition-all">
            <svg className="w-8 h-8 text-[#1d4ed8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-sm font-semibold text-[#1e293b] text-center">주문<br/>관리</span>
          </Link>
          <Link href="/supplier/parts" className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-[#1d4ed8]/40 hover:shadow-sm transition-all">
            <svg className="w-8 h-8 text-[#1d4ed8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
            <span className="text-sm font-semibold text-[#1e293b] text-center">부품<br/>관리</span>
          </Link>
          <Link href="/supplier/inventory" className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-[#1d4ed8]/40 hover:shadow-sm transition-all">
            <svg className="w-8 h-8 text-[#1d4ed8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <span className="text-sm font-semibold text-[#1e293b] text-center">재고<br/>관리</span>
          </Link>
        </div>

        {/* 대기중 주문 */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-[#f1f3f5] flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0f172a]">대기중 주문</h2>
            <Link href="/supplier/orders" className="text-base font-semibold text-[#1d4ed8] hover:text-[#1e40af]">전체 보기 →</Link>
          </div>
          <div className="divide-y divide-[#f1f3f5]">
            {loading ? (
              <div className="p-6"><Skeleton variant="text" count={3} /></div>
            ) : orders.filter(o => o.orderStatus === 'PENDING').length === 0 ? (
              <div className="p-8 text-center text-base text-[#475569]">대기중인 주문이 없습니다</div>
            ) : (
              orders.filter(o => o.orderStatus === 'PENDING').slice(0, 5).map(order => (
                <div key={order.orderId} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-base font-medium text-[#1e293b]">{order.receiverName}</p>
                    <p className="text-sm text-[#475569] mt-0.5 font-mono">
                      {formatCurrency(order.items.reduce((sum, item) => sum + item.itemTotalAmount, 0))}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <OrderStatusBadge status={order.orderStatus} />
                    <span className="text-sm text-[#94a3b8]">{formatDate(order.orderedAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 재고 부족 알림 */}
        {!loading && lowStock > 0 && (
          <div className="bg-white border border-[#fecaca] rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-[#fecaca] flex items-center justify-between bg-[#fef2f2]">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-[#b91c1c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-lg font-bold text-[#b91c1c]">재고 부족 품목</h2>
              </div>
              <Link href="/supplier/inventory" className="text-base font-semibold text-[#b91c1c]">관리하기 →</Link>
            </div>
            <div className="divide-y divide-[#fef2f2]">
              {inventory.filter(i => i.stock <= 5).slice(0, 5).map(item => (
                <div key={item.inventoryId} className="px-6 py-4 flex items-center justify-between">
                  <span className="text-base font-medium text-[#1e293b]">{item.productName}</span>
                  <span className={`text-base font-bold font-mono ${item.stock === 0 ? 'text-[#b91c1c]' : 'text-[#b45309]'}`}>
                    {item.stock === 0 ? '품절' : `${item.stock}개`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
