# Pocket Ledger

3차 해커톤용 금융 웹 서비스입니다. 소비 패턴 분석 기반 가계부를 중심으로 `인증`, `거래 CRUD`, `예산 설정`, `금융상품 조회`, `관심 상품 저장`까지 연결했습니다.

## 사용 기술

- React
- Next.js
- HTML/CSS/JS
- Tailwind CSS
- React Query
- 상태관리 라이브러리(Zustand)

## 현재 구현 범위

- JWT 쿠키 기반 회원가입 / 로그인 / 로그아웃
- 거래 내역 등록 / 조회 / 수정 / 삭제
- 카테고리별 소비 분석
- 월별 예산 등록 / 삭제
- 금융상품 목록 조회
- 관심 상품 저장 / 해제
- 보고서 초안 페이지

## 실행 방법

```bash
npm install
npm run dev
```

## 환경 변수

`.env.local`

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=testuser
DB_PASSWORD=1234
DB_NAME=pfm_ledger
JWT_SECRET=pfm-ledger-local-secret
NEXT_PUBLIC_APP_NAME=Pocket Ledger
```

## 주요 페이지

- `/dashboard`
- `/transactions`
- `/analysis`
- `/products`
- `/auth`
- `/report`

## 주요 API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/transactions`
- `POST /api/transactions`
- `PUT /api/transactions/[id]`
- `DELETE /api/transactions/[id]`
- `GET /api/summary`
- `GET /api/budgets`
- `POST /api/budgets`
- `DELETE /api/budgets/[id]`
- `GET /api/products`
- `GET /api/saved-products`
- `POST /api/saved-products`
- `DELETE /api/saved-products/[productId]`

## 참고

- DB 스키마는 `schema.sql`
- DB 이름은 `pfm_ledger`
- MariaDB 계정은 현재 `testuser / 1234` 기준으로 연결되어 있습니다.
