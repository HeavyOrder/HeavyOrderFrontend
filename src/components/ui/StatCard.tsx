'use client';

import { ReactNode } from 'react';

// 통계 카드 props
interface StatCardProps {
  label: string;               // 라벨 텍스트
  value: number | string;      // 수치 값
  icon?: ReactNode;            // 아이콘 (선택)
  color?: 'blue' | 'amber' | 'green' | 'red'; // 액센트 색상
}

// 노년층 기준: 불투명 고대비 아이콘 배경
const colorStyles: Record<NonNullable<StatCardProps['color']>, string> = {
  blue:  'bg-[#dbeafe] text-[#1d4ed8]',
  amber: 'bg-[#fef3c7] text-[#b45309]',
  green: 'bg-[#dcfce7] text-[#15803d]',
  red:   'bg-[#fee2e2] text-[#b91c1c]',
};

// 대시보드 요약 수치 카드 컴포넌트 (노년층 라이트 테마)
export default function StatCard({
  label,
  value,
  icon,
  color = 'blue',
}: StatCardProps) {
  return (
    <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 flex items-center gap-5 shadow-sm">
      {/* 아이콘 영역 - 노년층 기준: 더 큰 아이콘 컨테이너 */}
      {icon && (
        <div className={`p-3.5 rounded-xl ${colorStyles[color]}`}>
          {icon}
        </div>
      )}

      {/* 텍스트 영역 */}
      <div>
        {/* 노년층 기준: 큰 수치, 진한 색상 */}
        <div className="font-mono text-3xl font-bold text-[#0f172a]">
          {value}
        </div>
        {/* 라벨 */}
        <div className="text-base text-[#475569] mt-1.5">
          {label}
        </div>
      </div>
    </div>
  );
}
