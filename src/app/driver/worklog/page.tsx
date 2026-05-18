'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRoleGuard } from '@/lib/hooks';
import { worklogApi } from '@/lib/api';
import { Skeleton, ConfirmModal, EmptyState } from '@/components/ui';
import { WorkLogResponse } from '@/types';
import { formatDate, formatDateTime } from '@/lib/utils';

export default function WorklogListPage() {
  const { isAuthorized, isLoading: authLoading } = useRoleGuard(['DRIVER']);
  const [worklogs, setWorklogs] = useState<WorkLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // 이번 달 기본 범위
  const today = new Date();
  const defaultFrom = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`;
  const defaultTo = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  const fetchWorklogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await worklogApi.getList({ from, to, sort: 'dateTime,desc', size: 50 });
      setWorklogs(res.data.data?.content || []);
    } catch {
      setWorklogs([]);
    }
    setLoading(false);
  }, [from, to]);

  useEffect(() => {
    if (isAuthorized) fetchWorklogs();
  }, [isAuthorized, fetchWorklogs]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await worklogApi.delete(deleteTarget);
      await fetchWorklogs();
    } catch { /* ignore */ }
    setDeleting(false);
    setDeleteTarget(null);
  };

  if (authLoading || !isAuthorized) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Skeleton variant="card" count={2} />
    </div>
  );

  // 월별 총 가동시간 합산
  const totalHours = worklogs.reduce((sum, w) => sum + w.workingHour, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold text-[#1e293b]">작업일지</h1>
        <Link
          href="/driver/worklog/new"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          작업일지 등록
        </Link>
      </div>
      <p className="text-sm text-[#475569] mb-6">일일 작업 기록을 관리합니다</p>

      {/* 기간 필터 */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-4 mb-4 flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-[#1e293b]">조회 기간</span>
        <input
          type="date"
          value={from}
          onChange={e => setFrom(e.target.value)}
          className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#1e293b] focus:outline-none focus:border-[#1d4ed8]"
        />
        <span className="text-sm text-[#475569]">~</span>
        <input
          type="date"
          value={to}
          onChange={e => setTo(e.target.value)}
          className="border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#1e293b] focus:outline-none focus:border-[#1d4ed8]"
        />
        <button
          onClick={fetchWorklogs}
          className="px-4 py-2 text-sm font-medium bg-[#eff6ff] text-[#1d4ed8] rounded-lg hover:bg-[#dbeafe] transition-colors"
        >
          조회
        </button>
        {worklogs.length > 0 && (
          <span className="ml-auto text-sm text-[#475569]">
            총 <span className="font-semibold text-[#1d4ed8]">{totalHours.toFixed(1)}시간</span> 가동
          </span>
        )}
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5">
          <Skeleton variant="table-row" count={3} />
        </div>
      ) : worklogs.length === 0 ? (
        <EmptyState title="작업일지가 없습니다" description="이 기간에 등록된 작업일지가 없습니다" />
      ) : (
        <div className="space-y-3">
          {worklogs.map(w => (
            <div
              key={w.id}
              className="bg-white border border-[#e2e8f0] rounded-xl p-4 hover:border-[#bfdbfe] transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-[#1e293b]">{w.location}</h3>
                  <p className="text-xs text-[#475569] mt-0.5">{formatDateTime(w.dateTime)}</p>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-[#eff6ff] text-[#1d4ed8] rounded-full border border-[#bfdbfe]">
                  {w.workingHour.toFixed(1)}시간
                </span>
              </div>

              {w.description && (
                <p className="text-xs text-[#475569] mb-2 line-clamp-2">{w.description}</p>
              )}

              {w.photos.length > 0 && (
                <p className="text-xs text-[#94a3b8] mb-2">사진 {w.photos.length}장</p>
              )}

              <div className="flex items-center gap-3 pt-2 border-t border-[#f1f5f9]">
                <Link
                  href={`/driver/worklog/${w.id}`}
                  className="text-xs text-[#1d4ed8] hover:text-[#1e40af] font-medium transition-colors"
                >
                  상세보기
                </Link>
                <button
                  onClick={() => setDeleteTarget(w.id)}
                  className="text-xs text-[#b91c1c] hover:text-[#f87171] transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="작업일지 삭제"
        message="이 작업일지를 삭제하시겠습니까? 첨부된 사진도 함께 삭제됩니다."
        confirmText="삭제"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
