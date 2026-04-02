# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
