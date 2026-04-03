import { NewWorkoutForm } from "./components/new-workout-form";

export default function NewWorkoutPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Log Workout</h1>
      <NewWorkoutForm />
    </div>
  );
}
