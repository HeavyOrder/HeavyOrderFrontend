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

// 라이트 테마 셀렉트 컴포넌트 (노년층 고대비)
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
      {/* 라벨 - 노년층 기준: 크고 선명하게 */}
      {label && (
        <label className="block text-base font-semibold text-[#1e293b] mb-2">
          {label}
          {props.required && <span className="text-[#b91c1c] ml-1">*</span>}
        </label>
      )}

      {/* 셀렉트 입력 - 노년층 기준: py-3.5로 48px+ 높이 */}
      <select
        className={`
          w-full px-4 py-3.5 rounded-lg text-lg appearance-none
          bg-white border-2 text-[#1e293b]
          focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8]
          disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors duration-150
          ${error ? 'border-[#b91c1c]' : 'border-[#e2e8f0]'}
          ${className}
        `}
        onChange={onChange}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='%23475569' viewBox='0 0 16 16'%3E%3Cpath d='M8 11L3 6h10l-5 5z'/%3E%3C/svg%3E")`,
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
      {error && <p className="mt-1.5 text-sm text-[#b91c1c]">{error}</p>}
    </div>
  );
}
