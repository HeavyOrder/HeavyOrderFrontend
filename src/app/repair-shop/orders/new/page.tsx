'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useRoleGuard } from '@/lib/hooks';
import { partsApi, ordersApi } from '@/lib/api';
import { Button, Input, Skeleton } from '@/components/ui';
import { PartResponse, CartItem } from '@/types';
import { formatCurrency } from '@/lib/utils';

export default function NewOrder() {
  const { isAuthorized, isLoading: authLoading, user } = useRoleGuard(['REPAIR_SHOP']);
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // 전체 부품 목록
  const [allParts, setAllParts] = useState<PartResponse[]>([]);
  const [partsLoading, setPartsLoading] = useState(true);

  // 검색 상태
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<PartResponse[] | null>(null);
  const [searching, setSearching] = useState(false);

  // 장바구니
  const [cart, setCart] = useState<CartItem[]>([]);

  // 배송 정보
  const [delivery, setDelivery] = useState({ receiverName: '', phoneNumber: '', address: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 페이지 로드 시 전체 부품 목록 조회
  useEffect(() => {
    const fetchParts = async () => {
      try {
        const res = await partsApi.getList();
        setAllParts(res.data.data || []);
      } catch { setAllParts([]); }
      setPartsLoading(false);
    };
    if (isAuthorized) fetchParts();
  }, [isAuthorized]);

  // 검색 결과 또는 전체 목록 표시
  const displayParts = searchResults !== null ? searchResults : allParts;

  const handleSearch = async () => {
    if (!keyword.trim()) {
      // 검색어 비우면 전체 목록으로 복원
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const res = await partsApi.search({ keyword: keyword.trim() });
      setSearchResults(res.data.data || []);
    } catch { setSearchResults([]); }
    setSearching(false);
  };

  // 검색어 지우면 전체 목록 복원
  const handleKeywordChange = (value: string) => {
    setKeyword(value);
    if (!value.trim()) setSearchResults(null);
  };

  const addToCart = (product: PartResponse) => {
    setCart(prev => {
      const existing = prev.find(c => c.product.id === product.id);
      if (existing) return prev.map(c => c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (productId: number, qty: number) => {
    if (qty <= 0) { setCart(prev => prev.filter(c => c.product.id !== productId)); return; }
    setCart(prev => prev.map(c => c.product.id === productId ? { ...c, quantity: qty } : c));
  };

  const removeItem = (productId: number) => setCart(prev => prev.filter(c => c.product.id !== productId));

  const totalAmount = cart.reduce((sum, c) => sum + c.product.price * c.quantity, 0);

  const handleSubmit = async () => {
    if (!delivery.receiverName || !delivery.phoneNumber || !delivery.address) {
      setError('모든 배송 정보를 입력해주세요.'); return;
    }
    setSubmitting(true);
    setError('');
    try {
      await ordersApi.create({
        receiverName: delivery.receiverName,
        phoneNumber: delivery.phoneNumber,
        address: delivery.address,
        items: cart.map(c => ({ productId: c.product.id, quantity: c.quantity })),
      });
      router.push('/repair-shop/orders');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message || '발주에 실패했습니다.');
    }
    setSubmitting(false);
  };

  if (authLoading || !isAuthorized) return <div className="min-h-[60vh] flex items-center justify-center"><Skeleton variant="card" count={1} /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-xl font-bold text-[#1e293b] mb-1">새 발주</h1>
      <p className="text-sm text-[#475569] mb-6">부품을 검색하고 발주합니다</p>

      {/* 스텝 표시 */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
              step >= s ? 'bg-[#1d4ed8] text-white' : 'bg-[#f8f9fa] text-[#475569] border border-[#e2e8f0]'
            }`}>{s}</div>
            {s < 3 && <div className={`w-8 h-px ${step > s ? 'bg-[#1d4ed8]' : 'bg-[#e2e8f0]'}`} />}
          </div>
        ))}
        <span className="text-xs text-[#475569] ml-2">
          {step === 1 ? '부품 검색' : step === 2 ? '장바구니 확인' : '배송정보 입력'}
        </span>
      </div>

      {/* Step 1: 부품 검색 + 목록 */}
      {step === 1 && (
        <div>
          {/* 검색바 */}
          <div className="flex gap-2 mb-6">
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={keyword}
                onChange={e => handleKeywordChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="부품명으로 검색..."
                className="w-full pl-9 pr-3 py-2.5 rounded-lg text-sm bg-white border border-[#e2e8f0] text-[#1e293b] placeholder:text-[#475569] focus:outline-none focus:ring-2 focus:ring-[#1d4ed8]/20 focus:border-[#1d4ed8]/30"
              />
            </div>
            <Button onClick={handleSearch} loading={searching}>검색</Button>
          </div>

          {/* 검색 결과 안내 */}
          {searchResults !== null && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[#475569]">
                &quot;{keyword}&quot; 검색 결과 <span className="text-[#1e293b] font-medium">{searchResults.length}건</span>
              </p>
              <button
                onClick={() => { setKeyword(''); setSearchResults(null); }}
                className="text-xs text-[#1d4ed8] hover:text-[#1d4ed8] transition-colors"
              >
                전체 목록 보기
              </button>
            </div>
          )}

          {/* 부품 목록 (카드 그리드) */}
          {partsLoading || searching ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border border-[#e2e8f0] rounded-xl p-4 animate-pulse">
                  <div className="h-4 bg-[#f8f9fa] rounded w-3/4 mb-3" />
                  <div className="h-3 bg-[#f8f9fa] rounded w-1/2 mb-4" />
                  <div className="h-6 bg-[#f8f9fa] rounded w-1/3" />
                </div>
              ))}
            </div>
          ) : displayParts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {displayParts.map(p => {
                const inCart = cart.find(c => c.product.id === p.id);
                return (
                  <div
                    key={p.id}
                    className={`bg-white border rounded-xl overflow-hidden transition-all duration-150 ${
                      inCart ? 'border-[#1d4ed8]/40 shadow-sm' : 'border-[#e2e8f0] hover:border-[#1d4ed8]/30'
                    }`}
                  >
                    {/* 부품 이미지 */}
                    <div className="relative w-full aspect-square bg-[#f8f9fa] border-b border-[#f1f3f5]">
                      {p.imageUrl ? (
                        <Image
                          src={p.imageUrl}
                          alt={p.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-10 h-10 text-[#cbd5e1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      {inCart && (
                        <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-bold bg-[#1d4ed8] text-white rounded-full">
                          {inCart.quantity}개
                        </span>
                      )}
                    </div>

                    {/* 부품 정보 */}
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-[#1e293b] truncate">{p.name}</h3>
                      <p className="text-xs text-[#94a3b8] mt-0.5 truncate">{p.supplier}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-base font-bold font-mono text-[#1e293b]">
                          {formatCurrency(p.price)}
                        </span>
                        <button
                          onClick={() => addToCart(p)}
                          className="px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors bg-[#1d4ed8] text-white hover:bg-[#1e40af]"
                        >
                          + 담기
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <svg className="w-10 h-10 text-[#475569] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-sm text-[#475569]">
                {searchResults !== null ? '검색 결과가 없습니다' : '등록된 부품이 없습니다'}
              </p>
            </div>
          )}

          {/* 장바구니 미리보기 (하단 고정 스타일) */}
          {cart.length > 0 && (
            <div className="sticky bottom-4 bg-white border border-[#fde68a] rounded-xl p-4 shadow-lg shadow-black/30">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#b45309]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-sm font-medium text-[#1e293b]">장바구니 ({cart.length}개 품목)</span>
                </div>
                <span className="text-sm font-bold font-mono text-[#b45309]">{formatCurrency(totalAmount)}</span>
              </div>
              <div className="space-y-1.5 mb-3 max-h-24 overflow-y-auto">
                {cart.map(c => (
                  <div key={c.product.id} className="flex items-center justify-between text-xs">
                    <span className="text-[#475569] truncate mr-2">{c.product.name} x{c.quantity}</span>
                    <span className="text-[#1e293b] font-mono flex-shrink-0">{formatCurrency(c.product.price * c.quantity)}</span>
                  </div>
                ))}
              </div>
              <Button fullWidth onClick={() => setStep(2)}>다음: 장바구니 확인 &rarr;</Button>
            </div>
          )}
        </div>
      )}

      {/* Step 2: 장바구니 */}
      {step === 2 && (
        <div>
          <div className="bg-white border border-[#e2e8f0] rounded-xl overflow-hidden mb-4">
            {cart.map(c => (
              <div key={c.product.id} className="flex items-center justify-between px-5 py-3 border-b border-[#e2e8f0] last:border-0">
                <div>
                  <p className="text-sm text-[#1e293b]">{c.product.name}</p>
                  <p className="text-xs text-[#475569]">{c.product.supplier} · {formatCurrency(c.product.price)}/개</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-[#e2e8f0] rounded">
                    <button onClick={() => updateQty(c.product.id, c.quantity - 1)} className="px-2 py-1 text-sm text-[#475569] hover:text-[#1e293b]">-</button>
                    <span className="px-2 py-1 text-sm text-[#1e293b] font-mono border-x border-[#e2e8f0]">{c.quantity}</span>
                    <button onClick={() => updateQty(c.product.id, c.quantity + 1)} className="px-2 py-1 text-sm text-[#475569] hover:text-[#1e293b]">+</button>
                  </div>
                  <span className="text-sm font-mono text-[#1e293b] w-24 text-right">{formatCurrency(c.product.price * c.quantity)}</span>
                  <button onClick={() => removeItem(c.product.id)} className="text-xs text-[#b91c1c] hover:text-[#f87171]">삭제</button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between px-1 mb-4">
            <span className="text-sm text-[#475569]">합계</span>
            <span className="text-lg font-bold font-mono text-[#1e293b]">{formatCurrency(totalAmount)}</span>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(1)}>이전</Button>
            <Button fullWidth onClick={() => setStep(3)}>다음: 배송정보</Button>
          </div>
        </div>
      )}

      {/* Step 3: 배송정보 */}
      {step === 3 && (
        <div>
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 space-y-4 mb-4">
            <Input label="수령인" value={delivery.receiverName} onChange={e => setDelivery(p => ({ ...p, receiverName: e.target.value }))} placeholder="수령인 이름" required />
            <Input label="연락처" value={delivery.phoneNumber} onChange={e => setDelivery(p => ({ ...p, phoneNumber: e.target.value }))} placeholder="010-0000-0000" required />
            <Input label="배송 주소" value={delivery.address} onChange={e => setDelivery(p => ({ ...p, address: e.target.value }))} placeholder="배송지 주소" required />
          </div>

          {/* 주문 요약 */}
          <div className="bg-white border border-[#e2e8f0] rounded-xl p-5 mb-4">
            <h3 className="text-sm font-semibold text-[#1e293b] mb-3">주문 요약</h3>
            <div className="space-y-2 mb-3">
              {cart.map(c => (
                <div key={c.product.id} className="flex justify-between text-sm">
                  <span className="text-[#475569]">{c.product.name} x{c.quantity}</span>
                  <span className="text-[#1e293b] font-mono">{formatCurrency(c.product.price * c.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-[#e2e8f0] pt-3 flex justify-between">
              <span className="text-sm font-medium text-[#1e293b]">합계</span>
              <span className="text-base font-bold font-mono text-[#b45309]">{formatCurrency(totalAmount)}</span>
            </div>
          </div>

          {error && <div className="bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca] p-3 rounded-lg text-sm mb-4">{error}</div>}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setStep(2)}>이전</Button>
            <Button fullWidth onClick={handleSubmit} loading={submitting}>발주 확정</Button>
          </div>
        </div>
      )}
    </div>
  );
}
