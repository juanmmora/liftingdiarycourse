"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { deleteSetAction } from "../actions";

type Props = {
  workoutId: string;
  setId: string;
  setNumber: number;
  reps: number | null;
  weight: string | null;
};

export function SetRow({ workoutId, setId, setNumber, reps, weight }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteSetAction(workoutId, { setId });
      router.refresh();
    });
  }

  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span>
        Set {setNumber} — {reps ?? "—"} reps @ {weight ?? "—"} kg
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        disabled={isPending}
        className="text-destructive hover:text-destructive"
      >
        Remove
      </Button>
    </div>
  );
}
