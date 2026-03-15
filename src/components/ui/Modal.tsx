'use client';

import { ReactNode, useEffect, useCallback } from 'react';

// 모달 props
interface ModalProps {
  isOpen: boolean;          // 열림 여부
  onClose: () => void;      // 닫기 핸들러
  title: string;            // 모달 제목
  children: ReactNode;      // 본문 콘텐츠
  size?: 'sm' | 'md' | 'lg'; // 모달 크기
}

// 기본 모달 컴포넌트 (노년층 라이트 테마)
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps) {
  // ESC 키로 닫기
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // 모달 열릴 때 스크롤 방지
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  // 크기별 너비 클래스
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 오버레이 (클릭 시 닫기) */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 패널 - 노년층 기준: 흰 배경, 큰 텍스트 */}
      <div
        className={`
          relative w-full ${sizeClasses[size]}
          bg-white border border-[#e2e8f0] rounded-2xl
          shadow-2xl
        `}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#f1f3f5]">
          <h2 className="text-xl font-bold text-[#0f172a]">{title}</h2>

          {/* X 닫기 버튼 - 노년층 기준: 터치 타겟 확대 */}
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#94a3b8] hover:text-[#475569] hover:bg-[#f1f3f5] transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 본문 */}
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  );
}
