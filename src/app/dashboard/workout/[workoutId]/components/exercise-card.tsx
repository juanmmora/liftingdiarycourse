"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SetRow } from "./set-row";
import { AddSetForm } from "./add-set-form";
import { deleteWorkoutExerciseAction } from "../actions";

type Set = {
  id: string;
  setNumber: number;
  reps: number | null;
  weight: string | null;
};

type Props = {
  workoutId: string;
  workoutExerciseId: string;
  exerciseName: string;
  sets: Set[];
};

export function ExerciseCard({ workoutId, workoutExerciseId, exerciseName, sets }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteWorkoutExerciseAction(workoutId, { workoutExerciseId });
      router.refresh();
    });
  }

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg">{exerciseName}</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={isPending}
          className="text-destructive hover:text-destructive"
        >
          Remove Exercise
        </Button>
      </div>
      <div className="divide-y">
        {sets.map((set) => (
          <SetRow
            key={set.id}
            workoutId={workoutId}
            setId={set.id}
            setNumber={set.setNumber}
            reps={set.reps}
            weight={set.weight}
          />
        ))}
      </div>
      <AddSetForm workoutId={workoutId} workoutExerciseId={workoutExerciseId} />
    </div>
  );
}
