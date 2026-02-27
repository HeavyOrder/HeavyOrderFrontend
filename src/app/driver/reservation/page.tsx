'use client';

import { useState, useEffect } from 'react';
import { useRoleGuard } from '@/lib/hooks';
import { reservationApi } from '@/lib/api';
import { Skeleton, ConfirmModal, EmptyState } from '@/components/ui';
import { ReservationDriverResponse, ReservationStatus, ReservationStatusLabel } from '@/types';
import { formatDateTime } from '@/lib/utils';

// 예약 상태별 뱃지 색상
const STATUS_COLORS: Record<ReservationStatus, string> = {
  PENDING: 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20',
  APPROVED: 'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20',
  COMPLETED: 'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20',
  CANCELED: 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20',
};

export default function DriverReservation() {
  const { isAuthorized, isLoading: authLoading } = useRoleGuard(['DRIVER']);
  const [reservations, setReservations] = useState<ReservationDriverResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelTarget, setCancelTarget] = useState<number | null>(null);
  const [canceling, setCanceling] = useState(false);

  const fetchReservations = async () => {
    try {
      const res = await reservationApi.getDriverReservations();
      const data = res.data.data || [];
      // 최신순 정렬
      data.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setReservations(data);
    } catch { setReservations([]); }
    setLoading(false);
  };

  useEffect(() => { if (isAuthorized) fetchReservations(); }, [isAuthorized]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setCanceling(true);
    try {
      await reservationApi.changeDriverStatus(cancelTarget, { status: 'CANCELED' });
      await fetchReservations();
    } catch { /* ignore */ }
    setCanceling(false);
    setCancelTarget(null);
  };

  if (authLoading || !isAuthorized) return <div className="min-h-[60vh] flex items-center justify-center"><Skeleton variant="card" count={2} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-xl font-bold text-[#f5f5f5] mb-1">내 예약</h1>
      <p className="text-sm text-[#666] mb-6">공업사 예약 내역을 확인합니다</p>

      {loading ? (
        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5">
          <Skeleton variant="table-row" count={3} />
        </div>
      ) : reservations.length === 0 ? (
        <EmptyState title="예약 내역이 없습니다" description="아직 등록된 예약이 없습니다" />
      ) : (
        <div className="space-y-3">
          {reservations.map(r => (
            <div key={r.id} className="bg-[#111] border border-[#2a2a2a] rounded-xl p-4 hover:border-[#333] transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-medium text-[#f5f5f5]">{r.shopName}</h3>
                  <p className="text-xs text-[#666] mt-0.5 font-mono">{r.shopPhoneNumber}</p>
                </div>
                <span className={`px-2 py-0.5 text-xs font-medium border rounded ${STATUS_COLORS[r.status]}`}>
                  {ReservationStatusLabel[r.status]}
                </span>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-[#a0a0a0]">{formatDateTime(r.time)}</span>
                </div>
              </div>

              {r.memo && (
                <p className="mt-2 text-xs text-[#666] bg-[#0a0a0a] rounded p-2">{r.memo}</p>
              )}

              {/* 대기중인 예약만 취소 가능 */}
              {r.status === 'PENDING' && (
                <div className="mt-3 pt-3 border-t border-[#2a2a2a]">
                  <button
                    onClick={() => setCancelTarget(r.id)}
                    className="text-xs text-[#ef4444] hover:text-[#f87171] transition-colors"
                  >
                    예약 취소
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={cancelTarget !== null}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        title="예약 취소"
        message="이 예약을 취소하시겠습니까?"
        confirmText="취소하기"
        variant="danger"
        loading={canceling}
      />
    </div>
  );
}
