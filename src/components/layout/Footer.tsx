'use client';

import Link from 'next/link';

// 푸터 컴포넌트
export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] border-t border-[#2a2a2a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 회사 정보 */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 bg-[#f59e0b] rounded flex items-center justify-center">
                <span className="text-[#0a0a0a] font-bold text-xs">H</span>
              </div>
              <span className="text-sm font-bold text-[#f5f5f5]">HeavyOrder</span>
            </div>
            <p className="text-sm text-[#666] leading-relaxed">
              중장비 부품 발주 플랫폼<br />
              수리점, 공급사, 장비기사를 연결합니다.
            </p>
          </div>

          {/* 빠른 링크 */}
          <div>
            <h3 className="text-sm font-semibold text-[#a0a0a0] mb-3">서비스</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/parts" className="text-sm text-[#666] hover:text-[#e5e5e5] transition-colors duration-150">
                  부품 검색
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-sm text-[#666] hover:text-[#e5e5e5] transition-colors duration-150">
                  주문 관리
                </Link>
              </li>
              <li>
                <Link href="/inventory" className="text-sm text-[#666] hover:text-[#e5e5e5] transition-colors duration-150">
                  재고 관리
                </Link>
              </li>
            </ul>
          </div>

          {/* 고객 지원 */}
          <div>
            <h3 className="text-sm font-semibold text-[#a0a0a0] mb-3">고객 지원</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-sm text-[#666] hover:text-[#e5e5e5] transition-colors duration-150">
                  도움말
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-[#666] hover:text-[#e5e5e5] transition-colors duration-150">
                  문의하기
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-[#666] hover:text-[#e5e5e5] transition-colors duration-150">
                  자주 묻는 질문
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 저작권 */}
        <div className="border-t border-[#2a2a2a] mt-8 pt-6 text-center">
          <p className="text-xs text-[#666]">&copy; 2024 HeavyOrder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
