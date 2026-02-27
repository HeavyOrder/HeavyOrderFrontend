'use client';

import { ReactNode } from 'react';

// 통계 카드 props
interface StatCardProps {
  label: string;               // 라벨 텍스트
  value: number | string;      // 수치 값
  icon?: ReactNode;            // 아이콘 (선택)
  color?: 'blue' | 'amber' | 'green' | 'red'; // 액센트 색상
}

// 색상별 아이콘 배경 스타일
const colorStyles: Record<NonNullable<StatCardProps['color']>, string> = {
  blue: 'bg-[#3b82f6]/10 text-[#3b82f6]',
  amber: 'bg-[#f59e0b]/10 text-[#f59e0b]',
  green: 'bg-[#22c55e]/10 text-[#22c55e]',
  red: 'bg-[#ef4444]/10 text-[#ef4444]',
};

// 대시보드 요약 수치 카드 컴포넌트
// 주문 건수, 매출 등 요약 표시에 사용
export default function StatCard({
  label,
  value,
  icon,
  color = 'blue',
}: StatCardProps) {
  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5 flex items-center gap-4">
      {/* 아이콘 영역 */}
      {icon && (
        <div className={`p-2.5 rounded-lg ${colorStyles[color]}`}>
          {icon}
        </div>
      )}

      {/* 텍스트 영역 */}
      <div>
        {/* 수치: 모노스페이스 폰트로 표시 */}
        <div className="font-mono text-2xl font-semibold text-[#f5f5f5]">
          {value}
        </div>
        {/* 라벨 */}
        <div className="text-sm text-[#a0a0a0] mt-0.5">
          {label}
        </div>
      </div>
    </div>
  );
}
