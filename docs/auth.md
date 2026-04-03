# Authentication Coding Standards

## Provider

**This app uses [Clerk](https://clerk.com) exclusively for authentication.**

- Do NOT use NextAuth, Auth.js, or any other auth library
- Do NOT implement custom session handling
- All auth logic must go through the `@clerk/nextjs` package

## Setup

### ClerkProvider

The root layout wraps the entire app in `<ClerkProvider>`. This must always be present in `src/app/layout.tsx` and must never be removed or replaced.

```tsx
import { ClerkProvider } from "@clerk/nextjs";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
```

### Middleware

Route protection is handled via `clerkMiddleware` in `src/middleware.ts`. The middleware must always be present to protect authenticated routes.

```ts
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

To protect specific routes, use `createRouteMatcher` with `clerkMiddleware`:

```ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})
```

## Getting the Authenticated User

### In Server Components

Use `auth()` from `@clerk/nextjs/server` to get the current user's `userId`:

```ts
import { auth } from '@clerk/nextjs/server'

export default async function Page() {
  const { userId } = await auth()

  if (!userId) {
    // handle unauthenticated state
  }

  const data = await getDataByUser(userId)
  // ...
}
```

- **ALWAYS** use `auth()` — never derive the user from URL params, cookies, or request bodies
- `userId` from `auth()` is the Clerk user ID and is the canonical identifier for the user throughout the app

### In Client Components

Use the `useAuth` or `useUser` hooks from `@clerk/nextjs`:

```tsx
"use client"
import { useAuth } from '@clerk/nextjs'

export function MyComponent() {
  const { userId, isSignedIn } = useAuth()
  // ...
}
```

Note: per data-fetching standards, data must never be fetched in Client Components. Use these hooks only for UI state (e.g., conditionally rendering elements based on auth status).

## UI Components

Use Clerk's pre-built components for sign-in/sign-up UI. Do NOT build custom auth forms.

| Component | Usage |
|-----------|-------|
| `<SignInButton>` | Triggers sign-in flow |
| `<SignUpButton>` | Triggers sign-up flow |
| `<UserButton>` | Displays signed-in user avatar + menu |
| `<Show when="signed-in">` | Conditionally renders for signed-in users |
| `<Show when="signed-out">` | Conditionally renders for signed-out users |

```tsx
import { SignInButton, SignUpButton, UserButton, Show } from "@clerk/nextjs";

<Show when="signed-out">
  <SignInButton mode="modal" />
  <SignUpButton mode="modal" />
</Show>
<Show when="signed-in">
  <UserButton />
</Show>
```

## Security Rules

- Every data helper in `/data` that returns user-scoped data **must** filter by `userId` obtained from `auth()` — see `docs/data-fetching.md` for details
- Never trust a `userId` from the client (URL params, form fields, request body) — always read it from the server-side `auth()` call
- Never expose another user's data, even if a `userId` is passed as a prop or param
