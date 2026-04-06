import { db } from "@/db";
import { exercises, workoutExercises, sets } from "@/db/schema";
import { eq, ilike, max } from "drizzle-orm";

export async function getExerciseCatalog() {
  return db
    .select({ id: exercises.id, name: exercises.name })
    .from(exercises)
    .orderBy(exercises.name);
}

export async function getOrCreateExercise(name: string) {
  const trimmed = name.trim();
  const existing = await db
    .select({ id: exercises.id })
    .from(exercises)
    .where(ilike(exercises.name, trimmed))
    .limit(1);

  if (existing[0]) return existing[0];

  const inserted = await db
    .insert(exercises)
    .values({ name: trimmed })
    .returning({ id: exercises.id });

  return inserted[0];
}

export async function getWorkoutExercisesWithSets(workoutId: string) {
  const rows = await db
    .select({
      workoutExerciseId: workoutExercises.id,
      exerciseId: workoutExercises.exerciseId,
      exerciseName: exercises.name,
      order: workoutExercises.order,
      setId: sets.id,
      setNumber: sets.setNumber,
      reps: sets.reps,
      weight: sets.weight,
    })
    .from(workoutExercises)
    .innerJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(sets, eq(sets.workoutExerciseId, workoutExercises.id))
    .where(eq(workoutExercises.workoutId, workoutId))
    .orderBy(workoutExercises.order, sets.setNumber);

  type WorkoutExerciseWithSets = {
    workoutExerciseId: string;
    exerciseId: string;
    exerciseName: string;
    order: number;
    sets: { id: string; setNumber: number; reps: number | null; weight: string | null }[];
  };

  const map = new Map<string, WorkoutExerciseWithSets>();

  for (const row of rows) {
    if (!map.has(row.workoutExerciseId)) {
      map.set(row.workoutExerciseId, {
        workoutExerciseId: row.workoutExerciseId,
        exerciseId: row.exerciseId,
        exerciseName: row.exerciseName,
        order: row.order,
        sets: [],
      });
    }
    if (row.setId !== null) {
      map.get(row.workoutExerciseId)!.sets.push({
        id: row.setId,
        setNumber: row.setNumber!,
        reps: row.reps,
        weight: row.weight,
      });
    }
  }

  return Array.from(map.values());
}

export async function addExerciseToWorkout(workoutId: string, exerciseId: string) {
  const result = await db
    .select({ maxOrder: max(workoutExercises.order) })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId));

  const nextOrder = (result[0]?.maxOrder ?? 0) + 1;

  return db
    .insert(workoutExercises)
    .values({ workoutId, exerciseId, order: nextOrder })
    .returning();
}

export async function deleteWorkoutExercise(workoutExerciseId: string) {
  return db
    .delete(workoutExercises)
    .where(eq(workoutExercises.id, workoutExerciseId));
}

export async function addSet(workoutExerciseId: string, reps: number, weight: number) {
  const result = await db
    .select({ maxSetNumber: max(sets.setNumber) })
    .from(sets)
    .where(eq(sets.workoutExerciseId, workoutExerciseId));

  const nextSetNumber = (result[0]?.maxSetNumber ?? 0) + 1;

  return db
    .insert(sets)
    .values({
      workoutExerciseId,
      setNumber: nextSetNumber,
      reps,
      weight: weight.toString(),
    })
    .returning();
}

export async function deleteSet(setId: string) {
  return db.delete(sets).where(eq(sets.id, setId));
}
