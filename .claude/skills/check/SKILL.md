---
name: check
description: >
  Run the full quality gate for the indexeddb project: tests + TypeScript + lint.
  Use before committing or when you want to verify the project is in a clean state.
allowed-tools: Bash
---

# Quality gate check

Run all checks for the indexeddb project in order.
Project root: `d:/Patterns2025/IndexedDBfork/indexeddb`

## Step 1 — Tests

```bash
cd d:/Patterns2025/IndexedDBfork/indexeddb && npm test
```

Expected: all 53 tests pass (0 failures).
If any test fails — stop and fix before proceeding.

## Step 2 — TypeScript type check

```bash
cd d:/Patterns2025/IndexedDBfork/indexeddb && npx tsc --noEmit
```

Expected: no output (no type errors).
If errors appear — fix them before proceeding.

## Step 3 — Lint

```bash
cd d:/Patterns2025/IndexedDBfork/indexeddb && npm run lint
```

Expected: no errors, no warnings.
If warnings exist — run `npm run lint:fix` to auto-fix, then re-check.

## Report

After all three steps, report:
- Tests: N/N pass ✓ / X failures ✗
- TypeScript: clean ✓ / N errors ✗
- Lint: clean ✓ / N issues ✗

If everything is clean — the project is ready to commit.
