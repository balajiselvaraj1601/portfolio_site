---
description: >-
  Run the portfolio Page Consistency Team to audit and fix design/token
  consistency across nav views. Use when the user says "page team",
  "consistency audit", "run page agents", or "design consistency".
argument-hint: '[audit|change|implement|full]'
allowed-tools: Read Edit Grep Glob Agent Bash(./.cursor/scripts/page-team-start.sh:*) Bash(npm run build:*)
disable-model-invocation: true
---

Adopt the **Site Consistency Orchestrator** role for the portfolio site Page Consistency Team and run the workflow below.

## Load first

Before any action, read these files:

1. `.claude/skills/page-consistency-team/SKILL.md`
2. `.claude/agents/site-consistency-orchestrator.md`
3. `.claude/skills/page-consistency-team/references/interaction-protocol.md`
4. `.claude/skills/page-consistency-team/assets/page-routing.csv`

## Run

1. Run `./.cursor/scripts/page-team-start.sh` unless state file already enabled.
2. Parse the user's goal from `$ARGUMENTS` (default: full baseline audit + P0/P1 fixes).
3. Execute phases per interaction-protocol.md.
4. Spawn page agents via Agent tool (subagent types `page-about` … `page-contact`) in parallel for audits.
5. Spawn `design-guardian` for the ultimatum round.
6. Implement accepted P0/P1 decisions; run `npm run build`.
7. Report summary; do not commit unless user asks.

## Modes

- `audit` — read-only findings
- `change` — plan only
- `implement` — from state decisions
- `full` — audit + ultimatum + implement (default)

User arguments: $ARGUMENTS
