import { useAuth } from '@/lib/context';
import { RoleType } from '@/types';
import { useEffect } from 'react';

// 역할 기반 접근 제어 훅
// 허용된 역할이 아니면 자동으로 리다이렉트
export function useRoleGuard(allowedRoles: RoleType[]) {
  const { user, isLoading, isLoggedIn } = useAuth();

  useEffect(() => {
    // 로딩 중이면 아직 판단 불가
    if (isLoading) return;

    // 로그인 안 된 경우 로그인 페이지로
    if (!isLoggedIn) {
      window.location.href = '/auth/login';
      return;
    }

    // ADMIN은 모든 페이지 접근 가능, 그 외 허용되지 않은 역할이면 홈으로
    if (user && user.roleType !== 'ADMIN' && !allowedRoles.includes(user.roleType)) {
      window.location.href = '/';
    }
  }, [user, isLoading, isLoggedIn, allowedRoles]);

  return {
    user,
    isLoading,
    isAuthorized: !!user && (user.roleType === 'ADMIN' || allowedRoles.includes(user.roleType)),
  };
}
