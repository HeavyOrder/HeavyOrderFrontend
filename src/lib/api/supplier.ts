import apiClient from './client';
import {
  ApiResponse,
  SupplierOrder,
  ChangeOrderStatusRequest,
} from '@/types';

// 공급사 주문 관리 API
export const supplierApi = {
  // 받은 주문 목록 조회
  getOrders: () =>
    apiClient.get<ApiResponse<SupplierOrder[]>>('/supplier/orders'),

  // 주문 상태 변경 (승인, 배송완료 등)
  changeOrderStatus: (data: ChangeOrderStatusRequest) =>
    apiClient.patch<ApiResponse<void>>('/supplier/orders', data),
};
