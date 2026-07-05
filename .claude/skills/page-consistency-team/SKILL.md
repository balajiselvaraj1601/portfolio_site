---
name: page-consistency-team
description: >-
  Multi-agent Page Consistency Team for portfolio nav views. Six page representatives
  plus design guardian collaborate on design, structure, padding, and token consistency.
  Trigger on "page team", "consistency audit", "run page agents", "design consistency",
  or /page-team. Modes: audit, change, implement, full. Works in Claude Code (subagents)
  and Cursor (Task subagents). State: .cursor/page-team.state.json.
---

# Page consistency team Skill

Orchestrate six page-representative agents and a design guardian to audit and implement
consistent design across all nav views.

## Before starting

1. For the shared design rules, read `.claude/references/design-consistency-contract.md`
2. Read `assets/page-routing.csv`
3. Run `./.cursor/scripts/page-team-start.sh` (or confirm state file exists)
4. Operator guide: `docs/page-team.md`

## Quick invoke

**Claude Code:** `/page-team` or "Run page team full mode: {goal}"

**Cursor:** "Run page-consistency-team skill in full mode: {goal}"

## Operating modes

| Mode        | Phases          | Edits                |
| ----------- | --------------- | -------------------- |
| `audit`     | 0→1→2→3→7       | None                 |
| `change`    | 0→1→2→3→4→7     | Plan only            |
| `implement` | 0→5→6→7         | From state decisions |
| `full`      | 0→1→2→3→4→5→6→7 | Audit + fix P0/P1    |

Default: `full` when mode unspecified.

## Orchestrator role

When this skill is invoked, adopt **site-consistency-orchestrator** behavior:

1. Read `.claude/agents/site-consistency-orchestrator.md` (skipped when running AS that
   subagent — the file is already your system prompt)
2. Follow `references/interaction-protocol.md` phase by phase
3. Update `.cursor/page-team.state.json` after each phase
4. Never edit site files directly — spawn scoped agents

## Spawning sub-agents

### Claude Code

```
Agent tool, subagent_type from page-routing.csv agent_id column
(e.g. page-experience, design-guardian). The agent file is the sub-agent's
system prompt — pass run context only (mode, goal, run_id, decision subsets).
```

### Cursor

```
Task tool, subagent_type: generalPurpose
Parallel: launch all page audits in one message
Prompt: include agent file path (page-routing.csv agent_file column) + "return JSON only"
```

## Efficiency: batch edits and parallel calls

- **Parallel agents:** spawn all page audits in a single message — one Agent/Task call each.
- **Batch edits:** within an agent's scope, combine changes to one file into a single Edit.
- **Read before edit:** read each file once, plan all changes, then apply the fewest edits.

## Quick reference: where to go deeper

| Topic                                                             | Reference file    |
| ----------------------------------------------------------------- | ----------------- |
| [interaction-protocol.md](references/interaction-protocol.md)     | Phase details     |
| [finding-schema.md](references/finding-schema.md)                 | JSON shapes       |
| [cursor-delegation.md](references/cursor-delegation.md)           | External dispatch |
| [page-routing.csv](assets/page-routing.csv)                       | View → agent map  |
| [page-agent-standard.md](../../references/page-agent-standard.md) | Agent compliance  |

## Hard rules (all agents)

- Copy in `content/` only — not components
- Schema changes: `src/schemas.ts` first
- `npm run build` before handoff
- No phone numbers; no dist commits
- `@astrojs/sitemap` pinned at 3.6.0

## Cancel a run

```bash
./.cursor/scripts/page-team-cancel.sh
```

## Status

```bash
./.cursor/scripts/page-team-status.sh
```
