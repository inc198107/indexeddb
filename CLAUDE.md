# IndexedDB Fork — Claude Code Guide

## Project Overview

TypeScript library providing promise-based and async iterator utilities for the IndexedDB API. Private package, no external runtime dependencies.

## Tech Stack

- **Language:** TypeScript 5.7 (strict mode, ES2022 target, ESNext modules)
- **Runtime:** Browser (DOM lib) + Node.js types
- **Test runner:** Node.js built-in `node:test` via `tsx`
- **Linter:** ESLint 8 (airbnb-base + airbnb-typescript/base + prettier)
- **Formatter:** Prettier 3
- **Package manager:** npm (v3 lockfile)

## Key Commands

```bash
npm test          # Run all tests via tsx --test
npm run lint      # Check linting
npm run lint:fix  # Auto-fix linting issues
npm run format    # Format with Prettier
```

## Code Conventions

### Prettier (enforced)
- Single quotes (`'`)
- Semicolons: yes
- Trailing commas: all
- Print width: 100 chars
- Tab width: 2 spaces

### ESLint rules
- **No default exports** — use named exports only
- Max 1 class per file (class expressions allowed)
- Import extensions disabled for `.ts`/`.js` files
- `no-use-before-define` allows function declarations

### TypeScript
- Strict mode (`"strict": true`)
- `noEmit: true` — no compiled output, types only
- `moduleResolution: "Bundler"`
- No `any` — use generics or proper union types

### Module pattern
- ES modules only (`"type": "module"` in package.json)
- All source files are `.ts`, exported directly (no build step)

## Project Structure

```
indexeddb/
├── abort.ts          # AbortError signal utility
├── adoptRequest.ts   # IDBRequest → Promise adapter (AdoptRequest class)
├── cursor.ts         # Promise-based IDBCursor wrapper (Cursor class)
├── IDBIndex.ts       # Promise-based IDBIndex adapter (IndexAdapter class)
├── on.ts             # AsyncIterableIterator for continuous events (On class)
├── once.ts           # Single-event async listener (Once class)
├── types.ts          # Runtime type definitions
├── types.d.ts        # Type declarations
├── index.ts          # Main entry — re-exports everything
├── index.d.ts        # Public TypeScript declarations
└── tests/            # Node test runner tests (tsx)
    ├── adoptRequest.test.ts
    ├── cursor.test.ts    # Largest (~400 lines), mock IndexedDB classes
    ├── IDBIndex.test.ts
    ├── on.test.ts
    └── once.test.ts
```

## Testing Notes

- Uses `node:test` and `assert/strict` — no external test library
- Mock classes (MockCursor, MockObjectStore, etc.) defined inside test files
- Run with `tsx --test` (transpiles TS on the fly)
- Test files in `tests/` directory, pattern: `*.test.ts`

## Important Constraints

- **No build step** — library exports `.ts` source directly
- **No runtime deps** — everything is pure TS/JS using native APIs
- **Browser API target** — code uses DOM types (IDBRequest, IDBCursor, etc.)
- **Private package** — not published to npm
