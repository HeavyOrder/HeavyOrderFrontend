import apiClient from './client';
import {
  ApiResponse,
  Member,
  LoginRequest,
  MachineDriverSignUpRequest,
  RepairShopSignUpRequest,
  SupplierCompanySignUpRequest,
  MemberResponse,
} from '@/types';

// 인증 관련 API
export const authApi = {
  // 장비기사 회원가입
  signUpMachineDriver: (data: MachineDriverSignUpRequest) =>
    apiClient.post<ApiResponse<Member>>('/auth/sign-up/machine-driver', data),

  // 수리점 회원가입
  signUpRepairShop: (data: RepairShopSignUpRequest) =>
    apiClient.post<ApiResponse<Member>>('/auth/sign-up/repair-shop', data),

  // 공급사 회원가입
  signUpSupplierCompany: (data: SupplierCompanySignUpRequest) =>
    apiClient.post<ApiResponse<Member>>('/auth/sign-up/supplier-company', data),

  // 로그인
  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<Member>>('/auth/login', data),

  // 로그아웃
  logout: () => apiClient.post('/auth/logout'),

  // 회원 탈퇴 (Soft Delete - 개인정보 익명화, 푸시 토큰 삭제)
  deleteAccount: () => apiClient.delete<ApiResponse<null>>('/auth/account'),
};

// 사용자 정보 관련 API
export const userApi = {
  // 내 정보 조회
  getMe: () => apiClient.get<ApiResponse<MemberResponse>>('/user/me'),

  // 홈 - 로그인 상태 확인 (GET /)
  checkLoginStatus: () => apiClient.get<ApiResponse<MemberResponse>>('/'),
};
