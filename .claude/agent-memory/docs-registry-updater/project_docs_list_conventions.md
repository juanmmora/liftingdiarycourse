---
name: CLAUDE.md docs list conventions
description: Formatting and ordering rules observed in the Documentation First section of CLAUDE.md
type: project
---

Entries in the `## Documentation First` list use the plain path format with no descriptions:

```
- /docs/filename.md
```

Ordering is insertion order, not alphabetical. As of 2026-04-05 the list contains 6 entries:

1. /docs/ui.md
2. /docs/data-fetching.md
3. /docs/auth.md
4. /docs/data-mutations.md
5. /docs/server-components.md
6. /docs/routing.md

**Why:** The project maintainer adds docs files as the project grows and appends them in the order they are created.

**How to apply:** When registering new docs files, append at the end of the list rather than inserting alphabetically.
