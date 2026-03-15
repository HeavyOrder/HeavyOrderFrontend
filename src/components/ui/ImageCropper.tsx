'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// 이미지 크롭 컴포넌트
// 선택한 이미지를 지정된 비율로 잘라서 업로드할 수 있게 해줌

interface CropBox {
  x: number; // 이미지 원본 좌표 기준
  y: number;
  w: number;
  h: number;
}

interface Props {
  file: File;
  aspectRatio: number; // 가로/세로 비율 (예: 1=정방형, 4/3=표준, 16/9=와이드)
  onCrop: (croppedFile: File) => void;
  onCancel: () => void;
}

const CANVAS_MAX = 480; // 캔버스 최대 표시 크기(px)

export default function ImageCropper({ file, aspectRatio, onCrop, onCancel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const scaleRef = useRef(1); // 원본 이미지 → 캔버스 표시 비율
  const [cropBox, setCropBox] = useState<CropBox>({ x: 0, y: 0, w: 0, h: 0 });
  const [ready, setReady] = useState(false);

  // 드래그 상태
  const dragging = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, bx: 0, by: 0 });

  // 캔버스에 이미지 + 크롭 오버레이 그리기
  const draw = useCallback((img: HTMLImageElement, box: CropBox, scale: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 원본 이미지 전체
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    // 어두운 오버레이
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // 크롭 영역 원본 이미지로 복원
    const cx = box.x * scale;
    const cy = box.y * scale;
    const cw = box.w * scale;
    const ch = box.h * scale;
    ctx.drawImage(img, box.x, box.y, box.w, box.h, cx, cy, cw, ch);
    // 크롭 테두리 (파란색)
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 2;
    ctx.strokeRect(cx, cy, cw, ch);
    // 모서리 핸들
    const hs = 8;
    ctx.fillStyle = '#1d4ed8';
    [[cx, cy], [cx + cw - hs, cy], [cx, cy + ch - hs], [cx + cw - hs, cy + ch - hs]].forEach(([hx, hy]) => {
      ctx.fillRect(hx, hy, hs, hs);
    });
    // 격자선 (가이드)
    ctx.strokeStyle = 'rgba(255,255,255,0.4)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath(); ctx.moveTo(cx + cw * i / 3, cy); ctx.lineTo(cx + cw * i / 3, cy + ch); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx, cy + ch * i / 3); ctx.lineTo(cx + cw, cy + ch * i / 3); ctx.stroke();
    }
  }, []);

  // 이미지 로드 및 초기화
  useEffect(() => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      imgRef.current = img;
      const canvas = canvasRef.current;
      if (!canvas) return;

      // 캔버스 크기 설정 (최대 CANVAS_MAX px에 맞춤)
      const scale = Math.min(CANVAS_MAX / img.width, CANVAS_MAX / img.height, 1);
      scaleRef.current = scale;
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      // 초기 크롭 박스: 이미지 내 가능한 최대 크기로 중앙 배치
      let w = img.width;
      let h = w / aspectRatio;
      if (h > img.height) { h = img.height; w = h * aspectRatio; }
      const box: CropBox = {
        x: Math.round((img.width - w) / 2),
        y: Math.round((img.height - h) / 2),
        w: Math.round(w),
        h: Math.round(h),
      };
      setCropBox(box);
      draw(img, box, scale);
      setReady(true);
    };
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file, aspectRatio, draw]);

  // cropBox 변경 시 다시 그리기
  useEffect(() => {
    const img = imgRef.current;
    if (!img || !ready) return;
    draw(img, cropBox, scaleRef.current);
  }, [cropBox, ready, draw]);

  // 캔버스 좌표 → 이미지 원본 좌표 변환
  const toImgCoord = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width) / scaleRef.current,
      y: (clientY - rect.top) * (canvas.height / rect.height) / scaleRef.current,
    };
  };

  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    const pos = toImgCoord(e);
    dragging.current = true;
    dragStart.current = { mx: pos.x, my: pos.y, bx: cropBox.x, by: cropBox.y };
  };

  const onDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging.current) return;
    e.preventDefault();
    const pos = toImgCoord(e);
    const dx = pos.x - dragStart.current.mx;
    const dy = pos.y - dragStart.current.my;
    const img = imgRef.current!;
    const newX = Math.max(0, Math.min(img.width - cropBox.w, dragStart.current.bx + dx));
    const newY = Math.max(0, Math.min(img.height - cropBox.h, dragStart.current.by + dy));
    setCropBox(prev => ({ ...prev, x: Math.round(newX), y: Math.round(newY) }));
  };

  const onDragEnd = () => { dragging.current = false; };

  // 크롭 확정: 캔버스로 잘라서 Blob → File 반환
  const handleConfirm = () => {
    const img = imgRef.current;
    if (!img) return;
    const output = document.createElement('canvas');
    output.width = cropBox.w;
    output.height = cropBox.h;
    const ctx = output.getContext('2d')!;
    ctx.drawImage(img, cropBox.x, cropBox.y, cropBox.w, cropBox.h, 0, 0, cropBox.w, cropBox.h);
    output.toBlob(blob => {
      if (blob) onCrop(new File([blob], 'part-image.jpg', { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.92);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-sm text-[#475569] text-center">
        파란 영역을 드래그해서 이미지 위치를 조정하세요
      </p>

      {/* 캔버스 영역 */}
      <div className="relative rounded-xl overflow-hidden border-2 border-[#e2e8f0] touch-none w-full">
        <canvas
          ref={canvasRef}
          className="block w-full h-auto"
          style={{ cursor: 'grab', touchAction: 'none' }}
          onMouseDown={onDragStart}
          onMouseMove={onDragMove}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
          onTouchStart={onDragStart}
          onTouchMove={onDragMove}
          onTouchEnd={onDragEnd}
        />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#f8f9fa]">
            <div className="text-sm text-[#475569]">이미지 불러오는 중...</div>
          </div>
        )}
      </div>

      {/* 크롭 정보 */}
      {ready && (
        <p className="text-xs text-[#94a3b8]">
          크롭 크기: {cropBox.w} × {cropBox.h}px
        </p>
      )}

      {/* 버튼 */}
      <div className="flex gap-3 w-full">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 text-base font-semibold border-2 border-[#e2e8f0] text-[#475569] rounded-xl hover:bg-[#f8f9fa] transition-colors"
        >
          취소
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!ready}
          className="flex-1 py-3 text-base font-semibold bg-[#1d4ed8] text-white rounded-xl hover:bg-[#1e40af] disabled:opacity-50 transition-colors"
        >
          이 영역으로 자르기
        </button>
      </div>
    </div>
  );
}
