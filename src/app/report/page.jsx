import { PageShell } from "@/components/page-shell";

export default function ReportPage() {
  return (
    <PageShell
      eyebrow="Report"
      title="월간 리포트"
      description="이번 달 금융 활동을 요약하고 핵심 관리 항목을 정리해서 다음 달 계획에 반영할 수 있도록 구성한 리포트 화면입니다."
      aside={
        <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
          <h3 className="text-2xl font-semibold">리포트 요약</h3>
          <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            <p>총수입과 총지출 흐름을 월 단위로 정리합니다.</p>
            <p>예산이 큰 카테고리와 반복 지출 항목을 함께 검토합니다.</p>
            <p>관심 상품과 자금 계획을 연결해 다음 달 전략을 세울 수 있습니다.</p>
          </div>
        </section>
      }
    >
      <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
        <div className="space-y-4 text-sm leading-7 text-[var(--muted)]">
          <p>서비스명: Astera Finance</p>
          <p>리포트 기준: 월별 소비 패턴 분석과 예산 운영 현황</p>
          <p>핵심 기능: 거래 관리, 지출 분석, 예산 설정, 관심 상품 저장</p>
          <p>활용 목적: 개인 자산 흐름 정리와 금융 의사결정 지원</p>
        </div>
      </section>

      <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
        <h3 className="text-2xl font-semibold">이번 달 체크 포인트</h3>
        <div className="mt-4 space-y-3 text-sm leading-7 text-[var(--muted)]">
          <p>고정지출이 높은 카테고리를 우선 점검합니다.</p>
          <p>예산 한도와 실제 지출 차이를 확인해 다음 달 목표를 조정합니다.</p>
          <p>관심 상품 목록을 검토해 단기 자금과 장기 자금 계획을 분리합니다.</p>
        </div>
      </section>
    </PageShell>
  );
}
