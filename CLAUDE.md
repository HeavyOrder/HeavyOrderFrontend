# HeavyOrder Frontend

중장비 부품 발주 플랫폼의 프론트엔드 프로젝트입니다.

## 프로젝트 개요
- 수리점, 공급사, 장비기사를 연결하는 중장비 부품 플랫폼
- 수리점: 부품 검색 및 발주
- 공급사: 부품 등록 및 주문 관리
- 장비기사: 부품 검색 및 수리점 연결

## 기술 스택
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Axios

## 백엔드 연동
- API Base URL: http://localhost:8080
- 인증: 세션 기반 (쿠키)
- 백엔드 코드 위치: ../HeavyOrderBackend

### 주요 백엔드 Controller
- AuthController: 인증 (로그인, 회원가입, 로그아웃)
- PartsController: 부품 관리
- RepairShopOrderController: 수리점 발주
- SupplierController: 공급사 주문 관리
- InventoryController: 재고 관리
- UserController: 사용자 정보

## User Context
- 사용자는 프론트엔드 지식이 없음
- Claude Code가 전적으로 프론트엔드 개발 담당
- 코드 작성 시 주석으로 간단히 설명 추가
- 변경사항은 직접 코드에 적용할 것

## UI 스타일 가이드
- 주요 색상: blue-600 (신뢰감, 산업적)
- 한국어 UI
- 모바일 우선 반응형
- 깔끔하고 직관적인 디자인

## Commit Convention
- 백엔드와 동일한 규칙 사용
- 형식: `{type}: {제목}`
- 타입: `feat`, `fix`, `chore`, `docs`, `refactor`, `style`
- 한국어 커밋 메시지
- Co-Authored-By 라인 추가하지 않음
