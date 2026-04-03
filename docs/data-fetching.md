# Data Fetching

## CRITICAL RULES

### 1. Server Components Only

**ALL data fetching MUST be done exclusively via Server Components.**

- **DO NOT** fetch data in Client Components (`"use client"`)
- **DO NOT** fetch data via Route Handlers (`src/app/api/`)
- **DO NOT** use `useEffect` + `fetch` patterns
- **DO NOT** use SWR, React Query, or any client-side data fetching library

Data flows in one direction: **Server Component → props → Client Component**. If a Client Component needs data, it must receive it as props from a parent Server Component.

```tsx
// CORRECT — fetch in Server Component, pass as props
export default async function WorkoutsPage() {
  const workouts = await getWorkoutsByUser(userId);
  return <WorkoutList workouts={workouts} />;
}

// WRONG — never fetch in a Client Component
"use client";
export function WorkoutList() {
  const [workouts, setWorkouts] = useState([]);
  useEffect(() => { fetch("/api/workouts")... }, []); // ❌
}
```

### 2. All Database Queries via `/data` Helper Functions

**ALL database queries MUST go through helper functions in the `/data` directory.**

- **DO NOT** write raw SQL strings
- **DO NOT** query the database directly from page/layout components
- **USE** Drizzle ORM exclusively for all queries

```ts
// src/data/workouts.ts — CORRECT
import { db } from "@/db";
import { workouts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getWorkoutsByUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}
```

```tsx
// WRONG — never query the database outside of /data
import { db } from "@/db";
export default async function Page() {
  const data = await db.execute(sql`SELECT * FROM workouts`); // ❌
}
```

### 3. Users Can ONLY Access Their Own Data

**This is a security requirement.** Every `/data` helper function that returns user-scoped data MUST filter by the authenticated user's ID. A logged-in user must never be able to retrieve another user's data.

- Always obtain `userId` from the authenticated session (e.g., `auth()` or equivalent)
- Always include `eq(table.userId, userId)` (or equivalent) in every query
- Never accept a `userId` parameter from untrusted sources (e.g., URL params, request body) without validating it matches the session user

```ts
// CORRECT — always scope queries to the authenticated user
export async function getWorkoutsByUser(userId: string) {
  return db.select().from(workouts).where(eq(workouts.userId, userId));
}

// WRONG — no user scoping, any user's data could be returned
export async function getAllWorkouts() {
  return db.select().from(workouts); // ❌
}
```

```tsx
// CORRECT — resolve userId from session, not from URL
import { auth } from "@/auth";

export default async function WorkoutsPage() {
  const session = await auth();
  const workouts = await getWorkoutsByUser(session.user.id); // ✅
}
```

## Summary Checklist

| Rule | Requirement |
|------|-------------|
| Data fetching location | Server Components only |
| Route Handlers for data | Never |
| Client-side fetching | Never |
| Database query method | Drizzle ORM via `/data` helpers only |
| Raw SQL | Never |
| User data scoping | Always filter by authenticated `userId` |
