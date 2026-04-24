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
      eyebrow="Auth"
      title="인증 준비 페이지"
      description="JWT 쿠키 기반 로그인과 회원가입을 실제로 연결한 페이지입니다."
      aside={
        <section className="glass-panel rounded-[1.75rem] p-5 sm:p-6">
          <h3 className="text-2xl font-semibold">예정 기능</h3>
          <div className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            <p>이메일 기반 회원가입</p>
            <p>JWT 로그인과 세션 확인</p>
            <p>사용자별 데이터 접근 제어</p>
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
