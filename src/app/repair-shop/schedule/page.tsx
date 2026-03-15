'use client';

import { useState, useEffect } from 'react';
import { useRoleGuard } from '@/lib/hooks';
import { reservationApi } from '@/lib/api';
import { Tabs, Skeleton, ConfirmModal, EmptyState } from '@/components/ui';
import { ReservationShopResponse, ReservationStatus, ReservationStatusLabel } from '@/types';
import { formatDateTime } from '@/lib/utils';

// 예약 상태별 뱃지 색상
const STATUS_COLORS: Record<ReservationStatus, string> = {
  PENDING: 'bg-[#b45309]/10 text-[#b45309] border-[#f59e0b]/20',
  APPROVED: 'bg-[#15803d]/10 text-[#15803d] border-[#bbf7d0]',
  COMPLETED: 'bg-[#1d4ed8]/10 text-[#1d4ed8] border-[#bfdbfe]',
  CANCELED: 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]',
};

export default function RepairShopSchedule() {
  const { isAuthorized, isLoading: authLoading } = useRoleGuard(['REPAIR_SHOP']);
  const [reservations, setReservations] = useState<ReservationShopResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');

  // 상태 변경 액션
  const [statusAction, setStatusAction] = useState<{ id: number; toStatus: ReservationStatus; label: string } | null>(null);
  const [changing, setChanging] = useState(false);

  const fetchReservations = async () => {
    try {
      const res = await reservationApi.getRepairShopReservations();
      const data = res.data.data || [];
      // 최신순 정렬
      data.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setReservations(data);
    } catch { setReservations([]); }
    setLoading(false);
  };

  useEffect(() => { if (isAuthorized) fetchReservations(); }, [isAuthorized]);

  const handleStatusChange = async () => {
    if (!statusAction) return;
    setChanging(true);
    try {
      await reservationApi.changeRepairShopStatus(statusAction.id, { status: statusAction.toStatus });
      await fetchReservations();
    } catch { /* ignore */ }
    setChanging(false);
    setStatusAction(null);
  };

  if (authLoading || !isAuthorized) return <div className="min-h-[60vh] flex items-center justify-center"><Skeleton variant="card" count={2} /></div>;

  const filtered = activeTab === 'ALL' ? reservations : reservations.filter(r => r.status === activeTab);
  const counts: Record<string, number> = { ALL: reservations.length };
  (['PENDING', 'APPROVED', 'COMPLETED', 'CANCELED'] as ReservationStatus[]).forEach(s => {
    counts[s] = reservations.filter(r => r.status === s).length;
  });

  const tabs = [
    { key: 'ALL', label: '전체', count: counts.ALL },
    { key: 'PENDING', label: '대기중', count: counts.PENDING },
    { key: 'APPROVED', label: '승인됨', count: counts.APPROVED },
    { key: 'COMPLETED', label: '완료됨', count: counts.COMPLETED },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-xl font-bold text-[#1e293b] mb-1">일정 관리</h1>
      <p className="text-sm text-[#475569] mb-6">기사 예약 일정을 확인하고 관리합니다</p>

      <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

      <div className="mt-4">
        {loading ? (
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-5">
            <Skeleton variant="table-row" count={5} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="예약이 없습니다" description="아직 접수된 예약이 없습니다" />
        ) : (
          <div className="space-y-3">
            {filtered.map(r => (
              <div key={r.id} className="bg-white border border-[#e2e8f0] rounded-xl p-4 hover:border-[#e2e8f0] transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-medium text-[#1e293b]">{r.driverEmail}</h3>
                    <p className="text-xs text-[#475569] mt-0.5 font-mono">{r.driverPhoneNumber}</p>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium border rounded ${STATUS_COLORS[r.status]}`}>
                    {ReservationStatusLabel[r.status]}
                  </span>
                </div>

                {/* 예약 시간 */}
                <div className="flex items-center gap-1.5 text-sm mb-2">
                  <svg className="w-3.5 h-3.5 text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[#475569]">{formatDateTime(r.time)}</span>
                </div>

                {r.memo && (
                  <p className="text-xs text-[#475569] bg-white rounded p-2 mb-3">{r.memo}</p>
                )}

                {/* 상태별 액션 버튼 */}
                {(r.status === 'PENDING' || r.status === 'APPROVED') && (
                  <div className="flex gap-2 pt-3 border-t border-[#e2e8f0]">
                    {r.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => setStatusAction({ id: r.id, toStatus: 'APPROVED', label: '승인' })}
                          className="text-xs px-2.5 py-1 rounded bg-[#15803d]/10 text-[#15803d] border border-[#bbf7d0] hover:bg-[#15803d]/20 transition-colors"
                        >
                          승인
                        </button>
                        <button
                          onClick={() => setStatusAction({ id: r.id, toStatus: 'CANCELED', label: '거절' })}
                          className="text-xs px-2.5 py-1 rounded bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca] hover:bg-[#ef4444]/20 transition-colors"
                        >
                          거절
                        </button>
                      </>
                    )}
                    {r.status === 'APPROVED' && (
                      <button
                        onClick={() => setStatusAction({ id: r.id, toStatus: 'COMPLETED', label: '완료' })}
                        className="text-xs px-2.5 py-1 rounded bg-[#1d4ed8]/10 text-[#1d4ed8] border border-[#bfdbfe] hover:bg-[#1d4ed8]/20 transition-colors"
                      >
                        완료 처리
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={statusAction !== null}
        onClose={() => setStatusAction(null)}
        onConfirm={handleStatusChange}
        title={`예약 ${statusAction?.label || ''}`}
        message={`이 예약을 ${statusAction?.label} 처리하시겠습니까?`}
        confirmText={statusAction?.label || '확인'}
        variant={statusAction?.toStatus === 'CANCELED' ? 'danger' : 'info'}
        loading={changing}
      />
    </div>
  );
}
