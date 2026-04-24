"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageShell } from "@/components/page-shell";
import { apiRequest } from "@/lib/client-api";

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const productsQuery = useQuery({
    queryKey: ["financial-products"],
    queryFn: () => apiRequest("/api/products"),
    enabled: isMounted,
  });

  const savedProductsQuery = useQuery({
    queryKey: ["saved-products"],
    queryFn: () => apiRequest("/api/saved-products"),
    enabled: isMounted,
    retry: false,
  });

  const saveMutation = useMutation({
    mutationFn: (productId) =>
      apiRequest("/api/saved-products", {
        method: "POST",
        body: JSON.stringify({ productId }),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["saved-products"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (productId) =>
      apiRequest(`/api/saved-products/${productId}`, { method: "DELETE" }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["saved-products"] });
    },
  });

  const products = productsQuery.data?.products ?? [];
  const savedIds = new Set(
    (savedProductsQuery.data?.savedProducts ?? []).map((item) => item.productId),
  );

  return (
    <PageShell
      eyebrow="Products"
      title="금융상품 비교"
      description="가계부 서비스에 금융상품 추천을 확장하려 할 때 바로 이어서 붙일 수 있는 비교 페이지입니다."
      aside={
        <>
          <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
            <h3 className="text-2xl font-semibold">확장 아이디어</h3>
            <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
              <p>사용자 소비 성향 기반 상품 추천</p>
              <p>즐겨찾기 저장과 비교표 생성</p>
              <p>가입 링크 연결</p>
            </div>
          </section>

          <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
            <h3 className="text-2xl font-semibold">관심 상품</h3>
            <div className="mt-4 grid gap-3">
              {(savedProductsQuery.data?.savedProducts ?? []).map((item) => (
                <div
                  key={item.id}
                  className="rounded-[1.4rem] border border-[var(--border)] bg-[var(--surface-strong)] p-4"
                >
                  <span className="pill">{item.productType}</span>
                  <strong className="mt-3 block">{item.productName}</strong>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    {item.bankName} · {item.rateDisplay}
                  </p>
                </div>
              ))}
              {savedProductsQuery.error ? (
                <p className="text-sm text-[var(--muted)]">
                  로그인 후 관심 상품 저장 기능을 사용할 수 있습니다.
                </p>
              ) : null}
            </div>
          </section>
        </>
      }
    >
      <section className="grid gap-4">
        {productsQuery.error ? (
          <p className="text-sm text-[var(--danger)]">{productsQuery.error.message}</p>
        ) : null}
        {products.map((product) => (
          <article
            key={product.id}
            className="glass-panel rounded-[1.75rem] p-5 sm:p-6"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="pill">{product.productType}</span>
                <h3 className="mt-3 text-2xl font-semibold">{product.productName}</h3>
                <p className="text-muted mt-2 text-sm">
                  {product.bankName} · {product.description}
                </p>
              </div>
              <strong className="text-xl text-[var(--accent-strong)]">
                {product.rateDisplay}
              </strong>
            </div>
            <div className="mt-4 flex justify-end">
              {savedIds.has(product.id) ? (
                <button
                  className="btn-secondary"
                  type="button"
                  onClick={() => removeMutation.mutate(product.id)}
                >
                  관심 해제
                </button>
              ) : (
                <button
                  className="btn-primary"
                  type="button"
                  onClick={() => saveMutation.mutate(product.id)}
                >
                  관심 상품 저장
                </button>
              )}
            </div>
          </article>
        ))}
      </section>
    </PageShell>
  );
}
