# UI Coding Standards

## Component Library

**ONLY shadcn/ui components must be used for all UI in this project.**

- Do NOT create custom components
- Do NOT use any other component library
- All UI elements must come from shadcn/ui
- Install new shadcn/ui components via `npx shadcn@latest add <component>` as needed

## Date Formatting

All date formatting must use **date-fns**.

Dates must be formatted using ordinal day, abbreviated month, and full year:

```
1st Sep 2025
2nd Aug 2025
3rd Jan 2026
4th Jun 2024
```

### Implementation

Use `format` and `formatDate` from `date-fns` with the `do MMM yyyy` format token:

```ts
import { format } from "date-fns";

format(date, "do MMM yyyy"); // e.g. "1st Sep 2025"
```
