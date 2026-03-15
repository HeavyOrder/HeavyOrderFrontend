'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useRoleGuard } from '@/lib/hooks';
import { partsApi } from '@/lib/api';
import { Button, Input, Skeleton, ImageCropper, Modal } from '@/components/ui';

// 비율 옵션
const ASPECT_RATIOS = [
  { label: '정방형 (1:1)', value: 1 },
  { label: '표준 (4:3)', value: 4 / 3 },
  { label: '와이드 (16:9)', value: 16 / 9 },
];

export default function SupplierPartsRegister() {
  const router = useRouter();
  const { isAuthorized, isLoading: authLoading } = useRoleGuard(['SUPPLIER']);

  // 1단계: 기본 정보
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 2단계: 이미지 업로드
  const [step, setStep] = useState<'info' | 'image'>('info');
  const [registeredId, setRegisteredId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [croppedPreviewUrl, setCroppedPreviewUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState(1); // 기본: 정방형
  const [showCropper, setShowCropper] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1단계: 부품 등록
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    setSubmitting(true);
    setError('');
    try {
      const res = await partsApi.register({
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
      });
      const partId = res.data.data;
      if (!partId) throw new Error('부품 ID를 받지 못했습니다.');
      setRegisteredId(partId);
      setStep('image'); // 2단계로 이동
    } catch {
      setError('부품 등록에 실패했습니다. 다시 시도해주세요.');
    }
    setSubmitting(false);
  };

  // 파일 선택 처리
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // jpg, jpeg, png, webp만 허용
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      setUploadError('jpg, png, webp 파일만 업로드 가능합니다.');
      return;
    }
    setUploadError('');
    setSelectedFile(file);
    setCroppedFile(null);
    setCroppedPreviewUrl(null);
    setShowCropper(true);
    // input 값 초기화 (같은 파일 재선택 가능하도록)
    e.target.value = '';
  };

  // 크롭 완료
  const handleCropDone = (file: File) => {
    setCroppedFile(file);
    const url = URL.createObjectURL(file);
    setCroppedPreviewUrl(url);
    setShowCropper(false);
    setSelectedFile(null);
  };

  // 이미지 업로드
  const handleUpload = async () => {
    if (!registeredId || !croppedFile) return;
    setUploading(true);
    setUploadError('');
    try {
      await partsApi.uploadImage(registeredId, croppedFile);
      router.push('/supplier/parts');
    } catch {
      setUploadError('이미지 업로드에 실패했습니다. 다시 시도해주세요.');
    }
    setUploading(false);
  };

  // 이미지 없이 완료
  const handleSkip = () => {
    router.push('/supplier/parts');
  };

  if (authLoading || !isAuthorized) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Skeleton variant="card" count={1} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* 단계 표시 */}
        <div className="flex items-center gap-3 mb-6">
          <div className={`flex items-center gap-2 ${step === 'info' ? 'text-[#1d4ed8]' : 'text-[#15803d]'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white
              ${step === 'info' ? 'bg-[#1d4ed8]' : 'bg-[#15803d]'}`}>
              {step === 'info' ? '1' : '✓'}
            </div>
            <span className="text-base font-semibold">기본 정보</span>
          </div>
          <div className="flex-1 h-px bg-[#e2e8f0]" />
          <div className={`flex items-center gap-2 ${step === 'image' ? 'text-[#1d4ed8]' : 'text-[#94a3b8]'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
              ${step === 'image' ? 'bg-[#1d4ed8] text-white' : 'bg-[#e2e8f0] text-[#94a3b8]'}`}>
              2
            </div>
            <span className="text-base font-semibold">이미지 등록</span>
          </div>
        </div>

        {/* 1단계: 기본 정보 */}
        {step === 'info' && (
          <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm p-6 space-y-5">
            <div>
              <h1 className="text-xl font-bold text-[#0f172a]">부품 기본 정보</h1>
              <p className="text-base text-[#475569] mt-1">부품명, 설명, 가격을 입력하세요</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="부품명"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="예: 유압 실린더 HX-200"
                required
              />

              <div>
                <label className="block text-base font-semibold text-[#1e293b] mb-2">설명</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="부품에 대한 상세 설명을 입력하세요"
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl text-base bg-white border-2 border-[#e2e8f0] text-[#1e293b] placeholder:text-[#94a3b8] focus:outline-none focus:border-[#1d4ed8] resize-none transition-colors"
                />
              </div>

              <Input
                label="가격 (원)"
                type="number"
                min="0"
                step="100"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="예: 150000"
                required
              />

              {error && (
                <div className="text-base text-[#b91c1c] bg-[#fef2f2] border border-[#fecaca] rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button variant="secondary" type="button" onClick={() => router.back()}>
                  취소
                </Button>
                <Button type="submit" fullWidth loading={submitting}>
                  다음 단계 →
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* 2단계: 이미지 업로드 */}
        {step === 'image' && (
          <div className="bg-white border border-[#e2e8f0] rounded-2xl shadow-sm p-6 space-y-5">
            <div>
              <h1 className="text-xl font-bold text-[#0f172a]">부품 이미지 등록</h1>
              <p className="text-base text-[#475569] mt-1">{name} — 이미지를 추가하면 구매자가 더 잘 찾을 수 있습니다 (선택)</p>
            </div>

            {/* 비율 선택 */}
            <div>
              <label className="block text-base font-semibold text-[#1e293b] mb-3">이미지 비율 선택</label>
              <div className="flex gap-2">
                {ASPECT_RATIOS.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setAspectRatio(r.value)}
                    className={`flex-1 py-3 text-sm font-semibold rounded-xl border-2 transition-colors
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

            {/* 이미지 미리보기 / 업로드 영역 */}
            {croppedPreviewUrl ? (
              <div className="space-y-3">
                <label className="block text-base font-semibold text-[#1e293b]">미리보기</label>
                <div className="relative rounded-xl overflow-hidden border-2 border-[#e2e8f0] bg-[#f8f9fa]"
                  style={{ aspectRatio: aspectRatio }}>
                  <Image
                    src={croppedPreviewUrl}
                    alt="크롭된 이미지 미리보기"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 600px"
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
                className="w-full border-2 border-dashed border-[#bfdbfe] rounded-2xl p-10 flex flex-col items-center gap-3 hover:border-[#1d4ed8] hover:bg-[#eff6ff] transition-colors"
              >
                <div className="w-14 h-14 bg-[#eff6ff] rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-[#1d4ed8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-base font-semibold text-[#1d4ed8]">이미지 선택</p>
                  <p className="text-sm text-[#94a3b8] mt-1">jpg, png, webp (최대 10MB)</p>
                </div>
              </button>
            )}

            {/* 숨겨진 파일 input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
              onChange={handleFileSelect}
            />

            {uploadError && (
              <div className="text-base text-[#b91c1c] bg-[#fef2f2] border border-[#fecaca] rounded-xl px-4 py-3">
                {uploadError}
              </div>
            )}

            {/* 버튼 */}
            <div className="flex flex-col gap-3 pt-2">
              {croppedFile && (
                <Button fullWidth loading={uploading} onClick={handleUpload}>
                  이미지 업로드 후 완료
                </Button>
              )}
              <Button variant="secondary" fullWidth onClick={handleSkip}>
                {croppedFile ? '이미지 없이 완료' : '이미지 없이 등록 완료'}
              </Button>
            </div>
          </div>
        )}

        {/* 크롭 모달 */}
        {showCropper && selectedFile && (
          <Modal
            isOpen={showCropper}
            onClose={() => { setShowCropper(false); setSelectedFile(null); }}
            title="이미지 편집"
          >
            <ImageCropper
              file={selectedFile}
              aspectRatio={aspectRatio}
              onCrop={handleCropDone}
              onCancel={() => { setShowCropper(false); setSelectedFile(null); }}
            />
          </Modal>
        )}

      </div>
    </div>
  );
}
