'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';
import { authApi } from '@/lib/api';
import { useAuth } from '@/lib/context';

// 회원가입 폼 컴포넌트 (useSearchParams 사용)
function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get('role') || 'REPAIR_SHOP';
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    phoneNumber: '',
    role: defaultRole.toUpperCase(),
    // 수리점/공급사 전용 필드
    businessName: '',
    businessNumber: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 역할 한글 변환 (백엔드 RoleType과 매핑)
  const roleLabels: Record<string, string> = {
    REPAIR_SHOP: '수리점 (공업사)',
    SUPPLIER: '공급사 (부품사)',
    DRIVER: '장비기사',
  };

  // 사업자 정보가 필요한 역할인지 확인
  const needsBusinessInfo = formData.role === 'REPAIR_SHOP' || formData.role === 'SUPPLIER';

  // 입력값 변경 처리
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 비밀번호 확인
    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    // 사업자 정보 필수 검증
    if (needsBusinessInfo) {
      if (!formData.businessName || !formData.businessNumber || !formData.address) {
        setError('사업자 정보를 모두 입력해주세요.');
        setLoading(false);
        return;
      }
    }

    try {
      // 역할에 따라 다른 API 엔드포인트 호출
      const baseData = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phoneNumber: formData.phoneNumber,
      };

      if (formData.role === 'DRIVER') {
        // 장비기사 회원가입
        await authApi.signUpMachineDriver(baseData);
      } else if (formData.role === 'REPAIR_SHOP') {
        // 수리점 회원가입
        await authApi.signUpRepairShop({
          ...baseData,
          businessName: formData.businessName,
          businessNumber: formData.businessNumber,
          address: formData.address,
        });
      } else if (formData.role === 'SUPPLIER') {
        // 공급사 회원가입
        await authApi.signUpSupplierCompany({
          ...baseData,
          businessName: formData.businessName,
          businessNumber: formData.businessNumber,
          address: formData.address,
        });
      }

      // 회원가입 성공 후 자동 로그인
      await login(formData.email, formData.password);
      router.push('/'); // 홈에서 역할별 대시보드로 리다이렉트
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold text-[#f5f5f5]">회원가입</h1>
        <p className="text-sm text-[#666] mt-1">HeavyOrder에 가입하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 역할 선택 (다크 테마 select) */}
        <div>
          <label className="block text-sm font-medium text-[#a0a0a0] mb-1">
            가입 유형 <span className="text-[#ef4444]">*</span>
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-[#e5e5e5] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/40 focus:border-[#3b82f6] transition-colors duration-150"
          >
            {Object.entries(roleLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

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
          label="연락처"
          type="tel"
          name="phoneNumber"
          placeholder="010-1234-5678"
          value={formData.phoneNumber}
          onChange={handleChange}
          required
        />

        {/* 수리점/공급사 전용: 사업자 정보 */}
        {needsBusinessInfo && (
          <>
            <Input
              label="상호명 (사업자명)"
              type="text"
              name="businessName"
              placeholder="상호명을 입력하세요"
              value={formData.businessName}
              onChange={handleChange}
              required
            />

            <Input
              label="사업자등록번호"
              type="text"
              name="businessNumber"
              placeholder="000-00-00000"
              value={formData.businessNumber}
              onChange={handleChange}
              required
            />

            <Input
              label="주소"
              type="text"
              name="address"
              placeholder="사업장 주소"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </>
        )}

        <Input
          label="비밀번호"
          type="password"
          name="password"
          placeholder="비밀번호 (8자 이상)"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <Input
          label="비밀번호 확인"
          type="password"
          name="passwordConfirm"
          placeholder="비밀번호를 다시 입력하세요"
          value={formData.passwordConfirm}
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
          회원가입
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-[#666]">
          이미 계정이 있으신가요?{' '}
          <Link href="/auth/login" className="text-[#3b82f6] hover:text-[#60a5fa] transition-colors duration-150">
            로그인
          </Link>
        </p>
      </div>
    </Card>
  );
}

// 회원가입 페이지 (Suspense로 감싸기)
export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-120px)] flex items-center justify-center py-12 px-4">
      <Suspense fallback={
        <Card className="w-full max-w-sm">
          <div className="text-center py-8">
            <div className="animate-spin w-5 h-5 border-2 border-[#3b82f6] border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-[#666] mt-4">로딩중...</p>
          </div>
        </Card>
      }>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
