"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/providers";
import { ApiError, fetchSummaryOverview } from "@/lib/api";
import { Card } from "@/components/ui";

export default function DashboardPage(): React.ReactElement {
  const { user } = useAuth();
  const [summary, setSummary] = useState<unknown>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const data = await fetchSummaryOverview();
        setSummary(data);
      } catch (e) {
        setErr(e instanceof ApiError ? e.message : "Could not load summary");
      }
    })();
  }, []);

  const s = summary as {
    daily?: { totalCalories: number; mealCount: number };
    weekly?: { totalCalories: number; mealCount: number };
  } | null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">
          Hello{user?.profile?.displayName ? `, ${user.profile.displayName}` : ""}
        </h1>
        <p className="mt-1 text-muted">Here is a snapshot of your nutrition.</p>
      </div>

      {err && <p className="text-sm text-red-700">{err}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Today</p>
          <p className="mt-2 font-display text-3xl font-semibold text-ink">
            {s?.daily?.totalCalories ?? "—"}
          </p>
          <p className="text-sm text-muted">kcal · {s?.daily?.mealCount ?? 0} meals</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">This week</p>
          <p className="mt-2 font-display text-3xl font-semibold text-ink">
            {s?.weekly?.totalCalories ?? "—"}
          </p>
          <p className="text-sm text-muted">kcal · {s?.weekly?.mealCount ?? 0} meals</p>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/meals/new"
          className="inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Log a meal
        </Link>
        <Link
          href="/summary"
          className="inline-flex rounded-lg border border-line px-4 py-2 text-sm font-medium text-ink hover:bg-canvas"
        >
          Full summary
        </Link>
      </div>
    </div>
  );
}
