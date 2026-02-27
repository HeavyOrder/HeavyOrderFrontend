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
    { label: '예약', href: '/driver/reservation' },
  ],
  ADMIN: [
    { label: '대시보드', href: '/dashboard/repair-shop' },
    { label: '주문 관리', href: '/repair-shop/orders' },
    { label: '재고 관리', href: '/repair-shop/inventory' },
    { label: '고객 관리', href: '/repair-shop/customers' },
    { label: '일정 관리', href: '/repair-shop/schedule' },
  ],
};

// 헤더 컴포넌트: 네비게이션 바
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
    <header className="bg-[#0a0a0a] border-b border-[#2a2a2a]">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* 로고 */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-[#f59e0b] rounded flex items-center justify-center">
                <span className="text-[#0a0a0a] font-bold text-sm">H</span>
              </div>
              <span className="text-base font-bold text-[#f5f5f5]">HeavyOrder</span>
            </Link>
          </div>

          {/* 데스크톱 네비게이션 - 역할별 메뉴 */}
          {isLoggedIn && navItems.length > 0 && (
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 text-sm rounded transition-colors duration-150 ${
                    isActive(item.href)
                      ? 'text-[#f5f5f5] bg-[#1a1a1a]'
                      : 'text-[#a0a0a0] hover:text-[#e5e5e5] hover:bg-[#111]'
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
                <div className="h-4 w-28 bg-[#1a1a1a] rounded animate-pulse"></div>
                <div className="h-8 w-16 bg-[#1a1a1a] rounded animate-pulse"></div>
              </div>
            ) : isLoggedIn ? (
              // 로그인됨: 사용자 이름 + 로그아웃 버튼
              <>
                <span className="text-sm text-[#a0a0a0]">
                  {displayName}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 text-sm text-[#666] hover:text-[#e5e5e5] transition-colors duration-150"
                >
                  로그아웃
                </button>
              </>
            ) : (
              // 로그인 안됨: 로그인/회원가입 버튼
              <>
                <Link
                  href="/auth/login"
                  className="px-3 py-1.5 text-sm text-[#a0a0a0] hover:text-[#e5e5e5] transition-colors duration-150"
                >
                  로그인
                </Link>
                <Link
                  href="/auth/register"
                  className="px-3 py-1.5 text-sm bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30 rounded hover:bg-[#f59e0b]/20 transition-colors duration-150"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-[#a0a0a0] hover:text-[#e5e5e5] transition-colors duration-150"
            >
              <svg
                className="w-5 h-5"
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
          <div className="md:hidden py-3 border-t border-[#2a2a2a]">
            <div className="flex flex-col gap-1">
              {/* 역할별 네비게이션 메뉴 (로그인 시) */}
              {isLoggedIn && navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 text-sm rounded transition-colors duration-150 ${
                    isActive(item.href)
                      ? 'text-[#f5f5f5] bg-[#1a1a1a]'
                      : 'text-[#a0a0a0] hover:text-[#e5e5e5] hover:bg-[#111]'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {/* 구분선 */}
              {isLoggedIn && navItems.length > 0 && (
                <div className="border-t border-[#2a2a2a] my-2"></div>
              )}

              {isLoading ? (
                // 로딩 중: 스켈레톤 UI
                <>
                  <div className="h-4 w-32 bg-[#1a1a1a] rounded animate-pulse my-2 mx-3"></div>
                  <div className="h-9 w-full bg-[#1a1a1a] rounded animate-pulse"></div>
                </>
              ) : isLoggedIn ? (
                // 로그인됨: 사용자 이름 + 로그아웃 버튼
                <>
                  <span className="text-sm text-[#a0a0a0] px-3 py-2">
                    {displayName}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-left px-3 py-2 text-sm text-[#666] hover:text-[#e5e5e5] hover:bg-[#111] rounded transition-colors duration-150"
                  >
                    로그아웃
                  </button>
                </>
              ) : (
                // 로그인 안됨: 로그인/회원가입 버튼
                <>
                  <Link
                    href="/auth/login"
                    className="px-3 py-2 text-sm text-[#a0a0a0] hover:text-[#e5e5e5] hover:bg-[#111] rounded transition-colors duration-150"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    로그인
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-3 py-2 text-sm text-center bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/30 rounded hover:bg-[#f59e0b]/20 transition-colors duration-150"
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
