"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import Link from "next/link";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Workout = {
  id: string;
  name: string;
  startedAt: Date;
  exercises: string[];
};

export function WorkoutCalendar({ workouts }: { workouts: Workout[] }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [open, setOpen] = useState(false);

  const workoutsForDate = workouts.filter(
    (w) =>
      format(new Date(w.startedAt), "yyyy-MM-dd") ===
      format(selectedDate, "yyyy-MM-dd")
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workouts Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Workouts &middot; {format(selectedDate, "do MMM yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/workout/new">
            <Button>Log New Workout</Button>
          </Link>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon">
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setOpen(false);
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div>
        {workoutsForDate.length === 0 ? (
          <p className="text-muted-foreground">
            No workouts logged for this date.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {workoutsForDate.map((workout) => (
              <Link key={workout.id} href={`/dashboard/workout/${workout.id}`}>
                <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
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
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
