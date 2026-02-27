'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRoleGuard } from '@/lib/hooks';
import { partsApi } from '@/lib/api';
import { Button, Input, Skeleton } from '@/components/ui';

export default function SupplierPartsRegister() {
  const router = useRouter();
  const { isAuthorized, isLoading: authLoading } = useRoleGuard(['SUPPLIER']);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price) return;

    setSubmitting(true);
    setError('');
    try {
      await partsApi.register({
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
      });
      router.push('/supplier/parts');
    } catch {
      setError('부품 등록에 실패했습니다. 다시 시도해주세요.');
    }
    setSubmitting(false);
  };

  if (authLoading || !isAuthorized) return <div className="min-h-[60vh] flex items-center justify-center"><Skeleton variant="card" count={1} /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-xl font-bold text-[#f5f5f5] mb-1">부품 등록</h1>
      <p className="text-sm text-[#666] mb-6">새로운 부품을 등록합니다</p>

      <form onSubmit={handleSubmit} className="bg-[#111] border border-[#2a2a2a] rounded-xl p-6 space-y-5">
        <Input
          label="부품명"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="예: 유압 실린더 HX-200"
          required
        />

        <div>
          <label className="block text-sm font-medium text-[#a0a0a0] mb-1.5">설명</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="부품에 대한 상세 설명을 입력하세요"
            rows={4}
            className="w-full px-3 py-2 rounded-lg text-sm bg-[#0a0a0a] border border-[#2a2a2a] text-[#e5e5e5] placeholder:text-[#666] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30 resize-none"
          />
        </div>

        <Input
          label="가격 (원)"
          type="number"
          min="0"
          step="100"
          value={price}
          onChange={e => setPrice(e.target.value)}
          placeholder="예: 150000"
          required
        />

        {error && (
          <div className="text-sm text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg px-4 py-2">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={() => router.back()}>
            취소
          </Button>
          <Button type="submit" fullWidth loading={submitting}>
            부품 등록
          </Button>
        </div>
      </form>
    </div>
  );
}
