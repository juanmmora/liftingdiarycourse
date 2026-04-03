# Data Mutations

## CRITICAL RULES

### 1. All Database Mutations via `/data` Helper Functions

**ALL database mutations MUST go through helper functions in the `src/data` directory.**

- **DO NOT** write raw SQL strings
- **DO NOT** mutate the database directly from Server Actions, pages, or any other component
- **USE** Drizzle ORM exclusively for all mutations

```ts
// src/data/workouts.ts — CORRECT
import { db } from "@/db";
import { workouts } from "@/db/schema";

export async function createWorkout(data: typeof workouts.$inferInsert) {
  return db.insert(workouts).values(data).returning();
}

export async function deleteWorkout(id: string) {
  return db.delete(workouts).where(eq(workouts.id, id));
}
```

```ts
// WRONG — never mutate the database outside of /data
import { db } from "@/db";
export async function createWorkoutAction() {
  await db.insert(workouts).values({ ... }); // ❌
}
```

### 2. All Mutations Invoked via Server Actions

**ALL data mutations MUST be triggered through Server Actions.**

- **DO NOT** use Route Handlers (`src/app/api/`) for mutations
- **DO NOT** mutate data from Client Components directly
- Server Actions MUST be defined in colocated `actions.ts` files alongside the page or feature they belong to

```
src/app/workouts/
├── page.tsx
├── actions.ts        ← Server Actions for this route
└── components/
    └── WorkoutForm.tsx
```

### 3. Server Action Parameters Must Be Typed — No `FormData`

**ALL Server Action parameters MUST be explicitly typed with TypeScript types or interfaces.**

- **DO NOT** use `FormData` as a parameter type
- Accept plain typed objects instead
- This ensures type safety end-to-end and enables Zod validation

```ts
// actions.ts — CORRECT
"use server";

type CreateWorkoutInput = {
  name: string;
  date: string;
  notes?: string;
};

export async function createWorkoutAction(input: CreateWorkoutInput) { ... }
```

```ts
// WRONG — FormData is not allowed
export async function createWorkoutAction(formData: FormData) { // ❌
  const name = formData.get("name");
}
```

### 4. All Server Actions MUST Validate Arguments with Zod

**Every Server Action MUST validate its input using Zod before performing any mutation.**

- Define a Zod schema that matches the expected input shape
- Call `.parse()` or `.safeParse()` at the top of the action before any other logic
- Never trust or use the raw input without parsing it first

```ts
// actions.ts — CORRECT
"use server";

import { z } from "zod";
import { createWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1),
  date: z.string().datetime(),
  notes: z.string().optional(),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const parsed = createWorkoutSchema.parse(input);
  await createWorkout(parsed);
}
```

```ts
// WRONG — no validation, raw input used directly
export async function createWorkoutAction(input: { name: string }) {
  await createWorkout(input); // ❌ never trust unvalidated input
}
```

### 5. No `redirect()` Inside Server Actions — Use Client-Side Navigation

**Server Actions MUST NOT call `redirect()`.** Redirects must be handled client-side after the action resolves.

- **DO NOT** import or call `redirect()` from `next/navigation` inside a Server Action
- Return a result (or throw) from the action, then navigate client-side using `useRouter` or similar

```ts
// actions.ts — CORRECT
"use server";

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const session = await auth();
  const parsed = schema.parse(input);
  await createWorkout({ ...parsed, userId: session.user.id });
  // ✅ no redirect here — caller handles navigation
}
```

```ts
// WRONG — redirect inside Server Action
import { redirect } from "next/navigation";

export async function createWorkoutAction(input: CreateWorkoutInput) {
  await createWorkout(input);
  redirect("/dashboard"); // ❌
}
```

```tsx
// Client component — CORRECT way to redirect after action
"use client";
import { useRouter } from "next/navigation";

export function WorkoutForm() {
  const router = useRouter();

  async function onSubmit(values: FormValues) {
    await createWorkoutAction(values);
    router.push("/dashboard"); // ✅ redirect handled client-side
  }
}
```

### 6. Users Can ONLY Mutate Their Own Data

**This is a security requirement.** Every mutation that is user-scoped MUST resolve the `userId` from the authenticated session — never from user-supplied input.

- Always obtain `userId` from `auth()` or equivalent inside the Server Action
- Never accept `userId` as a parameter from the caller
- Always include the session `userId` when calling `/data` mutation helpers

```ts
// actions.ts — CORRECT
"use server";

import { auth } from "@/auth";
import { z } from "zod";
import { createWorkout } from "@/data/workouts";

const schema = z.object({
  name: z.string().min(1),
  date: z.string().datetime(),
});

export async function createWorkoutAction(input: z.infer<typeof schema>) {
  const session = await auth();
  const parsed = schema.parse(input);
  await createWorkout({ ...parsed, userId: session.user.id }); // ✅
}
```

```ts
// WRONG — userId supplied by the caller, not from session
export async function createWorkoutAction(input: { userId: string; name: string }) {
  await createWorkout(input); // ❌ caller could pass any userId
}
```

## Full Example

```
src/app/workouts/
├── page.tsx
├── actions.ts
└── components/
    └── CreateWorkoutForm.tsx
```

```ts
// src/data/workouts.ts
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createWorkout(data: typeof workouts.$inferInsert) {
  return db.insert(workouts).values(data).returning();
}

export async function deleteWorkout(id: string, userId: string) {
  return db
    .delete(workouts)
    .where(eq(workouts.id, id) && eq(workouts.userId, userId));
}
```

```ts
// src/app/workouts/actions.ts
"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { createWorkout, deleteWorkout } from "@/data/workouts";

const createWorkoutSchema = z.object({
  name: z.string().min(1),
  date: z.string().datetime(),
  notes: z.string().optional(),
});

export async function createWorkoutAction(
  input: z.infer<typeof createWorkoutSchema>
) {
  const session = await auth();
  const parsed = createWorkoutSchema.parse(input);
  await createWorkout({ ...parsed, userId: session.user.id });
}

const deleteWorkoutSchema = z.object({
  id: z.string().uuid(),
});

export async function deleteWorkoutAction(
  input: z.infer<typeof deleteWorkoutSchema>
) {
  const session = await auth();
  const { id } = deleteWorkoutSchema.parse(input);
  await deleteWorkout(id, session.user.id);
}
```

## Summary Checklist

| Rule | Requirement |
|------|-------------|
| Database mutation method | Drizzle ORM via `src/data` helpers only |
| Raw SQL | Never |
| Mutation trigger | Server Actions only |
| Server Action file location | Colocated `actions.ts` |
| Route Handlers for mutations | Never |
| Server Action parameter types | Explicit TypeScript types — no `FormData` |
| Input validation | Zod — always, before any logic |
| User scoping | Always resolve `userId` from session, never from input |
| Redirects | Never use `redirect()` in Server Actions — navigate client-side instead |
