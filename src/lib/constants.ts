// 기능 플래그
// 아직 백엔드에서 구현되지 않은 기능을 on/off 할 수 있음
export const FEATURE_FLAGS = {
  CUSTOMER_MANAGEMENT: false,   // 고객 관리
  DRIVER_RESERVATION: false,    // 장비기사 예약
  INVENTORY_INBOUND: false,     // 재고 입고
  SCHEDULE_MANAGEMENT: false,   // 일정 관리
} as const;
