'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button, Input, Card } from '@/components/ui';
import { useAuth } from '@/lib/context';

const DASHBOARD_ROUTES: Record<string, string> = {
  REPAIR_SHOP: '/dashboard/repair-shop',
  SUPPLIER: '/dashboard/supplier',
  DRIVER: '/dashboard/driver',
  ADMIN: '/dashboard/repair-shop',
};

// 로그인 페이지
export default function LoginPage() {
  const { login, isLoggedIn, isLoading, user } = useAuth();

  // 이미 로그인된 상태면 대시보드로
  useEffect(() => {
    if (!isLoading && isLoggedIn && user?.roleType) {
      const route = DASHBOARD_ROUTES[user.roleType];
      window.location.href = route || '/';
    }
  }, [isLoading, isLoggedIn, user]);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 입력값 변경 처리
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Context의 login 함수 사용 (API 호출 + 사용자 정보 갱신)
      const userData = await login(formData.email, formData.password);
      window.location.href = DASHBOARD_ROUTES[userData.roleType] || '/';
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-[#f5f5f5]">로그인</h1>
          <p className="text-sm text-[#666] mt-1">HeavyOrder에 오신 것을 환영합니다</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="이메일"
            type="email"
            name="email"
            placeholder="example@email.com"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <Input
            label="비밀번호"
            type="password"
            name="password"
            placeholder="비밀번호를 입력하세요"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {/* 에러 메시지 (다크 테마) */}
          {error && (
            <div className="bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Button type="submit" fullWidth loading={loading}>
            로그인
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-[#666]">
            계정이 없으신가요?{' '}
            <Link href="/auth/register" className="text-[#3b82f6] hover:text-[#60a5fa] transition-colors duration-150">
              회원가입
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
