---
name: site-review-fix
description: >-
  Full-site review and fix orchestrator for the Astro portfolio. Audits verify/CI,
  content SSOT, dead code, a11y/SEO, and design consistency (via page-consistency-team);
  fixes all verified issues; runs npm run verify; commits if allowed. Trigger on
  "site review", "fix all issues", "full audit", scheduled site review, or /site-review.
---

# Site review fix Skill

Orchestrate a comprehensive site health review and automated fix pass.

## Before starting

1. For the full review protocol, read `.claude/skills/site-review-fix/references/review-protocol.md`
2. Read `.claude/agents/site-review-fix.md`
3. Confirm state file at `.cursor/site-review.state.json` (or init in Phase 0)
4. Load baseline checklist: `docs/audits/codebase-review-2026-07-02.md`

## Quick invoke

**Claude Code:** `/site-review` or "Run site review fix: {goal}"

**Cursor:** "Run site-review-fix skill: {goal}"

**Scheduled CLI:** `./.cursor/scripts/site-review-run.sh` (headless, Fable, auto mode)

## Operating modes

| Mode    | Edits | Commit                   | Default |
| ------- | ----- | ------------------------ | ------- |
| `full`  | Yes   | If allowed + verify pass | yes     |
| `audit` | No    | No                       | —       |

Default: `full` when mode unspecified.

## Orchestrator role

When this skill is invoked, adopt **site-review-fix** agent behavior:

1. Read `.claude/agents/site-review-fix.md`
2. Follow `references/review-protocol.md` phase by phase
3. Update `.cursor/site-review.state.json` after each phase
4. Delegate design consistency to page-consistency-team (full mode)

## Spawning sub-agents

### Claude Code

```
Agent tool, subagent_type: site-consistency-orchestrator (for design slice)
Or generalPurpose with agent file path for themed audit sweeps
```

### Cursor

```
Task tool, subagent_type: site-consistency-orchestrator (design)
Task tool, subagent_type: generalPurpose (themed audits — SSOT, a11y, dead code)
Parallel: launch independent audit sweeps in one message
```

## Efficiency: batch edits and parallel calls

- **Parallel sweeps:** launch independent audit sweeps (SSOT, a11y, dead code) in one message.
- **Batch edits:** combine multiple changes to one file into a single Edit call.
- **Read before edit:** read each file once, plan all changes, then apply the fewest edits.

## Quick reference: where to go deeper

| Topic                                                                               | Reference file      |
| ----------------------------------------------------------------------------------- | ------------------- |
| [review-protocol.md](references/review-protocol.md)                                 | Phase details       |
| [site-review-fix agent](../../agents/site-review-fix.md)                            | Hard rules          |
| [codebase-review-2026-07-02.md](../../../docs/audits/codebase-review-2026-07-02.md) | Baseline checklist  |
| [page-consistency-team](../page-consistency-team/SKILL.md)                          | Design sub-workflow |

## Hard rules (all runs)

- Copy in `content/` only — not components
- Schema changes: `src/schemas.ts` first
- `npm run verify` before handoff
- No phone numbers; no dist commits
- `@astrojs/sitemap` pinned at 3.6.0
- Commit only after verify passes (if `SITE_REVIEW_ALLOW_COMMIT=true`)
- Never push unless user explicitly asks

## Cancel a run

```bash
./.cursor/scripts/site-review-cancel.sh
```

## Status

```bash
./.cursor/scripts/site-review-status.sh
```

## Arm scheduled run

```bash
./.cursor/scripts/site-review-arm.sh 180   # fire in 180 minutes
```
