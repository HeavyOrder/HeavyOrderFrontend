# HeavyOrder API 명세서

> 이 문서는 HeavyOrder 백엔드 API의 상세 명세입니다.

## 기본 정보

- **Base URL**: `http://localhost:8080`
- **인증 방식**: 세션 기반 (JSESSIONID 쿠키)
- **Content-Type**: `application/json`

---

## 공통 응답 형식

모든 API는 다음 형식으로 응답합니다:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T | null;
}
```

---

## Enum 타입

### RoleType (사용자 역할)

| 값 | 설명 |
|---|---|
| `REPAIR_SHOP` | 공업사 |
| `SUPPLIER` | 부품사 |
| `DRIVER` | 장비기사 |
| `ADMIN` | 관리자 |

### OrderStatus (주문 상태)

| 값 | 설명 |
|---|---|
| `PENDING` | 대기중 |
| `APPROVED` | 주문 승인 |
| `SHIPPED` | 배송 완료 |
| `CANCELED` | 취소됨 |

### ReservationStatus (예약 상태)

| 값 | 설명 |
|---|---|
| `PENDING` | 대기중 |
| `APPROVED` | 승인됨 |
| `COMPLETED` | 완료됨 |
| `CANCELED` | 취소됨 |

### PushPlatform (푸시 알림 플랫폼)

| 값 | 설명 |
|---|---|
| `ANDROID` | 안드로이드 |
| `WEB` | 웹 |

---

## 인증 API (`/auth`)

### 기계운전자 회원가입

```
POST /auth/sign-up/machine-driver
```

**Request Body:**
```typescript
{
  email: string;       // 이메일 (필수, 이메일 형식)
  password: string;    // 비밀번호 (필수)
  role: string;        // 역할 (필수)
  phoneNumber: string; // 전화번호 (필수)
  latitude?: number;   // 위도 (선택)
  longitude?: number;  // 경도 (선택)
}
```

**Response:**
```typescript
ApiResponse<Member>
```

---

### 수리점(공업사) 회원가입

```
POST /auth/sign-up/repair-shop
```

**Request Body:**
```typescript
{
  email: string;          // 이메일 (필수, 이메일 형식)
  password: string;       // 비밀번호 (필수)
  role: string;           // 역할 (필수)
  phoneNumber: string;    // 전화번호 (필수)
  businessName: string;   // 사업자명 (필수)
  businessNumber: string; // 사업자번호 (필수)
  address: string;        // 주소 (필수)
  latitude: number;       // 위도 (필수)
  longitude: number;      // 경도 (필수)
}
```

**Response:**
```typescript
ApiResponse<Member>
```

---

### 공급사(부품사) 회원가입

```
POST /auth/sign-up/supplier-company
```

**Request Body:**
```typescript
{
  email: string;          // 이메일 (필수, 이메일 형식)
  password: string;       // 비밀번호 (필수)
  role: string;           // 역할 (필수)
  phoneNumber: string;    // 전화번호 (필수)
  businessName: string;   // 사업자명 (필수)
  businessNumber: string; // 사업자번호 (필수)
  address: string;        // 주소 (필수)
}
```

**Response:**
```typescript
ApiResponse<Member>
```

---

### 로그인

```
POST /auth/login
```

**Request Body:**
```typescript
{
  email: string;    // 이메일 (필수, 이메일 형식)
  password: string; // 비밀번호 (필수)
}
```

**Response:**
```typescript
ApiResponse<Member>
```

**Note:** 성공 시 `JSESSIONID` 쿠키가 설정됩니다. 이후 요청에서 이 쿠키를 사용하여 인증합니다.

---

### 로그아웃

```
POST /auth/logout
```

**Request:** 없음 (세션 쿠키 필요)

**Response:** 없음

---

## 사용자 API (`/user`)

### 내 정보 조회

```
GET /user/me
```

**Headers:** 세션 쿠키 필요 (로그인 상태)

**Response:**
```typescript
ApiResponse<{
  email: string;
  roleType: RoleType;
  phoneNumber: string;
  businessName: string | null;
}>
```

---

## 부품 API (`/parts`)

### 부품 목록 조회

```
GET /parts
```

**Response:**
```typescript
ApiResponse<Array<{
  id: number;
  supplier: string;  // 공급사명
  name: string;      // 부품명
  price: number;     // 가격 (BigDecimal)
  imageUrl: string | null; // 이미지 URL
}>>
```

---

### 부품 검색

```
GET /parts/search
```

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `keyword` | string | 검색 키워드 (선택) |
| `supplier` | string | 공급사명 (선택) |

**Response:**
```typescript
ApiResponse<Array<{
  id: number;
  supplier: string;
  name: string;
  price: number;
  imageUrl: string | null;
}>>
```

---

### 부품 상세 조회

```
GET /parts/{id}
```

**Path Parameters:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `id` | number | 부품 ID |

**Response:**
```typescript
ApiResponse<{
  id: number;
  supplier: string;
  name: string;
  price: number;
  imageUrl: string | null;
  description: string;
}>
```

---

### 부품 등록

```
POST /parts
```

**Headers:** 세션 쿠키 필요 (로그인 상태)

**Request Body:**
```typescript
{
  name: string;        // 부품명 (필수)
  description: string; // 설명 (필수)
  price: number;       // 가격 (필수, 0 이상)
}
```

**Response:**
```typescript
ApiResponse<number>
// message: "상품이 성공적으로 저장되었습니다."
// data: 생성된 부품 ID
```

---

### 부품 이미지 업로드

```
POST /parts/{id}/image
```

**Path Parameters:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `id` | number | 부품 ID |

**Headers:** 세션 쿠키 필요 (로그인 상태)

**Content-Type:** `multipart/form-data`

**Form Data:**
| 필드 | 타입 | 설명 |
|------|------|------|
| `image` | File | 이미지 파일 (jpg, jpeg, png, webp) |

**Response:**
```typescript
ApiResponse<string>
// message: "이미지가 성공적으로 업로드되었습니다."
// data: Cloudinary 이미지 URL
```

---

## 재고 API (`/inventory`)

### 내 재고 조회

```
GET /inventory
```

**Headers:** 세션 쿠키 필요 (로그인 상태)

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `partName` | string | 부품명 검색 (선택) |
| `stock` | number | 재고 수량 필터 (선택) |

**Response:**
```typescript
ApiResponse<Array<{
  inventoryId: number;
  productName: string;
  stock: number;
}>>
```

---

### 재고 차감

```
PATCH /inventory/{id}/consume
```

**Path Parameters:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `id` | number | 재고(Inventory) ID |

**Headers:** 세션 쿠키 필요 (로그인 상태)

**Request Body:**
```typescript
{
  consumeQuantity: number; // 차감할 수량 (필수, 양수)
}
```

**Response:**
```typescript
ApiResponse<boolean>
// message: "재고 차감 완료"
// data: true면 안전 재고 이하, false면 정상
```

---

### 재고 입고

```
PATCH /inventory/{id}/restock
```

**Path Parameters:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `id` | number | 재고(Inventory) ID |

**Headers:** 세션 쿠키 필요 (로그인 상태)

**Request Body:**
```typescript
{
  restockQuantity: number; // 입고할 수량 (필수, 양수)
}
```

**Response:**
```typescript
ApiResponse<null>
// message: "재고 입고 완료"
```

---

### 재고 생성

```
POST /inventory
```

**Headers:** 세션 쿠키 필요 (로그인 상태)

**Request Body:**
```typescript
{
  productId: number;       // 상품 ID (필수)
  initQuantity: number;    // 초기 수량 (필수, 양수)
  safetyQuantity: number;  // 안전 재고 수량 (선택)
}
```

**Response:**
```typescript
ApiResponse<number>
// data: 생성된 재고 ID
```

---

## 주문 API (`/orders`)

### 주문 생성

```
POST /orders
```

**Headers:** 세션 쿠키 필요 (로그인 상태)

**Request Body:**
```typescript
{
  receiverName: string; // 수령인명 (필수)
  phoneNumber: string;  // 전화번호 (필수)
  address: string;      // 배송 주소 (필수)
  items: Array<{
    productId: number;  // 상품 ID
    quantity: number;   // 수량
  }>;
}
```

**Response:**
```typescript
ApiResponse<{
  orderId: number;
  supplierName: string;
  orderedItems: Array<{
    id: number;
    supplier: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  orderStatus: OrderStatus;
  receiverName: string;
  phoneNumber: string;
  address: string;
  orderTime: string; // ISO 8601 형식 (LocalDateTime)
}>
```

---

### 내 주문 목록 조회

```
GET /orders
```

**Headers:** 세션 쿠키 필요 (로그인 상태)

**Response:**
```typescript
ApiResponse<Array<{
  id: number;
  title: string;           // 예: "엔진오일 외 2건"
  totalAmount: number;
  orderStatus: OrderStatus;
  orderTime: string;       // ISO 8601 형식
}>>
```

---

### 주문 취소

```
PATCH /orders/{id}
```

**Path Parameters:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `id` | number | 주문 ID |

**Response:**
```typescript
ApiResponse<{
  orderId: number;
  supplierName: string;
  orderedItems: Array<{
    id: number;
    supplier: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  orderStatus: OrderStatus;
  receiverName: string;
  phoneNumber: string;
  address: string;
  orderTime: string;
}>
```

---

## 공급사 API (`/supplier`)

> 공급사(SUPPLIER) 역할만 접근 가능

### 내 주문 목록 조회 (공급사용)

```
GET /supplier/orders
```

**Headers:** 세션 쿠키 필요 (공급사 로그인 상태)

**Response:**
```typescript
ApiResponse<Array<{
  orderId: number;
  orderStatus: OrderStatus;
  orderedAt: string;     // ISO 8601 형식
  receiverName: string;
  phoneNumber: string;
  address: string;
  items: Array<{
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
    itemTotalAmount: number;
  }>;
}>>
```

---

### 주문 상태 변경 (공급사용)

```
PATCH /supplier/orders
```

**Headers:** 세션 쿠키 필요 (공급사 로그인 상태)

**Request Body:**
```typescript
{
  orderId: number;       // 주문 ID
  toStatus: OrderStatus; // 변경할 상태 (예: "APPROVED", "SHIPPED")
}
```

**Response:**
```typescript
ApiResponse<null>
// message: "상태 변경 완료"
```

---

## 고객 API (`/customer`)

> 공업사(REPAIR_SHOP) 역할의 고객 관리 API

### 고객 등록

```
POST /customer
```

**Headers:** 세션 쿠키 필요 (로그인 상태)

**Request Body:**
```typescript
{
  name: string;        // 고객명 (필수)
  phoneNumber: string; // 전화번호 (선택)
}
```

**Response:**
```typescript
ApiResponse<number>
// message: "고객 등록 완료", data: 생성된 고객 ID
```

---

### 내 고객 목록 조회

```
GET /customer
```

**Headers:** 세션 쿠키 필요 (로그인 상태)

**Response:**
```typescript
ApiResponse<Array<{
  id: number;
  name: string;
  phoneNumber: string;
  driverId: number | null; // 수동 등록 고객은 null
}>>
```

---

### 고객 상세 조회

```
GET /customer/{id}
```

**Path Parameters:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `id` | number | 고객 ID |

**Headers:** 세션 쿠키 필요 (로그인 상태)

**Response:**
```typescript
ApiResponse<{
  id: number;
  name: string;
  phoneNumber: string;
  driverId: number | null; // 수동 등록 고객은 null
}>
```

---

### 고객 정보 수정

```
PUT /customer/{id}
```

**Path Parameters:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `id` | number | 고객 ID |

**Headers:** 세션 쿠키 필요 (로그인 상태)

**Request Body:**
```typescript
{
  name: string;        // 변경할 이름 (선택, 값이 있으면 변경)
  phoneNumber: string; // 변경할 전화번호 (선택, 값이 있으면 변경)
}
```

**Response:**
```typescript
ApiResponse<null>
// message: "업데이트 성공"
```

---

## 드라이버 API (`/driver`)

> 장비기사(DRIVER) 역할만 접근 가능

### 근처 공업사 목록 조회

```
GET /driver/repair-shops
```

**Headers:** 세션 쿠키 필요 (장비기사 로그인 상태)

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `lat` | number | 현재 위치 위도 (필수) |
| `lng` | number | 현재 위치 경도 (필수) |
| `radius` | number | 검색 반경 km (선택, 기본값: 50) |

**Response:**
```typescript
ApiResponse<Array<{
  id: number;
  businessName: string;  // 공업사명
  address: string;       // 주소
  phoneNumber: string;   // 전화번호
  distanceKm: number;    // 현재 위치로부터의 거리 (km, 소수점 1자리)
}>>
```

**Note:** 결과는 거리 가까운 순으로 정렬됩니다. 위치 정보가 없는 공업사는 목록에서 제외됩니다.

---

### 공업사 상세 조회

```
GET /driver/repair-shops/{shopId}
```

**Path Parameters:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `shopId` | number | 공업사 ID |

**Headers:** 세션 쿠키 필요 (장비기사 로그인 상태)

**Response:**
```typescript
ApiResponse<{
  id: number;
  businessName: string;
  businessNumber: string;
  address: string;
  phoneNumber: string;
  latitude: number | null;
  longitude: number | null;
}>
```

---

### 예약 가능 시간대 조회

```
GET /driver/repair-shops/{shopId}/slots
```

**Path Parameters:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `shopId` | number | 공업사 ID |

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `date` | string | 조회할 날짜 (필수, `YYYY-MM-DD` 형식) |

**Headers:** 세션 쿠키 필요 (장비기사 로그인 상태)

**Response:**
```typescript
ApiResponse<Array<{
  slotTime: string;   // 시간대 (ISO 8601 형식, 예: "2026-03-19T09:00:00")
  available: boolean; // 예약 가능 여부 (PENDING/APPROVED 상태 예약 있으면 false)
}>>
```

**Note:** 운영시간은 09:00 ~ 17:00 (1시간 단위, 총 9슬롯)입니다. CANCELED 상태의 예약은 슬롯을 차지하지 않습니다.

---

## 예약 API (`/reservation`)

### 예약 등록 (장비기사)

```
POST /reservation
```

**Headers:** 세션 쿠키 필요 (장비기사 로그인 상태)

**Request Body:**
```typescript
{
  repairShopId: number;  // 공업사 ID (필수)
  time: string;          // 예약 시간 (필수, ISO 8601 형식)
  memo?: string;         // 메모 (선택)
}
```

**Response:**
```typescript
ApiResponse<number>
// data: 생성된 예약 ID
```

---

### 공업사 예약 목록 조회

```
GET /reservation/repair-shop
```

**Headers:** 세션 쿠키 필요 (공업사 로그인 상태)

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `date` | string | 날짜 필터 (선택, `YYYY-MM-DD` 형식). 지정 시 해당 날짜 예약만 반환 |

**Response:**
```typescript
ApiResponse<Array<{
  id: number;
  driverEmail: string;
  driverPhoneNumber: string;
  time: string;                  // ISO 8601 형식
  status: ReservationStatus;
  memo: string | null;
}>>
```

---

### 공업사 예약 상세 조회

```
GET /reservation/repair-shop/{id}
```

**Path Parameters:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `id` | number | 예약 ID |

**Headers:** 세션 쿠키 필요 (공업사 로그인 상태)

**Response:**
```typescript
ApiResponse<{
  id: number;
  driverEmail: string;
  driverPhoneNumber: string;
  time: string;
  status: ReservationStatus;
  memo: string | null;
}>
```

---

### 공업사 - 특정 고객 예약 목록 조회

```
GET /reservation/repair-shop/customers/{driverId}
```

**Path Parameters:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `driverId` | number | 고객(장비기사) ID |

**Headers:** 세션 쿠키 필요 (공업사 로그인 상태)

**Response:**
```typescript
ApiResponse<Array<{
  id: number;
  driverEmail: string;
  driverPhoneNumber: string;
  time: string;                  // ISO 8601 형식
  status: ReservationStatus;
  memo: string | null;
}>>
```

---

### 공업사 예약 상태 변경

```
PATCH /reservation/repair-shop/{id}
```

**Path Parameters:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `id` | number | 예약 ID |

**Headers:** 세션 쿠키 필요 (공업사 로그인 상태)

**Request Body:**
```typescript
{
  status: ReservationStatus; // 변경할 상태 (필수)
}
```

**Response:**
```typescript
ApiResponse<null>
```

---

### 장비기사 예약 목록 조회

```
GET /reservation/driver
```

**Headers:** 세션 쿠키 필요 (장비기사 로그인 상태)

**Response:**
```typescript
ApiResponse<Array<{
  id: number;
  shopName: string;
  shopPhoneNumber: string;
  time: string;                  // ISO 8601 형식
  status: ReservationStatus;
  memo: string | null;
}>>
```

---

### 장비기사 예약 상세 조회

```
GET /reservation/driver/{id}
```

**Path Parameters:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `id` | number | 예약 ID |

**Headers:** 세션 쿠키 필요 (장비기사 로그인 상태)

**Response:**
```typescript
ApiResponse<{
  id: number;
  shopName: string;
  shopPhoneNumber: string;
  time: string;
  status: ReservationStatus;
  memo: string | null;
}>
```

---

### 장비기사 예약 상태 변경

```
PATCH /reservation/driver/{id}
```

**Path Parameters:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `id` | number | 예약 ID |

**Headers:** 세션 쿠키 필요 (장비기사 로그인 상태)

**Request Body:**
```typescript
{
  status: ReservationStatus; // PENDING 또는 CANCELED만 가능
}
```

**Response:**
```typescript
ApiResponse<null>
```

---

## 푸시 알림 API (`/push/token`)

### 푸시 토큰 등록

```
POST /push/token
```

**Headers:** 세션 쿠키 필요 (로그인 상태)

**Request Body:**
```typescript
{
  token: string;        // FCM 토큰 (필수)
  platform: PushPlatform; // 플랫폼 (필수, "ANDROID" | "WEB")
}
```

**Response:**
```typescript
ApiResponse<null>
// message: "푸시 토큰 등록 완료"
```

**Note:** 동일한 토큰이 이미 등록된 경우 중복 저장하지 않습니다.

---

### 푸시 토큰 삭제

```
DELETE /push/token
```

**Headers:** 세션 쿠키 필요 (로그인 상태)

**Query Parameters:**
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `token` | string | 삭제할 FCM 토큰 (필수) |

**Response:**
```typescript
ApiResponse<null>
// message: "푸시 토큰 삭제 완료"
```

---

## 홈 API

### 홈 (로그인 상태 확인)

```
GET /
```

**Response (로그인 됨):**
```typescript
ApiResponse<{
  email: string;
  roleType: RoleType;
  phoneNumber: string;
  businessName: string | null;
}>
// message: "로그인이 된 사용자입니다."
```

**Response (로그인 안됨):**
```typescript
{
  success: false,
  message: "로그인이 필요한 사용자입니다.",
  data: null
}
```

---

## 에러 응답

모든 에러는 다음 형식으로 반환됩니다:

```typescript
{
  success: false,
  message: "에러 메시지",
  data: null
}
```

### 일반적인 에러 메시지

| 상황 | 메시지 |
|------|--------|
| 로그인 필요 | "로그인이 필요합니다." 또는 "다시 로그인 해주세요." |
| 권한 없음 | "접근 권한이 없습니다." |

---

## TypeScript 타입 정의 (참고용)

```typescript
// Enum Types
type RoleType = 'REPAIR_SHOP' | 'SUPPLIER' | 'DRIVER' | 'ADMIN';
type OrderStatus = 'PENDING' | 'APPROVED' | 'SHIPPED' | 'CANCELED';
type ReservationStatus = 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELED';

// Common
interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T | null;
}

// Member
interface MemberResponse {
  email: string;
  roleType: RoleType;
  phoneNumber: string;
  businessName: string | null;
}

// Parts
interface Part {
  id: number;
  supplier: string;
  name: string;
  price: number;
  imageUrl: string | null;
}

interface PartDetail extends Part {
  description: string;
}

interface PartRegister {
  name: string;
  description: string;
  price: number;
}

interface ProductSearch {
  keyword?: string;
  supplier?: string;
}

// Inventory
interface Inventory {
  inventoryId: number;
  productName: string;
  stock: number;
}

interface InventorySearch {
  partName?: string;
  stock?: number;
}

interface InventoryConsume {
  consumeQuantity: number;
}

interface InventoryRestock {
  restockQuantity: number;
}

interface InventoryMake {
  productId: number;
  initQuantity: number;
  safetyQuantity?: number;
}

// Order
interface OrderItem {
  productId: number;
  quantity: number;
}

interface OrderRequest {
  receiverName: string;
  phoneNumber: string;
  address: string;
  items: OrderItem[];
}

interface OrderItemResponse {
  id: number;
  supplier: string;
  name: string;
  price: number;
  quantity: number;
}

interface OrderResponse {
  orderId: number;
  supplierName: string;
  orderedItems: OrderItemResponse[];
  totalAmount: number;
  orderStatus: OrderStatus;
  receiverName: string;
  phoneNumber: string;
  address: string;
  orderTime: string;
}

interface MyOrder {
  id: number;
  title: string;
  totalAmount: number;
  orderStatus: OrderStatus;
  orderTime: string;
}

// Supplier Order
interface SupplierOrderItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  itemTotalAmount: number;
}

interface SupplierOrder {
  orderId: number;
  orderStatus: OrderStatus;
  orderedAt: string;
  receiverName: string;
  phoneNumber: string;
  address: string;
  items: SupplierOrderItem[];
}

interface ChangeOrderStatus {
  orderId: number;
  toStatus: OrderStatus;
}

// Driver
interface RepairShopListItem {
  id: number;
  businessName: string;
  address: string;
  phoneNumber: string;
  distanceKm: number;
}

interface RepairShopDetail {
  id: number;
  businessName: string;
  businessNumber: string;
  address: string;
  phoneNumber: string;
  latitude: number | null;
  longitude: number | null;
}

interface AvailableSlot {
  slotTime: string;
  available: boolean;
}

// Reservation
interface ReservationRequest {
  repairShopId: number;
  time: string;
  memo?: string;
}

interface ReservationShopResponse {
  id: number;
  driverEmail: string;
  driverPhoneNumber: string;
  time: string;
  status: ReservationStatus;
  memo: string | null;
}

interface ReservationDriverResponse {
  id: number;
  shopName: string;
  shopPhoneNumber: string;
  time: string;
  status: ReservationStatus;
  memo: string | null;
}

interface ChangeReservationStatus {
  status: ReservationStatus;
}

// Customer
interface CustomerRequest {
  name: string;
  phoneNumber: string;
}

interface CustomerResponse {
  id: number;
  name: string;
  phoneNumber: string;
  driverId: number | null; // 수동 등록 고객은 null
}

interface CustomerUpdate {
  name?: string;
  phoneNumber?: string;
}

// Push Notification
type PushPlatform = 'ANDROID' | 'WEB';

interface PushTokenRequest {
  token: string;
  platform: PushPlatform;
}

// Auth
interface LoginRequest {
  email: string;
  password: string;
}

interface MachineDriverSignUp {
  email: string;
  password: string;
  role: string;
  phoneNumber: string;
  latitude?: number;
  longitude?: number;
}

interface RepairShopSignUp extends MachineDriverSignUp {
  businessName: string;
  businessNumber: string;
  address: string;
  latitude: number;
  longitude: number;
}

interface SupplierCompanySignUp extends MachineDriverSignUp {
  businessName: string;
  businessNumber: string;
  address: string;
}
```

---

## API 엔드포인트 요약표

| 메서드 | 경로 | 설명 | 인증 |
|--------|------|------|------|
| GET | `/` | 홈 (로그인 상태 확인) | 선택 |
| POST | `/auth/sign-up/machine-driver` | 기계운전자 회원가입 | X |
| POST | `/auth/sign-up/repair-shop` | 수리점 회원가입 | X |
| POST | `/auth/sign-up/supplier-company` | 공급사 회원가입 | X |
| POST | `/auth/login` | 로그인 | X |
| POST | `/auth/logout` | 로그아웃 | O |
| GET | `/user/me` | 내 정보 조회 | O |
| GET | `/parts` | 부품 목록 조회 | X |
| GET | `/parts/search` | 부품 검색 | X |
| GET | `/parts/{id}` | 부품 상세 조회 | X |
| POST | `/parts` | 부품 등록 | O |
| POST | `/parts/{id}/image` | 부품 이미지 업로드 | O |
| GET | `/inventory` | 내 재고 조회 | O |
| PATCH | `/inventory/{id}/consume` | 재고 차감 | O |
| PATCH | `/inventory/{id}/restock` | 재고 입고 | O |
| POST | `/inventory` | 재고 생성 | O |
| POST | `/orders` | 주문 생성 | O |
| GET | `/orders` | 내 주문 목록 조회 | O |
| PATCH | `/orders/{id}` | 주문 취소 | O |
| GET | `/supplier/orders` | 공급사 주문 목록 조회 | O (공급사만) |
| PATCH | `/supplier/orders` | 주문 상태 변경 | O (공급사만) |
| POST | `/customer` | 고객 등록 | O |
| GET | `/customer` | 내 고객 목록 조회 | O |
| GET | `/customer/{id}` | 고객 상세 조회 | O |
| PUT | `/customer/{id}` | 고객 정보 수정 | O |
| GET | `/driver/repair-shops` | 근처 공업사 목록 조회 | O (장비기사) |
| GET | `/driver/repair-shops/{shopId}` | 공업사 상세 조회 | O (장비기사) |
| GET | `/driver/repair-shops/{shopId}/slots` | 예약 가능 시간대 조회 | O (장비기사) |
| POST | `/reservation` | 예약 등록 | O (장비기사) |
| GET | `/reservation/repair-shop` | 공업사 예약 목록 조회 (date 필터 선택) | O (공업사) |
| GET | `/reservation/repair-shop/{id}` | 공업사 예약 상세 조회 | O (공업사) |
| GET | `/reservation/repair-shop/customers/{driverId}` | 공업사 - 특정 고객 예약 목록 조회 | O (공업사) |
| PATCH | `/reservation/repair-shop/{id}` | 공업사 예약 상태 변경 | O (공업사) |
| GET | `/reservation/driver` | 장비기사 예약 목록 조회 | O (장비기사) |
| GET | `/reservation/driver/{id}` | 장비기사 예약 상세 조회 | O (장비기사) |
| PATCH | `/reservation/driver/{id}` | 장비기사 예약 상태 변경 | O (장비기사) |
| POST | `/push/token` | 푸시 토큰 등록 | O |
| DELETE | `/push/token` | 푸시 토큰 삭제 | O |
