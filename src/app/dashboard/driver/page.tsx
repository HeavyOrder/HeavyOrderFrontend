'use client';

import Link from 'next/link';
import { useRoleGuard } from '@/lib/hooks';
import { Skeleton } from '@/components/ui';

export default function DriverDashboard() {
  const { isAuthorized, isLoading: authLoading, user } = useRoleGuard(['DRIVER']);

  if (authLoading || !isAuthorized) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Skeleton variant="card" count={2} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* 인사말 카드 */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#0f172a]">
                안녕하세요,<br />{user?.email}님
              </h1>
              <p className="text-base text-[#475569] mt-1">오늘도 안전 운행 되세요</p>
            </div>
            <span className="bg-[#f0fdf4] text-[#15803d] px-3 py-1.5 rounded-full text-base font-semibold">
              장비기사
            </span>
          </div>
        </div>

        {/* 메인 CTA - 예약 */}
        <Link
          href="/driver/repair-shops"
          className="block bg-[#1d4ed8] rounded-2xl shadow-sm px-6 py-6 hover:bg-[#1e40af] transition-colors"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-xl font-bold text-white">수리 예약하기</p>
              <p className="text-base text-blue-200 mt-0.5">가까운 공업사를 찾아 수리를 예약합니다</p>
            </div>
            <svg className="w-6 h-6 text-white/70 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* 안내 섹션 */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm px-6 py-5">
          <h2 className="text-lg font-bold text-[#0f172a] mb-4">이용 안내</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#eff6ff] rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-base font-bold text-[#1d4ed8]">1</span>
              </div>
              <div>
                <p className="text-base font-semibold text-[#1e293b]">공업사 선택</p>
                <p className="text-sm text-[#475569] mt-0.5">주변 공업사를 검색하고 선택합니다</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#eff6ff] rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-base font-bold text-[#1d4ed8]">2</span>
              </div>
              <div>
                <p className="text-base font-semibold text-[#1e293b]">날짜·시간 선택</p>
                <p className="text-sm text-[#475569] mt-0.5">원하는 예약 날짜와 시간을 선택합니다</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-[#eff6ff] rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-base font-bold text-[#1d4ed8]">3</span>
              </div>
              <div>
                <p className="text-base font-semibold text-[#1e293b]">예약 완료</p>
                <p className="text-sm text-[#475569] mt-0.5">공업사의 확인 후 예약이 확정됩니다</p>
              </div>
            </div>
          </div>
        </div>

        {/* 준비 중 기능 */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm px-6 py-5 opacity-60">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#f1f3f5] rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-7 h-7 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-base font-semibold text-[#475569]">수리 이력</p>
              <p className="text-sm text-[#94a3b8] mt-0.5">곧 출시 예정입니다</p>
            </div>
            <span className="ml-auto bg-[#f1f3f5] text-[#64748b] px-3 py-1 rounded-full text-sm font-medium">
              준비 중
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
