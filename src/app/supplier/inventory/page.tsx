'use client';

import { useState, useEffect } from 'react';
import { useRoleGuard } from '@/lib/hooks';
import { inventoryApi } from '@/lib/api';
import { Button, Input, Skeleton, EmptyState, Modal } from '@/components/ui';
import { InventoryResponse } from '@/types';

export default function SupplierInventory() {
  const { isAuthorized, isLoading: authLoading } = useRoleGuard(['SUPPLIER']);
  const [inventory, setInventory] = useState<InventoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lowOnly, setLowOnly] = useState(false);

  // 차감 모달
  const [consumeTarget, setConsumeTarget] = useState<InventoryResponse | null>(null);
  const [consumeQty, setConsumeQty] = useState('');
  const [consuming, setConsuming] = useState(false);

  const fetchInventory = async () => {
    try {
      const res = await inventoryApi.getMyInventories({});
      setInventory(res.data.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { if (isAuthorized) fetchInventory(); }, [isAuthorized]);

  const handleConsume = async () => {
    if (!consumeTarget || !consumeQty) return;
    setConsuming(true);
    try {
      await inventoryApi.consume(consumeTarget.inventoryId, { consumeQuantity: parseInt(consumeQty) });
      await fetchInventory();
      setConsumeTarget(null);
      setConsumeQty('');
    } catch { /* ignore */ }
    setConsuming(false);
  };

  if (authLoading || !isAuthorized) return <div className="min-h-[60vh] flex items-center justify-center"><Skeleton variant="card" count={2} /></div>;

  const filtered = inventory
    .filter(i => !search || i.productName.includes(search))
    .filter(i => !lowOnly || i.stock <= 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-xl font-bold text-[#f5f5f5] mb-1">재고 관리</h1>
      <p className="text-sm text-[#666] mb-6">재고 현황을 확인하고 출고를 관리합니다</p>

      {/* 검색/필터 */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="부품명 검색..."
          className="flex-1 px-3 py-2 rounded-lg text-sm bg-[#111] border border-[#2a2a2a] text-[#e5e5e5] placeholder:text-[#666] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/30"
        />
        <label className="flex items-center gap-2 text-sm text-[#a0a0a0] cursor-pointer">
          <input type="checkbox" checked={lowOnly} onChange={e => setLowOnly(e.target.checked)} className="rounded" />
          재고 부족만
        </label>
      </div>

      <div className="bg-[#111] border border-[#2a2a2a] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-5"><Skeleton variant="table-row" count={5} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState title="재고 데이터가 없습니다" />
        ) : (
          <div className="divide-y divide-[#2a2a2a]">
            <div className="hidden md:grid grid-cols-[1fr_100px_80px_100px] gap-4 px-5 py-3 bg-[#1a1a1a] text-xs text-[#666] uppercase tracking-wider">
              <span>부품명</span><span>재고</span><span>상태</span><span>액션</span>
            </div>
            {filtered.map(item => (
              <div key={item.inventoryId} className="grid grid-cols-1 md:grid-cols-[1fr_100px_80px_100px] gap-2 md:gap-4 px-5 py-3 hover:bg-[#1a1a1a] items-center">
                <span className="text-sm text-[#e5e5e5]">{item.productName}</span>
                <span className="text-sm font-mono text-[#e5e5e5]">{item.stock}개</span>
                <span className={`text-xs px-2 py-0.5 rounded border inline-block w-fit ${
                  item.stock === 0 ? 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20' :
                  item.stock <= 5 ? 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20' :
                  'bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20'
                }`}>
                  {item.stock === 0 ? '없음' : item.stock <= 5 ? '부족' : '충분'}
                </span>
                <div>
                  {item.stock > 0 && (
                    <button onClick={() => { setConsumeTarget(item); setConsumeQty(''); }} className="text-xs text-[#3b82f6] hover:text-[#60a5fa]">차감</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 차감 모달 */}
      <Modal isOpen={!!consumeTarget} onClose={() => setConsumeTarget(null)} title="재고 차감">
        {consumeTarget && (
          <div className="space-y-4">
            <div className="text-sm text-[#a0a0a0]">
              <span className="text-[#e5e5e5]">{consumeTarget.productName}</span> · 현재 재고: <span className="font-mono text-[#e5e5e5]">{consumeTarget.stock}개</span>
            </div>
            <Input label="차감 수량" type="number" min="1" max={consumeTarget.stock} value={consumeQty} onChange={e => setConsumeQty(e.target.value)} placeholder="수량 입력" required />
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setConsumeTarget(null)}>취소</Button>
              <Button fullWidth onClick={handleConsume} loading={consuming}>차감 확인</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
