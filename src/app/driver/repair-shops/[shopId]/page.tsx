'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useRoleGuard } from '@/lib/hooks';
import { driverApi, reservationApi } from '@/lib/api';
import { Skeleton, Button } from '@/components/ui';
import { RepairShopDetail, AvailableSlot } from '@/types';

// 날짜를 YYYY-MM-DD 형식으로 변환
function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

// 슬롯 시간에서 HH:MM 추출
function toTimeLabel(slotTime: string): string {
  const d = new Date(slotTime);
  const h = d.getHours().toString().padStart(2, '0');
  const m = d.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

// 날짜를 한국어 형식으로 표시
function toKoreanDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
}

export default function RepairShopDetailPage() {
  const { isAuthorized, isLoading: authLoading } = useRoleGuard(['DRIVER']);
  const params = useParams();
  const router = useRouter();
  const shopId = Number(params.shopId);

  const [shop, setShop] = useState<RepairShopDetail | null>(null);
  const [shopLoading, setShopLoading] = useState(true);

  // 날짜 선택 (오늘부터)
  const [selectedDate, setSelectedDate] = useState(toDateString(new Date()));
  const [slots, setSlots] = useState<AvailableSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // 예약 선택
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [memo, setMemo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 공업사 상세 조회
  useEffect(() => {
    if (!isAuthorized || !shopId) return;
    driverApi.getRepairShopDetail(shopId)
      .then(res => setShop(res.data.data))
      .catch(() => setShop(null))
      .finally(() => setShopLoading(false));
  }, [isAuthorized, shopId]);

  // 날짜 변경 시 예약 가능 시간대 조회
  useEffect(() => {
    if (!isAuthorized || !shopId || !selectedDate) return;
    setSlotsLoading(true);
    setSelectedSlot(null);
    driverApi.getAvailableSlots(shopId, selectedDate)
      .then(res => setSlots(res.data.data || []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [isAuthorized, shopId, selectedDate]);

  // 예약 생성
  const handleSubmit = async () => {
    if (!selectedSlot) return;
    setSubmitting(true);
    setError('');
    try {
      await reservationApi.create({
        repairShopId: shopId,
        time: selectedSlot,
        ...(memo.trim() && { memo: memo.trim() }),
      });
      router.push('/driver/reservation');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || '예약에 실패했습니다. 다시 시도해주세요.');
    }
    setSubmitting(false);
  };

  if (authLoading || !isAuthorized) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Skeleton variant="card" count={2} />
    </div>
  );

  // 오늘 날짜 (날짜 선택 최솟값)
  const today = toDateString(new Date());

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* 뒤로 가기 */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-[#475569] hover:text-[#1e293b] mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        공업사 목록
      </button>

      {/* 공업사 정보 */}
      {shopLoading ? (
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 mb-6">
          <Skeleton variant="card" count={1} />
        </div>
      ) : shop ? (
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 mb-6">
          <h1 className="text-lg font-bold text-[#0f172a]">{shop.businessName}</h1>
          <div className="mt-3 space-y-1.5 text-sm text-[#475569]">
            <p>{shop.address}</p>
            <p className="font-mono">{shop.phoneNumber}</p>
          </div>
        </div>
      ) : (
        <div className="bg-[#fef2f2] border border-[#fecaca] rounded-xl p-5 mb-6 text-sm text-[#b91c1c]">
          공업사 정보를 불러올 수 없습니다.
        </div>
      )}

      {/* 예약 섹션 */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-5">
        <h2 className="text-base font-bold text-[#1e293b] mb-4">예약하기</h2>

        {/* 날짜 선택 */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#1e293b] mb-2">날짜 선택</label>
          <input
            type="date"
            min={today}
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full px-4 py-3 border-2 border-[#e2e8f0] rounded-lg text-base text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors"
          />
          {selectedDate && (
            <p className="text-xs text-[#475569] mt-1">{toKoreanDate(selectedDate)}</p>
          )}
        </div>

        {/* 시간대 선택 */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-[#1e293b] mb-2">
            시간 선택
            <span className="text-xs text-[#94a3b8] font-normal ml-2">09:00 ~ 17:00 (1시간 단위)</span>
          </label>
          {slotsLoading ? (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-10 bg-[#f1f5f9] animate-pulse rounded-lg" />
              ))}
            </div>
          ) : slots.length === 0 ? (
            <p className="text-sm text-[#94a3b8] py-3">날짜를 선택하면 가능한 시간대가 표시됩니다</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {slots.map(slot => (
                <button
                  key={slot.slotTime}
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot.slotTime)}
                  className={`py-2.5 rounded-lg text-sm font-medium border-2 transition-all ${
                    !slot.available
                      ? 'bg-[#f1f5f9] text-[#94a3b8] border-[#e2e8f0] cursor-not-allowed'
                      : selectedSlot === slot.slotTime
                        ? 'bg-[#1d4ed8] text-white border-[#1d4ed8]'
                        : 'bg-white text-[#1e293b] border-[#e2e8f0] hover:border-[#1d4ed8]/50 hover:bg-[#eff6ff]'
                  }`}
                >
                  {toTimeLabel(slot.slotTime)}
                  {!slot.available && <span className="block text-xs mt-0.5 text-[#94a3b8]">예약됨</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 메모 */}
        <div className="mb-5">
          <label className="block text-sm font-semibold text-[#1e293b] mb-2">
            메모 <span className="text-xs text-[#94a3b8] font-normal">(선택)</span>
          </label>
          <textarea
            value={memo}
            onChange={e => setMemo(e.target.value)}
            placeholder="수리 내용이나 요청사항을 입력해주세요"
            rows={3}
            className="w-full px-4 py-3 border-2 border-[#e2e8f0] rounded-lg text-sm text-[#1e293b] resize-none focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors placeholder:text-[#94a3b8]"
          />
        </div>

        {/* 에러 */}
        {error && (
          <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg p-3 mb-4 text-sm text-[#b91c1c]">
            {error}
          </div>
        )}

        {/* 예약 버튼 */}
        <Button
          fullWidth
          disabled={!selectedSlot || submitting}
          loading={submitting}
          onClick={handleSubmit}
        >
          {selectedSlot
            ? `${toKoreanDate(selectedDate)} ${toTimeLabel(selectedSlot)} 예약하기`
            : '시간을 선택해주세요'}
        </Button>
      </div>
    </div>
  );
}
