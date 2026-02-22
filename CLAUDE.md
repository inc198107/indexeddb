# IndexedDB Fork — Claude Code Guide

## Project Overview

TypeScript library providing promise-based and async iterator utilities for the IndexedDB API.
Private package, no external runtime dependencies.

**Open PR:** https://github.com/0xDazzer/indexeddb/pull/25
**Upstream:** https://github.com/0xDazzer/indexeddb
**Fork:** https://github.com/inc198107/indexeddb (branch: `my_ideal_branch`)

## Tech Stack

- **Language:** TypeScript 5.7 (strict mode, ES2022 target, ESNext modules)
- **Runtime:** Browser (DOM lib) + Node.js types
- **Test runner:** Node.js built-in `node:test` via `tsx` (53 tests, 0 failures)
- **Linter:** ESLint 8 (airbnb-base + airbnb-typescript/base + prettier)
- **Formatter:** Prettier 3
- **Package manager:** npm (v3 lockfile)

## Key Commands

```bash
npm test          # Run all 53 tests via tsx --test
npm run lint      # Check linting (airbnb + TS rules)
npm run lint:fix  # Auto-fix linting issues
npm run format    # Format with Prettier
```

## Available Skills (slash commands)

| Skill | When to use |
|-------|-------------|
| `/new-adapter` | Add a new IDB interface adapter (e.g. `IDBOpenDBRequest`) |
| `/check` | Full quality gate: tests + tsc + lint before committing |
| `/pr-update` | Push changes and update PR description |
| `/code-review` | Review all adapters and tests for correctness, coverage, and patterns |

## Project Structure

```
indexeddb/
├── abort.ts            # getAbortReason() — shared AbortError factory
├── adoptRequest.ts     # AdoptRequest<T> — IDBRequest → Promise
├── cursor.ts           # Cursor — promise-based IDBCursor wrapper
├── IDBIndex.ts         # IndexAdapter — wraps IDBIndex
├── IDBObjectStore.ts   # ObjectStoreAdapter — wraps IDBObjectStore
├── IDBTransaction.ts   # TransactionAdapter — wraps IDBTransaction
├── IDBDatabase.ts      # DatabaseAdapter — wraps IDBDatabase
├── on.ts               # On<T> — AsyncIterableIterator over EventTarget
├── once.ts             # Once<T> — single-event Promise from EventTarget
├── types.ts / types.d.ts  # Shared types: OnOptions, IDBTarget, IDBEventMap
├── index.ts            # Re-exports all public classes + types
├── index.d.ts          # Public TypeScript declarations
└── tests/
    ├── adoptRequest.test.ts
    ├── cursor.test.ts          # ~400 lines, largest test file
    ├── IDBIndex.test.ts
    ├── IDBObjectStore.test.ts  # 17 tests
    ├── IDBTransaction.test.ts  # 5 tests
    ├── IDBDatabase.test.ts     # 7 tests
    ├── on.test.ts
    └── once.test.ts
```

## Adapter Dependency Chain (no circular deps)

```
DatabaseAdapter
  └─ IDBDatabase.createObjectStore() → ObjectStoreAdapter
  └─ IDBDatabase.transaction()       → TransactionAdapter
       └─ IDBTransaction.objectStore() → ObjectStoreAdapter
            └─ IDBObjectStore.createIndex() → IndexAdapter
            └─ IDBObjectStore.index()       → IndexAdapter
                 └─ IDBIndex.openCursor()   → AsyncGenerator<Cursor>
                      └─ Cursor ← AdoptRequest
```

Cross-references that stay as raw DOM types to avoid cycles:
- `ObjectStoreAdapter.transaction` → `IDBTransaction` (not `TransactionAdapter`)
- `TransactionAdapter.db` → `IDBDatabase` (not `DatabaseAdapter`)
- `IndexAdapter.objectStore` → `IDBObjectStore` (not `ObjectStoreAdapter`)

## Code Conventions

### Prettier (enforced, `.prettierrc.json`)
- Single quotes, semicolons, trailing commas: all
- Print width: 100 chars, tab width: 2 spaces

### ESLint rules (`.eslintrc.cjs`)
- **No default exports** — named exports only
- Max 1 class per file (class expressions allowed)
- Import extensions disabled for `.ts`/`.js`
- `no-use-before-define` allows function declarations
- Test files: relaxed rules (dupe class members, unused vars allowed)

### TypeScript (`tsconfig.json`)
- `"strict": true`, `"noEmit": true`, `"moduleResolution": "Bundler"`
- No `any` — use generics or union types
- DOM + ES2022 libs

### Module pattern
- ES modules only (`"type": "module"`)
- `.ts` source exported directly — no build step

## Writing a New Adapter (pattern reference)

```typescript
// 1. Import base primitives
import { AdoptRequest } from './adoptRequest';
import { Cursor } from './cursor';           // only if cursor methods exist
import { SomeOtherAdapter } from './IDB...'; // only if needed, avoid cycles

export class XyzAdapter {
  // 2. Store raw DOM object
  constructor(private readonly xyz: IDBXyz) {}

  // 3. Pass-through readonly properties
  get name(): string { return this.xyz.name; }

  // 4. Promisify IDBRequest methods
  get(key: IDBValidKey): Promise<unknown> {
    return new AdoptRequest(this.xyz.get(key)).toPromise();
  }

  // 5. AsyncGenerator for cursor methods (copy pattern from IDBIndex.ts)
  async *openCursor(): AsyncGenerator<Cursor, void, undefined> {
    const firstRequest = this.xyz.openCursor() as unknown as IDBRequest<IDBCursorWithValue | null>;
    let cursor = await new AdoptRequest<IDBCursorWithValue | null>(firstRequest).toPromise();
    while (cursor) {
      yield new Cursor(cursor);
      const nextRequest = cursor.continue() as unknown as IDBRequest<IDBCursorWithValue | null>;
      // eslint-disable-next-line no-await-in-loop -- each iteration awaits next cursor
      cursor = await new AdoptRequest<IDBCursorWithValue | null>(nextRequest).toPromise();
    }
  }

  // 6. Static factory (required by convention)
  static from(xyz: IDBXyz): XyzAdapter { return new XyzAdapter(xyz); }
}
```

## Writing Tests (pattern reference)

```typescript
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { XyzAdapter } from '../IDBXyz';

// Helper: fake IDBRequest that fires success asynchronously
function createRequest<T>(result: T): IDBRequest<T> {
  const req = new EventTarget() as IDBRequest<T>;
  (req as { result: T }).result = result;
  (req as { error: unknown }).error = null;
  setTimeout(() => req.dispatchEvent(new Event('success')), 0);
  return req;
}

// Mock must implement the full DOM interface (TypeScript strict checks)
class MockIDBXyz implements IDBXyz {
  // implement all required properties and methods
}

test('XyzAdapter.method returns expected value', async () => {
  const adapter = new XyzAdapter(new MockIDBXyz());
  const result = await adapter.method(key);
  assert.deepEqual(result, expected);
});
```

## Commit Workflow

Two layers enforce tests before every commit:

1. **Git pre-commit hook** (`.git/hooks/pre-commit`) — runs `npm test`, blocks commit on failure
2. **Claude Code PreToolUse hook** (`.claude/hooks/test-before-commit.sh`) — intercepts `git commit` Bash calls, runs `npm test`, returns `permissionDecision: "deny"` if tests fail

Both are already active. Just run `git commit` normally — hooks handle the rest.

## Important Constraints

- **No build step** — library exports `.ts` source directly
- **No runtime deps** — pure TS/JS using native browser APIs
- **Browser API target** — DOM types (IDBRequest, IDBCursor, etc.)
- **Private package** — not published to npm
- **Strict TypeScript** — mock classes in tests must implement full DOM interfaces
