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

// 탭 필터 컴포넌트
// 주문 상태별 필터링 등에 사용
export default function Tabs({ tabs, activeKey, onChange }: TabsProps) {
  return (
    <div className="flex border-b border-[#2a2a2a]">
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`
              px-4 py-2.5 text-sm font-medium transition-colors duration-150
              border-b-2 -mb-px
              ${
                isActive
                  ? 'text-[#3b82f6] border-[#3b82f6]'
                  : 'text-[#666] border-transparent hover:text-[#a0a0a0]'
              }
            `}
          >
            {tab.label}
            {/* 건수 뱃지 */}
            {tab.count !== undefined && (
              <span
                className={`
                  ml-2 px-1.5 py-0.5 text-xs rounded-full
                  ${isActive ? 'bg-[#3b82f6]/10 text-[#3b82f6]' : 'bg-[#1a1a1a] text-[#666]'}
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
