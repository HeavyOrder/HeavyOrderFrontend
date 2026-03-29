import apiClient from './client';
import {
  ApiResponse,
  ReservationRequest,
  ReservationShopResponse,
  ReservationDriverResponse,
  ChangeReservationStatusRequest,
} from '@/types';

// 예약 관련 API
export const reservationApi = {
  // 예약 등록 (장비기사)
  create: (data: ReservationRequest) =>
    apiClient.post<ApiResponse<number>>('/reservation', data),

  // 공업사 예약 목록 조회 (date: YYYY-MM-DD 형식, 선택)
  getRepairShopReservations: (date?: string) =>
    apiClient.get<ApiResponse<ReservationShopResponse[]>>('/reservation/repair-shop', {
      params: date ? { date } : undefined,
    }),

  // 공업사 예약 상세 조회
  getRepairShopReservation: (id: number) =>
    apiClient.get<ApiResponse<ReservationShopResponse>>(`/reservation/repair-shop/${id}`),

  // 공업사 - 특정 고객 예약 목록 조회
  getRepairShopCustomerReservations: (driverId: number) =>
    apiClient.get<ApiResponse<ReservationShopResponse[]>>(`/reservation/repair-shop/customers/${driverId}`),

  // 공업사 예약 상태 변경
  changeRepairShopStatus: (id: number, data: ChangeReservationStatusRequest) =>
    apiClient.patch<ApiResponse<null>>(`/reservation/repair-shop/${id}`, data),

  // 장비기사 예약 목록 조회
  getDriverReservations: () =>
    apiClient.get<ApiResponse<ReservationDriverResponse[]>>('/reservation/driver'),

  // 장비기사 예약 상세 조회
  getDriverReservation: (id: number) =>
    apiClient.get<ApiResponse<ReservationDriverResponse>>(`/reservation/driver/${id}`),

  // 장비기사 예약 상태 변경 (PENDING 또는 CANCELED만 가능)
  changeDriverStatus: (id: number, data: ChangeReservationStatusRequest) =>
    apiClient.patch<ApiResponse<null>>(`/reservation/driver/${id}`, data),
};
