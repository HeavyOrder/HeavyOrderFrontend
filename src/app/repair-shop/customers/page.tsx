'use client';

import { useState, useEffect } from 'react';
import { useRoleGuard } from '@/lib/hooks';
import { customerApi, reservationApi } from '@/lib/api';
import { Button, Input, Skeleton, EmptyState, Modal } from '@/components/ui';
import { CustomerResponse, ReservationShopResponse } from '@/types';

// 예약 상태 한글 라벨
const STATUS_LABELS: Record<string, string> = {
  PENDING: '대기중',
  APPROVED: '승인됨',
  COMPLETED: '완료',
  CANCELED: '취소',
};

// 예약 상태별 색상
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  COMPLETED: 'bg-blue-100 text-blue-700',
  CANCELED: 'bg-red-100 text-red-700',
};

export default function RepairShopCustomers() {
  const { isAuthorized, isLoading: authLoading } = useRoleGuard(['REPAIR_SHOP']);
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // 아코디언: 선택된 고객 ID와 해당 예약 목록
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [reservations, setReservations] = useState<ReservationShopResponse[]>([]);
  const [reservationLoading, setReservationLoading] = useState(false);

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

  // 고객 행 클릭: 토글 방식 아코디언
  const handleSelectCustomer = async (customer: CustomerResponse) => {
    // 이미 선택된 고객 클릭 시 닫기
    if (selectedCustomerId === customer.id) {
      setSelectedCustomerId(null);
      setReservations([]);
      return;
    }

    setSelectedCustomerId(customer.id);
    setReservations([]);

    // 드라이버 계정과 연동된 고객만 예약 조회 가능
    if (!customer.driverId) return;

    setReservationLoading(true);
    try {
      const res = await reservationApi.getRepairShopCustomerReservations(customer.driverId);
      const list: ReservationShopResponse[] = res.data.data || [];
      // 최신순 정렬 후 최대 5개
      list.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setReservations(list.slice(0, 5));
    } catch { /* ignore */ }
    setReservationLoading(false);
  };

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

  const openEdit = (e: React.MouseEvent, c: CustomerResponse) => {
    e.stopPropagation(); // 아코디언 토글 방지
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
          <p className="text-sm text-[#475569] mt-1">고객을 선택하면 최근 예약 내역을 확인할 수 있습니다</p>
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
            {/* 테이블 헤더 */}
            <div className="hidden md:grid grid-cols-[60px_1fr_160px_80px] gap-4 px-5 py-3 bg-[#f8f9fa] text-xs text-[#475569] uppercase tracking-wider">
              <span>ID</span><span>이름</span><span>연락처</span><span></span>
            </div>

            {filtered.map(customer => (
              <div key={customer.id}>
                {/* 고객 행 — 클릭 시 아코디언 토글 */}
                <div
                  onClick={() => handleSelectCustomer(customer)}
                  className={`grid grid-cols-1 md:grid-cols-[60px_1fr_160px_80px] gap-2 md:gap-4 px-5 py-3 transition-colors items-center cursor-pointer ${
                    selectedCustomerId === customer.id
                      ? 'bg-[#eff6ff]'
                      : 'hover:bg-[#f8f9fa]'
                  }`}
                >
                  <span className="text-sm text-[#475569] font-mono">#{customer.id}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#1e293b]">{customer.name}</span>
                    {/* 드라이버 계정 연동 여부 표시 */}
                    {customer.driverId ? (
                      <span className="text-xs px-1.5 py-0.5 bg-[#dbeafe] text-[#1d4ed8] rounded">앱 연동</span>
                    ) : (
                      <span className="text-xs px-1.5 py-0.5 bg-[#f1f5f9] text-[#94a3b8] rounded">수동 등록</span>
                    )}
                  </div>
                  <span className="text-sm text-[#475569] font-mono">{customer.phoneNumber || '-'}</span>
                  <button
                    onClick={(e) => openEdit(e, customer)}
                    className="text-xs text-[#1d4ed8] hover:text-[#1d4ed8] transition-colors"
                  >
                    수정
                  </button>
                </div>

                {/* 아코디언: 예약 내역 패널 */}
                {selectedCustomerId === customer.id && (
                  <div className="px-5 py-4 bg-[#f8faff] border-t border-[#e2e8f0]">
                    <p className="text-xs font-semibold text-[#475569] uppercase tracking-wider mb-3">
                      최근 예약 내역
                    </p>

                    {/* 드라이버 계정 미연동 */}
                    {!customer.driverId && (
                      <p className="text-sm text-[#94a3b8]">앱 계정과 연동되지 않은 고객입니다. 예약 내역을 조회할 수 없습니다.</p>
                    )}

                    {/* 로딩 중 */}
                    {customer.driverId && reservationLoading && (
                      <div className="flex items-center gap-2 text-sm text-[#475569]">
                        <svg className="animate-spin h-4 w-4 text-[#1d4ed8]" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        불러오는 중...
                      </div>
                    )}

                    {/* 예약 없음 */}
                    {customer.driverId && !reservationLoading && reservations.length === 0 && (
                      <p className="text-sm text-[#94a3b8]">예약 내역이 없습니다.</p>
                    )}

                    {/* 예약 목록 */}
                    {customer.driverId && !reservationLoading && reservations.length > 0 && (
                      <div className="space-y-2">
                        {reservations.map(r => (
                          <div key={r.id} className="flex items-center justify-between bg-white border border-[#e2e8f0] rounded-lg px-4 py-3">
                            <div className="flex flex-col gap-0.5">
                              {/* 날짜/시간 */}
                              <span className="text-sm font-medium text-[#1e293b]">
                                {new Date(r.time).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                                {' '}
                                {new Date(r.time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {/* 메모 */}
                              {r.memo && (
                                <span className="text-xs text-[#64748b]">{r.memo}</span>
                              )}
                            </div>
                            {/* 상태 뱃지 */}
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLORS[r.status] || 'bg-gray-100 text-gray-600'}`}>
                              {STATUS_LABELS[r.status] || r.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
