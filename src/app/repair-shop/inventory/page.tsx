'use client';

import { useState, useEffect } from 'react';
import { useRoleGuard } from '@/lib/hooks';
import { inventoryApi } from '@/lib/api';
import { Button, Input, Skeleton, EmptyState, Modal } from '@/components/ui';
import { InventoryResponse } from '@/types';

export default function RepairShopInventory() {
  const { isAuthorized, isLoading: authLoading } = useRoleGuard(['REPAIR_SHOP']);
  const [inventory, setInventory] = useState<InventoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lowOnly, setLowOnly] = useState(false);

  // 출고 모달
  const [consumeTarget, setConsumeTarget] = useState<InventoryResponse | null>(null);
  const [consumeQty, setConsumeQty] = useState('');
  const [consuming, setConsuming] = useState(false);

  // 입고 모달
  const [restockTarget, setRestockTarget] = useState<InventoryResponse | null>(null);
  const [restockQty, setRestockQty] = useState('');
  const [restocking, setRestocking] = useState(false);

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

  const handleRestock = async () => {
    if (!restockTarget || !restockQty) return;
    setRestocking(true);
    try {
      await inventoryApi.restock(restockTarget.inventoryId, { restockQuantity: parseInt(restockQty) });
      await fetchInventory();
      setRestockTarget(null);
      setRestockQty('');
    } catch { /* ignore */ }
    setRestocking(false);
  };

  if (authLoading || !isAuthorized) return <div className="min-h-[60vh] flex items-center justify-center"><Skeleton variant="card" count={2} /></div>;

  const filtered = inventory
    .filter(i => !search || i.productName.includes(search))
    .filter(i => !lowOnly || i.stock <= 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-xl font-bold text-[#1e293b] mb-1">재고 관리</h1>
      <p className="text-sm text-[#475569] mb-6">재고 현황을 확인하고 입출고를 관리합니다</p>

      {/* 검색/필터 */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="부품명 검색..."
          className="flex-1 px-3 py-2 rounded-lg text-sm bg-white border border-[#e2e8f0] text-[#1e293b] placeholder:text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20"
        />
        <label className="flex items-center gap-2 text-sm text-[#475569] cursor-pointer">
          <input type="checkbox" checked={lowOnly} onChange={e => setLowOnly(e.target.checked)} className="rounded" />
          재고 부족만
        </label>
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-5"><Skeleton variant="table-row" count={5} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState title="재고 데이터가 없습니다" />
        ) : (
          <div className="divide-y divide-[#e2e8f0]">
            <div className="hidden md:grid grid-cols-[1fr_100px_80px_160px] gap-4 px-5 py-3 bg-[#f8f9fa] text-xs text-[#475569] uppercase tracking-wider">
              <span>부품명</span><span>재고</span><span>상태</span><span>액션</span>
            </div>
            {filtered.map(item => (
              <div key={item.inventoryId} className="grid grid-cols-1 md:grid-cols-[1fr_100px_80px_160px] gap-2 md:gap-4 px-5 py-3 hover:bg-[#f8f9fa] items-center">
                <span className="text-sm text-[#1e293b]">{item.productName}</span>
                <span className="text-sm font-mono text-[#1e293b]">{item.stock}개</span>
                <span className={`text-xs px-2 py-0.5 rounded border inline-block w-fit ${
                  item.stock === 0 ? 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]' :
                  item.stock <= 5 ? 'bg-[#b45309]/10 text-[#b45309] border-[#f59e0b]/20' :
                  'bg-[#15803d]/10 text-[#15803d] border-[#bbf7d0]'
                }`}>
                  {item.stock === 0 ? '없음' : item.stock <= 5 ? '부족' : '충분'}
                </span>
                <div className="flex gap-2">
                  {item.stock > 0 && (
                    <button onClick={() => { setConsumeTarget(item); setConsumeQty(''); }} className="text-xs text-[#1d4ed8] hover:text-[#1d4ed8]">출고</button>
                  )}
                  <button onClick={() => { setRestockTarget(item); setRestockQty(''); }} className="text-xs text-[#15803d] hover:text-[#15803d]">입고</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 출고 모달 */}
      <Modal isOpen={!!consumeTarget} onClose={() => setConsumeTarget(null)} title="출고 처리">
        {consumeTarget && (
          <div className="space-y-4">
            <div className="text-sm text-[#475569]">
              <span className="text-[#1e293b]">{consumeTarget.productName}</span> · 현재 재고: <span className="font-mono text-[#1e293b]">{consumeTarget.stock}개</span>
            </div>
            <Input label="출고 수량" type="number" min="1" max={consumeTarget.stock} value={consumeQty} onChange={e => setConsumeQty(e.target.value)} placeholder="수량 입력" required />
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setConsumeTarget(null)}>취소</Button>
              <Button fullWidth onClick={handleConsume} loading={consuming}>출고 확인</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* 입고 모달 */}
      <Modal isOpen={!!restockTarget} onClose={() => setRestockTarget(null)} title="입고 처리">
        {restockTarget && (
          <div className="space-y-4">
            <div className="text-sm text-[#475569]">
              <span className="text-[#1e293b]">{restockTarget.productName}</span> · 현재 재고: <span className="font-mono text-[#1e293b]">{restockTarget.stock}개</span>
            </div>
            <Input label="입고 수량" type="number" min="1" value={restockQty} onChange={e => setRestockQty(e.target.value)} placeholder="수량 입력" required />
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setRestockTarget(null)}>취소</Button>
              <Button fullWidth onClick={handleRestock} loading={restocking}>입고 확인</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
