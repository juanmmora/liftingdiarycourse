"use client";

import { AddExerciseForm } from "./add-exercise-form";
import { ExerciseCard } from "./exercise-card";

type Set = {
  id: string;
  setNumber: number;
  reps: number | null;
  weight: string | null;
};

type WorkoutExercise = {
  workoutExerciseId: string;
  exerciseId: string;
  exerciseName: string;
  order: number;
  sets: Set[];
};

type Props = {
  workoutId: string;
  workoutExercises: WorkoutExercise[];
  exerciseCatalog: { id: string; name: string }[];
};

export function WorkoutLogger({ workoutId, workoutExercises, exerciseCatalog }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Exercises</h2>
      <AddExerciseForm workoutId={workoutId} exerciseCatalog={exerciseCatalog} />
      {workoutExercises.length === 0 ? (
        <p className="text-muted-foreground text-sm">No exercises yet. Add one above.</p>
      ) : (
        <div className="space-y-4">
          {workoutExercises.map((we) => (
            <ExerciseCard
              key={we.workoutExerciseId}
              workoutId={workoutId}
              workoutExerciseId={we.workoutExerciseId}
              exerciseName={we.exerciseName}
              sets={we.sets}
            />
          ))}
        </div>
      )}
    </div>
  );
}
