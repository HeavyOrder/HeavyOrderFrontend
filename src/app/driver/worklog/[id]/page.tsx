'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { useRoleGuard } from '@/lib/hooks';
import { worklogApi } from '@/lib/api';
import { Skeleton, ConfirmModal } from '@/components/ui';
import { WorkLogResponse, WorkLogPhotoType, WorkLogPhotoTypeLabel } from '@/types';
import { formatDateTime } from '@/lib/utils';

export default function WorklogDetailPage() {
  const { isAuthorized, isLoading: authLoading } = useRoleGuard(['DRIVER']);
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const worklogId = Number(id);

  const [worklog, setWorklog] = useState<WorkLogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // 수정 폼 상태
  const [form, setForm] = useState({
    location: '',
    dateTime: '',
    description: '',
    workingHour: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // 삭제
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // 사진 업로드
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoType, setPhotoType] = useState<WorkLogPhotoType>('WORK');
  const [uploading, setUploading] = useState(false);
  const [photoDeleteTarget, setPhotoDeleteTarget] = useState<number | null>(null);
  const [photoDeleting, setPhotoDeleting] = useState(false);

  const fetchWorklog = async () => {
    setLoading(true);
    try {
      const res = await worklogApi.getOne(worklogId);
      const data = res.data.data;
      if (data) {
        setWorklog(data);
        // dateTime에서 seconds 제거 (datetime-local input용)
        const dt = data.dateTime.substring(0, 16);
        setForm({
          location: data.location,
          dateTime: dt,
          description: data.description || '',
          workingHour: String(data.workingHour),
        });
      }
    } catch { /* 404 or 401 */ }
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthorized) fetchWorklog();
  }, [isAuthorized, worklogId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const workingHour = parseFloat(form.workingHour);
    if (!form.location.trim()) { setFormError('현장명을 입력해주세요.'); return; }
    if (isNaN(workingHour) || workingHour < 0) { setFormError('가동시간을 올바르게 입력해주세요.'); return; }

    setSubmitting(true);
    try {
      await worklogApi.update(worklogId, {
        location: form.location.trim(),
        dateTime: form.dateTime + ':00',
        description: form.description.trim() || undefined,
        workingHour,
      });
      setIsEditing(false);
      await fetchWorklog();
    } catch {
      setFormError('수정에 실패했습니다. 다시 시도해주세요.');
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await worklogApi.delete(worklogId);
      router.push('/driver/worklog');
    } catch { /* ignore */ }
    setDeleting(false);
    setDeleteOpen(false);
  };

  const handlePhotoUpload = async () => {
    if (photoFiles.length === 0) return;
    setUploading(true);
    try {
      await worklogApi.uploadPhotos(worklogId, photoFiles, photoType);
      setPhotoFiles([]);
      await fetchWorklog();
    } catch { /* ignore */ }
    setUploading(false);
  };

  const handlePhotoDelete = async () => {
    if (!photoDeleteTarget) return;
    setPhotoDeleting(true);
    try {
      await worklogApi.deletePhoto(photoDeleteTarget);
      setPhotoDeleteTarget(null);
      await fetchWorklog();
    } catch { /* ignore */ }
    setPhotoDeleting(false);
  };

  if (authLoading || !isAuthorized) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Skeleton variant="card" count={2} />
    </div>
  );

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Skeleton variant="card" count={3} />
    </div>
  );

  if (!worklog) return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 text-center">
      <p className="text-[#475569]">작업일지를 찾을 수 없습니다.</p>
      <button onClick={() => router.push('/driver/worklog')} className="mt-4 text-sm text-[#1d4ed8]">
        목록으로
      </button>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-5">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 text-[#475569] hover:text-[#1d4ed8] rounded-lg hover:bg-[#f8f9fa] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-[#1e293b] flex-1">작업일지 상세</h1>
        {!isEditing && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 text-xs font-medium text-[#1d4ed8] border border-[#bfdbfe] rounded-lg hover:bg-[#eff6ff] transition-colors"
            >
              수정
            </button>
            <button
              onClick={() => setDeleteOpen(true)}
              className="px-3 py-1.5 text-xs font-medium text-[#b91c1c] border border-[#fecaca] rounded-lg hover:bg-[#fef2f2] transition-colors"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      {/* 상세 / 수정 폼 */}
      {isEditing ? (
        <form onSubmit={handleUpdate} className="bg-white border border-[#e2e8f0] rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-[#1e293b]">작업일지 수정</h2>

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">
              현장명 <span className="text-[#b91c1c]">*</span>
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              maxLength={200}
              className="w-full border border-[#e2e8f0] rounded-lg px-4 py-2.5 text-sm text-[#1e293b] focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8]"
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
              min={0}
              step={0.1}
              className="w-full border border-[#e2e8f0] rounded-lg px-4 py-2.5 text-sm text-[#1e293b] focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">작업 내용</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              maxLength={1000}
              rows={4}
              className="w-full border border-[#e2e8f0] rounded-lg px-4 py-2.5 text-sm text-[#1e293b] focus:outline-none focus:border-[#1d4ed8] focus:ring-1 focus:ring-[#1d4ed8] resize-none"
            />
          </div>

          {formError && (
            <p className="text-sm text-[#b91c1c] bg-[#fef2f2] border border-[#fecaca] rounded-lg px-4 py-2">
              {formError}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setIsEditing(false); setFormError(''); }}
              className="flex-1 py-2.5 text-sm font-medium text-[#475569] border border-[#e2e8f0] rounded-xl hover:bg-[#f8f9fa] transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 text-sm font-semibold bg-[#1d4ed8] text-white rounded-xl hover:bg-[#1e40af] disabled:opacity-50 transition-colors"
            >
              {submitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#1e293b]">{worklog.location}</h2>
            <span className="px-3 py-1 text-sm font-semibold bg-[#eff6ff] text-[#1d4ed8] rounded-full border border-[#bfdbfe]">
              {worklog.workingHour.toFixed(1)}시간
            </span>
          </div>
          <div className="text-sm text-[#475569]">{formatDateTime(worklog.dateTime)}</div>
          {worklog.description && (
            <p className="text-sm text-[#374151] leading-relaxed whitespace-pre-wrap">{worklog.description}</p>
          )}
          <div className="text-xs text-[#94a3b8] pt-2 border-t border-[#f1f5f9]">
            등록: {formatDateTime(worklog.createdAt)} · 수정: {formatDateTime(worklog.updatedAt)}
          </div>
        </div>
      )}

      {/* 사진 섹션 */}
      <div className="bg-white border border-[#e2e8f0] rounded-xl p-5">
        <h2 className="text-sm font-semibold text-[#1e293b] mb-4">
          첨부 사진 ({worklog.photos.length}장)
        </h2>

        {worklog.photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            {worklog.photos.map(photo => (
              <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-[#e2e8f0]">
                <div className="relative aspect-square">
                  <Image
                    src={photo.url}
                    alt={WorkLogPhotoTypeLabel[photo.type]}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1 flex items-center justify-between">
                  <span className="text-xs text-white">{WorkLogPhotoTypeLabel[photo.type]}</span>
                  <button
                    onClick={() => setPhotoDeleteTarget(photo.id)}
                    className="text-xs text-red-300 hover:text-red-100"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 사진 추가 업로드 */}
        <div className="border border-[#f1f5f9] rounded-lg p-3 space-y-3">
          <p className="text-xs font-medium text-[#475569]">사진 추가 업로드</p>
          <div className="flex items-center gap-2">
            <select
              value={photoType}
              onChange={e => setPhotoType(e.target.value as WorkLogPhotoType)}
              className="border border-[#e2e8f0] rounded-lg px-3 py-1.5 text-xs text-[#1e293b] focus:outline-none focus:border-[#1d4ed8]"
            >
              {(Object.keys(WorkLogPhotoTypeLabel) as WorkLogPhotoType[]).map(t => (
                <option key={t} value={t}>{WorkLogPhotoTypeLabel[t]}</option>
              ))}
            </select>
            <input
              type="file"
              accept="image/jpg,image/jpeg,image/png,image/webp"
              multiple
              onChange={e => setPhotoFiles(e.target.files ? Array.from(e.target.files) : [])}
              className="flex-1 text-xs text-[#475569] file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-[#eff6ff] file:text-[#1d4ed8]"
            />
          </div>
          <button
            type="button"
            onClick={handlePhotoUpload}
            disabled={photoFiles.length === 0 || uploading}
            className="px-4 py-1.5 text-xs font-medium bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] disabled:opacity-50 transition-colors"
          >
            {uploading ? '업로드 중...' : `${photoFiles.length}장 업로드`}
          </button>
        </div>
      </div>

      {/* 삭제 모달 */}
      <ConfirmModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="작업일지 삭제"
        message="이 작업일지를 삭제하시겠습니까? 첨부된 사진도 함께 삭제됩니다."
        confirmText="삭제"
        variant="danger"
        loading={deleting}
      />

      {/* 사진 삭제 모달 */}
      <ConfirmModal
        isOpen={photoDeleteTarget !== null}
        onClose={() => setPhotoDeleteTarget(null)}
        onConfirm={handlePhotoDelete}
        title="사진 삭제"
        message="이 사진을 삭제하시겠습니까?"
        confirmText="삭제"
        variant="danger"
        loading={photoDeleting}
      />
    </div>
  );
}
