import apiClient from './client';
import {
  ApiResponse,
  WorkLogRequest,
  WorkLogResponse,
  WorkLogPhotoResponse,
  WorkLogPhotoType,
  Page,
} from '@/types';

// 작업일지 관련 API (장비기사 전용)
export const worklogApi = {
  // 작업일지 등록
  create: (data: WorkLogRequest) =>
    apiClient.post<ApiResponse<number>>('/worklog', data),

  // 내 작업일지 목록 조회 (기간·페이징)
  getList: (params?: {
    from?: string;  // YYYY-MM-DD
    to?: string;    // YYYY-MM-DD
    page?: number;
    size?: number;
    sort?: string;
  }) =>
    apiClient.get<ApiResponse<Page<WorkLogResponse>>>('/worklog', { params }),

  // 작업일지 단건 조회
  getOne: (id: number) =>
    apiClient.get<ApiResponse<WorkLogResponse>>(`/worklog/${id}`),

  // 작업일지 수정
  update: (id: number, data: WorkLogRequest) =>
    apiClient.patch<ApiResponse<WorkLogResponse>>(`/worklog/${id}`, data),

  // 작업일지 삭제
  delete: (id: number) =>
    apiClient.delete<ApiResponse<null>>(`/worklog/${id}`),

  // 작업일지 사진 업로드 (multipart/form-data)
  uploadPhotos: (id: number, files: File[], type: WorkLogPhotoType) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return apiClient.post<ApiResponse<WorkLogPhotoResponse[]>>(
      `/worklog/${id}/photos?type=${type}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
  },

  // 작업일지 사진 삭제
  deletePhoto: (photoId: number) =>
    apiClient.delete<ApiResponse<null>>(`/worklog/photos/${photoId}`),
};
