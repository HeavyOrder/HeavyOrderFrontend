'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRoleGuard } from '@/lib/hooks';
import { worklogApi } from '@/lib/api';
import { Skeleton } from '@/components/ui';
import { WorkLogPhotoType, WorkLogPhotoTypeLabel } from '@/types';

export default function WorklogNewPage() {
  const { isAuthorized, isLoading: authLoading } = useRoleGuard(['DRIVER']);
  const router = useRouter();

  const now = new Date();
  const defaultDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}T09:00`;

  const [form, setForm] = useState({
    location: '',
    dateTime: defaultDateTime,
    description: '',
    workingHour: '',
  });
  const [photos, setPhotos] = useState<{ files: File[]; type: WorkLogPhotoType }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddPhotoGroup = () => {
    setPhotos(prev => [...prev, { files: [], type: 'WORK' }]);
  };

  const handlePhotoFiles = (index: number, files: FileList | null) => {
    if (!files) return;
    setPhotos(prev => prev.map((p, i) => i === index ? { ...p, files: Array.from(files) } : p));
  };

  const handlePhotoType = (index: number, type: WorkLogPhotoType) => {
    setPhotos(prev => prev.map((p, i) => i === index ? { ...p, type } : p));
  };

  const handleRemovePhotoGroup = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const workingHour = parseFloat(form.workingHour);
    if (!form.location.trim()) { setError('현장명을 입력해주세요.'); return; }
    if (isNaN(workingHour) || workingHour < 0) { setError('가동시간을 올바르게 입력해주세요.'); return; }

    setSubmitting(true);
    try {
      const res = await worklogApi.create({
        location: form.location.trim(),
        dateTime: form.dateTime + ':00', // seconds 추가
        description: form.description.trim() || undefined,
        workingHour,
      });

      const newId = res.data.data;
      if (newId && photos.length > 0) {
        for (const group of photos) {
          if (group.files.length > 0) {
            await worklogApi.uploadPhotos(newId, group.files, group.type);
          }
        }
      }

      router.push('/driver/worklog');
    } catch {
      setError('작업일지 등록에 실패했습니다. 다시 시도해주세요.');
    }
    setSubmitting(false);
  };

  if (authLoading || !isAuthorized) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Skeleton variant="card" count={2} />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 text-[#475569] hover:text-[#1d4ed8] rounded-lg hover:bg-[#f8f9fa] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-[#1e293b]">작업일지 등록</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 기본 정보 */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#1e293b]">기본 정보</h2>

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">
              현장명 <span className="text-[#b91c1c]">*</span>
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="현장명을 입력하세요"
              maxLength={200}
              className="w-full border border-[#e2e8f0] rounded-lg px-4 py-2.5 text-sm text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">
              작업 일시 <span className="text-[#b91c1c]">*</span>
            </label>
            <input
              type="datetime-local"
              name="dateTime"
              value={form.dateTime}
              onChange={handleChange}
              className="w-full border border-[#e2e8f0] rounded-lg px-4 py-2.5 text-sm text-[#1e293b] focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">
              가동시간(시간) <span className="text-[#b91c1c]">*</span>
            </label>
            <input
              type="number"
              name="workingHour"
              value={form.workingHour}
              onChange={handleChange}
              placeholder="예: 8.5"
              min={0}
              step={0.1}
              className="w-full border border-[#e2e8f0] rounded-lg px-4 py-2.5 text-sm text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">작업 내용</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="작업 내용을 입력하세요 (선택)"
              maxLength={1000}
              rows={4}
              className="w-full border border-[#e2e8f0] rounded-lg px-4 py-2.5 text-sm text-[#1e293b] placeholder-[#94a3b8] focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8] resize-none"
            />
          </div>
        </div>

        {/* 사진 첨부 */}
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#1e293b]">사진 첨부 (선택)</h2>
            <button
              type="button"
              onClick={handleAddPhotoGroup}
              className="text-xs text-[#1d4ed8] hover:text-[#1e40af] font-medium"
            >
              + 사진 그룹 추가
            </button>
          </div>

          {photos.length === 0 ? (
            <p className="text-xs text-[#94a3b8]">사진 그룹 추가 버튼을 눌러 사진을 첨부할 수 있습니다.</p>
          ) : (
            <div className="space-y-4">
              {photos.map((group, idx) => (
                <div key={idx} className="border border-[#f1f5f9] rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <select
                      value={group.type}
                      onChange={e => handlePhotoType(idx, e.target.value as WorkLogPhotoType)}
                      className="border border-[#e2e8f0] rounded-lg px-3 py-1.5 text-xs text-[#1e293b] focus:outline-none focus:border-[#1d4ed8]"
                    >
                      {(Object.keys(WorkLogPhotoTypeLabel) as WorkLogPhotoType[]).map(t => (
                        <option key={t} value={t}>{WorkLogPhotoTypeLabel[t]}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemovePhotoGroup(idx)}
                      className="text-xs text-[#b91c1c] hover:text-[#f87171]"
                    >
                      제거
                    </button>
                  </div>
                  <input
                    type="file"
                    accept="image/jpg,image/jpeg,image/png,image/webp"
                    multiple
                    onChange={e => handlePhotoFiles(idx, e.target.files)}
                    className="w-full text-xs text-[#475569] file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:bg-[#eff6ff] file:text-[#1d4ed8] hover:file:bg-[#dbeafe]"
                  />
                  {group.files.length > 0 && (
                    <p className="text-xs text-[#475569]">{group.files.length}장 선택됨</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-[#b91c1c] bg-[#fef2f2] border border-[#fecaca] rounded-lg px-4 py-2.5">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 py-3 text-sm font-medium text-[#475569] border border-[#e2e8f0] rounded-xl hover:bg-[#f8f9fa] transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 py-3 text-sm font-semibold bg-[#1d4ed8] text-white rounded-xl hover:bg-[#1e40af] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? '등록 중...' : '등록'}
          </button>
        </div>
      </form>
    </div>
  );
}
