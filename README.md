# Pocket Ledger

3차 해커톤 제출용 금융 웹 서비스입니다. 소비 패턴 분석 기반 가계부 서비스를 주제로 `JWT 인증`, `MariaDB CRUD`, `Next.js Route Handlers`, `React Query`, `Zustand`를 연결했습니다.

## 1. 프로젝트 개요

- 수행 주제: 소비 패턴 분석 기반 가계부 서비스
- 사용 기술: React, Next.js, HTML/CSS, JS, Tailwind CSS, React Query, Zustand, MariaDB, JWT, GCP, Cloudflare
- 프로젝트 설명: 사용자별 수입/지출을 관리하고, 월별 소비 패턴과 예산을 분석하며, 금융상품 비교 및 관심 상품 저장 기능까지 제공하는 금융 서비스입니다.
- GitHub 저장소: https://github.com/HolyMo-J/3rd.Hackathon
- 배포 URL: 배포 후 입력 예정

## 2. 백엔드 구성 및 라우팅

- 구현 방식: Next.js Route Handlers
- 인증 라우트:
  `POST /api/auth/register`
  `POST /api/auth/login`
  `POST /api/auth/logout`
  `GET /api/auth/me`
- 거래 라우트:
  `GET /api/transactions`
  `POST /api/transactions`
  `PUT /api/transactions/[id]`
  `DELETE /api/transactions/[id]`
- 제출 형식 대응 alias 라우트:
  `GET /api/finance`
  `POST /api/finance`
  `PUT /api/finance/[id]`
  `DELETE /api/finance/[id]`
- 추가 라우트:
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

- 사용 테이블: `users`, `user_sessions`, `transactions`, `budgets`, `financial_products`, `saved_products`
- 데이터베이스명: `pfm_ledger`
- 주요 SQL 예시:

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

- SQL 활용 내용:
  사용자별 인증 정보 저장
  거래 생성/조회/수정/삭제
  카테고리별 소비 집계
  월별 예산 설정
  금융상품 및 관심 상품 저장

## 4. 프론트엔드 상태 관리 및 데이터 최적화 (가점 반영)

- 상태 관리 전략:
  Zustand를 사용해 현재 로그인 사용자와 선택 월 상태를 전역 관리했습니다.
  관련 파일: `src/store/use-finance-store.js`
- 서버 데이터 관리:
  React Query의 `useQuery`, `useMutation`, `invalidateQueries`를 사용해 인증, 거래 목록, 요약 데이터, 예산, 금융상품, 관심 상품 데이터를 관리했습니다.
  캐시 무효화를 통해 거래 등록/수정/삭제 후 화면이 즉시 갱신되도록 구성했습니다.
- 적용 페이지:
  `/dashboard`
  `/transactions`
  `/analysis`
  `/products`
  `/auth`

## 5. 트러블슈팅 (문제 해결 기록)

- 사례 1: 로컬 MariaDB 권한 문제
  `testuser` 계정으로 `pfm_ledger` 접근 시 권한 부족 오류가 발생했습니다.
  `GRANT ALL PRIVILEGES ON pfm_ledger.* TO 'testuser'@'localhost' IDENTIFIED BY '1234';`로 권한을 부여해 해결했습니다.
- 사례 2: GitHub SSH 푸시 실패
  HTTPS 푸시 시 인증 정보가 없어 실패했습니다.
  `ed25519` SSH 키를 생성하고 GitHub에 등록한 뒤 원격 URL을 SSH 형식으로 변경해 해결했습니다.
- 사례 3: 원격 저장소와 로컬 저장소 이력 분리
  원격 `main` 브랜치의 초기 커밋과 로컬 저장소가 서로 다른 이력이어서 푸시가 거절됐습니다.
  `git pull origin main --allow-unrelated-histories --no-rebase`로 병합 후 `README.md` 충돌을 정리해 해결했습니다.
- 사례 4: 빌드 환경 제약
  이 VM 환경에서는 `next build --webpack`이 마지막 정적 생성 워커 단계에서 간헐적으로 종료되는 현상이 있었습니다.
  대신 개발 서버 기준으로 회원가입, 로그인, 거래 등록, 예산 저장, 관심 상품 저장, 요약 조회까지 API 동작을 직접 검증했습니다.

## 평가 가이드라인 대응

- 백엔드 설계:
  Next.js Route Handlers 기반 API가 구현되어 있으며 인증, 거래, 예산, 상품 기능이 분리돼 있습니다.
- 데이터 처리:
  MariaDB에서 사용자, 거래, 예산, 세션, 금융상품, 관심상품 데이터를 CRUD합니다.
- 심화 기술 활용:
  Zustand와 React Query를 실제 화면 상태와 서버 데이터 갱신에 사용했습니다.
- 배포 성공 여부:
  GitHub 업로드 완료. GCP VM + Cloudflare 배포는 `DEPLOYMENT.md` 기준으로 진행 예정입니다.
- 문서화:
  본 README와 `schema.sql`, `DEPLOYMENT.md`에 구조와 실행 방법을 정리했습니다.

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
