# Page Consistency Team

Multi-agent workflow for design, structure, padding, and token consistency across all
six nav views. Six page representatives collaborate with a design guardian under an
orchestrator that runs ultimatum consensus rounds before implementing fixes.

Works in **Claude Code** (`/page-team`) and **Cursor** (page-consistency-team skill).

---

## Prerequisites

1. Repo root: `portfolio_site`
2. `jq` on PATH (status scripts)
3. `npm ci` completed
4. Read [`AGENTS.md`](../AGENTS.md) working rules

---

## Quick start

```bash
# 1. Enable a run
./.cursor/scripts/page-team-start.sh "Your goal here"

# 2. Paste the printed prompt into Agent chat (Claude or Cursor)

# 3. Monitor
./.cursor/scripts/page-team-status.sh
```

---

## Entry points

| Tool        | Invoke                                               |
| ----------- | ---------------------------------------------------- |
| Claude Code | `/page-team` or "Run page team full mode: …"         |
| Claude Code | Read `.claude/skills/page-consistency-team/SKILL.md` |
| Cursor      | "Run page-consistency-team skill …"                  |
| Cursor      | `.cursor/skills/page-consistency-team/SKILL.md`      |
| Dual path   | `.agents/skills/page-consistency-team/` (symlink)    |

---

## Team roster

| Agent                           | View           | Sections                              |
| ------------------------------- | -------------- | ------------------------------------- |
| `page-about`                    | About (`home`) | hero, thirukural, leadership          |
| `page-experience`               | Experience     | experience                            |
| `page-research`                 | Research       | publications, conferences, speakers   |
| `page-recognition`              | Recognition    | awards, kaggle, education             |
| `page-vision`                   | Vision         | vision-programs, vision-impact        |
| `page-contact`                  | Contact        | contact                               |
| `design-guardian`               | Cross-cutting  | global.css, ui/, cards/               |
| `site-consistency-orchestrator` | All            | Spawns agents, owns state             |

Routing table: `.claude/skills/page-consistency-team/assets/page-routing.csv`

Shared runtime rules for page agents: `.claude/references/page-agent-playbook.md`
(each agent Reads it first). Authoring standard: `.claude/references/page-agent-standard.md`.

---

## Operating modes

| Mode        | What happens                                         |
| ----------- | ---------------------------------------------------- |
| `audit`     | Findings + guardian decisions; no file edits         |
| `change`    | Plan + decisions; no implement unless asked          |
| `implement` | Apply decisions already in state file                |
| `full`      | Audit → ultimatum → accept → implement P0/P1 → build |

Set mode via env: `PAGE_TEAM_MODE=audit ./.cursor/scripts/page-team-start.sh`

---

## Protocol phases

1. **Init** — create `.cursor/page-team.state.json`
2. **Audit** — parallel page agents emit structured findings
3. **Synthesize** — orchestrator flags cross-view conflicts
4. **Ultimatum** — design guardian issues binding decisions
5. **Accept** — page agents accept or raise one objection
6. **Implement** — scoped edits per view + guardian for tokens
7. **Verify** — `npm run build`
8. **Report** — summary to user

Details: `.claude/skills/page-consistency-team/references/interaction-protocol.md`

---

## Design authority

Checklist SSOT: `.claude/references/design-consistency-contract.md`

Page agents audit against it. Guardian resolves conflicts with binding decisions.
Severity: P0 (build/a11y) → P1 (cross-view consistency) → P2 (polish, report-only).

---

## State file

Runtime: `.cursor/page-team.state.json` (gitignored)

Template: [`.cursor/page-team.state.json.example`](../.cursor/page-team.state.json.example)

Finding/decision JSON shapes:
`.claude/skills/page-consistency-team/references/finding-schema.md`

---

## Cancel

```bash
./.cursor/scripts/page-team-cancel.sh
```

---

## Related

| Doc                                                                                         | Purpose                                          |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| [`docs/page-briefs/`](page-briefs/)                                                         | Per-view content intent                          |
| [`docs/design-direction.md`](design-direction.md)                                           | Visual language                                  |
| [`docs/task-runner.md`](task-runner.md)                                                     | Sequential TASKS.md batches (different workflow) |
| [`.claude/references/page-agent-standard.md`](../.claude/references/page-agent-standard.md) | Agent file compliance                            |

---

## Example invocations

- _"Page team audit — eyebrows only"_
- _"Page team full: align Recognition card padding to Research"_
- _"Run page agents for Vision hub icon consistency"_

Do not commit unless the user asks.
