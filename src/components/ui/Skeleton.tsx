'use client';

// 스켈레톤 props
interface SkeletonProps {
  variant?: 'text' | 'card' | 'table-row'; // 표시 형태
  count?: number;                           // 반복 횟수
}

// 로딩 스켈레톤 컴포넌트
// 데이터 로딩 중 placeholder로 사용
export default function Skeleton({
  variant = 'text',
  count = 1,
}: SkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  // text 형태: 한 줄 막대
  if (variant === 'text') {
    return (
      <>
        {items.map((i) => (
          <div
            key={i}
            className="h-4 bg-[#1a1a1a] animate-pulse rounded mb-2 last:mb-0"
            style={{ width: `${70 + Math.random() * 30}%` }}
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
            className="bg-[#1a1a1a] animate-pulse rounded-xl border border-[#2a2a2a] p-5 mb-3 last:mb-0"
          >
            <div className="h-4 bg-[#222] rounded w-1/3 mb-3" />
            <div className="h-3 bg-[#222] rounded w-2/3 mb-2" />
            <div className="h-3 bg-[#222] rounded w-1/2" />
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
          <tr key={i} className="border-b border-[#2a2a2a]">
            <td colSpan={100} className="px-4 py-3">
              <div className="h-4 bg-[#1a1a1a] animate-pulse rounded w-full" />
            </td>
          </tr>
        ))}
      </>
    );
  }

  return null;
}
