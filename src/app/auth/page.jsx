"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageShell } from "@/components/page-shell";
import { apiRequest } from "@/lib/client-api";
import { useFinanceStore } from "@/store/use-finance-store";

export default function AuthPage() {
  const queryClient = useQueryClient();
  const { user, setUser, clearUser } = useFinanceStore();
  const [isMounted, setIsMounted] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: () => apiRequest("/api/auth/me"),
    retry: false,
    enabled: isMounted,
  });

  useEffect(() => {
    if (meQuery.data?.user) {
      setUser(meQuery.data.user);
    }
    if (meQuery.isError) {
      clearUser();
    }
  }, [clearUser, meQuery.data, meQuery.isError, setUser]);

  const loginMutation = useMutation({
    mutationFn: () =>
      apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(loginForm),
      }),
    onSuccess: async (data) => {
      setUser(data.user);
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: () =>
      apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(registerForm),
      }),
    onSuccess: async (data) => {
      setUser(data.user);
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("/api/auth/logout", { method: "POST" }),
    onSuccess: async () => {
      clearUser();
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["auth", "me"] }),
        queryClient.invalidateQueries({ queryKey: ["transactions"] }),
        queryClient.invalidateQueries({ queryKey: ["finance-snapshot"] }),
      ]);
    },
  });

  return (
    <PageShell
      eyebrow="Account"
      title="계정 및 보안"
      description="이메일 기반 로그인과 회원가입을 통해 개인 자산 데이터와 금융 활동 내역을 안전하게 관리할 수 있습니다."
      aside={
        <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
          <h3 className="text-2xl font-semibold">보안 안내</h3>
          <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            <p>이메일 기반 계정 등록과 로그인 기능을 제공합니다.</p>
            <p>로그인 후에는 개인 거래 데이터와 저장한 금융상품만 조회할 수 있습니다.</p>
            <p>세션이 만료되면 다시 인증을 요청해 계정 정보를 보호합니다.</p>
            <p>{user ? `${user.name} 로그인 중` : "현재 로그인 전"}</p>
          </div>
          {user ? (
            <button
              className="btn-secondary mt-4"
              type="button"
              onClick={() => logoutMutation.mutate()}
            >
              로그아웃
            </button>
          ) : null}
        </section>
      }
    >
      <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            loginMutation.mutate();
          }}
        >
          <input
            className="field"
            placeholder="이메일"
            value={loginForm.email}
            onChange={(event) =>
              setLoginForm((current) => ({ ...current, email: event.target.value }))
            }
          />
          <input
            className="field"
            placeholder="비밀번호"
            type="password"
            value={loginForm.password}
            onChange={(event) =>
              setLoginForm((current) => ({ ...current, password: event.target.value }))
            }
          />
          <button className="btn-primary" type="submit">
            로그인
          </button>
          {loginMutation.error ? (
            <p className="text-sm text-[var(--danger)]">{loginMutation.error.message}</p>
          ) : null}
        </form>
      </section>

      <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            registerMutation.mutate();
          }}
        >
          <input
            className="field"
            placeholder="이름"
            value={registerForm.name}
            onChange={(event) =>
              setRegisterForm((current) => ({ ...current, name: event.target.value }))
            }
          />
          <input
            className="field"
            placeholder="이메일"
            value={registerForm.email}
            onChange={(event) =>
              setRegisterForm((current) => ({ ...current, email: event.target.value }))
            }
          />
          <input
            className="field"
            placeholder="비밀번호"
            type="password"
            value={registerForm.password}
            onChange={(event) =>
              setRegisterForm((current) => ({
                ...current,
                password: event.target.value,
              }))
            }
          />
          <button className="btn-secondary" type="submit">
            회원가입
          </button>
          {registerMutation.error ? (
            <p className="text-sm text-[var(--danger)]">{registerMutation.error.message}</p>
          ) : null}
        </form>
      </section>
    </PageShell>
  );
}
