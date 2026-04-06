"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addExerciseToWorkoutAction } from "../actions";

type Props = {
  workoutId: string;
  exerciseCatalog: { id: string; name: string }[];
};

export function AddExerciseForm({ workoutId, exerciseCatalog }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = inputRef.current?.value.trim();
    if (!name) return;

    startTransition(async () => {
      await addExerciseToWorkoutAction(workoutId, { exerciseName: name });
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <div className="flex-1">
        <Label htmlFor="exercise-name">Add Exercise</Label>
        <Input
          id="exercise-name"
          ref={inputRef}
          list="exercise-catalog"
          placeholder="e.g. Bench Press"
          required
        />
        <datalist id="exercise-catalog">
          {exerciseCatalog.map((ex) => (
            <option key={ex.id} value={ex.name} />
          ))}
        </datalist>
      </div>
      <Button type="submit" disabled={isPending}>
        Add
      </Button>
    </form>
  );
}
