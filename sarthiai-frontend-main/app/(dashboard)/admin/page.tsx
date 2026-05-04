"use client";

import Link from "next/link";
import { useAuth } from "@/app/providers";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card } from "@/components/ui";

export default function AdminHomePage(): React.ReactElement {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [user, router]);

  if (!user || user.role !== "admin") {
    return <p className="text-sm text-muted">Checking access…</p>;
  }

  const links = [
    { href: "/admin/stats", label: "Statistics", desc: "System & usage overview" },
    { href: "/admin/users", label: "Users", desc: "Directory & roles" },
    { href: "/admin/meals", label: "Meals", desc: "All users’ meals" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Admin</h1>
        <p className="text-sm text-muted">Elevated access — handle with care</p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-3">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href}>
              <Card className="h-full transition-colors hover:border-accent/40">
                <p className="font-medium text-ink">{l.label}</p>
                <p className="mt-1 text-xs text-muted">{l.desc}</p>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
