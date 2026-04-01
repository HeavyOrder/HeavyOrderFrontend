'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Card } from '@/components/ui';
import { authApi } from '@/lib/api';
import { useAuth } from '@/lib/context';

// Daum 우편번호 API 타입 선언
declare global {
  interface Window {
    daum: {
      Postcode: new (options: {
        oncomplete: (data: {
          address: string;       // 지번 주소
          roadAddress: string;   // 도로명 주소
          x: string;             // 경도 (longitude)
          y: string;             // 위도 (latitude)
        }) => void;
      }) => { open: () => void };
    };
  }
}

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
    businessName: '',
    address: '',
    latitude: 0,
    longitude: 0,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Daum 우편번호 스크립트 동적 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
    script.async = true;
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // 역할 한글 변환
  const roleLabels: Record<string, string> = {
    REPAIR_SHOP: '수리점 (공업사)',
    SUPPLIER: '공급사 (부품사)',
    DRIVER: '장비기사',
  };

  const needsBusinessInfo = formData.role === 'REPAIR_SHOP' || formData.role === 'SUPPLIER';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  // 카카오 Geocoding API로 주소 → 좌표 변환 (서버 API Route 경유)
  const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    try {
      const res = await fetch(`/api/geocode?query=${encodeURIComponent(address)}`);
      const json = await res.json();
      const doc = json.documents?.[0];
      if (!doc) return null;
      return { lat: parseFloat(doc.y), lng: parseFloat(doc.x) };
    } catch {
      return null;
    }
  };

  // 주소 검색 팝업 열기
  const handleAddressSearch = () => {
    if (!window.daum?.Postcode) {
      setError('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    new window.daum.Postcode({
      oncomplete: async (data) => {
        const selectedAddress = data.roadAddress || data.address;
        // 카카오 Geocoding으로 좌표 조회
        const coords = await geocodeAddress(selectedAddress);
        if (!coords) {
          setError('주소의 좌표를 가져올 수 없습니다. 다른 주소를 검색해주세요.');
          return;
        }
        setFormData(prev => ({
          ...prev,
          address: selectedAddress,
          latitude: coords.lat,
          longitude: coords.lng,
        }));
        setError('');
      },
    }).open();
  };

  // 폼 제출
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    if (needsBusinessInfo) {
      if (!formData.businessName || !formData.address) {
        setError('사업자 정보를 모두 입력해주세요.');
        setLoading(false);
        return;
      }
      // 수리점은 주소 검색 팝업으로 선택한 주소 + 유효한 좌표 필수
      if (formData.role === 'REPAIR_SHOP') {
        if (!formData.address) {
          setError('주소 검색 버튼을 눌러 주소를 선택해주세요.');
          setLoading(false);
          return;
        }
        if (isNaN(formData.latitude) || isNaN(formData.longitude)) {
          setError('좌표를 확인할 수 없습니다. 주소 검색을 다시 시도해주세요.');
          setLoading(false);
          return;
        }
      }
    }

    try {
      const baseData = {
        email: formData.email,
        password: formData.password,
        role: formData.role,
        phoneNumber: formData.phoneNumber,
      };

      if (formData.role === 'DRIVER') {
        await authApi.signUpMachineDriver(baseData);
      } else if (formData.role === 'REPAIR_SHOP') {
        await authApi.signUpRepairShop({
          ...baseData,
          businessName: formData.businessName,
          address: formData.address,
          latitude: formData.latitude,
          longitude: formData.longitude,
        });
      } else if (formData.role === 'SUPPLIER') {
        await authApi.signUpSupplierCompany({
          ...baseData,
          businessName: formData.businessName,
          address: formData.address,
        });
      }

      await login(formData.email, formData.password);
      router.push('/');
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
        <h1 className="text-xl font-bold text-[#0f172a]">회원가입</h1>
        <p className="text-base text-[#475569] mt-1">HeavyOrder에 가입하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 역할 선택 */}
        <div>
          <label className="block text-base font-semibold text-[#1e293b] mb-2">
            가입 유형 <span className="text-[#b91c1c]">*</span>
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-3.5 bg-white border-2 border-[#e2e8f0] rounded-lg text-lg text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8] transition-colors duration-150"
          >
            {Object.entries(roleLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
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

            {/* 주소 검색 */}
            <div>
              <label className="block text-base font-semibold text-[#1e293b] mb-2">
                주소 <span className="text-[#b91c1c]">*</span>
              </label>
              <div className="flex gap-2">
                {/* 주소 표시 (읽기 전용) */}
                <div className="flex-1 px-4 py-3.5 bg-[#f8f9fa] border-2 border-[#e2e8f0] rounded-lg text-base text-[#1e293b] min-h-[52px] flex items-center">
                  {formData.address ? (
                    <span>{formData.address}</span>
                  ) : (
                    <span className="text-[#94a3b8]">주소 검색을 눌러주세요</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAddressSearch}
                  className="flex-shrink-0 px-4 py-3.5 bg-[#1d4ed8] text-white text-sm font-semibold rounded-lg hover:bg-[#1e40af] transition-colors whitespace-nowrap"
                >
                  주소 검색
                </button>
              </div>
              {/* 수리점: 좌표 확인 메시지 */}
              {formData.role === 'REPAIR_SHOP' && formData.latitude !== 0 && (
                <p className="text-xs text-[#15803d] mt-1.5 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  위치 정보가 설정되었습니다
                </p>
              )}
            </div>
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

        {error && (
          <div className="bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca] p-3 rounded-lg text-base">
            {error}
          </div>
        )}

        <Button type="submit" fullWidth loading={loading}>
          회원가입
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-base text-[#475569]">
          이미 계정이 있으신가요?{' '}
          <Link href="/auth/login" className="text-[#1d4ed8] font-semibold hover:text-[#1e40af] transition-colors duration-150">
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
            <div className="animate-spin w-6 h-6 border-2 border-[#1d4ed8] border-t-transparent rounded-full mx-auto"></div>
            <p className="text-base text-[#475569] mt-4">로딩중...</p>
          </div>
        </Card>
      }>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
