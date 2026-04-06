"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addSetAction } from "../actions";

const schema = z.object({
  reps: z.coerce.number().int().positive("Reps must be a positive integer"),
  weight: z.coerce.number().positive("Weight must be positive"),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  workoutId: string;
  workoutExerciseId: string;
};

export function AddSetForm({ workoutId, workoutExerciseId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
  });

  function onSubmit(values: FormValues) {
    startTransition(async () => {
      await addSetAction(workoutId, {
        workoutExerciseId,
        reps: values.reps,
        weight: values.weight,
      });
      reset();
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-2 mt-2">
      <div>
        <Label htmlFor={`reps-${workoutExerciseId}`} className="text-xs">Reps</Label>
        <Input
          id={`reps-${workoutExerciseId}`}
          type="number"
          placeholder="8"
          className="w-20"
          {...register("reps")}
        />
        {errors.reps && <p className="text-xs text-destructive mt-1">{errors.reps.message}</p>}
      </div>
      <div>
        <Label htmlFor={`weight-${workoutExerciseId}`} className="text-xs">Weight (kg)</Label>
        <Input
          id={`weight-${workoutExerciseId}`}
          type="number"
          step="0.5"
          placeholder="60"
          className="w-24"
          {...register("weight")}
        />
        {errors.weight && <p className="text-xs text-destructive mt-1">{errors.weight.message}</p>}
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        Add Set
      </Button>
    </form>
  );
}
