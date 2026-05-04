"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/app/providers";

const nav = [
  { href: "/dashboard", label: "Home" },
  { href: "/meals", label: "Meals" },
  { href: "/summary", label: "Summary" },
  { href: "/profile", label: "Profile" },
];

export function AppShell({ children }: { children: React.ReactNode }): React.ReactElement {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-line/80 bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="font-display text-lg font-semibold tracking-tight text-ink">
            Sarthi AI
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                    active ? "bg-accent-soft text-accent font-medium" : "text-muted hover:text-ink"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            {user?.role === "admin" && (
              <Link
                href="/admin"
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  pathname.startsWith("/admin")
                    ? "bg-accent-soft text-accent font-medium"
                    : "text-muted hover:text-ink"
                }`}
              >
                Admin
              </Link>
            )}
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted sm:inline truncate max-w-[140px]">
              {user?.email}
            </span>
            <button
              type="button"
              onClick={() => void logout()}
              className="text-xs font-medium text-muted hover:text-ink"
            >
              Sign out
            </button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-line/50 px-4 py-2 sm:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="shrink-0 rounded-md px-2.5 py-1 text-xs text-muted"
            >
              {item.label}
            </Link>
          ))}
          {user?.role === "admin" && (
            <Link href="/admin" className="shrink-0 rounded-md px-2.5 py-1 text-xs text-muted">
              Admin
            </Link>
          )}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
