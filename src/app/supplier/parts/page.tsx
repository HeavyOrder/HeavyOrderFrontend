'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRoleGuard } from '@/lib/hooks';
import { partsApi } from '@/lib/api';
import { Skeleton, EmptyState } from '@/components/ui';
import { PartResponse } from '@/types';
import { formatCurrency } from '@/lib/utils';

export default function SupplierParts() {
  const { isAuthorized, isLoading: authLoading, user } = useRoleGuard(['SUPPLIER']);
  const [parts, setParts] = useState<PartResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAuthorized) return;
    const load = async () => {
      try {
        const res = await partsApi.getList();
        // 자사 부품만 필터링 (supplier 필드가 내 businessName과 일치)
        const myParts = (res.data.data || []).filter(
          p => p.supplier === user?.businessName
        );
        setParts(myParts);
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [isAuthorized, user]);

  if (authLoading || !isAuthorized) return <div className="min-h-[60vh] flex items-center justify-center"><Skeleton variant="card" count={2} /></div>;

  const filtered = parts.filter(p => !search || p.name.includes(search));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#f5f5f5]">부품 관리</h1>
          <p className="text-sm text-[#666] mt-1">등록된 부품을 관리합니다</p>
        </div>
        <Link
          href="/supplier/parts/register"
          className="px-4 py-2 text-sm font-medium bg-[#3b82f6] text-white rounded-lg hover:bg-[#2563eb] transition-colors"
        >
          + 부품 등록
        </Link>
      </div>

      {/* 검색 */}
      <div className="mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="부품명 검색..."
          className="w-full sm:w-80 px-3 py-2 rounded-lg text-sm bg-[#111] border border-[#2a2a2a] text-[#e5e5e5] placeholder:text-[#666] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30"
        />
      </div>

      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-5"><Skeleton variant="table-row" count={5} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            title="등록된 부품이 없습니다"
            description="새 부품을 등록해보세요"
            action={{ label: '부품 등록', href: '/supplier/parts/register' }}
          />
        ) : (
          <div className="divide-y divide-[#2a2a2a]">
            <div className="hidden md:grid grid-cols-[60px_1fr_140px] gap-4 px-5 py-3 bg-[#1a1a1a] text-xs text-[#666] uppercase tracking-wider">
              <span>ID</span><span>부품명</span><span>가격</span>
            </div>
            {filtered.map(part => (
              <div key={part.id} className="grid grid-cols-1 md:grid-cols-[60px_1fr_140px] gap-2 md:gap-4 px-5 py-3 hover:bg-[#1a1a1a] transition-colors items-center">
                <span className="text-sm text-[#666] font-mono">#{part.id}</span>
                <span className="text-sm text-[#e5e5e5]">{part.name}</span>
                <span className="text-sm text-[#e5e5e5] font-mono">{formatCurrency(part.price)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
