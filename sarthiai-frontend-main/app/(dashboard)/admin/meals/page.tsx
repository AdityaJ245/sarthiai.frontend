"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import { ApiError, deleteAdminMeal, fetchAdminMeals } from "@/lib/api";
import type { Meal } from "@/lib/types";
import { Button, Card } from "@/components/ui";

type AdminMeal = Meal & {
  user?: { id: string; email: string; role: string };
  suspicious?: boolean;
};

export default function AdminMealsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [meals, setMeals] = useState<AdminMeal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState<string>("");

  useEffect(() => {
    if (user && user.role !== "admin") router.replace("/dashboard");
  }, [user, router]);

  async function load(): Promise<void> {
    try {
      const r = await fetchAdminMeals({ limit: 40, skip: 0, ...(q ? { q } : {}) });
      setMeals(r.meals as AdminMeal[]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed");
    }
  }

  useEffect(() => {
    if (user?.role === "admin") void load();
    // Search uses the latest query via the Search button; avoid refetch on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  async function remove(id: string): Promise<void> {
    if (!confirm("Delete this meal?")) return;
    try {
      await deleteAdminMeal(id);
      await load();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed");
    }
  }

  if (user?.role !== "admin") return null;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold text-ink">All meals</h1>
      <Card className="flex flex-wrap gap-2">
        <input
          className="min-w-[200px] flex-1 rounded-lg border border-line px-3 py-2 text-sm"
          placeholder="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Button type="button" onClick={() => void load()}>
          Search
        </Button>
      </Card>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <ul className="space-y-2">
        {meals.map((m) => (
          <li key={m.id}>
            <Card className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-ink">
                  {m.title || "Untitled"}{" "}
                  {m.suspicious && (
                    <span className="rounded bg-amber-100 px-1.5 text-xs text-amber-900">flagged</span>
                  )}
                </p>
                <p className="text-xs text-muted">
                  {m.user?.email ?? m.userId} · {m.nutrition.calories} kcal ·{" "}
                  {new Date(m.eatenAt).toLocaleString()}
                </p>
              </div>
              <Button type="button" variant="danger" onClick={() => void remove(m.id)}>
                Delete
              </Button>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
