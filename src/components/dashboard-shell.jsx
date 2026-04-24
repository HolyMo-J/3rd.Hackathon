"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useFinanceStore } from "@/store/use-finance-store";
import { SummaryCard } from "@/components/summary-card";
import { apiRequest } from "@/lib/client-api";

const currency = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

const quickLinks = [
  { href: "/transactions", label: "거래내역 보기" },
  { href: "/analysis", label: "소비 분석 보기" },
  { href: "/products", label: "금융상품 비교" },
];

export function DashboardShell() {
  const { user, selectedMonth, setSelectedMonth, setUser, clearUser } = useFinanceStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => apiRequest("/api/auth/me"),
    retry: false,
    enabled: isMounted,
  });
  const snapshotQuery = useQuery({
    queryKey: ["finance-snapshot", selectedMonth],
    queryFn: () => apiRequest("/api/summary"),
    enabled: isMounted && meQuery.isSuccess,
  });

  const snapshot = snapshotQuery.data;

  useEffect(() => {
    if (meQuery.data?.user) {
      setUser(meQuery.data.user);
    }
    if (meQuery.isError) {
      clearUser();
    }
  }, [clearUser, meQuery.data, meQuery.isError, setUser]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="glass-panel fade-up relative overflow-hidden rounded-[2rem] px-6 py-8 sm:px-8 sm:py-10">
        <div className="absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,_rgba(255,122,89,0.24),transparent_60%)]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="pill">3차 해커톤 메인 대시보드</span>
            <h1 className="display-font mt-4 text-5xl leading-none sm:text-6xl">
              Pocket Ledger
            </h1>
            <p className="text-muted mt-4 max-w-2xl text-base leading-7 sm:text-lg">
              월별 수입과 지출, 카테고리 분석, 금융상품 확장 포인트를 한 화면에서
              확인할 수 있는 홈 화면입니다.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <span className="pill">
              {user ? `${user.name} 님` : "인증 후 대시보드 활성화"}
            </span>
            <label className="flex items-center gap-3">
              <span className="text-sm font-medium">기준 월</span>
              <input
                className="field py-3"
                type="month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
              />
            </label>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard
              label="총 수입"
              value={snapshot ? currency.format(snapshot.income) : "₩0"}
              tone="income"
            />
            <SummaryCard
              label="총 지출"
              value={snapshot ? currency.format(snapshot.expense) : "₩0"}
              tone="expense"
            />
            <SummaryCard
              label="잔액"
              value={snapshot ? currency.format(snapshot.balance) : "₩0"}
            />
          </div>

          <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">최근 거래 요약</h2>
                <p className="text-muted mt-1 text-sm">
                  구현 초기에 가장 빨리 시연하기 좋은 화면입니다.
                </p>
              </div>
              <span className="pill">{user.plan}</span>
            </div>

            <div className="mt-5 space-y-3">
              {snapshotQuery.isLoading ? (
                <p className="text-muted rounded-2xl border border-dashed border-[var(--border)] px-4 py-8 text-center">
                  데이터를 정리하는 중입니다.
                </p>
              ) : null}

              {meQuery.isError ? (
                <p className="text-muted rounded-2xl border border-dashed border-[var(--border)] px-4 py-8 text-center">
                  로그인 후 실제 DB 데이터가 표시됩니다.
                </p>
              ) : null}

              {snapshot?.recent?.slice(0, 5).map((transaction) => (
                <article
                  key={transaction.id}
                  className="fade-up flex flex-col gap-3 rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface-strong)] p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`pill ${
                          transaction.type === "income"
                            ? "text-[var(--success)]"
                            : "text-[var(--danger)]"
                        }`}
                      >
                        {transaction.type === "income" ? "수입" : "지출"}
                      </span>
                      <strong>{transaction.category}</strong>
                    </div>
                    <p className="text-muted mt-2 text-sm">
                      {transaction.note} ·{" "}
                      {new Date(transaction.occurredAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>

                  <strong
                    className={`text-lg ${
                      transaction.type === "income"
                        ? "text-[var(--success)]"
                        : "text-[var(--danger)]"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}
                    {currency.format(transaction.amount)}
                  </strong>
                </article>
              ))}
            </div>
          </section>
        </div>

        <div className="grid gap-6">
          <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
            <h2 className="text-2xl font-semibold">바로가기</h2>
            <div className="mt-5 grid gap-3">
              {quickLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 py-4 font-medium transition-transform hover:-translate-y-0.5"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </section>

          <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
            <h2 className="text-2xl font-semibold">다음 구현 순서</h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-[var(--muted)]">
              <p>1. Route Handlers로 인증과 거래 CRUD를 추가</p>
              <p>2. MariaDB 테이블과 SQL 쿼리를 연결</p>
              <p>3. JWT 인증 흐름을 붙이고 사용자별 권한 검증을 추가</p>
              <p>4. 마지막에 GCP와 Cloudflare로 배포</p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
