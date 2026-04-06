import { db } from "@/db";
import { exercises, workoutExercises, workouts } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function createWorkout(data: typeof workouts.$inferInsert) {
  return db.insert(workouts).values(data).returning();
}

export async function getWorkoutById(id: string, userId: string) {
  const result = await db
    .select()
    .from(workouts)
    .where(eq(workouts.id, id))
    .limit(1);

  const workout = result[0];
  if (!workout || workout.userId !== userId) return null;
  return workout;
}

export async function updateWorkout(
  id: string,
  userId: string,
  data: { name: string; startedAt: Date }
) {
  return db
    .update(workouts)
    .set({ name: data.name, startedAt: data.startedAt, updatedAt: new Date() })
    .where(and(eq(workouts.id, id), eq(workouts.userId, userId)))
    .returning();
}

export async function getWorkoutsByUser(userId: string) {
  return db
    .select({
      id: workouts.id,
      name: workouts.name,
      startedAt: workouts.startedAt,
      exerciseName: exercises.name,
    })
    .from(workouts)
    .leftJoin(workoutExercises, eq(workoutExercises.workoutId, workouts.id))
    .leftJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .where(eq(workouts.userId, userId))
    .orderBy(workouts.startedAt);
}
