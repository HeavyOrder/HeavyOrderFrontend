'use client';

// 탭 아이템 정의
interface Tab {
  key: string;      // 탭 식별 키
  label: string;    // 표시 텍스트
  count?: number;   // 건수 뱃지 (선택)
}

// 탭 컴포넌트 props
interface TabsProps {
  tabs: Tab[];              // 탭 목록
  activeKey: string;        // 현재 활성 탭 키
  onChange: (key: string) => void; // 탭 변경 핸들러
}

// 탭 필터 컴포넌트 (노년층 라이트 테마)
export default function Tabs({ tabs, activeKey, onChange }: TabsProps) {
  return (
    <div className="flex border-b border-[#e2e8f0]">
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`
              px-5 py-3.5 text-base font-semibold transition-colors duration-150
              border-b-2 -mb-px
              ${
                isActive
                  ? 'text-[#1d4ed8] border-[#1d4ed8]'
                  : 'text-[#64748b] border-transparent hover:text-[#1e293b] hover:bg-[#f8f9fa]'
              }
            `}
          >
            {tab.label}
            {/* 건수 뱃지 - 노년층 기준: 더 큰 크기 */}
            {tab.count !== undefined && (
              <span
                className={`
                  ml-2 px-2 py-0.5 text-sm rounded-full font-medium
                  ${isActive ? 'bg-[#dbeafe] text-[#1d4ed8]' : 'bg-[#f1f3f5] text-[#475569]'}
                `}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
