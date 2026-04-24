"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/client-api";

const navigationItems = [
  { href: "/", label: "홈" },
  { href: "/dashboard", label: "대시보드" },
  { href: "/transactions", label: "거래내역" },
  { href: "/analysis", label: "분석" },
  { href: "/products", label: "금융상품" },
  { href: "/auth", label: "로그인" },
];

export function SiteHeader() {
  const pathname = usePathname();
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

  return (
    <header className="sticky top-0 z-20 px-4 py-4 sm:px-6 lg:px-8">
      <div className="glass-panel mx-auto flex w-full max-w-7xl flex-col gap-4 rounded-[1.75rem] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-[0.18em] text-[var(--accent-strong)] uppercase">
            Astera Finance
          </p>
          <h1 className="display-font text-2xl">자산 흐름을 한눈에 관리하는 금융 플랫폼</h1>
        </div>

        <nav className="flex flex-wrap gap-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`pill transition-colors ${
                  isActive ? "bg-[var(--foreground)] text-white" : ""
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="text-sm text-[var(--muted)]">
          {meQuery.data?.user ? `${meQuery.data.user.name} 로그인 중` : "로그인 전"}
        </div>
      </div>
    </header>
  );
}
