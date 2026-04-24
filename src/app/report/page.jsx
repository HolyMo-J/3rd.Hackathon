import { PageShell } from "@/components/page-shell";

export default function ReportPage() {
  return (
    <PageShell
      eyebrow="Report"
      title="제출 보고서 초안"
      description="README와 발표 자료에 옮기기 쉬운 형식으로 구현 항목을 정리해두는 페이지입니다."
      aside={
        <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
          <h3 className="text-2xl font-semibold">README에 넣을 것</h3>
          <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            <p>프로젝트 개요</p>
            <p>라우팅 구조</p>
            <p>DB 설계와 SQL</p>
            <p>트러블슈팅</p>
            <p>배포 URL / GitHub 저장소</p>
          </div>
        </section>
      }
    >
      <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
        <div className="space-y-4 text-sm leading-7 text-[var(--muted)]">
          <p>프로젝트 제목: Pocket Ledger</p>
          <p>주제: 소비 패턴 분석 기반 가계부 서비스</p>
          <p>핵심 기능: 사용자 인증, 거래 CRUD, 월별 소비 분석, 예산 설정, 관심 상품 저장</p>
          <p>배포 대상: GCP VM + Cloudflare SSL</p>
        </div>
      </section>

      <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
        <h3 className="text-2xl font-semibold">주요 라우트</h3>
        <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--muted)]">
          <p>페이지: /dashboard, /transactions, /analysis, /products, /auth, /report</p>
          <p>인증 API: /api/auth/register, /api/auth/login, /api/auth/logout, /api/auth/me</p>
          <p>거래 API: /api/transactions, /api/transactions/[id]</p>
          <p>예산 API: /api/budgets, /api/budgets/[id]</p>
          <p>상품 API: /api/products, /api/saved-products, /api/saved-products/[productId]</p>
        </div>
      </section>
    </PageShell>
  );
}
