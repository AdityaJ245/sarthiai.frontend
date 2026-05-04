"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError, listMeals } from "@/lib/api";
import type { Meal } from "@/lib/types";
import { Card } from "@/components/ui";

export default function MealsPage(): React.ReactElement {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState<string>("");
  const [period, setPeriod] = useState<string>("");

  async function load(): Promise<void> {
    setError(null);
    try {
      const res = await listMeals({
        limit: 50,
        skip: 0,
        ...(q ? { q } : {}),
        ...(period ? { period } : {}),
        sort: "latest",
      });
      setMeals(res.meals);
      setTotal(res.total);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to load meals");
    }
  }

  useEffect(() => {
    void load();
    // Filters refresh only when the user clicks Apply; omitting load avoids duplicate requests.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Meals</h1>
          <p className="text-sm text-muted">{total} logged</p>
        </div>
        <Link
          href="/meals/new"
          className="inline-flex w-fit rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-hover"
        >
          Add meal
        </Link>
      </div>

      <Card className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <input
            placeholder="Search title or notes"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="min-w-[200px] flex-1 rounded-lg border border-line px-3 py-2 text-sm"
          />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm"
          >
            <option value="">All time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 days</option>
            <option value="month">Last 30 days</option>
          </select>
          <button
            type="button"
            onClick={() => void load()}
            className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white"
          >
            Apply
          </button>
        </div>
      </Card>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <ul className="space-y-3">
        {meals.map((m) => (
          <li key={m.id}>
            <Link href={`/meals/${m.id}`}>
              <Card className="transition-colors hover:border-accent/40">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-ink">{m.title || "Untitled"}</p>
                    <p className="text-xs text-muted">
                      {new Date(m.eatenAt).toLocaleString()} · {m.nutrition.calories} kcal
                    </p>
                  </div>
                  <span className="text-xs text-accent">View →</span>
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>

      {meals.length === 0 && !error && (
        <p className="text-center text-sm text-muted">No meals yet. Add your first one.</p>
      )}
    </div>
  );
}
