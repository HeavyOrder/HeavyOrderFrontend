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

// 검색바 + 필터 슬롯 컴포넌트 (노년층 라이트 테마)
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
        {/* 돋보기 아이콘 - 노년층 기준: 더 크게 */}
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]"
          width="20"
          height="20"
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
            w-full pl-12 pr-4 py-3.5 rounded-lg text-lg
            bg-white border-2 border-[#e2e8f0] text-[#1e293b]
            placeholder:text-[#94a3b8]
            focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8]
            transition-colors duration-150
          "
        />
      </div>

      {/* 추가 필터 슬롯 (셀렉트 등) */}
      {children}

      {/* 검색 버튼 - 노년층 기준: 입력 필드와 높이 일치, 큰 텍스트 */}
      <button
        onClick={onSearch}
        className="
          px-5 py-3.5 rounded-lg text-lg font-semibold
          bg-[#1d4ed8] text-white hover:bg-[#1e40af]
          transition-colors duration-150
        "
      >
        검색
      </button>
    </div>
  );
}
