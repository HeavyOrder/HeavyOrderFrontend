'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRoleGuard } from '@/lib/hooks';
import { reservationApi } from '@/lib/api';
import { Tabs, Skeleton, ConfirmModal, EmptyState } from '@/components/ui';
import { ReservationShopResponse, ReservationStatus, ReservationStatusLabel } from '@/types';
import { formatDateTime } from '@/lib/utils';

// ────────────────────────────
// 상수 / 유틸
// ────────────────────────────
const STATUS_COLORS: Record<ReservationStatus, string> = {
  PENDING: 'bg-[#b45309]/10 text-[#b45309] border-[#f59e0b]/20',
  APPROVED: 'bg-[#15803d]/10 text-[#15803d] border-[#bbf7d0]',
  COMPLETED: 'bg-[#1d4ed8]/10 text-[#1d4ed8] border-[#bfdbfe]',
  CANCELED: 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]',
};

// 예약 상태별 캘린더 dot 색상
const DOT_COLORS: Record<ReservationStatus, string> = {
  PENDING: 'bg-[#f59e0b]',
  APPROVED: 'bg-[#15803d]',
  COMPLETED: 'bg-[#1d4ed8]',
  CANCELED: 'bg-[#d1d5db]',
};

// ISO string → YYYY-MM-DD
function toDay(isoString: string): string {
  return isoString.split('T')[0];
}

// Date → YYYY-MM-DD
function toDateStr(d: Date): string {
  return d.toISOString().split('T')[0];
}

// 해당 월의 캘린더 그리드 생성 (빈 칸 포함, 일~토)
function buildCalendarGrid(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1).getDay(); // 0=일, 6=토
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid: (Date | null)[] = [];
  for (let i = 0; i < firstDay; i++) grid.push(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(new Date(year, month, d));
  return grid;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// ────────────────────────────
// 캘린더 컴포넌트
// ────────────────────────────
interface CalendarProps {
  reservationsByDate: Map<string, ReservationShopResponse[]>;
  selectedDay: string | null;
  onSelectDay: (day: string) => void;
}

function ReservationCalendar({ reservationsByDate, selectedDay, onSelectDay }: CalendarProps) {
  const todayStr = toDateStr(new Date());
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  const grid = useMemo(
    () => buildCalendarGrid(viewDate.year, viewDate.month),
    [viewDate]
  );

  const prevMonth = () => {
    setViewDate(prev => {
      const d = new Date(prev.year, prev.month - 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  const nextMonth = () => {
    setViewDate(prev => {
      const d = new Date(prev.year, prev.month + 1, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  };

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
      {/* 월 헤더 */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
        <button
          onClick={prevMonth}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#f1f5f9] text-[#475569] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-base font-bold text-[#1e293b]">
          {viewDate.year}년 {viewDate.month + 1}월
        </span>
        <button
          onClick={nextMonth}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#f1f5f9] text-[#475569] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-b border-[#e2e8f0]">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`py-2 text-center text-xs font-semibold ${
              i === 0 ? 'text-[#b91c1c]' : i === 6 ? 'text-[#1d4ed8]' : 'text-[#64748b]'
            }`}
          >
            {w}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7">
        {grid.map((date, idx) => {
          if (!date) return <div key={`empty-${idx}`} className="min-h-[64px] border-b border-r border-[#f1f5f9]" />;

          const dayStr = toDateStr(date);
          const dayReservations = reservationsByDate.get(dayStr) || [];
          const isToday = dayStr === todayStr;
          const isSelected = dayStr === selectedDay;
          const isWeekend = date.getDay() === 0 || date.getDay() === 6;
          const isSunday = date.getDay() === 0;
          const isSaturday = date.getDay() === 6;

          // 상태별 dot 중복 제거 (CANCELED 제외하고 우선순위)
          const statuses = [...new Set(
            dayReservations
              .filter(r => r.status !== 'CANCELED')
              .map(r => r.status)
          )] as ReservationStatus[];
          const dots = statuses.slice(0, 3);
          const extra = dayReservations.filter(r => r.status !== 'CANCELED').length - dots.length;

          return (
            <button
              key={dayStr}
              onClick={() => onSelectDay(dayStr)}
              className={`min-h-[64px] p-1.5 border-b border-r border-[#f1f5f9] flex flex-col items-center gap-1 transition-colors ${
                isSelected
                  ? 'bg-[#eff6ff]'
                  : 'hover:bg-[#f8f9fa]'
              }`}
            >
              {/* 날짜 숫자 */}
              <span
                className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium ${
                  isSelected
                    ? 'bg-[#1d4ed8] text-white'
                    : isToday
                      ? 'ring-2 ring-[#1d4ed8] text-[#1d4ed8] font-bold'
                      : isSunday
                        ? 'text-[#b91c1c]'
                        : isSaturday
                          ? 'text-[#1d4ed8]'
                          : isWeekend
                            ? ''
                            : 'text-[#1e293b]'
                }`}
              >
                {date.getDate()}
              </span>

              {/* 예약 dot */}
              {dayReservations.length > 0 && (
                <div className="flex items-center gap-0.5 flex-wrap justify-center">
                  {dots.map((status, i) => (
                    <span key={i} className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[status]}`} />
                  ))}
                  {extra > 0 && (
                    <span className="text-[9px] text-[#64748b] font-medium">+{extra}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="px-5 py-3 border-t border-[#e2e8f0] flex items-center gap-4 flex-wrap">
        <span className="text-xs text-[#94a3b8]">예약 상태:</span>
        {(['PENDING', 'APPROVED', 'COMPLETED'] as ReservationStatus[]).map(s => (
          <span key={s} className="flex items-center gap-1 text-xs text-[#64748b]">
            <span className={`w-2 h-2 rounded-full ${DOT_COLORS[s]}`} />
            {ReservationStatusLabel[s]}
          </span>
        ))}
      </div>
    </div>
  );
}

// ────────────────────────────
// 예약 카드 (리스트/캘린더 공용)
// ────────────────────────────
interface ReservationCardProps {
  r: ReservationShopResponse;
  onAction: (id: number, toStatus: ReservationStatus, label: string) => void;
}

function ReservationCard({ r, onAction }: ReservationCardProps) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 hover:border-[#e2e8f0] transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-[#1e293b]">{r.driverEmail}</h3>
          <p className="text-xs text-[#475569] mt-0.5 font-mono">{r.driverPhoneNumber}</p>
        </div>
        <span className={`px-2 py-0.5 text-xs font-medium border rounded ${STATUS_COLORS[r.status]}`}>
          {ReservationStatusLabel[r.status]}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-sm mb-2">
        <svg className="w-3.5 h-3.5 text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-[#475569]">{formatDateTime(r.time)}</span>
      </div>

      {r.memo && (
        <p className="text-xs text-[#475569] bg-[#f8f9fa] rounded p-2 mb-3">{r.memo}</p>
      )}

      {(r.status === 'PENDING' || r.status === 'APPROVED') && (
        <div className="flex gap-2 pt-3 border-t border-[#e2e8f0]">
          {r.status === 'PENDING' && (
            <>
              <button
                onClick={() => onAction(r.id, 'APPROVED', '승인')}
                className="text-xs px-2.5 py-1 rounded bg-[#15803d]/10 text-[#15803d] border border-[#bbf7d0] hover:bg-[#15803d]/20 transition-colors"
              >
                승인
              </button>
              <button
                onClick={() => onAction(r.id, 'CANCELED', '거절')}
                className="text-xs px-2.5 py-1 rounded bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca] hover:bg-[#ef4444]/20 transition-colors"
              >
                거절
              </button>
            </>
          )}
          {r.status === 'APPROVED' && (
            <button
              onClick={() => onAction(r.id, 'COMPLETED', '완료')}
              className="text-xs px-2.5 py-1 rounded bg-[#1d4ed8]/10 text-[#1d4ed8] border border-[#bfdbfe] hover:bg-[#1d4ed8]/20 transition-colors"
            >
              완료 처리
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────
// 메인 페이지
// ────────────────────────────
export default function RepairShopSchedule() {
  const { isAuthorized, isLoading: authLoading } = useRoleGuard(['REPAIR_SHOP']);
  const [reservations, setReservations] = useState<ReservationShopResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // 뷰 모드: 리스트 / 캘린더
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // 리스트 탭 필터
  const [activeTab, setActiveTab] = useState('ALL');

  // 캘린더: 선택된 날짜
  const todayStr = toDateStr(new Date());
  const [selectedDay, setSelectedDay] = useState<string>(todayStr);

  // 상태 변경 액션
  const [statusAction, setStatusAction] = useState<{ id: number; toStatus: ReservationStatus; label: string } | null>(null);
  const [changing, setChanging] = useState(false);

  const fetchReservations = async () => {
    try {
      const res = await reservationApi.getRepairShopReservations();
      const data = res.data.data || [];
      data.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setReservations(data);
    } catch { setReservations([]); }
    setLoading(false);
  };

  useEffect(() => { if (isAuthorized) fetchReservations(); }, [isAuthorized]);

  const handleAction = (id: number, toStatus: ReservationStatus, label: string) => {
    setStatusAction({ id, toStatus, label });
  };

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

  // 날짜별 그룹핑 (캘린더용)
  const reservationsByDate = useMemo(() => {
    return reservations.reduce((acc, r) => {
      const day = toDay(r.time);
      acc.set(day, [...(acc.get(day) || []), r]);
      return acc;
    }, new Map<string, ReservationShopResponse[]>());
  }, [reservations]);

  // 리스트 필터
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

  // 캘린더 선택 날짜의 예약 목록 (시간순)
  const selectedDayReservations = (reservationsByDate.get(selectedDay) || []).sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  );

  if (authLoading || !isAuthorized) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Skeleton variant="card" count={2} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 헤더 + 뷰 토글 */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b]">일정 관리</h1>
          <p className="text-sm text-[#475569] mt-1">기사 예약 일정을 확인하고 관리합니다</p>
        </div>
        {/* 리스트/캘린더 토글 */}
        <div className="flex items-center gap-1 bg-[#f1f5f9] rounded-lg p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-[#1e293b] shadow-sm'
                : 'text-[#64748b] hover:text-[#1e293b]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            리스트
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'calendar'
                ? 'bg-white text-[#1e293b] shadow-sm'
                : 'text-[#64748b] hover:text-[#1e293b]'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            캘린더
          </button>
        </div>
      </div>

      {/* 로딩 */}
      {loading && (
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5">
          <Skeleton variant="table-row" count={5} />
        </div>
      )}

      {/* ── 리스트 뷰 ── */}
      {!loading && viewMode === 'list' && (
        <div>
          <Tabs tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />
          <div className="mt-4">
            {filtered.length === 0 ? (
              <EmptyState title="예약이 없습니다" description="아직 접수된 예약이 없습니다" />
            ) : (
              <div className="space-y-3">
                {filtered.map(r => (
                  <ReservationCard key={r.id} r={r} onAction={handleAction} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── 캘린더 뷰 ── */}
      {!loading && viewMode === 'calendar' && (
        <div className="space-y-4">
          <ReservationCalendar
            reservationsByDate={reservationsByDate}
            selectedDay={selectedDay}
            onSelectDay={setSelectedDay}
          />

          {/* 선택된 날짜 예약 목록 */}
          <div>
            <h2 className="text-sm font-semibold text-[#475569] mb-3">
              {(() => {
                const d = new Date(selectedDay + 'T00:00:00');
                return `${d.getMonth() + 1}월 ${d.getDate()}일 예약 (${selectedDayReservations.length}건)`;
              })()}
            </h2>
            {selectedDayReservations.length === 0 ? (
              <div className="bg-white border border-[#e2e8f0] rounded-xl p-6 text-center text-sm text-[#94a3b8]">
                이 날짜에 예약이 없습니다
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDayReservations.map(r => (
                  <ReservationCard key={r.id} r={r} onAction={handleAction} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
