'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context';
import { authApi } from '@/lib/api';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

// 역할 한글 매핑
const ROLE_LABELS: Record<string, string> = {
  REPAIR_SHOP: '공업사',
  SUPPLIER: '부품사',
  DRIVER: '장비기사',
  ADMIN: '관리자',
};

const CONFIRM_KEYWORD = '탈퇴합니다';

export default function SettingsPage() {
  const { user, isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  // 비로그인 시 로그인 페이지로
  if (!isLoading && !isLoggedIn) {
    router.push('/auth/login');
    return null;
  }

  const handleDeleteAccount = async () => {
    if (confirmText !== CONFIRM_KEYWORD) return;
    setDeleteLoading(true);
    try {
      await authApi.deleteAccount();
      window.location.href = '/';
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      alert(error.response?.data?.message || '회원 탈퇴에 실패했습니다.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const closeModal = () => {
    setShowDeleteModal(false);
    setConfirmText('');
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="h-8 w-32 bg-[#e2e8f0] rounded animate-pulse mb-6" />
        <div className="space-y-4">
          <div className="h-32 bg-[#e2e8f0] rounded-xl animate-pulse" />
          <div className="h-32 bg-[#e2e8f0] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#0f172a] mb-6">설정</h1>

      {/* 내 정보 섹션 */}
      <section className="bg-white border border-[#e2e8f0] rounded-xl p-5 mb-4">
        <h2 className="text-lg font-semibold text-[#0f172a] mb-4">내 정보</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-[#f1f3f5]">
            <span className="text-base text-[#64748b]">이메일</span>
            <span className="text-base font-medium text-[#0f172a]">{user?.email}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#f1f3f5]">
            <span className="text-base text-[#64748b]">역할</span>
            <span className="text-base font-medium text-[#0f172a]">
              {user?.roleType ? ROLE_LABELS[user.roleType] || user.roleType : '-'}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-[#f1f3f5]">
            <span className="text-base text-[#64748b]">전화번호</span>
            <span className="text-base font-medium text-[#0f172a]">{user?.phoneNumber || '-'}</span>
          </div>
          {user?.businessName && (
            <div className="flex justify-between items-center py-2 border-b border-[#f1f3f5]">
              <span className="text-base text-[#64748b]">상호명</span>
              <span className="text-base font-medium text-[#0f172a]">{user.businessName}</span>
            </div>
          )}
        </div>
      </section>

      {/* 회원 탈퇴 섹션 */}
      <section className="bg-white border border-[#fecaca] rounded-xl p-5">
        <h2 className="text-lg font-semibold text-[#b91c1c] mb-2">회원 탈퇴</h2>
        <p className="text-sm text-[#64748b] mb-4">
          탈퇴 시 계정이 비활성화되며, 개인정보가 익명 처리됩니다. 이 작업은 되돌릴 수 없습니다.
        </p>
        <Button variant="danger" size="md" onClick={() => setShowDeleteModal(true)}>
          회원 탈퇴
        </Button>
      </section>

      {/* 회원 탈퇴 확인 모달 - "탈퇴합니다" 입력 필수 */}
      <Modal isOpen={showDeleteModal} onClose={closeModal} title="정말 탈퇴하시겠습니까?" size="sm">
        <div className="space-y-4">
          <p className="text-base text-[#475569]">
            탈퇴하면 계정이 비활성화되고 개인정보가 익명 처리됩니다.
            <br />
            <strong className="text-[#b91c1c]">이 작업은 되돌릴 수 없습니다.</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-[#475569] mb-2">
              확인을 위해 <strong className="text-[#b91c1c]">{CONFIRM_KEYWORD}</strong>를 입력해주세요
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={CONFIRM_KEYWORD}
              className="w-full px-4 py-3 text-base border-2 border-[#e2e8f0] rounded-lg focus:outline-none focus:border-[#b91c1c] transition-colors"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={closeModal} disabled={deleteLoading}>
              취소
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAccount}
              loading={deleteLoading}
              disabled={confirmText !== CONFIRM_KEYWORD}
            >
              탈퇴
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
