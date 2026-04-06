# Server Components Coding Standards

## Async Params (Next.js 16)

**In Next.js 16, `params` and `searchParams` are Promises and MUST be awaited.**

- **DO NOT** access `params` or `searchParams` synchronously
- **ALWAYS** `await` them before destructuring

```tsx
// CORRECT — await params before use
type Props = {
  params: Promise<{ workoutId: string }>;
};

export default async function Page({ params }: Props) {
  const { workoutId } = await params;
  // ...
}

// WRONG — synchronous access will not work in Next.js 16
export default async function Page({ params }: { params: { workoutId: string } }) {
  const { workoutId } = params; // ❌
}
```

This applies to all dynamic route segments, including nested params (e.g. `{ teamId, projectId }`).

```tsx
// CORRECT — multiple params, still awaited once
type Props = {
  params: Promise<{ teamId: string; projectId: string }>;
};

export default async function Page({ params }: Props) {
  const { teamId, projectId } = await params;
}
```

### `searchParams`

The same rule applies to `searchParams`:

```tsx
// CORRECT
type Props = {
  searchParams: Promise<{ query?: string }>;
};

export default async function Page({ searchParams }: Props) {
  const { query } = await searchParams;
}
```
