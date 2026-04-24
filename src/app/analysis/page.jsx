"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageShell } from "@/components/page-shell";
import { apiRequest } from "@/lib/client-api";

const currency = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

export default function AnalysisPage() {
  const queryClient = useQueryClient();
  const [isMounted, setIsMounted] = useState(false);
  const [budgetForm, setBudgetForm] = useState({
    category: "",
    budgetMonth: "2026-04",
    limitAmount: "",
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const analysisQuery = useQuery({
    queryKey: ["category-analysis"],
    queryFn: () => apiRequest("/api/summary"),
    enabled: isMounted,
  });

  const budgetMutation = useMutation({
    mutationFn: () =>
      apiRequest("/api/budgets", {
        method: "POST",
        body: JSON.stringify({
          ...budgetForm,
          limitAmount: Number(budgetForm.limitAmount),
        }),
      }),
    onSuccess: async () => {
      setBudgetForm({
        category: "",
        budgetMonth: budgetForm.budgetMonth,
        limitAmount: "",
      });
      await queryClient.invalidateQueries({ queryKey: ["category-analysis"] });
    },
  });

  const deleteBudgetMutation = useMutation({
    mutationFn: (id) => apiRequest(`/api/budgets/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["category-analysis"] });
    },
  });

  const categories = analysisQuery.data?.byCategory ?? [];
  const budgets = analysisQuery.data?.budgets ?? [];

  return (
    <PageShell
      eyebrow="Analysis"
      title="소비 패턴 분석"
      description="카테고리별 지출 규모를 빠르게 보여주는 발표용 분석 페이지입니다. 이후 차트 라이브러리 없이도 충분히 시각화가 가능합니다."
      aside={
        <>
          <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
            <h3 className="text-2xl font-semibold">발표 포인트</h3>
            <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
              <p>사용자별 지출 카테고리 비교</p>
              <p>월 예산 대비 사용률 표시</p>
              <p>절약 제안 문구 추가 가능</p>
            </div>
          </section>

          <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
            <h3 className="text-2xl font-semibold">예산 설정</h3>
            <form
              className="mt-4 grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                budgetMutation.mutate();
              }}
            >
              <input
                className="field"
                placeholder="카테고리"
                value={budgetForm.category}
                onChange={(event) =>
                  setBudgetForm((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
              />
              <input
                className="field"
                type="month"
                value={budgetForm.budgetMonth}
                onChange={(event) =>
                  setBudgetForm((current) => ({
                    ...current,
                    budgetMonth: event.target.value,
                  }))
                }
              />
              <input
                className="field"
                type="number"
                placeholder="예산 금액"
                value={budgetForm.limitAmount}
                onChange={(event) =>
                  setBudgetForm((current) => ({
                    ...current,
                    limitAmount: event.target.value,
                  }))
                }
              />
              <button className="btn-primary" type="submit">
                예산 저장
              </button>
              {budgetMutation.error ? (
                <p className="text-sm text-[var(--danger)]">
                  {budgetMutation.error.message}
                </p>
              ) : null}
            </form>
          </section>
        </>
      }
    >
      <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
        <div className="grid gap-3">
          {analysisQuery.error ? (
            <p className="text-sm text-[var(--danger)]">{analysisQuery.error.message}</p>
          ) : null}
          {categories.map((item, index) => (
            <div
              key={item.category}
              className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface-strong)] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-[var(--muted)]">Top {index + 1}</p>
                  <strong className="text-lg">{item.category}</strong>
                </div>
                <strong className="text-[var(--danger)]">
                  {currency.format(item.total)}
                </strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
        <h3 className="text-2xl font-semibold">예산 설정 현황</h3>
        <div className="mt-4 grid gap-3">
          {budgets.map((item) => (
            <div
              key={item.id}
              className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface-strong)] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <span>{item.category}</span>
                <div className="text-right">
                  <strong>{currency.format(item.limitAmount)}</strong>
                  <div className="mt-2">
                    <button
                      className="btn-secondary px-4 py-2 text-sm"
                      type="button"
                      onClick={() => deleteBudgetMutation.mutate(item.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
              <p className="mt-2 text-sm text-[var(--muted)]">{item.budgetMonth}</p>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
