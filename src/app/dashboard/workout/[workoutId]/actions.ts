"use server";

import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { updateWorkout } from "@/data/workouts";

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
