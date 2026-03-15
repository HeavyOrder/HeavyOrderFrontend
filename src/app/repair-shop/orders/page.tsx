'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRoleGuard } from '@/lib/hooks';
import { ordersApi } from '@/lib/api';
import { Tabs, Skeleton, ConfirmModal, EmptyState } from '@/components/ui';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { MyOrderListItem, OrderStatus, OrderStatusLabel } from '@/types';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';

export default function RepairShopOrders() {
  const { isAuthorized, isLoading: authLoading } = useRoleGuard(['REPAIR_SHOP']);
  const [orders, setOrders] = useState<MyOrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const [canceling, setCanceling] = useState(false);

  // 상세 토글
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await ordersApi.getMyOrders();
      // 최신 주문순 정렬
      const data = res.data.data || [];
      data.sort((a, b) => new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime());
      setOrders(data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { if (isAuthorized) fetchOrders(); }, [isAuthorized]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCanceling(true);
    try {
      await ordersApi.cancel(cancelTarget);
      await fetchOrders();
    } catch { /* ignore */ }
    setCanceling(false);
    setCancelTarget(null);
  };

  if (authLoading || !isAuthorized) return <div className="min-h-[60vh] flex items-center justify-center"><Skeleton variant="card" count={2} /></div>;

  const filtered = activeTab === 'ALL' ? orders : orders.filter(o => o.orderStatus === activeTab);
  const counts: Record<string, number> = { ALL: orders.length };
  (['PENDING', 'APPROVED', 'SHIPPED', 'CANCELED'] as OrderStatus[]).forEach(s => {
    counts[s] = orders.filter(o => o.orderStatus === s).length;
  });

  const tabs = [
    { key: 'ALL', label: '전체', count: counts.ALL },
    { key: 'PENDING', label: '대기중', count: counts.PENDING },
    { key: 'APPROVED', label: '승인됨', count: counts.APPROVED },
    { key: 'SHIPPED', label: '배송완료', count: counts.SHIPPED },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b]">주문 관리</h1>
          <p className="text-sm text-[#475569] mt-1">발주 내역을 확인하고 관리합니다</p>
        </div>
        <Link
          href="/repair-shop/orders/new"
          className="px-4 py-2 text-sm font-medium bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] transition-colors"
        >
          + 새 발주
        </Link>
      </div>

      <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

      <div className="mt-4 bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-5"><Skeleton variant="table-row" count={5} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState title="주문 내역이 없습니다" description="새 발주를 생성해보세요" action={{ label: '새 발주', href: '/repair-shop/orders/new' }} />
        ) : (
          <div className="divide-y divide-[#e2e8f0]">
            {/* 테이블 헤더 */}
            <div className="hidden md:grid grid-cols-[1fr_120px_100px_100px_80px] gap-4 px-5 py-3 bg-[#f8f9fa] text-xs text-[#475569] uppercase tracking-wider">
              <span>주문명</span><span>금액</span><span>상태</span><span>날짜</span><span></span>
            </div>
            {filtered.map(order => {
              const isExpanded = expandedId === order.id;
              return (
                <div key={order.id}>
                  {/* 주문 행 */}
                  <div
                    className="grid grid-cols-1 md:grid-cols-[1fr_120px_100px_100px_80px] gap-2 md:gap-4 px-5 py-3 hover:bg-[#f8f9fa] transition-colors items-center cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  >
                    <div className="flex items-center gap-2">
                      <svg className={`w-3.5 h-3.5 text-[#475569] transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="text-sm text-[#1e293b]">{order.title}</span>
                    </div>
                    <span className="text-sm text-[#1e293b] font-mono">{formatCurrency(order.totalAmount)}</span>
                    <OrderStatusBadge status={order.orderStatus} />
                    <span className="text-xs text-[#475569]">{formatDate(order.orderTime)}</span>
                    <div onClick={e => e.stopPropagation()}>
                      {order.orderStatus === 'PENDING' && (
                        <button
                          onClick={() => setCancelTarget(order.id)}
                          className="text-xs text-[#b91c1c] hover:text-[#f87171] transition-colors"
                        >
                          취소
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 상세 패널 */}
                  {isExpanded && (
                    <div className="px-5 pb-4 bg-white border-t border-[#e2e8f0]">
                      <div className="py-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-xs text-[#475569] uppercase tracking-wider mb-1">주문 정보</h4>
                            <div className="text-sm space-y-1">
                              <p className="text-[#1e293b]">{order.title}</p>
                              <p className="text-[#475569]">주문 일시: {formatDateTime(order.orderTime)}</p>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xs text-[#475569] uppercase tracking-wider mb-1">결제 정보</h4>
                            <div className="text-sm space-y-1">
                              <p className="text-[#1e293b] font-mono font-medium">{formatCurrency(order.totalAmount)}</p>
                              <p className="text-[#475569]">상태: {OrderStatusLabel[order.orderStatus]}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="주문 취소"
        message="이 주문을 취소하시겠습니까? 취소 후에는 되돌릴 수 없습니다."
        confirmText="취소하기"
        variant="danger"
        loading={canceling}
      />
    </div>
  );
}
