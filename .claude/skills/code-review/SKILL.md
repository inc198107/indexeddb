---
name: code-review
description: >
  Review all adapter source files and tests in the indexeddb project.
  Checks correctness, TypeScript strictness, naming conventions, test coverage,
  and adherence to project patterns. Use before opening or updating a PR.
allowed-tools: Read, Glob, Grep, Bash
---

# Code review: indexeddb adapters

Perform a thorough review of the project source.
Project root: `d:/Patterns2025/IndexedDBfork/indexeddb`

## Step 1 — Quality gate

Run the full check first. If anything fails, stop and report.

```bash
cd d:/Patterns2025/IndexedDBfork/indexeddb && npm test && npx tsc --noEmit && npm run lint
```

Expected: 53/53 tests pass, no TS errors, no lint errors.

## Step 2 — Read each adapter source

Read and review each file for:

- **Correctness**: does the adapter faithfully wrap the DOM interface?
- **Completeness**: are all public methods of the DOM interface covered?
- **Return types**: do they match the DOM spec (e.g. `keyPath: string | string[] | null`)?
- **Circular deps**: no adapter imports another adapter that would form a cycle (see CLAUDE.md)
- **Patterns**: uses `AdoptRequest`, `AsyncGenerator<Cursor>`, `Array.from()` for `DOMStringList`
- **Static factory**: every adapter has `static from(x: IDBX): XAdapter`
- **No default exports**: only named exports

Files to review:
- `adoptRequest.ts`
- `cursor.ts`
- `IDBIndex.ts`
- `IDBObjectStore.ts`
- `IDBTransaction.ts`
- `IDBDatabase.ts`

## Step 3 — Review test files

For each test file check:

- **Mock implements full interface**: `class MockIDB* implements IDB*`
- **Explicit generics on createRequest**: `createRequest<T>(value)` — never rely on inference
  (IDBRequest<T> is invariant — narrow inference breaks assignability)
- **One test per public method** minimum
- **Assertions are specific**: uses `assert.deepEqual`, `assert.equal`, `assert.ok`
- **AsyncGenerator tests**: `for await...of` loops, checks yielded `Cursor` instances

Test files:
- `tests/IDBIndex.test.ts`
- `tests/IDBObjectStore.test.ts`
- `tests/IDBTransaction.test.ts`
- `tests/IDBDatabase.test.ts`

## Step 4 — Check index.d.ts completeness

Read `index.d.ts` and verify:
- Every public class/method exported from `index.ts` has a matching declaration
- Types match the source implementation
- `keyPath` declared as `string | string[] | null` in `ObjectStoreAdapter`

## Step 5 — Report

Write a structured review report:

```
## Code Review Report

### Quality gate
- Tests: N/N ✓ / ✗
- TypeScript: clean ✓ / N errors ✗
- Lint: clean ✓ / N issues ✗

### Adapter correctness
For each adapter: ✓ LGTM / ✗ Issue: <description>

### Test coverage
For each test file: ✓ Complete / ✗ Missing: <method name>

### Patterns compliance
- AdoptRequest usage: ✓ / ✗
- AsyncGenerator cursors: ✓ / ✗
- DOMStringList → string[]: ✓ / ✗
- No circular deps: ✓ / ✗
- createRequest<T> explicit generics: ✓ / ✗

### Issues found
List any bugs, missing coverage, or pattern violations with file:line references.

### Verdict
APPROVED / CHANGES REQUESTED
```
