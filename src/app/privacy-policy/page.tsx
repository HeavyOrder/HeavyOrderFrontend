import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '개인정보처리방침 - HeavyOrder',
  description: 'HeavyOrder 개인정보처리방침',
};

// 개인정보처리방침 페이지 - 구글 플레이스토어 요구사항 준수
// 로그인 없이 누구나 접근 가능한 정적 페이지
export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 페이지 제목 */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#0f172a] mb-3">개인정보처리방침</h1>
          <p className="text-base text-[#475569]">
            시행일: 2024년 1월 1일 &nbsp;|&nbsp; 최종 수정일: 2025년 3월 30일
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e2e8f0] p-8 space-y-10">

          {/* 1. 개요 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4 pb-2 border-b border-[#e2e8f0]">
              1. 개인정보처리방침 개요
            </h2>
            <p className="text-base text-[#475569] leading-relaxed">
              HeavyOrder(이하 "회사")는 중장비 부품 발주 플랫폼 서비스를 제공하면서 이용자의 개인정보를 중요시하며,
              「개인정보 보호법」 및 관련 법령을 준수합니다. 본 방침은 회사가 수집하는 개인정보의 항목,
              수집 목적, 보유 기간, 제3자 제공 여부 및 이용자의 권리에 대해 안내합니다.
            </p>
          </section>

          {/* 2. 수집하는 개인정보 항목 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4 pb-2 border-b border-[#e2e8f0]">
              2. 수집하는 개인정보 항목
            </h2>
            <div className="space-y-4">
              <div className="bg-[#f8f9fa] rounded-xl p-5">
                <h3 className="text-base font-bold text-[#1e293b] mb-3">회원 공통</h3>
                <ul className="list-disc list-inside space-y-1 text-base text-[#475569]">
                  <li>이메일 주소 (아이디로 사용)</li>
                  <li>비밀번호 (암호화 저장)</li>
                  <li>휴대폰 번호</li>
                </ul>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-5">
                <h3 className="text-base font-bold text-[#1e293b] mb-3">수리점 / 공급사 회원 추가 항목</h3>
                <ul className="list-disc list-inside space-y-1 text-base text-[#475569]">
                  <li>사업체명 (상호)</li>
                  <li>사업장 주소</li>
                  <li>위도·경도 좌표 (지도 서비스 연동용)</li>
                </ul>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-5">
                <h3 className="text-base font-bold text-[#1e293b] mb-3">장비기사 회원 추가 항목</h3>
                <ul className="list-disc list-inside space-y-1 text-base text-[#475569]">
                  <li>현재 위치 정보 (위도·경도, 수리점 검색 시 선택 제공)</li>
                </ul>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-5">
                <h3 className="text-base font-bold text-[#1e293b] mb-3">서비스 이용 과정에서 자동 수집되는 정보</h3>
                <ul className="list-disc list-inside space-y-1 text-base text-[#475569]">
                  <li>IP 주소, 접속 일시, 서비스 이용 기록</li>
                  <li>기기 정보 (운영체제, 앱 버전)</li>
                  <li>쿠키 (세션 인증용)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3. 수집 목적 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4 pb-2 border-b border-[#e2e8f0]">
              3. 개인정보 수집 및 이용 목적
            </h2>
            <ul className="space-y-3 text-base text-[#475569]">
              <li className="flex gap-3">
                <span className="text-[#1d4ed8] font-bold mt-0.5">•</span>
                <span><strong className="text-[#1e293b]">회원 가입 및 관리:</strong> 회원 식별, 본인 확인, 서비스 부정 이용 방지</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#1d4ed8] font-bold mt-0.5">•</span>
                <span><strong className="text-[#1e293b]">서비스 제공:</strong> 부품 발주·조회, 주문 처리, 예약 관리, 재고 관리</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#1d4ed8] font-bold mt-0.5">•</span>
                <span><strong className="text-[#1e293b]">위치 기반 서비스:</strong> 주변 수리점 검색, 지도 표시</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#1d4ed8] font-bold mt-0.5">•</span>
                <span><strong className="text-[#1e293b]">고객 지원:</strong> 문의 접수 및 답변, 불만 처리</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#1d4ed8] font-bold mt-0.5">•</span>
                <span><strong className="text-[#1e293b]">서비스 개선:</strong> 이용 통계 분석, 오류 개선, 신규 기능 개발</span>
              </li>
            </ul>
          </section>

          {/* 4. 개인정보 보유 및 이용 기간 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4 pb-2 border-b border-[#e2e8f0]">
              4. 개인정보 보유 및 이용 기간
            </h2>
            <p className="text-base text-[#475569] leading-relaxed mb-4">
              회사는 이용자의 개인정보를 회원 탈퇴 시까지 보유·이용합니다.
              단, 관련 법령에 의해 보존 의무가 있는 경우 해당 기간 동안 보관합니다.
            </p>
            <div className="bg-[#f8f9fa] rounded-xl overflow-hidden">
              <table className="w-full text-base">
                <thead>
                  <tr className="bg-[#1d4ed8] text-white">
                    <th className="text-left px-5 py-3 font-bold">보존 항목</th>
                    <th className="text-left px-5 py-3 font-bold">보존 근거</th>
                    <th className="text-left px-5 py-3 font-bold">보존 기간</th>
                  </tr>
                </thead>
                <tbody className="text-[#475569]">
                  <tr className="border-b border-[#e2e8f0]">
                    <td className="px-5 py-3">계약·청약 철회 기록</td>
                    <td className="px-5 py-3">전자상거래법</td>
                    <td className="px-5 py-3">5년</td>
                  </tr>
                  <tr className="border-b border-[#e2e8f0]">
                    <td className="px-5 py-3">대금 결제·공급 기록</td>
                    <td className="px-5 py-3">전자상거래법</td>
                    <td className="px-5 py-3">5년</td>
                  </tr>
                  <tr className="border-b border-[#e2e8f0]">
                    <td className="px-5 py-3">소비자 불만·분쟁 기록</td>
                    <td className="px-5 py-3">전자상거래법</td>
                    <td className="px-5 py-3">3년</td>
                  </tr>
                  <tr>
                    <td className="px-5 py-3">접속 로그 기록</td>
                    <td className="px-5 py-3">통신비밀보호법</td>
                    <td className="px-5 py-3">3개월</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 5. 제3자 제공 및 외부 서비스 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4 pb-2 border-b border-[#e2e8f0]">
              5. 제3자 제공 및 외부 서비스 이용
            </h2>
            <p className="text-base text-[#475569] leading-relaxed mb-5">
              회사는 원칙적으로 이용자의 개인정보를 외부에 제공하지 않습니다.
              단, 서비스 운영을 위해 다음 외부 서비스를 이용하며, 각 서비스의 개인정보처리방침이 적용됩니다.
            </p>
            <div className="space-y-4">
              <div className="bg-[#f8f9fa] rounded-xl p-5">
                <h3 className="text-base font-bold text-[#1e293b] mb-2">Google Analytics</h3>
                <p className="text-base text-[#475569]">
                  서비스 이용 통계 수집 목적으로 사용합니다. 수집된 데이터는 익명 처리되며
                  Google의 개인정보처리방침이 적용됩니다.
                </p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-5">
                <h3 className="text-base font-bold text-[#1e293b] mb-2">Microsoft Clarity</h3>
                <p className="text-base text-[#475569]">
                  UX 개선을 위한 세션 분석 도구로 사용합니다. 화면 기록 및 클릭 히트맵 데이터가
                  수집되며 Microsoft의 개인정보처리방침이 적용됩니다.
                </p>
              </div>
              <div className="bg-[#f8f9fa] rounded-xl p-5">
                <h3 className="text-base font-bold text-[#1e293b] mb-2">카카오 지도 API</h3>
                <p className="text-base text-[#475569]">
                  주소 검색 및 지도 표시 목적으로 사용합니다. 카카오의 개인정보처리방침이 적용됩니다.
                </p>
              </div>
            </div>
          </section>

          {/* 6. 이용자 권리 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4 pb-2 border-b border-[#e2e8f0]">
              6. 이용자의 권리 및 행사 방법
            </h2>
            <p className="text-base text-[#475569] leading-relaxed mb-4">
              이용자는 언제든지 다음 권리를 행사할 수 있습니다.
            </p>
            <ul className="space-y-3 text-base text-[#475569]">
              <li className="flex gap-3">
                <span className="text-[#1d4ed8] font-bold mt-0.5">•</span>
                <span><strong className="text-[#1e293b]">열람 요청:</strong> 보유 중인 본인의 개인정보 확인</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#1d4ed8] font-bold mt-0.5">•</span>
                <span><strong className="text-[#1e293b]">정정 요청:</strong> 잘못된 개인정보 수정</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#1d4ed8] font-bold mt-0.5">•</span>
                <span><strong className="text-[#1e293b]">삭제 요청:</strong> 개인정보 삭제 (회원 탈퇴 포함)</span>
              </li>
              <li className="flex gap-3">
                <span className="text-[#1d4ed8] font-bold mt-0.5">•</span>
                <span><strong className="text-[#1e293b]">처리 정지 요청:</strong> 개인정보 처리의 일시 정지</span>
              </li>
            </ul>
            <p className="text-base text-[#475569] mt-4 leading-relaxed">
              권리 행사는 앱 내 '계정 설정' 메뉴 또는 아래 개인정보 보호책임자 이메일로 요청하시면 됩니다.
              회사는 요청을 받은 날로부터 10일 이내에 처리하겠습니다.
            </p>
          </section>

          {/* 7. 개인정보 보호책임자 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4 pb-2 border-b border-[#e2e8f0]">
              7. 개인정보 보호책임자
            </h2>
            <div className="bg-[#f0f4ff] rounded-xl p-6 border border-[#bfdbfe]">
              <p className="text-base text-[#1e293b] font-bold mb-3">HeavyOrder 개인정보 보호책임자</p>
              <ul className="space-y-2 text-base text-[#475569]">
                <li>
                  <span className="font-bold text-[#1e293b]">이메일:</span>{' '}
                  <a
                    href="mailto:privacy@heavyorder.co.kr"
                    className="text-[#1d4ed8] underline hover:text-[#1e40af]"
                  >
                    privacy@heavyorder.co.kr
                  </a>
                </li>
              </ul>
              <p className="text-base text-[#475569] mt-4 leading-relaxed">
                개인정보 침해 관련 신고나 상담은 아래 기관에 문의하실 수 있습니다.
              </p>
              <ul className="mt-2 space-y-1 text-base text-[#475569]">
                <li>• 개인정보 침해신고센터: 국번 없이 118 (privacy.kisa.or.kr)</li>
                <li>• 개인정보 분쟁조정위원회: 1833-6972 (www.kopico.go.kr)</li>
              </ul>
            </div>
          </section>

          {/* 8. 방침 변경 안내 */}
          <section>
            <h2 className="text-xl font-bold text-[#0f172a] mb-4 pb-2 border-b border-[#e2e8f0]">
              8. 개인정보처리방침 변경 안내
            </h2>
            <p className="text-base text-[#475569] leading-relaxed">
              본 방침은 법령·정책 변경 또는 서비스 변경에 따라 내용이 수정될 수 있습니다.
              방침이 변경되면 앱 공지사항을 통해 시행 7일 전에 미리 안내합니다.
            </p>
          </section>

        </div>

        {/* 하단 날짜 */}
        <p className="text-center text-sm text-[#94a3b8] mt-8">
          본 개인정보처리방침은 2025년 3월 30일부터 시행됩니다.
        </p>
      </div>
    </div>
  );
}
