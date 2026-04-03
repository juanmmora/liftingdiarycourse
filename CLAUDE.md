# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation First

**IMPORTANT:** Before generating any code, always first refer and check the `/docs` directory for relevant documentation files to understand existing patterns conventions and best practices before implementation. All implementation decisions should align with the specs, guidelines, and context found there.

- /docs/ui.md
- /docs/data-fetching.md
- /docs/auth.md

## Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

This is a Next.js 16 app using the **App Router** (`src/app/`). Pages and layouts live in `src/app/`. TypeScript path alias `@/*` maps to `src/`.

**Stack:** Next.js 16, React 19, TypeScript 5, Tailwind CSS v4 (PostCSS plugin).

Tailwind v4 is configured via `postcss.config.mjs` — no `tailwind.config.*` file needed. Global styles are in `src/app/globals.css`.
