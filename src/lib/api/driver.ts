import apiClient from './client';
import {
  ApiResponse,
  RepairShopListItem,
  RepairShopDetail,
  AvailableSlot,
} from '@/types';

// 장비기사 전용 API (/driver/*)
export const driverApi = {
  // 근처 공업사 목록 조회 (위치 기반)
  getNearbyRepairShops: (lat: number, lng: number, radius?: number) =>
    apiClient.get<ApiResponse<RepairShopListItem[]>>('/driver/repair-shops', {
      params: { lat, lng, ...(radius !== undefined && { radius }) },
    }),

  // 공업사 상세 조회
  getRepairShopDetail: (shopId: number) =>
    apiClient.get<ApiResponse<RepairShopDetail>>(`/driver/repair-shops/${shopId}`),

  // 예약 가능 시간대 조회 (YYYY-MM-DD 형식)
  getAvailableSlots: (shopId: number, date: string) =>
    apiClient.get<ApiResponse<AvailableSlot[]>>(`/driver/repair-shops/${shopId}/slots`, {
      params: { date },
    }),
};
