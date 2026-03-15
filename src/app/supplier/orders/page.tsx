'use client';

import { useState, useEffect } from 'react';
import { useRoleGuard } from '@/lib/hooks';
import { supplierApi } from '@/lib/api';
import { Tabs, Skeleton, ConfirmModal, EmptyState } from '@/components/ui';
import { OrderStatusBadge } from '@/components/ui/Badge';
import { SupplierOrder, OrderStatus } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function SupplierOrders() {
  const { isAuthorized, isLoading: authLoading } = useRoleGuard(['SUPPLIER']);
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  // 상세 토글
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // 상태 변경 확인
  const [statusAction, setStatusAction] = useState<{ orderId: number; toStatus: OrderStatus; label: string } | null>(null);
  const [changing, setChanging] = useState(false);

  const fetchOrders = async () => {
    try {
      const res = await supplierApi.getOrders();
      // 최신 주문순 정렬
      const data = res.data.data || [];
      data.sort((a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime());
      setOrders(data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { if (isAuthorized) fetchOrders(); }, [isAuthorized]);

  const handleStatusChange = async () => {
    if (!statusAction) return;
    setChanging(true);
    try {
      await supplierApi.changeOrderStatus({ orderId: statusAction.orderId, toStatus: statusAction.toStatus });
      await fetchOrders();
    } catch { /* ignore */ }
    setChanging(false);
    setStatusAction(null);
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
      <h1 className="text-xl font-bold text-[#1e293b] mb-1">주문 관리</h1>
      <p className="text-sm text-[#475569] mb-6">수신된 주문을 확인하고 상태를 관리합니다</p>

      <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

      <div className="mt-4 bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-5"><Skeleton variant="table-row" count={5} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState title="주문이 없습니다" />
        ) : (
          <div className="divide-y divide-[#e2e8f0]">
            {/* 테이블 헤더 */}
            <div className="hidden md:grid grid-cols-[1fr_120px_100px_100px_140px] gap-4 px-5 py-3 bg-[#f8f9fa] text-xs text-[#475569] uppercase tracking-wider">
              <span>수령인</span><span>금액</span><span>상태</span><span>날짜</span><span>액션</span>
            </div>
            {filtered.map(order => {
              const total = order.items.reduce((sum, item) => sum + item.itemTotalAmount, 0);
              const isExpanded = expandedId === order.orderId;
              return (
                <div key={order.orderId}>
                  {/* 주문 행 */}
                  <div
                    className="grid grid-cols-1 md:grid-cols-[1fr_120px_100px_100px_140px] gap-2 md:gap-4 px-5 py-3 hover:bg-[#f8f9fa] transition-colors items-center cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : order.orderId)}
                  >
                    <span className="text-sm text-[#1e293b]">{order.receiverName}</span>
                    <span className="text-sm text-[#1e293b] font-mono">{formatCurrency(total)}</span>
                    <OrderStatusBadge status={order.orderStatus} />
                    <span className="text-xs text-[#475569]">{formatDate(order.orderedAt)}</span>
                    <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                      {order.orderStatus === 'PENDING' && (
                        <>
                          <button
                            onClick={() => setStatusAction({ orderId: order.orderId, toStatus: 'APPROVED', label: '승인' })}
                            className="text-xs px-2.5 py-1 rounded bg-[#15803d]/10 text-[#15803d] border border-[#bbf7d0] hover:bg-[#15803d]/20 transition-colors"
                          >
                            승인
                          </button>
                          <button
                            onClick={() => setStatusAction({ orderId: order.orderId, toStatus: 'CANCELED', label: '거절' })}
                            className="text-xs px-2.5 py-1 rounded bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca] hover:bg-[#ef4444]/20 transition-colors"
                          >
                            거절
                          </button>
                        </>
                      )}
                      {order.orderStatus === 'APPROVED' && (
                        <button
                          onClick={() => setStatusAction({ orderId: order.orderId, toStatus: 'SHIPPED', label: '배송 완료' })}
                          className="text-xs px-2.5 py-1 rounded bg-[#1d4ed8]/10 text-[#1d4ed8] border border-[#bfdbfe] hover:bg-[#1d4ed8]/20 transition-colors"
                        >
                          배송 완료
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 상세 패널 */}
                  {isExpanded && (
                    <div className="px-5 pb-4 bg-white border-t border-[#e2e8f0]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                        {/* 수령인 정보 */}
                        <div className="space-y-2">
                          <h4 className="text-xs text-[#475569] uppercase tracking-wider">수령인 정보</h4>
                          <div className="text-sm space-y-1">
                            <p className="text-[#1e293b]">{order.receiverName}</p>
                            <p className="text-[#475569] font-mono">{order.phoneNumber}</p>
                            <p className="text-[#475569]">{order.address}</p>
                          </div>
                        </div>
                        {/* 주문 품목 */}
                        <div className="space-y-2">
                          <h4 className="text-xs text-[#475569] uppercase tracking-wider">주문 품목</h4>
                          <div className="space-y-1">
                            {order.items.map(item => (
                              <div key={item.productId} className="flex justify-between text-sm">
                                <span className="text-[#1e293b]">{item.productName} x{item.quantity}</span>
                                <span className="text-[#475569] font-mono">{formatCurrency(item.itemTotalAmount)}</span>
                              </div>
                            ))}
                            <div className="flex justify-between text-sm pt-2 border-t border-[#e2e8f0]">
                              <span className="text-[#1e293b] font-medium">합계</span>
                              <span className="text-[#1e293b] font-mono font-medium">{formatCurrency(total)}</span>
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
        isOpen={statusAction !== null}
        onClose={() => setStatusAction(null)}
        onConfirm={handleStatusChange}
        title={`주문 ${statusAction?.label || ''}`}
        message={`이 주문을 ${statusAction?.label} 처리하시겠습니까?`}
        confirmText={statusAction?.label || '확인'}
        variant={statusAction?.toStatus === 'CANCELED' ? 'danger' : 'info'}
        loading={changing}
      />
    </div>
  );
}
