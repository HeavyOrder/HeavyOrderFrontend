'use client';

import Link from 'next/link';

// 푸터 컴포넌트 (노년층 라이트 테마)
export default function Footer() {
  return (
    <footer className="bg-[#f8f9fa] border-t border-[#e2e8f0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 회사 정보 */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-[#1d4ed8] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-base font-bold text-[#0f172a]">HeavyOrder</span>
            </div>
            <p className="text-base text-[#475569] leading-relaxed">
              중장비 부품 발주 플랫폼<br />
              수리점, 공급사, 장비기사를 연결합니다.
            </p>
          </div>

          {/* 빠른 링크 */}
          <div>
            <h3 className="text-base font-bold text-[#1e293b] mb-3">서비스</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/parts" className="text-base text-[#475569] hover:text-[#1d4ed8] transition-colors duration-150">
                  부품 검색
                </Link>
              </li>
              <li>
                <Link href="/orders" className="text-base text-[#475569] hover:text-[#1d4ed8] transition-colors duration-150">
                  주문 관리
                </Link>
              </li>
              <li>
                <Link href="/inventory" className="text-base text-[#475569] hover:text-[#1d4ed8] transition-colors duration-150">
                  재고 관리
                </Link>
              </li>
            </ul>
          </div>

          {/* 고객 지원 */}
          <div>
            <h3 className="text-base font-bold text-[#1e293b] mb-3">고객 지원</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-base text-[#475569] hover:text-[#1d4ed8] transition-colors duration-150">
                  도움말
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-base text-[#475569] hover:text-[#1d4ed8] transition-colors duration-150">
                  문의하기
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-base text-[#475569] hover:text-[#1d4ed8] transition-colors duration-150">
                  자주 묻는 질문
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* 하단 저작권 및 법적 링크 */}
        <div className="border-t border-[#e2e8f0] mt-8 pt-6 text-center space-y-2">
          <div className="flex justify-center gap-4">
            <Link href="/privacy-policy" className="text-sm text-[#475569] hover:text-[#1d4ed8] transition-colors duration-150">
              개인정보처리방침
            </Link>
          </div>
          <p className="text-sm text-[#64748b]">&copy; 2024 HeavyOrder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
