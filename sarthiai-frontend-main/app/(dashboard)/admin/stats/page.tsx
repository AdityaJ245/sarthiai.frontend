"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import { ApiError, fetchAdminStats } from "@/lib/api";
import { Card } from "@/components/ui";

export default function AdminStatsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  useEffect(() => {
    if (user?.role !== "admin") return;
    void (async () => {
      try {
        setData((await fetchAdminStats()) as Record<string, unknown>);
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Failed");
      }
    })();
  }, [user?.role]);

  if (user?.role !== "admin") return null;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold text-ink">Statistics</h1>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <Card>
        <pre className="max-h-[70vh] overflow-auto text-xs text-ink">
          {data ? JSON.stringify(data, null, 2) : "Loading…"}
        </pre>
      </Card>
    </div>
  );
}
