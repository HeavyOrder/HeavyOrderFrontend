'use client';

import Modal from './Modal';
import Button from './Button';

// 확인/취소 모달 props
interface ConfirmModalProps {
  isOpen: boolean;             // 열림 여부
  onClose: () => void;         // 닫기 핸들러
  onConfirm: () => void;       // 확인 핸들러
  title: string;               // 모달 제목
  message: string;             // 확인 메시지
  confirmText?: string;        // 확인 버튼 텍스트
  cancelText?: string;         // 취소 버튼 텍스트
  variant?: 'danger' | 'warning' | 'info'; // 스타일 변형
  loading?: boolean;           // 확인 버튼 로딩 상태
}

// 확인/취소 모달 컴포넌트
// Modal 기반, 위험/경고/정보 변형 지원
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'info',
  loading = false,
}: ConfirmModalProps) {
  // variant별 확인 버튼 스타일
  const buttonVariantMap: Record<string, 'primary' | 'danger' | 'amber'> = {
    info: 'primary',
    danger: 'danger',
    warning: 'amber',
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      {/* 메시지 */}
      <p className="text-sm text-[#a0a0a0] mb-6">{message}</p>

      {/* 버튼 영역 */}
      <div className="flex gap-3 justify-end">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button
          variant={buttonVariantMap[variant]}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
