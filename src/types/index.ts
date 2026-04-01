// ============================================
// 공통 타입
// ============================================

// API 응답 타입 (백엔드 ApiResponse와 동일)
export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
}

// 페이지네이션 응답 타입
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

// ============================================
// 회원 관련 타입
// ============================================

// 역할 타입 (백엔드 RoleType enum과 동일)
export type RoleType = 'REPAIR_SHOP' | 'SUPPLIER' | 'DRIVER' | 'ADMIN';

// 회원 엔티티 (로그인 응답에 사용)
export interface Member {
  id: number;
  email: string;
  password?: string; // 응답에서는 제외될 수 있음
  role: RoleType;
  phoneNumber: string;
  businessName?: string;
  address?: string;
}

// 회원 응답 DTO (UserController /user/me 응답)
export interface MemberResponse {
  email: string;
  roleType: RoleType;
  phoneNumber: string;
  businessName: string | null;
}

// 로그인 요청 DTO
export interface LoginRequest {
  email: string;
  password: string;
}

// 기본 회원가입 DTO (공통 필드)
export interface MemberSignUpRequest {
  email: string;
  password: string;
  role: string;
  phoneNumber: string;
}

// 장비기사 회원가입 DTO
export interface MachineDriverSignUpRequest extends MemberSignUpRequest {
  latitude?: number;  // 위도 (선택)
  longitude?: number; // 경도 (선택)
}

// 수리점 회원가입 DTO
export interface RepairShopSignUpRequest extends MemberSignUpRequest {
  businessName: string;
  address: string;
  latitude: number;  // 위도 (필수)
  longitude: number; // 경도 (필수)
}

// 공급사 회원가입 DTO
export interface SupplierCompanySignUpRequest extends MemberSignUpRequest {
  businessName: string;
  address: string;
}

// ============================================
// 부품 관련 타입
// ============================================

// 부품 목록 응답 DTO
export interface PartResponse {
  id: number;
  supplier: string; // 공급사명
  name: string;
  price: number; // BigDecimal -> number
  imageUrl: string | null; // Cloudinary 이미지 URL
}

// 부품 상세 응답 DTO
export interface PartDetailResponse extends PartResponse {
  description: string;
}

// 부품 등록 요청 DTO
export interface PartRegisterRequest {
  name: string;
  description: string;
  price: number;
}

// 부품 검색 파라미터
export interface ProductSearchParams {
  keyword?: string;
  supplier?: string;
}

// ============================================
// 주문 관련 타입 (수리점)
// ============================================

// 주문 상태 (백엔드 OrderStatus enum과 동일)
export type OrderStatus = 'PENDING' | 'APPROVED' | 'SHIPPED' | 'CANCELED';

// 주문 상태 한글 매핑
export const OrderStatusLabel: Record<OrderStatus, string> = {
  PENDING: '대기중',
  APPROVED: '주문 승인',
  SHIPPED: '배송 완료',
  CANCELED: '취소됨',
};

// 주문 아이템 요청 DTO
export interface OrderItemRequest {
  productId: number;
  quantity: number;
}

// 주문 요청 DTO
export interface OrderRequest {
  receiverName: string;
  phoneNumber: string;
  address: string;
  items: OrderItemRequest[];
}

// 주문 아이템 응답 DTO
export interface OrderItemResponse {
  id: number;
  supplier: string;
  name: string;
  price: number;
  quantity: number;
}

// 주문 응답 DTO
export interface OrderResponse {
  orderId: number;
  supplierName: string;
  orderedItems: OrderItemResponse[];
  totalAmount: number;
  orderStatus: OrderStatus;
  receiverName: string;
  phoneNumber: string;
  address: string;
  orderTime: string; // LocalDateTime -> ISO string
}

// 내 주문 목록 DTO
export interface MyOrderListItem {
  id: number;
  title: string; // "상품명 외 N건" 형식
  totalAmount: number;
  orderStatus: OrderStatus;
  orderTime: string;
}

// ============================================
// 주문 관련 타입 (공급사)
// ============================================

// 공급사 주문 아이템 DTO
export interface SupplierOrderItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  itemTotalAmount: number;
}

// 공급사 주문 DTO
export interface SupplierOrder {
  orderId: number;
  orderStatus: OrderStatus;
  orderedAt: string;
  receiverName: string;
  phoneNumber: string;
  address: string;
  items: SupplierOrderItem[];
}

// 주문 상태 변경 요청 DTO
export interface ChangeOrderStatusRequest {
  orderId: number;
  toStatus: OrderStatus;
}

// ============================================
// 재고 관련 타입
// ============================================

// 재고 응답 DTO
export interface InventoryResponse {
  inventoryId: number;
  productName: string;
  stock: number;
}

// 재고 검색 파라미터
export interface InventorySearchParams {
  partName?: string;
  stock?: number;
}

// 재고 차감 요청 DTO (PATCH /inventory/{id}/consume)
export interface InventoryConsumeRequest {
  consumeQuantity: number;
}

// 재고 입고 요청 DTO (PATCH /inventory/{id}/restock)
export interface InventoryRestockRequest {
  restockQuantity: number;
}

// 재고 생성 요청 DTO (POST /inventory)
export interface InventoryCreateRequest {
  productId: number;
  initQuantity: number;
  safetyQuantity?: number;
}

// 장바구니 아이템 (발주 페이지에서 사용)
export interface CartItem {
  product: PartResponse;
  quantity: number;
}

// ============================================
// 고객 관련 타입
// ============================================

// 고객 등록 요청 DTO
export interface CustomerRequest {
  name: string;
  phoneNumber: string;
}

// 고객 응답 DTO
export interface CustomerResponse {
  id: number;
  name: string;
  phoneNumber: string;
  driverId?: number; // 연동된 드라이버 계정 ID (수동 등록 고객은 null)
}

// 고객 수정 요청 DTO
export interface CustomerUpdateRequest {
  name?: string;
  phoneNumber?: string;
}

// ============================================
// 드라이버 관련 타입 (장비기사 전용)
// ============================================

// 근처 공업사 목록 아이템
export interface RepairShopListItem {
  id: number;
  businessName: string; // 공업사명
  address: string;
  phoneNumber: string;
  distanceKm: number; // 현재 위치로부터 거리 (km)
}

// 공업사 상세 정보
export interface RepairShopDetail {
  id: number;
  businessName: string;
  address: string;
  phoneNumber: string;
  latitude: number | null;
  longitude: number | null;
}

// 예약 가능 시간대
export interface AvailableSlot {
  slotTime: string; // ISO 8601 형식 (예: "2026-03-19T09:00:00")
  available: boolean; // 예약 가능 여부
}

// 근처 공업사 검색 파라미터
export interface RepairShopSearchParams {
  lat: number;
  lng: number;
  radius?: number; // 검색 반경 km (기본값: 10)
}

// ============================================
// 예약 관련 타입
// ============================================

// 예약 상태 (백엔드 ReservationStatus enum과 동일)
export type ReservationStatus = 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELED';

// 예약 상태 한글 매핑
export const ReservationStatusLabel: Record<ReservationStatus, string> = {
  PENDING: '대기중',
  APPROVED: '승인됨',
  COMPLETED: '완료됨',
  CANCELED: '취소됨',
};

// 예약 등록 요청 DTO (장비기사)
export interface ReservationRequest {
  repairShopId: number;
  time: string;
  memo?: string; // 메모 (선택)
}

// 공업사 예약 응답 DTO
export interface ReservationShopResponse {
  id: number;
  driverEmail: string;
  driverPhoneNumber: string;
  time: string;
  status: ReservationStatus;
  memo: string | null;
}

// 장비기사 예약 응답 DTO
export interface ReservationDriverResponse {
  id: number;
  shopName: string;
  shopPhoneNumber: string;
  time: string;
  status: ReservationStatus;
  memo: string | null;
}

// 예약 상태 변경 요청 DTO
export interface ChangeReservationStatusRequest {
  status: ReservationStatus;
}
