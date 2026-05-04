"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ApiError, deleteMeal, getMeal, updateMeal } from "@/lib/api";
import type { Meal } from "@/lib/types";
import { Button, Card, Input, Textarea } from "@/components/ui";

export default function MealDetailPage(): React.ReactElement {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";
  const router = useRouter();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [edit, setEdit] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [calories, setCalories] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    if (!id) return;
    try {
      const { meal: m } = await getMeal(id);
      setMeal(m);
      setTitle(m.title);
      setNotes(m.notes);
      setCalories(String(m.nutrition.calories));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Not found");
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSave(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    if (!id) return;
    setError(null);
    try {
      const cal = Number.parseFloat(calories);
      if (!Number.isFinite(cal)) {
        setError("Invalid calories");
        return;
      }
      const { meal: m } = await updateMeal(id, {
        title,
        notes,
        nutrition: { calories: cal },
      });
      setMeal(m);
      setEdit(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Update failed");
    }
  }

  async function onDelete(): Promise<void> {
    if (!id || !confirm("Delete this meal?")) return;
    try {
      await deleteMeal(id);
      router.replace("/meals");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Delete failed");
    }
  }

  if (!meal && !error) {
    return <p className="text-sm text-muted">Loading…</p>;
  }
  if (error && !meal) {
    return <p className="text-sm text-red-700">{error}</p>;
  }
  if (!meal) return <></>;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/meals" className="text-sm text-muted hover:text-ink">
          ← Meals
        </Link>
        <Button type="button" variant="ghost" onClick={() => setEdit(!edit)}>
          {edit ? "Cancel" : "Edit"}
        </Button>
      </div>

      {edit ? (
        <Card>
          <form onSubmit={(e) => void onSave(e)} className="space-y-4">
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Textarea label="Notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
            <Input label="Calories" type="number" value={calories} onChange={(e) => setCalories(e.target.value)} />
            {error && <p className="text-sm text-red-700">{error}</p>}
            <Button type="submit">Save</Button>
          </form>
        </Card>
      ) : (
        <Card>
          <h1 className="font-display text-2xl font-semibold text-ink">{meal.title || "Meal"}</h1>
          <p className="mt-1 text-sm text-muted">{new Date(meal.eatenAt).toLocaleString()}</p>
          <p className="mt-6 font-display text-4xl font-semibold text-accent">{meal.nutrition.calories}</p>
          <p className="text-sm text-muted">kilocalories</p>
          {meal.notes && <p className="mt-6 text-sm leading-relaxed text-ink">{meal.notes}</p>}
        </Card>
      )}

      {!edit && (
        <Button type="button" variant="danger" className="w-full" onClick={() => void onDelete()}>
          Delete meal
        </Button>
      )}
    </div>
  );
}
