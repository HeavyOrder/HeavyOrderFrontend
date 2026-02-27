'use client';

import { ReactNode } from 'react';

// 검색바 props
interface SearchBarProps {
  placeholder?: string;       // 플레이스홀더
  value: string;              // 검색어
  onChange: (value: string) => void; // 검색어 변경
  onSearch: () => void;       // 검색 실행
  children?: ReactNode;       // 추가 필터 슬롯
}

// 검색바 + 필터 슬롯 컴포넌트
// 부품 검색, 주문 검색 등에 사용
export default function SearchBar({
  placeholder = '검색어를 입력하세요',
  value,
  onChange,
  onSearch,
  children,
}: SearchBarProps) {
  // Enter 키로 검색 실행
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* 검색 입력 필드 */}
      <div className="relative flex-1 min-w-[200px]">
        {/* 돋보기 아이콘 */}
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="
            w-full pl-10 pr-3 py-2 rounded-lg text-sm
            bg-[#111] border border-[#2a2a2a] text-[#e5e5e5]
            placeholder:text-[#666]
            focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30 focus:border-[#3b82f6]
          "
        />
      </div>

      {/* 추가 필터 슬롯 (셀렉트 등) */}
      {children}

      {/* 검색 버튼 */}
      <button
        onClick={onSearch}
        className="
          px-4 py-2 rounded-lg text-sm font-medium
          bg-[#3b82f6] text-white hover:bg-[#2563eb]
          transition-colors duration-150
        "
      >
        검색
      </button>
    </div>
  );
}
