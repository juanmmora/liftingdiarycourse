import { auth } from "@clerk/nextjs/server";
import { getWorkoutsByUser } from "@/data/workouts";
import { WorkoutCalendar } from "@/components/dashboard/workout-calendar";
import { Button } from "@/components/ui/button";

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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button>Log Workout</Button>
      </div>
      <WorkoutCalendar workouts={workouts} />
    </div>
  );
}
