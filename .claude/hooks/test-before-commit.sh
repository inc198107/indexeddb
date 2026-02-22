#!/bin/bash
# =============================================================================
# Claude Code PreToolUse hook — test-before-commit.sh
#
# Runs `npm test` before every `git commit` Bash call.
# If tests fail the commit is blocked (permissionDecision: "deny").
#
# HOW IT WORKS:
#   Claude Code calls this script via stdin with a JSON payload describing
#   the Bash tool call. If the command contains "git commit" we run tests
#   first; any other command is allowed through immediately.
#
# STDIN JSON shape:
#   { "tool_name": "Bash", "tool_input": { "command": "..." }, ... }
#
# EXIT / OUTPUT CONTRACT:
#   exit 0                              → tool allowed
#   exit 2                              → tool blocked (stderr → Claude feedback)
#   stdout JSON permissionDecision deny → structured block
# =============================================================================

INPUT=$(cat)

# Extract the command. Use python as a portable alternative to jq.
if command -v jq &>/dev/null; then
  COMMAND=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
else
  COMMAND=$(echo "$INPUT" | python3 -c \
    "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('command',''))" 2>/dev/null)
fi

# Only intercept git commit calls.
case "$COMMAND" in
  *"git commit"*) ;;
  *) exit 0 ;;
esac

echo "=== Claude Code hook: git commit detected — running tests... ===" >&2

# Resolve project root: prefer $CLAUDE_PROJECT_DIR, fall back to script location.
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"
cd "$PROJECT_DIR" || { echo "Cannot cd to $PROJECT_DIR" >&2; exit 2; }

if npm test >&2; then
  echo "=== All tests passed. Commit allowed. ===" >&2
  exit 0
else
  echo "=== Tests FAILED. Commit blocked. ===" >&2
  if command -v jq &>/dev/null; then
    jq -n '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "Commit blocked: npm test failed. Fix tests before committing."
      }
    }'
  else
    python3 -c "import json; print(json.dumps({'hookSpecificOutput': {'hookEventName': 'PreToolUse', 'permissionDecision': 'deny', 'permissionDecisionReason': 'Commit blocked: npm test failed. Fix tests before committing.'}}))"
  fi
  exit 0
fi
