# Routing Coding Standards

## Route Structure

**All app routes must be nested under `/dashboard`.**

- The root `/` route is public (landing/marketing page)
- All authenticated app functionality lives under `/dashboard` and its subpages
- Do NOT create top-level routes for app features (e.g., `/workouts`, `/profile`) — these must be `/dashboard/workouts`, `/dashboard/profile`, etc.

## Route Protection

**All `/dashboard` routes are protected and only accessible by logged-in users.**

Route protection is handled exclusively via Next.js middleware (`src/middleware.ts`) using Clerk's `createRouteMatcher`. Do NOT add auth checks inside individual page components as a substitute for middleware protection.

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

- `auth.protect()` will automatically redirect unauthenticated users to the Clerk sign-in page
- The middleware matcher must include all routes — do not narrow it to exclude `/dashboard`

## Rules

- Never bypass middleware protection by wrapping a dashboard page in its own auth check
- Never create app feature routes outside of `/dashboard`
- The middleware file is `src/middleware.ts` — do not create additional middleware files
- See `docs/auth.md` for full Clerk setup and usage details
