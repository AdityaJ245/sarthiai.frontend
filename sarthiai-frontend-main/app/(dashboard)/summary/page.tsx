"use client";

import { useEffect, useState } from "react";
import { ApiError, fetchSummaryOverview } from "@/lib/api";
import { Card } from "@/components/ui";

export default function SummaryPage(): React.ReactElement {
  const [data, setData] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setData(await fetchSummaryOverview());
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Failed to load");
      }
    })();
  }, []);

  const bundle = data as {
    daily?: { date: string; totalCalories: number; mealCount: number };
    weekly?: { totalCalories: number; mealCount: number; byDay?: Record<string, { calories: number; meals: number }> };
    nutrients?: { mealCount: number; totals: Record<string, number> };
    trends?: { days: number; series: { date: string; totalCalories: number; meals: number }[] };
  } | null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Summary</h1>
        <p className="text-sm text-muted">Your analytics in one place</p>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-ink">Daily</h2>
          <p className="mt-2 text-2xl font-semibold text-accent">{bundle?.daily?.totalCalories ?? "—"}</p>
          <p className="text-sm text-muted">kcal · {bundle?.daily?.mealCount ?? 0} meals</p>
        </Card>
        <Card>
          <h2 className="text-sm font-semibold text-ink">Weekly (ISO week)</h2>
          <p className="mt-2 text-2xl font-semibold text-accent">{bundle?.weekly?.totalCalories ?? "—"}</p>
          <p className="text-sm text-muted">kcal · {bundle?.weekly?.mealCount ?? 0} meals</p>
        </Card>
      </div>

      <Card>
        <h2 className="text-sm font-semibold text-ink">Nutrients (range)</h2>
        <p className="mt-1 text-xs text-muted">{bundle?.nutrients?.mealCount ?? 0} meals in window</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {["calories", "protein", "carbohydrates", "fat"].map((k) => (
            <div key={k}>
              <dt className="text-muted capitalize">{k}</dt>
              <dd className="font-medium text-ink">
                {bundle?.nutrients?.totals?.[k] !== undefined
                  ? Math.round(bundle.nutrients.totals[k] as number)
                  : "—"}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-ink">Trend</h2>
        <p className="text-xs text-muted">Last {bundle?.trends?.days ?? "—"} days</p>
        <div className="mt-4 max-h-48 space-y-1 overflow-y-auto text-xs">
          {bundle?.trends?.series?.map((row) => (
            <div key={row.date} className="flex justify-between border-b border-line/50 py-1">
              <span className="text-muted">{row.date}</span>
              <span>
                {row.totalCalories} kcal · {row.meals} meals
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
