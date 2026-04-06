import { auth } from "@clerk/nextjs/server";
import { getWorkoutsByUser } from "@/data/workouts";
import { WorkoutCalendar } from "@/components/dashboard/workout-calendar";

export default async function DashboardPage() {
  const { userId } = await auth();

  const rows = userId ? await getWorkoutsByUser(userId) : [];

  // Group flat rows into workouts with exercises arrays
  const workoutMap = new Map<
    string,
    { id: string; name: string; startedAt: Date; exercises: string[] }
  >();

  for (const row of rows) {
    if (!workoutMap.has(row.id)) {
      workoutMap.set(row.id, {
        id: row.id,
        name: row.name,
        startedAt: row.startedAt,
        exercises: [],
      });
    }
    if (row.exerciseName) {
      workoutMap.get(row.id)!.exercises.push(row.exerciseName);
    }
  }

  const workouts = Array.from(workoutMap.values());

  return (
    <div className="p-6">
      <WorkoutCalendar workouts={workouts} />
    </div>
  );
}
