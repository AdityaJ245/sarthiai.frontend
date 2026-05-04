"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, createMeal } from "@/lib/api";
import { Button, Card, Input, Textarea } from "@/components/ui";

export default function NewMealPage(): React.ReactElement {
  const router = useRouter();
  const [title, setTitle] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [eatenAt, setEatenAt] = useState<string>(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [calories, setCalories] = useState<string>("");
  const [protein, setProtein] = useState<string>("");
  const [carbs, setCarbs] = useState<string>("");
  const [fat, setFat] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<boolean>(false);

  async function onSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    const cal = Number.parseFloat(calories);
    if (!Number.isFinite(cal) || cal < 0) {
      setError("Calories must be a valid number");
      return;
    }
    setPending(true);
    try {
      const nutrition: Record<string, number | undefined> = { calories: cal };
      const p = Number.parseFloat(protein);
      if (Number.isFinite(p)) nutrition.protein = p;
      const c = Number.parseFloat(carbs);
      if (Number.isFinite(c)) nutrition.carbohydrates = c;
      const f = Number.parseFloat(fat);
      if (Number.isFinite(f)) nutrition.fat = f;

      const { meal } = await createMeal({
        title: title.trim(),
        notes,
        eatenAt: new Date(eatenAt).toISOString(),
        nutrition,
      });
      router.replace(`/meals/${meal.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save meal");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="font-display text-3xl font-semibold text-ink">Log meal</h1>
      <Card>
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea label="Notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          <Input
            label="When eaten"
            type="datetime-local"
            value={eatenAt}
            onChange={(e) => setEatenAt(e.target.value)}
            required
          />
          <Input
            label="Calories (required)"
            type="number"
            min={0}
            step={1}
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            required
          />
          <div className="grid grid-cols-3 gap-3">
            <Input label="Protein g" type="number" min={0} value={protein} onChange={(e) => setProtein(e.target.value)} />
            <Input label="Carbs g" type="number" min={0} value={carbs} onChange={(e) => setCarbs(e.target.value)} />
            <Input label="Fat g" type="number" min={0} value={fat} onChange={(e) => setFat(e.target.value)} />
          </div>
          {error && <p className="text-sm text-red-700">{error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Saving…" : "Save meal"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
