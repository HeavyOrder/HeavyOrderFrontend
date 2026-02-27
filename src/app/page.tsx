'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useAuth } from '@/lib/context';

// 역할별 대시보드 경로
const DASHBOARD_ROUTES: Record<string, string> = {
  REPAIR_SHOP: '/dashboard/repair-shop',
  SUPPLIER: '/dashboard/supplier',
  DRIVER: '/dashboard/driver',
  ADMIN: '/dashboard/repair-shop', // 관리자는 공업사 대시보드로
};

// 홈페이지: 로그인 시 대시보드 리다이렉트, 비로그인 시 랜딩 페이지
export default function Home() {
  const { user, isLoading, isLoggedIn } = useAuth();

  // 로그인 상태면 역할별 대시보드로 리다이렉트
  useEffect(() => {
    if (!isLoading && isLoggedIn && user?.roleType) {
      // 역할에 맞는 경로가 없으면 기본 대시보드로 이동
      const route = DASHBOARD_ROUTES[user.roleType] || '/dashboard/repair-shop';
      window.location.href = route;
    }
  }, [isLoading, isLoggedIn, user]);

  // 인증 확인 완료 + 로그인 상태 → 대시보드로 이동 중
  if (!isLoading && isLoggedIn) {
    return (
      <div className="min-h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-[#f59e0b] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-[#666]">대시보드로 이동 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a]">
      {/* 히어로 섹션 */}
      <section className="border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            {/* 상단 태그 */}
            <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#2a2a2a] rounded-full mb-6">
              <span className="w-1.5 h-1.5 bg-[#f59e0b] rounded-full"></span>
              <span className="text-xs text-[#a0a0a0]">중장비 부품 발주 플랫폼</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-[#f5f5f5] leading-tight mb-5">
              부품 발주,<br />
              <span className="text-[#f59e0b]">더 빠르고 정확하게.</span>
            </h1>
            <p className="text-base md:text-lg text-[#a0a0a0] mb-8 max-w-xl leading-relaxed">
              수리점, 공급사, 장비기사를 하나의 플랫폼에서 연결합니다.
              필요한 부품을 검색하고 즉시 발주하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/auth/register"
                className="px-5 py-2.5 text-sm font-medium bg-[#f59e0b] text-[#0a0a0a] rounded hover:bg-[#d97706] transition-colors duration-150 text-center"
              >
                시작하기
              </Link>
              <Link
                href="/auth/login"
                className="px-5 py-2.5 text-sm font-medium text-[#a0a0a0] border border-[#2a2a2a] rounded hover:border-[#333] hover:text-[#e5e5e5] transition-colors duration-150 text-center"
              >
                로그인
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 수치 섹션 */}
      <section className="border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-[#2a2a2a]">
            <div className="py-8 md:py-10 text-center">
              <div className="text-2xl md:text-3xl font-bold text-[#f5f5f5]">3</div>
              <div className="text-xs text-[#666] mt-1">사용자 유형</div>
            </div>
            <div className="py-8 md:py-10 text-center">
              <div className="text-2xl md:text-3xl font-bold text-[#f5f5f5]">실시간</div>
              <div className="text-xs text-[#666] mt-1">주문 상태 추적</div>
            </div>
            <div className="py-8 md:py-10 text-center">
              <div className="text-2xl md:text-3xl font-bold text-[#f5f5f5]">통합</div>
              <div className="text-xs text-[#666] mt-1">재고 관리</div>
            </div>
          </div>
        </div>
      </section>

      {/* 역할 소개 섹션 */}
      <section className="border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-[#f5f5f5] mb-2">
              역할별 서비스
            </h2>
            <p className="text-sm text-[#666]">
              각 업종에 최적화된 기능을 제공합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 공업사 카드 */}
            <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#333] transition-colors duration-150">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[#3b82f6]/10 border border-[#3b82f6]/20 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#3b82f6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-[#f5f5f5]">공업사</h3>
              </div>
              <p className="text-sm text-[#a0a0a0] mb-4 leading-relaxed">
                부품 검색 및 발주, 재고 관리,<br />
                고객 관리, 일정 관리
              </p>
              <Link
                href="/auth/register?role=repair_shop"
                className="text-xs text-[#3b82f6] hover:text-[#60a5fa] transition-colors duration-150"
              >
                공업사로 가입 &rarr;
              </Link>
            </div>

            {/* 부품회사 카드 */}
            <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#333] transition-colors duration-150">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[#22c55e]/10 border border-[#22c55e]/20 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-[#f5f5f5]">부품회사</h3>
              </div>
              <p className="text-sm text-[#a0a0a0] mb-4 leading-relaxed">
                부품 등록 및 관리, 주문 접수,<br />
                재고 현황 관리
              </p>
              <Link
                href="/auth/register?role=supplier"
                className="text-xs text-[#22c55e] hover:text-[#4ade80] transition-colors duration-150"
              >
                부품회사로 가입 &rarr;
              </Link>
            </div>

            {/* 기사 카드 */}
            <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#333] transition-colors duration-150">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#f59e0b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-[#f5f5f5]">장비기사</h3>
              </div>
              <p className="text-sm text-[#a0a0a0] mb-4 leading-relaxed">
                부품 검색, 수리점 예약,<br />
                수리 진행 상황 확인
              </p>
              <Link
                href="/auth/register?role=mechanic"
                className="text-xs text-[#f59e0b] hover:text-[#fbbf24] transition-colors duration-150"
              >
                장비기사로 가입 &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 기능 소개 섹션 */}
      <section className="border-b border-[#2a2a2a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
          <div className="mb-10">
            <h2 className="text-xl md:text-2xl font-bold text-[#f5f5f5] mb-2">
              주요 기능
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#2a2a2a]">
            <div className="bg-[#0a0a0a] p-5 md:p-6">
              <svg className="w-5 h-5 text-[#a0a0a0] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-sm font-medium text-[#f5f5f5] mb-1">부품 검색</h3>
              <p className="text-xs text-[#666] leading-relaxed">부품번호, 제조사, 카테고리로 빠르게 검색</p>
            </div>

            <div className="bg-[#0a0a0a] p-5 md:p-6">
              <svg className="w-5 h-5 text-[#a0a0a0] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-sm font-medium text-[#f5f5f5] mb-1">간편 발주</h3>
              <p className="text-xs text-[#666] leading-relaxed">클릭 몇 번으로 손쉽게 발주</p>
            </div>

            <div className="bg-[#0a0a0a] p-5 md:p-6">
              <svg className="w-5 h-5 text-[#a0a0a0] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h3 className="text-sm font-medium text-[#f5f5f5] mb-1">주문 관리</h3>
              <p className="text-xs text-[#666] leading-relaxed">실시간 주문 현황 확인</p>
            </div>

            <div className="bg-[#0a0a0a] p-5 md:p-6">
              <svg className="w-5 h-5 text-[#a0a0a0] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-sm font-medium text-[#f5f5f5] mb-1">재고 관리</h3>
              <p className="text-xs text-[#666] leading-relaxed">효율적인 재고 현황 관리</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 text-center">
          <h2 className="text-xl md:text-2xl font-bold text-[#f5f5f5] mb-3">
            지금 바로 시작하세요
          </h2>
          <p className="text-sm text-[#666] mb-6 max-w-md mx-auto">
            무료로 가입하고 중장비 부품 발주의 새로운 경험을 만나보세요.
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-6 py-2.5 text-sm font-medium bg-[#f59e0b] text-[#0a0a0a] rounded hover:bg-[#d97706] transition-colors duration-150"
          >
            무료 회원가입
          </Link>
        </div>
      </section>
    </div>
  );
}
