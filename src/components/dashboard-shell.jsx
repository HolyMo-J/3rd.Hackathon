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
  { href: "/analysis", label: "지출 분석 보기" },
  { href: "/products", label: "추천 상품 보기" },
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
  const serviceNote = user?.plan || "월별 자산 흐름과 예산 현황을 함께 관리하세요";

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
            <span className="pill">개인 금융 대시보드</span>
            <h1 className="display-font mt-4 text-5xl leading-none sm:text-6xl">
              Astera Finance
            </h1>
            <p className="text-muted mt-4 max-w-2xl text-base leading-7 sm:text-lg">
              월별 수입과 지출, 카테고리별 소비 패턴, 예산 상태를 하나의 화면에서
              확인할 수 있도록 구성한 메인 화면입니다.
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 sm:items-end">
            <span className="pill">
              {user ? `${user.name} 님의 자산 현황` : "로그인 후 개인 대시보드 이용 가능"}
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
                  최근 발생한 거래를 시간순으로 확인하고 주요 지출 흐름을 빠르게 파악할 수 있습니다.
                </p>
              </div>
              <span className="pill">{serviceNote}</span>
            </div>

            <div className="mt-5 space-y-3">
              {snapshotQuery.isLoading ? (
                <p className="text-muted rounded-2xl border border-dashed border-[var(--border)] px-4 py-8 text-center">
                  데이터를 정리하는 중입니다.
                </p>
              ) : null}

              {meQuery.isError ? (
                <p className="text-muted rounded-2xl border border-dashed border-[var(--border)] px-4 py-8 text-center">
                  로그인하면 개인 거래 데이터와 맞춤 요약이 표시됩니다.
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
            <h2 className="text-2xl font-semibold">서비스 안내</h2>
            <div className="mt-5 space-y-3 text-sm leading-7 text-[var(--muted)]">
              <p>월별 거래를 누적해 소비 흐름과 잔액 변화를 확인할 수 있습니다.</p>
              <p>예산을 설정하면 카테고리별 한도를 기준으로 소비를 관리할 수 있습니다.</p>
              <p>추천 금융상품을 저장해 개인 자금 계획에 맞는 선택지를 비교할 수 있습니다.</p>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
