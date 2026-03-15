import apiClient from './client';
import {
  ApiResponse,
  PartResponse,
  PartDetailResponse,
  PartRegisterRequest,
  ProductSearchParams,
} from '@/types';

// 부품 관련 API
export const partsApi = {
  // 부품 전체 목록 조회
  getList: () =>
    apiClient.get<ApiResponse<PartResponse[]>>('/parts'),

  // 부품 검색
  search: (params: ProductSearchParams) =>
    apiClient.get<ApiResponse<PartResponse[]>>('/parts/search', { params }),

  // 부품 상세 조회
  getById: (id: number) =>
    apiClient.get<ApiResponse<PartDetailResponse>>(`/parts/${id}`),

  // 부품 등록 (공급사 전용)
  register: (data: PartRegisterRequest) =>
    apiClient.post<ApiResponse<number>>('/parts', data),

  // 부품 이미지 업로드 (공급사 전용)
  uploadImage: (id: number, imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return apiClient.post<ApiResponse<string>>(`/parts/${id}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
