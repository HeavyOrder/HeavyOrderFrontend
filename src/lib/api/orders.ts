import apiClient from './client';
import {
  ApiResponse,
  OrderRequest,
  OrderResponse,
  MyOrderListItem,
} from '@/types';

// 수리점 주문 관련 API
export const ordersApi = {
  // 주문 생성
  create: (data: OrderRequest) =>
    apiClient.post<ApiResponse<OrderResponse>>('/orders', data),

  // 내 주문 목록 조회
  getMyOrders: () =>
    apiClient.get<ApiResponse<MyOrderListItem[]>>('/orders'),

  // 주문 취소
  cancel: (orderId: number) =>
    apiClient.patch<ApiResponse<OrderResponse>>(`/orders/${orderId}`),
};
