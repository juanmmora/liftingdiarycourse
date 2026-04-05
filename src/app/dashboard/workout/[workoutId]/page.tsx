import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getWorkoutById } from "@/data/workouts";
import { EditWorkoutForm } from "./components/edit-workout-form";

type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function EditWorkoutPage({ params }: Props) {
  const { workoutId } = await params;
  const { userId } = await auth();

  if (!userId) {
    return notFound();
  }

  const workout = await getWorkoutById(workoutId, userId);

  if (!workout) {
    return notFound();
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Edit Workout</h1>
      <EditWorkoutForm
        workoutId={workout.id}
        defaultValues={{
          name: workout.name,
          startedAt: workout.startedAt.toISOString().slice(0, 16),
        }}
      />
    </div>
  );
}
