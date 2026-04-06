"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { updateWorkout, getWorkoutById } from "@/data/workouts";
import {
  getOrCreateExercise,
  addExerciseToWorkout,
  deleteWorkoutExercise,
  addSet,
  deleteSet,
} from "@/data/exercises";

const updateWorkoutSchema = z.object({
  name: z.string().min(1, "Name is required"),
  startedAt: z.string().datetime(),
});

export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;

export async function updateWorkoutAction(workoutId: string, input: UpdateWorkoutInput) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const parsed = updateWorkoutSchema.parse(input);

  await updateWorkout(workoutId, userId, {
    name: parsed.name,
    startedAt: new Date(parsed.startedAt),
  });
}

const addExerciseSchema = z.object({
  exerciseName: z.string().min(1, "Exercise name is required"),
});

export type AddExerciseInput = z.infer<typeof addExerciseSchema>;

export async function addExerciseToWorkoutAction(workoutId: string, input: AddExerciseInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = addExerciseSchema.parse(input);

  const workout = await getWorkoutById(workoutId, userId);
  if (!workout) throw new Error("Workout not found");

  const exercise = await getOrCreateExercise(parsed.exerciseName);
  await addExerciseToWorkout(workoutId, exercise.id);
}

const deleteWorkoutExerciseSchema = z.object({
  workoutExerciseId: z.string().min(1),
});

export type DeleteWorkoutExerciseInput = z.infer<typeof deleteWorkoutExerciseSchema>;

export async function deleteWorkoutExerciseAction(
  workoutId: string,
  input: DeleteWorkoutExerciseInput
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = deleteWorkoutExerciseSchema.parse(input);

  const workout = await getWorkoutById(workoutId, userId);
  if (!workout) throw new Error("Workout not found");

  await deleteWorkoutExercise(parsed.workoutExerciseId);
}

const addSetSchema = z.object({
  workoutExerciseId: z.string().min(1),
  reps: z.number().int().positive(),
  weight: z.number().positive(),
});

export type AddSetInput = z.infer<typeof addSetSchema>;

export async function addSetAction(workoutId: string, input: AddSetInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = addSetSchema.parse(input);

  const workout = await getWorkoutById(workoutId, userId);
  if (!workout) throw new Error("Workout not found");

  await addSet(parsed.workoutExerciseId, parsed.reps, parsed.weight);
}

const deleteSetSchema = z.object({
  setId: z.string().min(1),
});

export type DeleteSetInput = z.infer<typeof deleteSetSchema>;

export async function deleteSetAction(workoutId: string, input: DeleteSetInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const parsed = deleteSetSchema.parse(input);

  const workout = await getWorkoutById(workoutId, userId);
  if (!workout) throw new Error("Workout not found");

  await deleteSet(parsed.setId);
}
