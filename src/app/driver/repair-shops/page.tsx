'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRoleGuard } from '@/lib/hooks';
import { driverApi } from '@/lib/api';
import { Skeleton, EmptyState } from '@/components/ui';
import { RepairShopListItem } from '@/types';

export default function DriverRepairShopsPage() {
  const { isAuthorized, isLoading: authLoading } = useRoleGuard(['DRIVER']);
  const [shops, setShops] = useState<RepairShopListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [locationLoading, setLocationLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // 현재 위치로 근처 공업사 검색
  const handleSearch = () => {
    if (!navigator.geolocation) {
      setLocationError('이 기기에서는 위치 서비스를 사용할 수 없습니다.');
      return;
    }

    setLocationLoading(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocationLoading(false);
        setLoading(true);
        try {
          const res = await driverApi.getNearbyRepairShops(latitude, longitude);
          setShops(res.data.data || []);
          setSearched(true);
        } catch {
          setShops([]);
          setSearched(true);
        }
        setLoading(false);
      },
      () => {
        setLocationLoading(false);
        setLocationError('위치 정보를 가져올 수 없습니다. 브라우저 위치 권한을 확인해주세요.');
      }
    );
  };

  // 페이지 진입 시 자동으로 위치 조회
  useEffect(() => {
    if (isAuthorized) handleSearch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthorized]);

  if (authLoading || !isAuthorized) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <Skeleton variant="card" count={2} />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-xl font-bold text-[#1e293b]">공업사 찾기</h1>
        <button
          onClick={handleSearch}
          disabled={locationLoading || loading}
          className="text-sm text-[#1d4ed8] font-medium hover:text-[#1e40af] transition-colors disabled:opacity-50"
        >
          {locationLoading || loading ? '검색 중...' : '새로고침'}
        </button>
      </div>
      <p className="text-sm text-[#475569] mb-6">내 위치 기준 반경 10km 이내 공업사를 보여줍니다</p>

      {/* 위치 오류 메시지 */}
      {locationError && (
        <div className="bg-[#fef2f2] border border-[#fecaca] rounded-xl p-4 mb-4 text-sm text-[#b91c1c]">
          {locationError}
          <button
            onClick={handleSearch}
            className="ml-2 underline font-medium hover:text-[#991b1b]"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 로딩 */}
      {(locationLoading || loading) && (
        <div className="bg-white border border-[#e2e8f0] rounded-xl p-5">
          <Skeleton variant="table-row" count={4} />
        </div>
      )}

      {/* 결과 없음 */}
      {!locationLoading && !loading && searched && shops.length === 0 && (
        <EmptyState
          title="근처 공업사가 없습니다"
          description="반경 10km 이내에 등록된 공업사가 없습니다"
        />
      )}

      {/* 공업사 목록 */}
      {!locationLoading && !loading && shops.length > 0 && (
        <div className="space-y-3">
          {shops.map(shop => (
            <Link
              key={shop.id}
              href={`/driver/repair-shops/${shop.id}`}
              className="block bg-white border border-[#e2e8f0] rounded-xl p-4 hover:border-[#1d4ed8]/30 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-[#1e293b] truncate">{shop.businessName}</h3>
                  <p className="text-xs text-[#475569] mt-0.5 truncate">{shop.address}</p>
                  <p className="text-xs text-[#475569] mt-0.5 font-mono">{shop.phoneNumber}</p>
                </div>
                <div className="ml-3 flex-shrink-0 text-right">
                  <span className="text-xs font-semibold text-[#1d4ed8]">{shop.distanceKm.toFixed(1)}km</span>
                  <svg className="w-4 h-4 text-[#94a3b8] mt-1 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
