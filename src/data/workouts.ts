import { db } from "@/db";
import { exercises, workoutExercises, workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createWorkout(data: typeof workouts.$inferInsert) {
  return db.insert(workouts).values(data).returning();
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
