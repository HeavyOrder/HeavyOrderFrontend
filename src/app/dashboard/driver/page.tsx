'use client';

import Link from 'next/link';
import { useRoleGuard } from '@/lib/hooks';
import { Skeleton } from '@/components/ui';

export default function DriverDashboard() {
  const { isAuthorized, isLoading: authLoading, user } = useRoleGuard(['DRIVER']);

  if (authLoading || !isAuthorized) return <div className="min-h-[60vh] flex items-center justify-center"><Skeleton variant="card" count={2} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-[#f5f5f5]">안녕하세요, {user?.email}님</h1>
        <p className="text-sm text-[#666] mt-1">기사 대시보드</p>
      </div>

      {/* 메뉴 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <Link href="/driver/reservation" className="group bg-[#111] border border-[#2a2a2a] rounded-xl p-6 hover:border-[#3b82f6]/40 transition-colors">
          <div className="w-10 h-10 bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-[#f5f5f5] mb-1 group-hover:text-[#3b82f6] transition-colors">예약</h3>
          <p className="text-xs text-[#666]">가까운 공업사를 찾아 수리를 예약합니다</p>
        </Link>

        <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-6 opacity-50">
          <div className="w-10 h-10 bg-[#666]/10 border border-[#666]/20 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-5 h-5 text-[#666]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-[#666] mb-1">수리 이력</h3>
          <p className="text-xs text-[#555]">수리 이력 기능이 준비 중입니다</p>
        </div>
      </div>
    </div>
  );
}
