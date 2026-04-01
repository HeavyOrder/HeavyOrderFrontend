# 현재 프론트엔드에 반영된 API 명세 (스냅샷)

> 이 파일은 프론트엔드에 마지막으로 반영된 API_SPEC.md의 스냅샷입니다.
> 백엔드가 API_SPEC.md를 업데이트하면, 이 파일과 비교하여 변경사항만 확인합니다.
> 반영 완료 후 이 파일을 API_SPEC.md와 동일하게 업데이트합니다.
>
> **마지막 동기화**: 2026-04-01

---

## API 엔드포인트 요약표

| 메서드 | 경로 | 설명 | 인증 | 프론트엔드 파일 |
|--------|------|------|------|----------------|
| GET | `/` | 홈 (로그인 상태 확인) | 선택 | `src/lib/api/auth.ts` |
| POST | `/auth/sign-up/machine-driver` | 기계운전자 회원가입 | X | `src/lib/api/auth.ts` |
| POST | `/auth/sign-up/repair-shop` | 수리점 회원가입 | X | `src/lib/api/auth.ts` |
| POST | `/auth/sign-up/supplier-company` | 공급사 회원가입 | X | `src/lib/api/auth.ts` |
| POST | `/auth/login` | 로그인 | X | `src/lib/api/auth.ts` |
| POST | `/auth/logout` | 로그아웃 | O | `src/lib/api/auth.ts` |
| DELETE | `/auth/account` | 회원 탈퇴 | O | `src/lib/api/auth.ts` |
| GET | `/user/me` | 내 정보 조회 | O | `src/lib/api/auth.ts` |
| GET | `/parts` | 부품 목록 조회 | X | `src/lib/api/parts.ts` |
| GET | `/parts/search` | 부품 검색 | X | `src/lib/api/parts.ts` |
| GET | `/parts/{id}` | 부품 상세 조회 | X | `src/lib/api/parts.ts` |
| POST | `/parts` | 부품 등록 | O | `src/lib/api/parts.ts` |
| POST | `/parts/{id}/image` | 부품 이미지 업로드 | O | `src/lib/api/parts.ts` |
| GET | `/inventory` | 내 재고 조회 | O | `src/lib/api/inventory.ts` |
| PATCH | `/inventory/{id}/consume` | 재고 차감 | O | `src/lib/api/inventory.ts` |
| PATCH | `/inventory/{id}/restock` | 재고 입고 | O | `src/lib/api/inventory.ts` |
| POST | `/inventory` | 재고 생성 | O | `src/lib/api/inventory.ts` |
| POST | `/orders` | 주문 생성 | O | `src/lib/api/orders.ts` |
| GET | `/orders` | 내 주문 목록 조회 | O | `src/lib/api/orders.ts` |
| PATCH | `/orders/{id}` | 주문 취소 | O | `src/lib/api/orders.ts` |
| GET | `/supplier/orders` | 공급사 주문 목록 조회 | O (공급사) | `src/lib/api/supplier.ts` |
| PATCH | `/supplier/orders` | 주문 상태 변경 | O (공급사) | `src/lib/api/supplier.ts` |
| POST | `/customer` | 고객 등록 | O | `src/lib/api/customer.ts` |
| GET | `/customer` | 내 고객 목록 조회 | O | `src/lib/api/customer.ts` |
| GET | `/customer/{id}` | 고객 상세 조회 | O | `src/lib/api/customer.ts` |
| PUT | `/customer/{id}` | 고객 정보 수정 | O | `src/lib/api/customer.ts` |
| GET | `/driver/repair-shops` | 근처 공업사 목록 조회 | O (장비기사) | `src/lib/api/driver.ts` |
| GET | `/driver/repair-shops/{shopId}` | 공업사 상세 조회 | O (장비기사) | `src/lib/api/driver.ts` |
| GET | `/driver/repair-shops/{shopId}/slots` | 예약 가능 시간대 조회 | O (장비기사) | `src/lib/api/driver.ts` |
| POST | `/reservation` | 예약 등록 | O (장비기사) | `src/lib/api/reservation.ts` |
| GET | `/reservation/repair-shop` | 공업사 예약 목록 조회 | O (공업사) | `src/lib/api/reservation.ts` |
| GET | `/reservation/repair-shop/{id}` | 공업사 예약 상세 조회 | O (공업사) | `src/lib/api/reservation.ts` |
| GET | `/reservation/repair-shop/customers/{driverId}` | 특정 고객 예약 목록 조회 | O (공업사) | `src/lib/api/reservation.ts` |
| PATCH | `/reservation/repair-shop/{id}` | 공업사 예약 상태 변경 | O (공업사) | `src/lib/api/reservation.ts` |
| GET | `/reservation/driver` | 장비기사 예약 목록 조회 | O (장비기사) | `src/lib/api/reservation.ts` |
| GET | `/reservation/driver/{id}` | 장비기사 예약 상세 조회 | O (장비기사) | `src/lib/api/reservation.ts` |
| PATCH | `/reservation/driver/{id}` | 장비기사 예약 상태 변경 | O (장비기사) | `src/lib/api/reservation.ts` |
| POST | `/push/token` | 푸시 토큰 등록 | O | `src/lib/api/push.ts` |
| DELETE | `/push/token` | 푸시 토큰 삭제 | O | `src/lib/api/push.ts` |

---

## Enum 타입

```typescript
type RoleType = 'REPAIR_SHOP' | 'SUPPLIER' | 'DRIVER' | 'ADMIN';
type OrderStatus = 'PENDING' | 'APPROVED' | 'SHIPPED' | 'CANCELED';
type ReservationStatus = 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELED';
type PushPlatform = 'ANDROID' | 'WEB';
```

---

## 공통 응답 형식

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T | null;
}
```

---

## 상세 명세

아래는 각 엔드포인트의 Request/Response 상세입니다.

### 인증 API (`/auth`)

#### POST `/auth/sign-up/machine-driver`
```typescript
// Request
{ email: string; password: string; role: string; phoneNumber: string; latitude?: number; longitude?: number; }
// Response: ApiResponse<Member>
```

#### POST `/auth/sign-up/repair-shop`
```typescript
// Request
{ email: string; password: string; role: string; phoneNumber: string; businessName: string; address: string; latitude: number; longitude: number; }
// Response: ApiResponse<Member>
```

#### POST `/auth/sign-up/supplier-company`
```typescript
// Request
{ email: string; password: string; role: string; phoneNumber: string; businessName: string; address: string; }
// Response: ApiResponse<Member>
```

#### POST `/auth/login`
```typescript
// Request
{ email: string; password: string; }
// Response: ApiResponse<Member> + JSESSIONID 쿠키 설정
```

#### POST `/auth/logout`
```typescript
// Request: 없음 (세션 쿠키)
// Response: 없음
```

#### DELETE `/auth/account`
```typescript
// Request: 없음 (세션 쿠키)
// Response: ApiResponse<null>
// Note: Soft Delete. 개인정보 익명화, 푸시 토큰 삭제
```

### 사용자 API (`/user`)

#### GET `/user/me`
```typescript
// Response
ApiResponse<{ email: string; roleType: RoleType; phoneNumber: string; businessName: string | null; }>
```

### 부품 API (`/parts`)

#### GET `/parts`
```typescript
// Response
ApiResponse<Array<{ id: number; supplier: string; name: string; price: number; imageUrl: string | null; }>>
```

#### GET `/parts/search?keyword=&supplier=`
```typescript
// Response: 위와 동일
```

#### GET `/parts/{id}`
```typescript
// Response
ApiResponse<{ id: number; supplier: string; name: string; price: number; imageUrl: string | null; description: string; }>
```

#### POST `/parts`
```typescript
// Request
{ name: string; description: string; price: number; }
// Response: ApiResponse<number> (생성된 부품 ID)
```

#### POST `/parts/{id}/image` (multipart/form-data)
```typescript
// Form Data: image (File - jpg, jpeg, png, webp)
// Response: ApiResponse<string> (Cloudinary 이미지 URL)
```

### 재고 API (`/inventory`)

#### GET `/inventory?partName=&stock=`
```typescript
// Response
ApiResponse<Array<{ inventoryId: number; productName: string; stock: number; }>>
```

#### PATCH `/inventory/{id}/consume`
```typescript
// Request
{ consumeQuantity: number; }
// Response: ApiResponse<boolean> (true면 안전 재고 이하)
```

#### PATCH `/inventory/{id}/restock`
```typescript
// Request
{ restockQuantity: number; }
// Response: ApiResponse<null>
```

#### POST `/inventory`
```typescript
// Request
{ productId: number; initQuantity: number; safetyQuantity?: number; }
// Response: ApiResponse<number> (생성된 재고 ID)
```

### 주문 API (`/orders`)

#### POST `/orders`
```typescript
// Request
{ receiverName: string; phoneNumber: string; address: string; items: Array<{ productId: number; quantity: number; }>; }
// Response
ApiResponse<{ orderId: number; supplierName: string; orderedItems: Array<{ id: number; supplier: string; name: string; price: number; quantity: number; }>; totalAmount: number; orderStatus: OrderStatus; receiverName: string; phoneNumber: string; address: string; orderTime: string; }>
```

#### GET `/orders`
```typescript
// Response
ApiResponse<Array<{ id: number; title: string; totalAmount: number; orderStatus: OrderStatus; orderTime: string; }>>
```

#### PATCH `/orders/{id}`
```typescript
// Response: OrderResponse (위와 동일한 구조)
```

### 공급사 API (`/supplier`)

#### GET `/supplier/orders`
```typescript
// Response
ApiResponse<Array<{ orderId: number; orderStatus: OrderStatus; orderedAt: string; receiverName: string; phoneNumber: string; address: string; items: Array<{ productId: number; productName: string; unitPrice: number; quantity: number; itemTotalAmount: number; }>; }>>
```

#### PATCH `/supplier/orders`
```typescript
// Request
{ orderId: number; toStatus: OrderStatus; }
// Response: ApiResponse<null>
```

### 고객 API (`/customer`)

#### POST `/customer`
```typescript
// Request
{ name: string; phoneNumber: string; }
// Response: ApiResponse<number>
```

#### GET `/customer`
```typescript
// Response
ApiResponse<Array<{ id: number; name: string; phoneNumber: string; driverId: number | null; }>>
```

#### GET `/customer/{id}`
```typescript
// Response
ApiResponse<{ id: number; name: string; phoneNumber: string; driverId: number | null; }>
```

#### PUT `/customer/{id}`
```typescript
// Request
{ name?: string; phoneNumber?: string; }
// Response: ApiResponse<null>
```

### 드라이버 API (`/driver`)

#### GET `/driver/repair-shops?lat=&lng=&radius=`
```typescript
// Response
ApiResponse<Array<{ id: number; businessName: string; address: string; phoneNumber: string; distanceKm: number; }>>
```

#### GET `/driver/repair-shops/{shopId}`
```typescript
// Response
ApiResponse<{ id: number; businessName: string; address: string; phoneNumber: string; latitude: number | null; longitude: number | null; }>
```

#### GET `/driver/repair-shops/{shopId}/slots?date=YYYY-MM-DD`
```typescript
// Response
ApiResponse<Array<{ slotTime: string; available: boolean; }>>
```

### 예약 API (`/reservation`)

#### POST `/reservation`
```typescript
// Request
{ repairShopId: number; time: string; memo?: string; }
// Response: ApiResponse<number>
```

#### GET `/reservation/repair-shop?date=YYYY-MM-DD`
```typescript
// Response
ApiResponse<Array<{ id: number; driverEmail: string; driverPhoneNumber: string; time: string; status: ReservationStatus; memo: string | null; }>>
```

#### GET `/reservation/repair-shop/{id}`
```typescript
// Response: 위와 동일 (단일 객체)
```

#### GET `/reservation/repair-shop/customers/{driverId}`
```typescript
// Response: 위와 동일 (배열)
```

#### PATCH `/reservation/repair-shop/{id}`
```typescript
// Request
{ status: ReservationStatus; }
// Response: ApiResponse<null>
```

#### GET `/reservation/driver`
```typescript
// Response
ApiResponse<Array<{ id: number; shopName: string; shopPhoneNumber: string; time: string; status: ReservationStatus; memo: string | null; }>>
```

#### GET `/reservation/driver/{id}`
```typescript
// Response: 위와 동일 (단일 객체)
```

#### PATCH `/reservation/driver/{id}`
```typescript
// Request
{ status: ReservationStatus; } // PENDING 또는 CANCELED만 가능
// Response: ApiResponse<null>
```

### 푸시 알림 API (`/push/token`)

#### POST `/push/token`
```typescript
// Request
{ token: string; platform: PushPlatform; }
// Response: ApiResponse<null>
```

#### DELETE `/push/token?token=`
```typescript
// Response: ApiResponse<null>
```

### 홈 API

#### GET `/`
```typescript
// Response (로그인 됨)
ApiResponse<{ email: string; roleType: RoleType; phoneNumber: string; businessName: string | null; }>
// Response (로그인 안됨)
{ success: false, message: "로그인이 필요한 사용자입니다.", data: null }
```
