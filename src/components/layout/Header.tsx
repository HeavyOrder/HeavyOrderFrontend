'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context';

// 역할별 네비게이션 메뉴 정의
const NAV_MENUS: Record<string, { label: string; href: string }[]> = {
  REPAIR_SHOP: [
    { label: '대시보드', href: '/dashboard/repair-shop' },
    { label: '주문 관리', href: '/repair-shop/orders' },
    { label: '재고 관리', href: '/repair-shop/inventory' },
    { label: '고객 관리', href: '/repair-shop/customers' },
    { label: '일정 관리', href: '/repair-shop/schedule' },
  ],
  SUPPLIER: [
    { label: '대시보드', href: '/dashboard/supplier' },
    { label: '주문 관리', href: '/supplier/orders' },
    { label: '부품 관리', href: '/supplier/parts' },
  ],
  DRIVER: [
    { label: '대시보드', href: '/dashboard/driver' },
    { label: '공업사 찾기', href: '/driver/repair-shops' },
    { label: '내 예약', href: '/driver/reservation' },
  ],
  ADMIN: [
    { label: '대시보드', href: '/dashboard/repair-shop' },
    { label: '주문 관리', href: '/repair-shop/orders' },
    { label: '재고 관리', href: '/repair-shop/inventory' },
    { label: '고객 관리', href: '/repair-shop/customers' },
    { label: '일정 관리', href: '/repair-shop/schedule' },
  ],
};

// 헤더 컴포넌트 (노년층 라이트 테마 - 큰 터치 타겟, 고대비)
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isLoading, isLoggedIn, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // 로그아웃 처리
  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    router.push('/');
  };

  // 표시할 사용자 이름 (상호명 우선, 없으면 이메일)
  const displayName = user?.businessName || user?.email || '';

  // 현재 역할에 맞는 네비게이션 메뉴
  const navItems = user?.roleType ? NAV_MENUS[user.roleType] || [] : [];

  // 현재 경로와 메뉴 경로 비교 (활성 상태 표시)
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <header className="bg-white border-b border-[#e2e8f0] shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 노년층 기준: h-16(64px)으로 더 큰 헤더 */}
        <div className="flex justify-between items-center h-16">
          {/* 로고 - 파란색으로 브랜드 통일 */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-[#1d4ed8] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-base">H</span>
              </div>
              <span className="text-lg font-bold text-[#0f172a]">HeavyOrder</span>
            </Link>
          </div>

          {/* 데스크톱 네비게이션 - 역할별 메뉴 */}
          {isLoggedIn && navItems.length > 0 && (
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2.5 text-base rounded-lg transition-colors duration-150 ${
                    isActive(item.href)
                      ? 'text-[#1d4ed8] bg-[#eff6ff] font-semibold'
                      : 'text-[#475569] hover:text-[#1d4ed8] hover:bg-[#f8f9fa]'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          {/* 로그인 상태에 따른 UI */}
          <div className="hidden md:flex items-center gap-3">
            {isLoading ? (
              // 로딩 중: 스켈레톤 UI
              <div className="flex items-center gap-3">
                <div className="h-5 w-28 bg-[#e2e8f0] rounded animate-pulse"></div>
                <div className="h-10 w-20 bg-[#e2e8f0] rounded animate-pulse"></div>
              </div>
            ) : isLoggedIn ? (
              // 로그인됨: 사용자 이름 + 로그아웃 버튼
              <>
                <span className="text-base font-medium text-[#475569]">
                  {displayName}
                </span>
                {/* 노년층 기준: 로그아웃은 빨간 색으로 명확하게 구분 */}
                <button
                  onClick={handleLogout}
                  className="px-4 py-2.5 text-base rounded-lg text-[#64748b] hover:text-[#b91c1c] hover:bg-[#fef2f2] transition-colors duration-150"
                >
                  로그아웃
                </button>
              </>
            ) : (
              // 로그인 안됨: 로그인/회원가입 버튼
              <>
                <Link
                  href="/auth/login"
                  className="px-4 py-2.5 text-base font-medium text-[#475569] hover:text-[#1d4ed8] rounded-lg transition-colors duration-150"
                >
                  로그인
                </Link>
                {/* 노년층 기준: 회원가입은 강한 파란 CTA 버튼 */}
                <Link
                  href="/auth/register"
                  className="px-4 py-2.5 text-base font-semibold bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] transition-colors duration-150"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>

          {/* 모바일 메뉴 버튼 - 노년층 기준: 더 큰 터치 타겟 (44×44px) */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 text-[#475569] hover:text-[#1d4ed8] hover:bg-[#f8f9fa] rounded-lg transition-colors duration-150"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#f1f3f5] bg-white">
            <div className="flex flex-col gap-1">
              {/* 역할별 네비게이션 메뉴 (로그인 시) */}
              {isLoggedIn && navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  // 노년층 기준: py-3.5로 48px 터치 타겟 보장
                  className={`px-4 py-3.5 text-base rounded-lg transition-colors duration-150 ${
                    isActive(item.href)
                      ? 'text-[#1d4ed8] bg-[#eff6ff] font-semibold'
                      : 'text-[#475569] hover:text-[#1d4ed8] hover:bg-[#f8f9fa]'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {/* 구분선 */}
              {isLoggedIn && navItems.length > 0 && (
                <div className="border-t border-[#f1f3f5] my-2"></div>
              )}

              {isLoading ? (
                // 로딩 중: 스켈레톤 UI
                <>
                  <div className="h-5 w-32 bg-[#e2e8f0] rounded animate-pulse my-2 mx-4"></div>
                  <div className="h-12 w-full bg-[#e2e8f0] rounded animate-pulse"></div>
                </>
              ) : isLoggedIn ? (
                // 로그인됨: 사용자 이름 + 로그아웃 버튼
                <>
                  <span className="text-base font-medium text-[#475569] px-4 py-2">
                    {displayName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-left px-4 py-3.5 text-base text-[#64748b] hover:text-[#b91c1c] hover:bg-[#fef2f2] rounded-lg transition-colors duration-150"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                // 로그인 안됨: 로그인/회원가입 버튼
                <>
                  <Link
                    href="/auth/login"
                    className="px-4 py-3.5 text-base font-medium text-[#475569] hover:text-[#1d4ed8] hover:bg-[#f8f9fa] rounded-lg transition-colors duration-150"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-4 py-3.5 text-base font-semibold text-center bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] transition-colors duration-150"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
