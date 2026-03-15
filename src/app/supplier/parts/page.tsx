'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRoleGuard } from '@/lib/hooks';
import { partsApi } from '@/lib/api';
import { Skeleton, EmptyState, ImageCropper, Modal } from '@/components/ui';
import { PartResponse } from '@/types';
import { formatCurrency } from '@/lib/utils';

const ASPECT_RATIOS = [
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
];

export default function SupplierParts() {
  const { isAuthorized, isLoading: authLoading, user } = useRoleGuard(['SUPPLIER']);
  const [parts, setParts] = useState<PartResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // 이미지 업로드 상태
  const [uploadTarget, setUploadTarget] = useState<PartResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState(1);
  const [showCropper, setShowCropper] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    if (!isAuthorized) return;
    try {
      const res = await partsApi.getList();
      const myParts = (res.data.data || []).filter(
        p => p.supplier === user?.businessName
      );
      setParts(myParts);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthorized, user]);

  if (authLoading || !isAuthorized) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Skeleton variant="card" count={2} />
    </div>
  );

  const filtered = parts.filter(p => !search || p.name.includes(search));

  const openUploadModal = (part: PartResponse) => {
    setUploadTarget(part);
    setCroppedFile(null);
    setCroppedPreviewUrl(null);
    setUploadError('');
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError('jpg, png, webp 파일만 업로드 가능합니다.');
      setUploadTarget(null);
      return;
    }
    setUploadError('');
    setSelectedFile(file);
    setShowCropper(true);
    e.target.value = '';
  };

  const handleCropDone = (file: File) => {
    setCroppedFile(file);
    const url = URL.createObjectURL(file);
    setCroppedPreviewUrl(url);
    setShowCropper(false);
    setSelectedFile(null);
  };

  const handleUpload = async () => {
    if (!uploadTarget || !croppedFile) return;
    setUploading(true);
    setUploadError('');
    try {
      await partsApi.uploadImage(uploadTarget.id, croppedFile);
      // 업로드 후 목록 새로고침
      await load();
      setUploadTarget(null);
      setCroppedFile(null);
      setCroppedPreviewUrl(null);
    } catch {
      setUploadError('이미지 업로드에 실패했습니다.');
    }
    setUploading(false);
  };

  const closeUploadModal = () => {
    setUploadTarget(null);
    setCroppedFile(null);
    if (croppedPreviewUrl) URL.revokeObjectURL(croppedPreviewUrl);
    setCroppedPreviewUrl(null);
    setShowCropper(false);
    setSelectedFile(null);
    setUploadError('');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

        {/* 헤더 */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#0f172a]">부품 관리</h1>
              <p className="text-base text-[#475569] mt-0.5">등록된 부품을 관리합니다</p>
            </div>
            <Link
              href="/supplier/parts/register"
              className="flex items-center gap-2 px-4 py-3 bg-[#1d4ed8] text-white text-base font-semibold rounded-xl hover:bg-[#1e40af] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              부품 등록
            </Link>
          </div>
        </div>

        {/* 검색 */}
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="부품명 검색..."
            className="w-full pl-12 pr-4 py-3.5 rounded-xl text-base bg-white border-2 border-[#e2e8f0] text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#1d4ed8] transition-colors"
          />
        </div>

        {/* 부품 목록 */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6"><Skeleton variant="text" count={5} /></div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="등록된 부품이 없습니다"
              description="새 부품을 등록해보세요"
              action={{ label: '부품 등록', href: '/supplier/parts/register' }}
            />
          ) : (
            <div className="divide-y divide-[#f1f3f5]">
              {/* 헤더 행 */}
              <div className="grid grid-cols-[80px_1fr_120px_96px] gap-3 px-5 py-3 bg-[#f8f9fa] text-sm font-bold text-[#475569]">
                <span>이미지</span>
                <span>부품명</span>
                <span>가격</span>
                <span className="text-center">사진 관리</span>
              </div>

              {filtered.map(part => (
                <div key={part.id} className="grid grid-cols-[80px_1fr_120px_96px] gap-3 px-5 py-4 items-center hover:bg-[#f8f9fa] transition-colors">
                  {/* 썸네일 */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#e2e8f0] bg-[#f8f9fa] flex items-center justify-center flex-shrink-0">
                    {part.imageUrl ? (
                      <Image
                        src={part.imageUrl}
                        alt={part.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-7 h-7 text-[#cbd5e1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>

                  {/* 부품명 + ID */}
                  <div className="min-w-0">
                    <p className="text-base font-medium text-[#1e293b] truncate">{part.name}</p>
                    <p className="text-sm text-[#94a3b8] font-mono mt-0.5">#{part.id}</p>
                  </div>

                  {/* 가격 */}
                  <span className="text-base font-mono text-[#1e293b]">{formatCurrency(part.price)}</span>

                  {/* 이미지 업로드 버튼 */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => openUploadModal(part)}
                      title={part.imageUrl ? '이미지 변경' : '이미지 업로드'}
                      className={`p-2.5 rounded-lg transition-colors
                        ${part.imageUrl
                          ? 'text-[#1d4ed8] hover:bg-[#eff6ff]'
                          : 'text-[#94a3b8] hover:bg-[#f8f9fa] hover:text-[#1d4ed8]'
                        }`}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 숨겨진 파일 input (목록 페이지용) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={handleFileSelect}
        />

        {/* 이미지 업로드 모달 (크롭 후 확인) */}
        {uploadTarget && !showCropper && (
          <Modal
            isOpen={!!uploadTarget}
            onClose={closeUploadModal}
            title={`이미지 업로드 — ${uploadTarget.name}`}
          >
            <div className="space-y-4">
              {/* 비율 선택 */}
              <div>
                <label className="block text-base font-semibold text-[#1e293b] mb-2">이미지 비율</label>
                <div className="flex gap-2">
                  {ASPECT_RATIOS.map(r => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setAspectRatio(r.value)}
                      className={`flex-1 py-2.5 text-sm font-semibold rounded-xl border-2 transition-colors
                        ${aspectRatio === r.value
                          ? 'bg-[#eff6ff] border-[#1d4ed8] text-[#1d4ed8]'
                          : 'bg-white border-[#e2e8f0] text-[#475569] hover:border-[#1d4ed8]/40'
                        }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 크롭된 이미지 미리보기 */}
              {croppedPreviewUrl ? (
                <div className="space-y-3">
                  <div className="relative rounded-xl overflow-hidden border-2 border-[#e2e8f0] bg-[#f8f9fa]"
                    style={{ aspectRatio: aspectRatio }}>
                    <Image
                      src={croppedPreviewUrl}
                      alt="미리보기"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-3 text-base font-semibold border-2 border-[#e2e8f0] text-[#475569] rounded-xl hover:bg-[#f8f9fa] transition-colors"
                  >
                    다른 이미지 선택
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-[#bfdbfe] rounded-2xl p-8 flex flex-col items-center gap-3 hover:border-[#1d4ed8] hover:bg-[#eff6ff] transition-colors"
                >
                  <div className="w-12 h-12 bg-[#eff6ff] rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-[#1d4ed8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-base font-semibold text-[#1d4ed8]">이미지 선택</p>
                  <p className="text-sm text-[#94a3b8]">jpg, png, webp</p>
                </button>
              )}

              {uploadError && (
                <div className="text-base text-[#b91c1c] bg-[#fef2f2] border border-[#fecaca] rounded-xl px-4 py-3">
                  {uploadError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={closeUploadModal}
                  className="flex-1 py-3 text-base font-semibold border-2 border-[#e2e8f0] text-[#475569] rounded-xl hover:bg-[#f8f9fa] transition-colors"
                >
                  취소
                </button>
                {croppedFile && (
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={uploading}
                    className="flex-1 py-3 text-base font-semibold bg-[#1d4ed8] text-white rounded-xl hover:bg-[#1e40af] disabled:opacity-50 transition-colors"
                  >
                    {uploading ? '업로드 중...' : '업로드'}
                  </button>
                )}
              </div>
            </div>
          </Modal>
        )}

        {/* 이미지 크롭 모달 */}
        {showCropper && selectedFile && (
          <Modal
            isOpen={showCropper}
            onClose={() => { setShowCropper(false); setSelectedFile(null); }}
            title="이미지 편집"
          >
            <div className="space-y-3">
              {/* 비율 선택 (크롭 모달에서도) */}
              <div className="flex gap-2">
                {ASPECT_RATIOS.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setAspectRatio(r.value)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-xl border-2 transition-colors
                      ${aspectRatio === r.value
                        ? 'bg-[#eff6ff] border-[#1d4ed8] text-[#1d4ed8]'
                        : 'bg-white border-[#e2e8f0] text-[#475569]'
                      }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              <ImageCropper
                file={selectedFile}
                aspectRatio={aspectRatio}
                onCrop={handleCropDone}
                onCancel={() => {
                  setShowCropper(false);
                  setSelectedFile(null);
                  setUploadTarget(null);
                }}
              />
            </div>
          </Modal>
        )}

      </div>
    </div>
  );
}
