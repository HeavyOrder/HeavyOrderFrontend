'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRoleGuard } from '@/lib/hooks';
import { ordersApi, inventoryApi, reservationApi } from '@/lib/api';
import { Skeleton } from '@/components/ui';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { MyOrderListItem, InventoryResponse, ReservationShopResponse, ReservationStatus } from '@/types';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';

// 오늘 날짜 YYYY-MM-DD
const today = new Date().toISOString().split('T')[0];

// 오늘 날짜를 한국어로 (예: 3월 19일)
function todayLabel(): string {
  const d = new Date();
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

// 예약 상태별 뱃지 색상
const RESERVATION_STATUS_COLORS: Record<ReservationStatus, string> = {
  PENDING: 'bg-[#fef3c7] text-[#b45309] border-[#f59e0b]/20',
  APPROVED: 'bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]',
  COMPLETED: 'bg-[#dbeafe] text-[#1d4ed8] border-[#bfdbfe]',
  CANCELED: 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]',
};

const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  PENDING: '대기중',
  APPROVED: '승인됨',
  COMPLETED: '완료됨',
  CANCELED: '취소됨',
};

export default function RepairShopDashboard() {
  const { isAuthorized, isLoading: authLoading, user } = useRoleGuard(['REPAIR_SHOP']);
  const [orders, setOrders] = useState<MyOrderListItem[]>([]);
  const [inventory, setInventory] = useState<InventoryResponse[]>([]);
  const [todayReservations, setTodayReservations] = useState<ReservationShopResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthorized) return;
    const load = async () => {
      try {
        const [ordersRes, invRes, reservRes] = await Promise.all([
          ordersApi.getMyOrders(),
          inventoryApi.getMyInventories({}),
          reservationApi.getRepairShopReservations(today),
        ]);
        setOrders(ordersRes.data.data || []);
        setInventory(invRes.data.data || []);
        // 오늘 예약을 시간순 정렬
        const reservations = (reservRes.data.data || []).sort(
          (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
        );
        setTodayReservations(reservations);
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
            <span className="bg-[#eff6ff] text-[#1d4ed8] px-3 py-1.5 rounded-full text-base font-semibold">
              공업사
            </span>
          </div>
        </div>

        {/* 통계 카드 2×2 */}
        <div className="grid grid-cols-2 gap-4">
          {/* 대기중 주문 */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm p-6 min-h-[120px] flex flex-col justify-between">
            <div className="w-10 h-10 bg-[#fef3c7] rounded-xl flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-[#b45309]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#0f172a]">{loading ? '-' : pending}</div>
              <div className="text-base text-[#475569] mt-1">대기중 주문</div>
            </div>
          </div>

          {/* 승인된 주문 */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm p-6 min-h-[120px] flex flex-col justify-between">
            <div className="w-10 h-10 bg-[#dbeafe] rounded-xl flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-[#1d4ed8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-3xl font-bold text-[#0f172a]">{loading ? '-' : approved}</div>
              <div className="text-base text-[#475569] mt-1">승인된 주문</div>
            </div>
          </div>

          {/* 배송 완료 */}
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

          {/* 재고 부족 */}
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

        {/* 핵심 CTA 버튼 */}
        <Link
          href="/repair-shop/orders/new"
          className="flex items-center justify-center gap-3 w-full py-5 text-xl font-bold bg-[#1d4ed8] text-white rounded-2xl hover:bg-[#1e40af] transition-colors duration-150 shadow-sm"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          새 주문 작성
        </Link>

        {/* 빠른 메뉴 */}
        <div className="grid grid-cols-3 gap-3">
          <Link href="/repair-shop/orders" className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-[#1d4ed8]/40 hover:shadow-sm transition-all">
            <svg className="w-8 h-8 text-[#1d4ed8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-sm font-semibold text-[#1e293b] text-center">주문<br/>관리</span>
          </Link>
          <Link href="/repair-shop/inventory" className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-[#1d4ed8]/40 hover:shadow-sm transition-all">
            <svg className="w-8 h-8 text-[#1d4ed8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <span className="text-sm font-semibold text-[#1e293b] text-center">재고<br/>관리</span>
          </Link>
          <Link href="/repair-shop/customers" className="bg-white border border-[#e2e8f0] rounded-2xl p-4 flex flex-col items-center gap-2 hover:border-[#1d4ed8]/40 hover:shadow-sm transition-all">
            <svg className="w-8 h-8 text-[#1d4ed8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-sm font-semibold text-[#1e293b] text-center">고객<br/>관리</span>
          </Link>
        </div>

        {/* 오늘 예약 */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-[#f1f3f5] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#1d4ed8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h2 className="text-lg font-bold text-[#0f172a]">오늘 예약</h2>
              <span className="text-sm text-[#475569]">{todayLabel()}</span>
            </div>
            <Link href="/repair-shop/schedule" className="text-base font-semibold text-[#1d4ed8] hover:text-[#1e40af]">
              전체 보기 →
            </Link>
          </div>
          <div className="divide-y divide-[#f1f3f5]">
            {loading ? (
              <div className="p-6"><Skeleton variant="text" count={2} /></div>
            ) : todayReservations.length === 0 ? (
              <div className="p-6 text-center text-base text-[#94a3b8]">오늘 예약이 없습니다</div>
            ) : (
              todayReservations.slice(0, 5).map(r => (
                <div key={r.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-base font-medium text-[#1e293b]">{r.driverEmail}</p>
                    <p className="text-sm text-[#475569] mt-0.5 font-mono">{r.driverPhoneNumber}</p>
                    <p className="text-sm text-[#475569] mt-0.5">{formatDateTime(r.time)}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-sm font-medium border rounded-lg ${RESERVATION_STATUS_COLORS[r.status]}`}>
                    {RESERVATION_STATUS_LABEL[r.status]}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 최근 주문 */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-[#f1f3f5] flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#0f172a]">최근 주문</h2>
            <Link href="/repair-shop/orders" className="text-base font-semibold text-[#1d4ed8] hover:text-[#1e40af]">
              전체 보기 →
            </Link>
          </div>
          <div className="divide-y divide-[#f1f3f5]">
            {loading ? (
              <div className="p-6"><Skeleton variant="text" count={3} /></div>
            ) : orders.length === 0 ? (
              <div className="p-8 text-center text-base text-[#475569]">주문 내역이 없습니다</div>
            ) : (
              orders.slice(0, 5).map(order => (
                <div key={order.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-base font-medium text-[#1e293b]">{order.title}</p>
                    <p className="text-sm text-[#475569] mt-0.5 font-mono">{formatCurrency(order.totalAmount)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <OrderStatusBadge status={order.orderStatus} />
                    <span className="text-sm text-[#94a3b8]">{formatDate(order.orderTime)}</span>
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
              <Link href="/repair-shop/inventory" className="text-base font-semibold text-[#b91c1c] hover:text-[#991b1b]">
                관리하기 →
              </Link>
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
