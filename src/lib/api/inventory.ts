import apiClient from './client';
import {
  ApiResponse,
  InventoryResponse,
  InventorySearchParams,
  InventoryConsumeRequest,
  InventoryRestockRequest,
  InventoryCreateRequest,
} from '@/types';

// 재고 관련 API
export const inventoryApi = {
  // 내 재고 목록 조회
  getMyInventories: (params?: InventorySearchParams) =>
    apiClient.get<ApiResponse<InventoryResponse[]>>('/inventory', { params }),

  // 재고 차감 (PATCH /inventory/{id}/consume)
  consume: (inventoryId: number, data: InventoryConsumeRequest) =>
    apiClient.patch<ApiResponse<boolean>>(`/inventory/${inventoryId}/consume`, data),

  // 재고 입고 (PATCH /inventory/{id}/restock)
  restock: (inventoryId: number, data: InventoryRestockRequest) =>
    apiClient.patch<ApiResponse<null>>(`/inventory/${inventoryId}/restock`, data),

  // 재고 생성 (POST /inventory)
  create: (data: InventoryCreateRequest) =>
    apiClient.post<ApiResponse<number>>('/inventory', data),
};
