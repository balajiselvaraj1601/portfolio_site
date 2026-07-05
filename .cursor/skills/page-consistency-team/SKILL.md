---
name: page-consistency-team
description: >-
  Multi-agent Page Consistency Team for portfolio nav views. Six page representatives
  plus design guardian collaborate on design, structure, padding, and token consistency.
  Trigger on "page team", "consistency audit", "run page agents", "design consistency".
  Uses Task tool for parallel page subagents. State: .cursor/page-team.state.json.
---

# Page consistency team Skill

Cursor variant of the Page Consistency Team. **Canonical skill:** [`.claude/skills/page-consistency-team/SKILL.md`](../../.claude/skills/page-consistency-team/SKILL.md)

Read and follow that file completely. Cursor-specific notes:

## Sub-agent spawning

Use the **Task tool** with `subagent_type: generalPurpose` to spawn page agents in parallel.
Each Task prompt must include:

1. Path to the page agent file (from `assets/page-routing.csv`)
2. Instruction to read `design-consistency-contract.md`
3. Mode: Audit / Accept / Implement
4. Requirement to return **JSON only**

Example (parallel audits — send all Tasks in one message):

```
Read .claude/agents/page-experience.md, .claude/references/page-agent-playbook.md,
and .claude/references/design-consistency-contract.md.
Audit mode only. Return JSON: {"view_id":"experience","findings":[...]}
Do not edit files.
```

## Orchestrator

Adopt `.claude/agents/site-consistency-orchestrator.md` behavior when this skill is invoked.

## Scripts

```bash
./.cursor/scripts/page-team-start.sh   # begin run
./.cursor/scripts/page-team-status.sh  # check phase
./.cursor/scripts/page-team-cancel.sh  # cancel
```

## Operator guide

See [`docs/page-team.md`](../../docs/page-team.md).

## Efficiency: batch edits and parallel calls

- **Parallel Tasks:** launch all page audits in a single message — one Task call each.
- **Batch edits:** within a Task's scope, combine changes to one file into a single edit.

## Quick reference: where to go deeper

| Topic                        | Reference file                                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Full workflow, modes, phases | [`.claude/skills/page-consistency-team/SKILL.md`](../../.claude/skills/page-consistency-team/SKILL.md)                               |
| View → agent map             | [`.claude/skills/page-consistency-team/assets/page-routing.csv`](../../.claude/skills/page-consistency-team/assets/page-routing.csv) |
| Operator guide               | [`docs/page-team.md`](../../docs/page-team.md)                                                                                       |
