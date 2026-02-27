// API 모듈 통합 export
// 사용 예: import { authApi, partsApi } from '@/lib/api';

export { default as apiClient } from './client';
export { authApi, userApi } from './auth';
export { partsApi } from './parts';
export { ordersApi } from './orders';
export { supplierApi } from './supplier';
export { inventoryApi } from './inventory';
export { customerApi } from './customer';
export { reservationApi } from './reservation';

// 타입 re-export (편의상)
export type { AxiosError } from 'axios';
