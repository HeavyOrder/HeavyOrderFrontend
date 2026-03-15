'use client';

import { ReactNode } from 'react';
import Skeleton from './Skeleton';

// 테이블 컬럼 정의
interface Column<T> {
  key: string;           // 컬럼 식별 키
  header: string;        // 헤더 텍스트
  render?: (item: T) => ReactNode; // 커스텀 렌더 함수
  className?: string;    // 추가 스타일
}

// 테이블 props
interface TableProps<T> {
  columns: Column<T>[];          // 컬럼 목록
  data: T[];                     // 데이터 배열
  onRowClick?: (item: T) => void; // 행 클릭 핸들러
  emptyMessage?: string;         // 빈 데이터 메시지
  loading?: boolean;             // 로딩 상태
}

// 제네릭 데이터 테이블 컴포넌트 (노년층 고대비 라이트 테마)
export default function Table<T>({
  columns,
  data,
  onRowClick,
  emptyMessage = '데이터가 없습니다.',
  loading = false,
}: TableProps<T>) {
  // 로딩 중이면 스켈레톤 표시
  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f8f9fa]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-4 text-left text-sm font-bold text-[#475569] uppercase tracking-wide ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <Skeleton variant="table-row" count={5} />
          </tbody>
        </table>
      </div>
    );
  }

  // 데이터 없으면 빈 메시지 표시
  if (data.length === 0) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-[#f8f9fa]">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-5 py-4 text-left text-sm font-bold text-[#475569] uppercase tracking-wide ${col.className || ''}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
        </table>
        {/* 노년층 기준: 큰 빈 상태 메시지 */}
        <div className="py-12 text-center text-[#475569] text-base">
          {emptyMessage}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        {/* 테이블 헤더 */}
        <thead>
          <tr className="bg-[#f8f9fa]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-5 py-4 text-left text-sm font-bold text-[#475569] uppercase tracking-wide ${col.className || ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* 테이블 본문 - zebra stripe로 행 구분 용이 */}
        <tbody>
          {data.map((item, index) => (
            <tr
              key={index}
              className={`
                border-b border-[#f1f3f5] hover:bg-[#eff6ff] transition-colors duration-100
                ${index % 2 === 1 ? 'bg-[#f8f9fa]' : 'bg-white'}
                ${onRowClick ? 'cursor-pointer' : ''}
              `}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-5 py-4 text-base text-[#1e293b] ${col.className || ''}`}
                >
                  {col.render
                    ? col.render(item)
                    : String((item as Record<string, unknown>)[col.key] ?? '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
