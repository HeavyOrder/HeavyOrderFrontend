'use client';

import Link from 'next/link';

// 빈 상태 props
interface EmptyStateProps {
  title: string;               // 제목
  description?: string;        // 설명 (선택)
  action?: {
    label: string;             // 버튼 텍스트
    href?: string;             // 링크 URL
    onClick?: () => void;      // 클릭 핸들러
  };
}

// 데이터 없음 표시 컴포넌트 (노년층 라이트 테마)
export default function EmptyState({
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* 아이콘: 빈 박스 - 노년층 기준: 라이트 배경에 맞는 연한 색상 */}
      <svg
        className="w-16 h-16 text-[#cbd5e1] mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>

      {/* 제목 - 노년층 기준: 더 크고 선명하게 */}
      <h3 className="text-lg font-semibold text-[#475569] mb-1">{title}</h3>

      {/* 설명 */}
      {description && (
        <p className="text-base text-[#64748b] mb-6 text-center max-w-sm">
          {description}
        </p>
      )}

      {/* 액션 버튼/링크 - 노년층 기준: 큰 버튼 */}
      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="
              px-6 py-3.5 rounded-lg text-base font-semibold
              bg-[#1d4ed8] text-white hover:bg-[#1e40af]
              transition-colors duration-150
            "
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="
              px-6 py-3.5 rounded-lg text-base font-semibold
              bg-[#1d4ed8] text-white hover:bg-[#1e40af]
              transition-colors duration-150
            "
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
