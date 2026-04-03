"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MOCK_WORKOUTS = [
  {
    id: 1,
    date: new Date(),
    name: "Upper Body Push",
    exercises: ["Bench Press", "Overhead Press", "Tricep Dips"],
  },
  {
    id: 2,
    date: new Date(),
    name: "Lower Body",
    exercises: ["Squat", "Romanian Deadlift", "Leg Press"],
  },
];

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const workoutsForDate = MOCK_WORKOUTS.filter(
    (w) => format(w.date, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd")
  );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      {/* Two-column layout: calendar on left, workout list on right */}
      <div className="flex gap-6 items-start">

        {/* Left: date picker */}
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

        {/* Right: workout list */}
        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-4">
            Workouts for {format(selectedDate, "do MMM yyyy")}
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
    </div>
  );
}
