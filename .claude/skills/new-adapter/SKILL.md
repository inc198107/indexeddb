---
name: new-adapter
description: >
  Create a new IndexedDB interface adapter following the project's established patterns.
  Use when implementing an adapter for an IDB* DOM interface that isn't yet covered
  (e.g. IDBOpenDBRequest, IDBKeyRange, etc.).
argument-hint: "[IDBInterfaceName, e.g. OpenDBRequest]"
allowed-tools: Read, Glob, Grep, Write, Edit, Bash
---

# Create new IndexedDB adapter: $ARGUMENTS

## Your task

Implement a complete adapter for `IDB$ARGUMENTS` following the exact patterns used in this project.

## Step 1 — Research the DOM interface

Read the MDN docs or TypeScript lib.dom.d.ts to understand the full `IDB$ARGUMENTS` interface:
- Which methods return `IDBRequest<T>` → need to be promisified
- Which methods return `IDBCursor | IDBCursorWithValue` → need AsyncGenerator
- Which properties return raw DOM types (DOMStringList, etc.) → need adaptation
- Which properties are simple scalars → pass-through

Look at how similar adapters handle the same patterns:
- Promisify: read `IDBObjectStore.ts`
- AsyncGenerator cursors: read `IDBIndex.ts` (`openCursor`/`openKeyCursor`)
- DOMStringList → string[]: read `IDBTransaction.ts` (`objectStoreNames`)
- Returning another adapter: read `IDBTransaction.ts` (`objectStore` → `ObjectStoreAdapter`)

## Step 2 — Check for circular dependency risks

Before designing the adapter, map all cross-references:
- If `A` returns `B` and `B` returns `A`, keep one side as the raw DOM type.
- See existing examples in CLAUDE.md "Adapter Dependency Chain" section.

## Step 3 — Create the source file

Create `d:/Patterns2025/IndexedDBfork/indexeddb/IDB$ARGUMENTS.ts`:

```typescript
import { AdoptRequest } from './adoptRequest';
// import { Cursor } from './cursor';         // only if cursor methods needed
// import { SomeAdapter } from './IDB...';    // only if needed, watch for cycles

export class ${ARGUMENTS}Adapter {
  constructor(private readonly x: IDB$ARGUMENTS) {}

  // Pass-through readonly properties first
  // Then promisified methods
  // Then async generators
  // Static from() last (required by convention)

  static from(x: IDB$ARGUMENTS): ${ARGUMENTS}Adapter {
    return new ${ARGUMENTS}Adapter(x);
  }
}
```

## Step 4 — Create the test file

Create `d:/Patterns2025/IndexedDBfork/indexeddb/tests/IDB$ARGUMENTS.test.ts`:

- Use `import assert from 'node:assert/strict'` and `import { test } from 'node:test'`
- Define `createRequest<T>(result: T): IDBRequest<T>` helper (fires success via setTimeout)
- Define `MockIDB$ARGUMENTS` with `implements IDB$ARGUMENTS` — must satisfy the full interface
- Write one `test()` per public adapter method

## Step 5 — Update exports

1. Add to `index.ts`:
   ```typescript
   export { ${ARGUMENTS}Adapter } from './IDB$ARGUMENTS';
   ```

2. Add full class declaration to `index.d.ts` (after the last existing class block)

3. Add to `package.json` → `"files"` array:
   ```json
   "IDB$ARGUMENTS.ts"
   ```

## Step 6 — Verify

Run `npm test` from `d:/Patterns2025/IndexedDBfork/indexeddb/`.
All tests must pass before considering the task complete.
