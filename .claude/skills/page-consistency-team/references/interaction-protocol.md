# Interaction protocol

Phase-by-phase instructions for the Page Consistency Team orchestrator.

Load with `.claude/skills/page-consistency-team/SKILL.md`.

---

## Prerequisites

1. Repo root: `/home/engineer/workspace/portfolio_site`
2. Routing SSOT: `assets/page-routing.csv`
3. State file: `.cursor/page-team.state.json` (create via `page-team-start.sh`)
4. Design contract: `.claude/references/design-consistency-contract.md`

---

## Phase 0 - Initialize

1. Run `./.cursor/scripts/page-team-start.sh` OR create state from example template.
2. Read user goal; set `mode` (default `full`).
3. Load routing CSV; set `active_views`.
4. Write state with `phase: "init"`.

---

## Phase 1 - Parallel audit

**Claude Code:** Use Agent tool × 6, one per active view row in CSV, spawned **by
subagent type** (`agent_id` column, e.g. `page-experience`). The agent file is the
sub-agent's system prompt - do not tell it to read its own file. Templates:
orchestrator agent file, Appendix A.

**Cursor:** Use Task tool × 6 (`subagent_type: generalPurpose`), parallel in one message.

**Cursor prompt template:**

```
Read .claude/agents/{agent_file from CSV} completely, then its required
playbook (.claude/references/page-agent-playbook.md) and design contract
(.claude/references/design-consistency-contract.md).
Operating mode: Audit only (Phases 0, 1, 5).
Return ONLY valid JSON:
{"view_id":"{view_id}","findings":[...]}
Each finding must match references/finding-schema.md.
Do not edit any files.
```

Merge all `findings` into state file. Set `phase: "audit_complete"`.

---

## Phase 2 - Synthesize

Orchestrator (no sub-agent):

1. Sort findings by `severity` then `category`.
2. Detect conflicts: same `category`, incompatible `proposed_fix` across views.
3. Write `conflicts[]` to state.
4. Set `phase: "synthesized"`.

---

## Phase 3 - Ultimatum

Spawn **design-guardian**:

**Claude Code** - by subagent type (no self-read needed):

```
Agent(subagent_type: design-guardian)
Mode: Review + Ultimatum (Phases 0, 1, 2, 5).
Findings: {paste from state}
Conflicts: {paste from state}
Return JSON: {"decisions":[...]}
```

**Cursor** - generalPurpose Task:

```
Read .claude/agents/design-guardian.md and
.claude/references/design-consistency-contract.md.
Findings: {paste from state}
Conflicts: {paste from state}
Run Phases 0, 1, 2, 5 (Review + Ultimatum).
Return JSON: {"decisions":[...]}
```

Write `decisions[]`. Set `phase: "ultimatum"`.

---

## Phase 4 - Accept

Parallel page agents for each `affected_views` in decisions (Claude: by subagent type;
Cursor: generalPurpose Task with agent file path):

```
Mode: Accept (Phase 2).
Decisions affecting your view: {subset}
Return JSON: {"view_id":"...","accepted":true|false,"objection":null|"..."}
```

If any `accepted: false`, stop and ask user before Phase 5.

Set `phase: "accepted"`.

---

## Phase 5 - Implement

1. For each decision with `implementation_owner: page-*`, spawn that page agent (Implement mode).
2. For `design-guardian` decisions, spawn guardian (Implement mode).
3. Record `implementations[]` in state.
4. Set `phase: "implemented"`.

**Heavy multi-file work from Claude:** use `references/cursor-delegation.md`.

---

## Phase 6 - Verify

```bash
cd /home/engineer/workspace/portfolio_site && npm run build
```

Optional:

```bash
node .cursor/scripts/smoke-localhost.mjs
```

Record `build: "pass"|"fail"`. Set `phase: "verified"`.

---

## Phase 7 - Report

Human-readable summary:

- Total findings (P0/P1/P2 counts)
- Conflicts resolved
- Decisions issued
- Files changed
- Build status
- Deferred P2 items

---

## Scoped runs

For targeted changes, filter `active_views` to affected pages only:

| Goal mentions                   | Active views          |
| ------------------------------- | --------------------- |
| experience, career, timeline    | experience            |
| recognition, awards, kaggle     | recognition           |
| vision, hub                     | vision                |
| padding, cards, tokens (global) | all + design-guardian |

Always include **design-guardian** when findings touch `card-shell`, `padding` tokens, or `global.css`.
