# Astera Finance

소비 패턴 분석 기반 가계부 서비스입니다. 사용자별 거래 관리, 월별 예산 설정, 금융상품 비교와 관심 상품 저장 기능을 제공하는 금융 웹 서비스로 구성했습니다.

## 1. 프로젝트 개요

- 수행 주제: 소비 패턴 분석 기반 가계부 서비스
- 프로젝트 설명: 사용자의 수입과 지출을 기록하고, 카테고리별 소비 흐름과 예산 상태를 분석하며, 금융상품을 비교하고 관심 상품으로 저장할 수 있는 개인 금융 관리 서비스입니다.
- 사용 기술: React, Next.js, HTML/CSS, JavaScript, Tailwind CSS, React Query, Zustand, MariaDB, JWT, GCP, Cloudflare
- GitHub 저장소: https://github.com/HolyMo-J/3rd.Hackathon
- 배포 URL: Cloudflare Quick Tunnel 기준  
  `https://decreased-successfully-pmid-delete.trycloudflare.com`

## 2. 백엔드 구성 및 라우팅

- 구현 방식: Next.js Route Handlers
- 인증 API
  `POST /api/auth/register`
  `POST /api/auth/login`
  `POST /api/auth/logout`
  `GET /api/auth/me`
- 거래 API
  `GET /api/transactions`
  `POST /api/transactions`
  `PUT /api/transactions/[id]`
  `DELETE /api/transactions/[id]`
- 제출 형식 대응 API
  `GET /api/finance`
  `POST /api/finance`
  `PUT /api/finance/[id]`
  `DELETE /api/finance/[id]`
- 추가 API
  `GET /api/summary`
  `GET /api/budgets`
  `POST /api/budgets`
  `DELETE /api/budgets/[id]`
  `GET /api/products`
  `GET /api/saved-products`
  `POST /api/saved-products`
  `DELETE /api/saved-products/[productId]`
  `GET /api/health`

## 3. 데이터베이스 및 SQL 활용

- 데이터베이스명: `pfm_ledger`
- 사용 테이블: `users`, `user_sessions`, `transactions`, `budgets`, `financial_products`, `saved_products`
- 테이블 역할
  `users`: 회원 정보 저장
  `user_sessions`: JWT 세션 저장
  `transactions`: 사용자별 수입/지출 저장
  `budgets`: 카테고리별 월 예산 저장
  `financial_products`: 비교용 금융상품 저장
  `saved_products`: 사용자 관심 상품 저장
- 주요 SQL 예시

```sql
INSERT INTO users (name, email, password_hash)
VALUES ('테스트유저', 'demo@example.com', 'salt:hash');

INSERT INTO transactions (user_id, type, category, amount, note, occurred_at)
VALUES (1, 'expense', '식비', 12000, '저녁 식사', '2026-04-24');

SELECT
  category,
  SUM(amount) AS total
FROM transactions
WHERE user_id = 1
  AND type = 'expense'
GROUP BY category
ORDER BY total DESC;

INSERT INTO budgets (user_id, category, budget_month, limit_amount)
VALUES (1, '식비', '2026-04', 250000)
ON DUPLICATE KEY UPDATE
  limit_amount = VALUES(limit_amount),
  updated_at = CURRENT_TIMESTAMP;
```

## 4. 프론트엔드 상태 관리 및 데이터 최적화

- 상태 관리 전략
  Zustand를 사용해 로그인 사용자와 선택 월 상태를 전역으로 관리했습니다.
- 서버 데이터 관리
  React Query의 `useQuery`, `useMutation`, `invalidateQueries`를 활용해 인증, 거래 목록, 요약 데이터, 예산, 금융상품, 관심 상품 데이터를 관리했습니다.
- 적용 효과
  거래 등록/수정/삭제 후 관련 캐시를 무효화해 목록과 요약 데이터가 즉시 갱신되도록 구성했습니다.
- 관련 파일
  `src/store/use-finance-store.js`
  `src/components/dashboard-shell.jsx`
  `src/app/transactions/page.jsx`
  `src/app/analysis/page.jsx`
  `src/app/products/page.jsx`
  `src/app/auth/page.jsx`

## 5. 트러블슈팅

- MariaDB 권한 문제
  `testuser` 계정으로 `pfm_ledger` 접근 시 권한 오류가 발생해 `GRANT ALL PRIVILEGES ON pfm_ledger.* TO 'testuser'@'localhost' IDENTIFIED BY '1234';`로 해결했습니다.
- GitHub 인증 문제
  HTTPS 푸시 시 인증 정보가 없어 실패해 SSH 키를 생성하고 GitHub에 등록한 뒤 SSH 원격으로 변경해 해결했습니다.
- 원격 저장소 이력 충돌
  원격 `main` 브랜치와 로컬 저장소가 서로 다른 이력이어서 푸시가 거절됐고, `git pull origin main --allow-unrelated-histories --no-rebase`로 병합 후 충돌을 정리했습니다.
- 빌드 환경 제약
  이 VM 환경에서는 `next build --webpack`이 마지막 정적 생성 단계에서 간헐적으로 종료되는 현상이 있어, 개발 서버 기준으로 회원가입, 로그인, 거래 등록, 예산 저장, 관심 상품 저장, 요약 조회를 직접 검증했습니다.

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

## 페이지 구성

- `/`
- `/login`
- `/dashboard`
- `/transactions`
- `/analysis`
- `/products`
- `/auth`
- `/report`
