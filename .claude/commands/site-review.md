---
description: >-
  Run the full portfolio site review-and-fix orchestrator — audit verify/CI,
  content SSOT, a11y, dead code, and design consistency, fix verified issues,
  then verify and commit. Use when the user says "site review", "fix all
  issues", "full audit", or requests a scheduled site review.
argument-hint: '[full|audit]'
allowed-tools: Read Edit Write Grep Glob Agent Bash(npm run verify:*) Bash(git add:*) Bash(git commit:*) Bash(git status:*) Bash(git diff:*)
disable-model-invocation: true
---

Adopt the **Site Review Fix** orchestrator role for the portfolio site and run the workflow below.

## Load first

Before any action, read these files:

1. `.claude/skills/site-review-fix/SKILL.md`
2. `.claude/agents/site-review-fix.md`
3. `.claude/skills/site-review-fix/references/review-protocol.md`
4. `docs/audits/simplification-refactor-2026-07-03.md`

## Run

1. Initialize `.cursor/site-review.state.json` unless already enabled for this run.
2. Parse the user's goal from `$ARGUMENTS` (default: full site review — audit all themes, fix every verified issue, verify, commit if pass).
3. Execute phases per review-protocol.md (full mode).
4. Run `npm run verify` before reporting success.
5. Commit with structured message if verify passes and commit is allowed.
6. Do not push unless user asks.

## Modes

- `full` — audit + fix + verify + commit (default)
- `audit` — read-only findings

User arguments: $ARGUMENTS
