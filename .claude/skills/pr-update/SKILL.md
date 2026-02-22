---
name: pr-update
description: >
  Push the current branch and update PR #25 description on GitHub.
  Use after implementing new features or fixes on my_ideal_branch that need to be reflected in the PR.
allowed-tools: Bash
---

# Update PR #25

Sync the current branch with GitHub and update the PR description.

**PR:** https://github.com/0xDazzer/indexeddb/pull/25
**Branch:** `my_ideal_branch` → `inc198107/indexeddb`
**Target:** `0xDazzer/indexeddb:main`

## Step 1 — Verify tests pass

```bash
cd d:/Patterns2025/IndexedDBfork/indexeddb && npm test
```

If any test fails — stop. Fix tests before pushing.

## Step 2 — Push branch

```bash
cd d:/Patterns2025/IndexedDBfork/indexeddb && git push origin my_ideal_branch
```

## Step 3 — Inspect current state

```bash
gh pr view 25 --repo 0xDazzer/indexeddb
```

```bash
cd d:/Patterns2025/IndexedDBfork/indexeddb && git log upstream/main..HEAD --oneline
```

## Step 4 — Update PR

Based on what's actually in the branch now, write an accurate PR description covering:

- **Summary**: bullet list of what was implemented/changed
- **Architecture notes**: any design decisions worth explaining (e.g. how circular deps were avoided)
- **Tests**: table showing new test files and counts, total pass count
- **Test plan**: checklist of what was verified

Use:
```bash
gh pr edit 25 --repo 0xDazzer/indexeddb --title "..." --body "..."
```

Make sure the body includes `closes #N` for every issue that this PR resolves.
Linked issues currently: #6, #7, #8.
