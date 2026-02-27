'use client';

import { SelectHTMLAttributes } from 'react';

// 셀렉트 옵션 정의
interface SelectOption {
  value: string;  // 옵션 값
  label: string;  // 표시 텍스트
}

// 셀렉트 props
interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;          // 라벨 텍스트
  error?: string;          // 에러 메시지
  options: SelectOption[]; // 옵션 목록
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void; // 변경 핸들러
}

// 다크 테마 셀렉트 컴포넌트
// Input과 동일한 다크 스타일 적용
export default function Select({
  label,
  error,
  options,
  className = '',
  onChange,
  ...props
}: SelectProps) {
  return (
    <div className="w-full">
      {/* 라벨 */}
      {label && (
        <label className="block text-sm font-medium text-[#a0a0a0] mb-1.5">
          {label}
          {props.required && <span className="text-[#ef4444] ml-1">*</span>}
        </label>
      )}

      {/* 셀렉트 입력 */}
      <select
        className={`
          w-full px-3 py-2 rounded-lg text-sm appearance-none
          bg-[#111] border text-[#e5e5e5]
          focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30 focus:border-[#3b82f6]
          disabled:opacity-40 disabled:cursor-not-allowed
          ${error ? 'border-[#ef4444]' : 'border-[#2a2a2a]'}
          ${className}
        `}
        onChange={onChange}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23666' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 0.75rem center',
          paddingRight: '2.5rem',
        }}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* 에러 메시지 */}
      {error && <p className="mt-1 text-xs text-[#ef4444]">{error}</p>}
    </div>
  );
}
