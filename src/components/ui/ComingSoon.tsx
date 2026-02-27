'use client';

// ComingSoon props
interface ComingSoonProps {
  title: string;        // 기능 제목
  features: string[];   // 예정된 기능 목록
}

// API 미구현 기능 안내 컴포넌트
// 아직 백엔드에서 구현되지 않은 기능 표시용
export default function ComingSoon({ title, features }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      {/* 공구 아이콘 */}
      <svg
        className="w-16 h-16 text-[#f59e0b] mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z"
        />
      </svg>

      {/* 제목 */}
      <h2 className="text-xl font-semibold text-[#f5f5f5] mb-2">{title}</h2>

      {/* "준비 중" 텍스트 */}
      <p className="text-sm text-[#a0a0a0] mb-6">이 기능은 현재 준비 중입니다</p>

      {/* 예정 기능 목록 */}
      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5 max-w-sm w-full">
        <h3 className="text-sm font-medium text-[#a0a0a0] mb-3">예정된 기능</h3>
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-[#e5e5e5]">
              {/* 체크 아이콘 (회색, 미완성 느낌) */}
              <svg
                className="w-4 h-4 text-[#333] flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
              </svg>
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
