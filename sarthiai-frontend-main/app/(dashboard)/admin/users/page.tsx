"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import { ApiError, fetchAdminUsers, setUserRole } from "@/lib/api";
import type { PublicUser } from "@/lib/types";
import { Button, Card } from "@/components/ui";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  async function load(): Promise<void> {
    try {
      const r = await fetchAdminUsers(0, 50);
      setUsers(r.users);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed");
    }
  }

  useEffect(() => {
    if (user?.role === "admin") void load();
  }, [user?.role]);

  async function toggleRole(u: PublicUser): Promise<void> {
    const next = u.role === "admin" ? "user" : "admin";
    try {
      await setUserRole(u.id, next);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed");
    }
  }

  if (user?.role !== "admin") return null;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold text-ink">Users</h1>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <ul className="space-y-2">
        {users.map((u) => (
          <li key={u.id}>
            <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-ink">{u.email}</p>
                <p className="text-xs text-muted">
                  {u.role} · {u.id}
                </p>
              </div>
              <Button type="button" variant="ghost" onClick={() => void toggleRole(u)}>
                Make {u.role === "admin" ? "user" : "admin"}
              </Button>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
