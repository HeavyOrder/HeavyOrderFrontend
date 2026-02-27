// 금액을 한국 원화 형식으로 포맷
// 예: 15000 → "15,000원"
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount) + '원';
}

// ISO 날짜 문자열을 한국 날짜 형식으로 변환
// 예: "2024-01-15T10:30:00" → "2024. 01. 15."
export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

// ISO 날짜 문자열을 한국 날짜+시간 형식으로 변환
// 예: "2024-01-15T10:30:00" → "2024. 01. 15. 오전 10:30"
export function formatDateTime(isoString: string): string {
  return new Date(isoString).toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
