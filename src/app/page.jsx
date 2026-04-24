import Link from "next/link";

const highlights = [
  {
    title: "자산 흐름 통합 관리",
    description:
      "수입과 지출, 잔액 변화를 한곳에서 확인하며 월별 자금 흐름을 안정적으로 관리할 수 있습니다.",
  },
  {
    title: "카테고리별 소비 분석",
    description:
      "식비, 교통, 쇼핑처럼 지출 카테고리를 구분해 소비 성향과 반복 지출 패턴을 파악할 수 있습니다.",
  },
  {
    title: "예산과 금융상품 연결",
    description:
      "월 예산을 설정하고, 관심 금융상품을 저장해 자금 계획과 금융 선택을 함께 검토할 수 있습니다.",
  },
];

const stats = [
  { label: "자산 관리 항목", value: "거래 · 예산 · 상품" },
  { label: "지원 기능", value: "로그인 · 분석 · 저장" },
  { label: "접근 방식", value: "웹 기반 개인 금융 관리" },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="glass-panel fade-up relative overflow-hidden rounded-[2rem] px-6 py-8 sm:px-8 sm:py-12">
        <div className="absolute -left-12 top-12 h-36 w-36 rounded-full bg-[rgba(255,122,89,0.14)] blur-3xl" />
        <div className="absolute right-0 top-0 h-48 w-48 bg-[radial-gradient(circle,_rgba(21,127,98,0.18),transparent_68%)]" />

        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="max-w-3xl">
            <span className="pill">개인 금융 관리 서비스</span>
            <h1 className="display-font mt-5 text-5xl leading-none sm:text-6xl lg:text-7xl">
              Astera Finance
            </h1>
            <p className="text-muted mt-5 max-w-2xl text-base leading-7 sm:text-lg">
              월별 수입과 지출을 정리하고, 소비 패턴과 예산 현황을 분석하며,
              금융상품 비교까지 이어지는 개인 자산 관리 경험을 제공합니다.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/auth" className="btn-primary">
                로그인 시작하기
              </Link>
              <Link href="/dashboard" className="btn-secondary">
                대시보드 둘러보기
              </Link>
            </div>
          </div>

          <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
            <h2 className="text-2xl font-semibold">빠른 안내</h2>
            <div className="mt-5 grid gap-3">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface-strong)] p-4"
                >
                  <p className="text-sm text-[var(--muted)]">{item.label}</p>
                  <strong className="mt-2 block text-lg">{item.value}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {highlights.map((item, index) => (
          <article key={item.title} className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
            <span className="pill">0{index + 1}</span>
            <h2 className="mt-4 text-2xl font-semibold">{item.title}</h2>
            <p className="text-muted mt-3 text-sm leading-7 sm:text-base">
              {item.description}
            </p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
          <h2 className="text-2xl font-semibold">이런 분께 적합합니다</h2>
          <div className="mt-5 space-y-3 text-sm leading-7 text-[var(--muted)]">
            <p>월급과 생활비를 체계적으로 관리하고 싶은 사용자</p>
            <p>카테고리별 지출 비중을 확인하고 소비 습관을 개선하고 싶은 사용자</p>
            <p>예산 계획과 금융상품 선택을 함께 관리하고 싶은 사용자</p>
          </div>
        </section>

        <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">서비스 시작 경로</h2>
              <p className="text-muted mt-2 text-sm">
                로그인 후 거래 등록, 소비 분석, 상품 비교까지 바로 이어서 사용할 수 있습니다.
              </p>
            </div>
            <Link href="/login" className="pill">
              로그인 페이지
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Link
              href="/transactions"
              className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface-strong)] p-4 transition-transform hover:-translate-y-0.5"
            >
              <strong className="block">거래 관리</strong>
              <p className="text-muted mt-2 text-sm">수입과 지출 등록, 수정, 삭제</p>
            </Link>
            <Link
              href="/analysis"
              className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface-strong)] p-4 transition-transform hover:-translate-y-0.5"
            >
              <strong className="block">지출 분석</strong>
              <p className="text-muted mt-2 text-sm">카테고리별 소비 흐름과 예산 확인</p>
            </Link>
            <Link
              href="/products"
              className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface-strong)] p-4 transition-transform hover:-translate-y-0.5"
            >
              <strong className="block">금융상품</strong>
              <p className="text-muted mt-2 text-sm">추천 상품 비교와 관심 목록 저장</p>
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
}
