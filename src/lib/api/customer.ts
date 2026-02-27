import apiClient from './client';
import {
  ApiResponse,
  CustomerRequest,
  CustomerResponse,
  CustomerUpdateRequest,
} from '@/types';

// 고객 관리 API (공업사 전용)
export const customerApi = {
  // 고객 등록
  create: (data: CustomerRequest) =>
    apiClient.post<ApiResponse<number>>('/customer', data),

  // 내 고객 목록 조회
  getList: () =>
    apiClient.get<ApiResponse<CustomerResponse[]>>('/customer'),

  // 고객 상세 조회
  getById: (id: number) =>
    apiClient.get<ApiResponse<CustomerResponse>>(`/customer/${id}`),

  // 고객 정보 수정
  update: (id: number, data: CustomerUpdateRequest) =>
    apiClient.put<ApiResponse<null>>(`/customer/${id}`, data),
};
