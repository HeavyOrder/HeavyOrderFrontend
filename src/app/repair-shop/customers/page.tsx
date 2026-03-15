'use client';

import { useState, useEffect } from 'react';
import { useRoleGuard } from '@/lib/hooks';
import { customerApi } from '@/lib/api';
import { Button, Input, Skeleton, EmptyState, Modal } from '@/components/ui';
import { CustomerResponse } from '@/types';

export default function RepairShopCustomers() {
  const { isAuthorized, isLoading: authLoading } = useRoleGuard(['REPAIR_SHOP']);
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // 등록 모달
  const [showAdd, setShowAdd] = useState(false);
  const [addName, setAddName] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [adding, setAdding] = useState(false);

  // 수정 모달
  const [editTarget, setEditTarget] = useState<CustomerResponse | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editing, setEditing] = useState(false);

  const fetchCustomers = async () => {
    try {
      const res = await customerApi.getList();
      setCustomers(res.data.data || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { if (isAuthorized) fetchCustomers(); }, [isAuthorized]);

  const handleAdd = async () => {
    if (!addName.trim()) return;
    setAdding(true);
    try {
      await customerApi.create({ name: addName.trim(), phoneNumber: addPhone.trim() });
      await fetchCustomers();
      setShowAdd(false);
      setAddName('');
      setAddPhone('');
    } catch { /* ignore */ }
    setAdding(false);
  };

  const openEdit = (c: CustomerResponse) => {
    setEditTarget(c);
    setEditName(c.name);
    setEditPhone(c.phoneNumber);
  };

  const handleEdit = async () => {
    if (!editTarget) return;
    setEditing(true);
    try {
      await customerApi.update(editTarget.id, { name: editName.trim(), phoneNumber: editPhone.trim() });
      await fetchCustomers();
      setEditTarget(null);
    } catch { /* ignore */ }
    setEditing(false);
  };

  if (authLoading || !isAuthorized) return <div className="min-h-[60vh] flex items-center justify-center"><Skeleton variant="card" count={2} /></div>;

  const filtered = customers.filter(c =>
    !search || c.name.includes(search) || c.phoneNumber.includes(search)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1e293b]">고객 관리</h1>
          <p className="text-sm text-[#475569] mt-1">고객 정보를 관리합니다</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 text-sm font-medium bg-[#1d4ed8] text-white rounded-lg hover:bg-[#1e40af] transition-colors"
        >
          + 고객 등록
        </button>
      </div>

      {/* 검색 */}
      <div className="mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="이름 또는 연락처로 검색..."
          className="w-full sm:w-80 px-3 py-2 rounded-lg text-sm bg-white border border-[#e2e8f0] text-[#1e293b] placeholder:text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20"
        />
      </div>

      <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-5"><Skeleton variant="table-row" count={5} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState title="고객이 없습니다" description="새 고객을 등록해보세요" />
        ) : (
          <div className="divide-y divide-[#e2e8f0]">
            <div className="hidden md:grid grid-cols-[60px_1fr_160px_80px] gap-4 px-5 py-3 bg-[#f8f9fa] text-xs text-[#475569] uppercase tracking-wider">
              <span>ID</span><span>이름</span><span>연락처</span><span></span>
            </div>
            {filtered.map(customer => (
              <div key={customer.id} className="grid grid-cols-1 md:grid-cols-[60px_1fr_160px_80px] gap-2 md:gap-4 px-5 py-3 hover:bg-[#f8f9fa] transition-colors items-center">
                <span className="text-sm text-[#475569] font-mono">#{customer.id}</span>
                <span className="text-sm text-[#1e293b]">{customer.name}</span>
                <span className="text-sm text-[#475569] font-mono">{customer.phoneNumber || '-'}</span>
                <button
                  onClick={() => openEdit(customer)}
                  className="text-xs text-[#1d4ed8] hover:text-[#1d4ed8] transition-colors"
                >
                  수정
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 고객 등록 모달 */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="고객 등록">
        <div className="space-y-4">
          <Input label="이름" value={addName} onChange={e => setAddName(e.target.value)} placeholder="고객명 입력" required />
          <Input label="연락처" value={addPhone} onChange={e => setAddPhone(e.target.value)} placeholder="010-0000-0000" />
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowAdd(false)}>취소</Button>
            <Button fullWidth onClick={handleAdd} loading={adding}>등록</Button>
          </div>
        </div>
      </Modal>

      {/* 고객 수정 모달 */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="고객 정보 수정">
        {editTarget && (
          <div className="space-y-4">
            <Input label="이름" value={editName} onChange={e => setEditName(e.target.value)} placeholder="고객명" required />
            <Input label="연락처" value={editPhone} onChange={e => setEditPhone(e.target.value)} placeholder="010-0000-0000" />
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setEditTarget(null)}>취소</Button>
              <Button fullWidth onClick={handleEdit} loading={editing}>수정 완료</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
