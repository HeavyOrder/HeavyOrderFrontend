'use client';

// 스켈레톤 props
interface SkeletonProps {
  variant?: 'text' | 'card' | 'table-row'; // 표시 형태
  count?: number;                           // 반복 횟수
}

// 로딩 스켈레톤 컴포넌트 (노년층 라이트 테마)
export default function Skeleton({
  variant = 'text',
  count = 1,
}: SkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  // text 형태: 한 줄 막대 (고정 너비로 SSR hydration 버그 방지)
  const textWidths = ['75%', '85%', '60%', '80%', '70%'];
  if (variant === 'text') {
    return (
      <>
        {items.map((i) => (
          <div
            key={i}
            className="h-5 bg-[#e2e8f0] animate-pulse rounded mb-2 last:mb-0"
            style={{ width: textWidths[i % textWidths.length] }}
          />
        ))}
      </>
    );
  }

  // card 형태: 카드 모양 사각형
  if (variant === 'card') {
    return (
      <>
        {items.map((i) => (
          <div
            key={i}
            className="bg-[#f1f3f5] animate-pulse rounded-2xl border border-[#e2e8f0] p-6 mb-3 last:mb-0"
          >
            <div className="h-5 bg-[#e2e8f0] rounded w-1/3 mb-3" />
            <div className="h-4 bg-[#e2e8f0] rounded w-2/3 mb-2" />
            <div className="h-4 bg-[#e2e8f0] rounded w-1/2" />
          </div>
        ))}
      </>
    );
  }

  // table-row 형태: 테이블 행
  if (variant === 'table-row') {
    return (
      <>
        {items.map((i) => (
          <tr key={i} className="border-b border-[#f1f3f5]">
            <td colSpan={100} className="px-5 py-4">
              <div className="h-5 bg-[#e2e8f0] animate-pulse rounded w-full" />
            </td>
          </tr>
        ))}
      </>
    );
  }

  return null;
}
