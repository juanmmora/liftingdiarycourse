"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Workout = {
  id: string;
  name: string;
  startedAt: Date;
  exercises: string[];
};

export function WorkoutCalendar({ workouts }: { workouts: Workout[] }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const workoutsForDate = workouts.filter(
    (w) =>
      format(new Date(w.startedAt), "yyyy-MM-dd") ===
      format(selectedDate, "yyyy-MM-dd")
  );

  return (
    <div className="flex gap-6 items-start">
      <Card className="shrink-0">
        <CardHeader>
          <CardTitle>Select Date</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(date)}
          />
        </CardContent>
      </Card>

      <div className="flex-1">
        <h2 className="text-xl font-semibold mb-4">
          Workouts for {format(new Date(selectedDate), "do MMM yyyy")}
        </h2>

        {workoutsForDate.length === 0 ? (
          <p className="text-muted-foreground">
            No workouts logged for this date.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {workoutsForDate.map((workout) => (
              <Card key={workout.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{workout.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {workout.exercises.map((exercise) => (
                      <li key={exercise}>{exercise}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
