"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateWorkoutAction } from "../actions";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  startedAt: z.string().min(1, "Date is required"),
});

type FormValues = z.infer<typeof schema>;

type Props = {
  workoutId: string;
  defaultValues: FormValues;
};

export function EditWorkoutForm({ workoutId, defaultValues }: Props) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  async function onSubmit(values: FormValues) {
    await updateWorkoutAction(workoutId, {
      name: values.name,
      startedAt: new Date(values.startedAt).toISOString(),
    });
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="name">Workout Name</Label>
        <Input
          id="name"
          placeholder="e.g. Push Day"
          {...register("name")}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="startedAt">Date &amp; Time</Label>
        <Input
          id="startedAt"
          type="datetime-local"
          {...register("startedAt")}
        />
        {errors.startedAt && (
          <p className="text-sm text-red-500">{errors.startedAt.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
