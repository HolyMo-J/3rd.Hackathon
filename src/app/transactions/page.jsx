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

export default function TransactionsPage() {
  const queryClient = useQueryClient();
  const [isMounted, setIsMounted] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    type: "expense",
    category: "",
    amount: "",
    note: "",
    occurredAt: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const transactionsQuery = useQuery({
    queryKey: ["transactions"],
    queryFn: () => apiRequest("/api/transactions"),
    enabled: isMounted,
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      apiRequest(editingId ? `/api/transactions/${editingId}` : "/api/transactions", {
        method: editingId ? "PUT" : "POST",
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
        }),
      }),
    onSuccess: async () => {
      setEditingId(null);
      setForm({
        type: "expense",
        category: "",
        amount: "",
        note: "",
        occurredAt: new Date().toISOString().slice(0, 10),
      });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["transactions"] }),
        queryClient.invalidateQueries({ queryKey: ["finance-snapshot"] }),
      ]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiRequest(`/api/transactions/${id}`, { method: "DELETE" }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["transactions"] }),
        queryClient.invalidateQueries({ queryKey: ["finance-snapshot"] }),
      ]);
    },
  });

  const transactions = transactionsQuery.data?.transactions ?? [];

  return (
    <PageShell
      eyebrow="Transactions"
      title="거래내역 관리"
      description="사용자별 수입과 지출을 조회하고, 이후 CRUD API를 붙일 자리까지 염두에 둔 목록 페이지입니다."
      aside={
        <>
          <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
            <h3 className="text-2xl font-semibold">구현 체크</h3>
            <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
              <p>JWT 로그인 후 사용자별 거래 조회</p>
              <p>거래 등록, 수정, 삭제</p>
              <p>월별/카테고리별 필터</p>
            </div>
          </section>
          <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
            <h3 className="text-2xl font-semibold">{editingId ? "거래 수정" : "거래 등록"}</h3>
            <form
              className="mt-4 grid gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                saveMutation.mutate();
              }}
            >
              <select
                className="field"
                value={form.type}
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
              >
                <option value="income">수입</option>
                <option value="expense">지출</option>
              </select>
              <input
                className="field"
                placeholder="카테고리"
                value={form.category}
                onChange={(event) =>
                  setForm((current) => ({ ...current, category: event.target.value }))
                }
              />
              <input
                className="field"
                type="number"
                placeholder="금액"
                value={form.amount}
                onChange={(event) =>
                  setForm((current) => ({ ...current, amount: event.target.value }))
                }
              />
              <input
                className="field"
                type="date"
                value={form.occurredAt}
                onChange={(event) =>
                  setForm((current) => ({ ...current, occurredAt: event.target.value }))
                }
              />
              <textarea
                className="field min-h-24"
                placeholder="메모"
                value={form.note}
                onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
              />
              <button className="btn-primary" type="submit">
                {editingId ? "수정 저장" : "거래 등록"}
              </button>
              {editingId ? (
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({
                      type: "expense",
                      category: "",
                      amount: "",
                      note: "",
                      occurredAt: new Date().toISOString().slice(0, 10),
                    });
                  }}
                >
                  취소
                </button>
              ) : null}
              {saveMutation.error ? (
                <p className="text-sm text-[var(--danger)]">{saveMutation.error.message}</p>
              ) : null}
            </form>
          </section>
        </>
      }
    >
      <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
        <div className="space-y-3">
          {transactionsQuery.error ? (
            <p className="text-sm text-[var(--danger)]">
              {transactionsQuery.error.message}
            </p>
          ) : null}
          {transactions.map((transaction) => (
            <article
              key={transaction.id}
              className="flex flex-col gap-3 rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface-strong)] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm text-[var(--muted)]">
                  {new Date(transaction.occurredAt).toLocaleDateString("ko-KR")}
                </p>
                <strong className="mt-1 block text-lg">{transaction.category}</strong>
                <p className="text-muted mt-1 text-sm">{transaction.note}</p>
              </div>
              <div className="text-right">
                <span className="pill">
                  {transaction.type === "income" ? "수입" : "지출"}
                </span>
                <strong className="mt-2 block text-xl">
                  {transaction.type === "income" ? "+" : "-"}
                  {currency.format(transaction.amount)}
                </strong>
                <div className="mt-3 flex justify-end gap-2">
                  <button
                    className="btn-secondary px-4 py-2 text-sm"
                    type="button"
                    onClick={() => {
                      setEditingId(transaction.id);
                      setForm({
                        type: transaction.type,
                        category: transaction.category,
                        amount: String(transaction.amount),
                        note: transaction.note || "",
                        occurredAt: transaction.occurredAt,
                      });
                    }}
                  >
                    수정
                  </button>
                  <button
                    className="btn-secondary px-4 py-2 text-sm"
                    type="button"
                    onClick={() => deleteMutation.mutate(transaction.id)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
