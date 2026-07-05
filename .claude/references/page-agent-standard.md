# Page Agent Standard — Portfolio Site

Authoring standard for **every** agent in `.claude/agents/` — the page representatives
(`page-*.md`), the design agents (`design-guardian.md`, `design-standardizer.md`), the
orchestrator (`site-consistency-orchestrator.md`), and the review agents
(`site-review-fix.md`, `site-review-auto.md`). Load when **creating, auditing, or
updating** any of these agent files.

Agents come in **two families** that share the same frontmatter / title / Load-first /
Appendix conventions: the **page family** (Template A — `## Required page-agent
structure`) and the **workflow family** (Template B — `## Required workflow-agent
structure`: guardian, standardizer, orchestrator, review-fix, review-auto).

Runtime rules, modes, and phases live in **one** place:
[`page-agent-playbook.md`](page-agent-playbook.md) — page agents Read it first via
their "Load first" block. Do not restate playbook content in agent files.

---

## File location & naming

| Agent type          | Path                                              | `name` field                           |
| ------------------- | ------------------------------------------------- | -------------------------------------- |
| Page representative | `.claude/agents/page-{view}.md`                   | `page-{view}` (e.g. `page-experience`) |
| Design guardian     | `.claude/agents/design-guardian.md`               | `design-guardian`                      |
| Orchestrator        | `.claude/agents/site-consistency-orchestrator.md` | `site-consistency-orchestrator`        |

- Names are lowercase + hyphens (canonical subagent format); `name` == filename stem.
- `view_id` stays as in `content/site.json → pages[].id` (`home` is represented by `page-about`).
- One agent per file.

---

## Required frontmatter

| Field         | Page agents                                                                             | Guardian | Orchestrator                                                 |
| ------------- | --------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------ |
| `name`        | required                                                                                | required | required                                                     |
| `description` | trigger scenarios + "Use proactively"                                                   | same     | same                                                         |
| `tools`       | `Read, Edit, Grep, Glob, Bash`                                                          | same     | `Read, Grep, Glob, Bash, Agent(<team list>)` — no Edit/Write |
| `model`       | `haiku` (bump one agent to `sonnet` only if its Implement edits repeatedly fail review) | `sonnet` | `sonnet`                                                     |
| `maxTurns`    | `25`                                                                                    | `40`     | `80`                                                         |
| `skills`      | —                                                                                       | —        | `page-consistency-team` (preloaded)                          |

**Canonical key order (all agents):** `name, description, tools, model, skills, maxTurns`.
Include `skills` only when the agent preloads one; `maxTurns` is always last.

**Spawn token.** An agent that spawns sub-agents declares `Agent` in `tools:` — bare to
allow any subagent type, or `Agent(<allow-list>)` to restrict which types (e.g. the
orchestrator's `Agent(page-about, …, design-guardian)`). `Task` is a **deprecated alias**
(pre-v2.1.63) — do not use it.

Do not add `memory`, `hooks`, `mcpServers`, `permissionMode`, or `isolation` without a
driving problem. Guardian knowledge persists in contract §11 (documented exceptions),
not agent memory.

---

## Required page-agent structure

```
1. YAML frontmatter (table above)
2. Title (H1) + one-line identity (view_id, anchor)
3. "Load first (mandatory)" block: instructs the agent to Read
   page-agent-playbook.md (rules/modes/phases) and design-consistency-contract.md
   before any phase. (@-imports do NOT expand in subagent system prompts —
   verified 2026-07 — so an explicit Read instruction is required.)
4. ## View-specific rules   — only deltas beyond playbook P1–P14 (2–5 rows)
5. ## Appendix A — View binding — owned sections/components/content;
   plus "Guardian-owned shared components used here (audit-only, never edit): …"
   plus "Shelved (never enable, never audit): …"
6. ## Appendix B — Audit checklist — view-specific checks only
7. ## Appendix C — Text & object hierarchy — maps every element (reading order) to
   its contract §3a T-code and §3b/§5 object tier. Ends with a
   "### Typography & theming summary (this view)": the **T-levels present** (comma
   list, cite §3a — never re-list font/weight/size values) plus an **element theming**
   table (`| Element | Text colour | Surface | Accent/hover |`) mapping each element to
   its semantic colour token per §3e. Cite tokens; never hardcode hex/rem.
```

Target length: ~55–80 lines. If a rule applies to two or more views, it belongs in the
playbook or the contract, not in agent files.

---

## Required workflow-agent structure

For `design-guardian`, `design-standardizer`, `site-consistency-orchestrator`,
`site-review-fix`, and `site-review-auto`:

```
1. YAML frontmatter (canonical key order; Agent / Agent(<list>) when spawn-capable)
2. Title (H1) `# <Name> Agent` + a one-line role statement
3. "Load first (mandatory)" block (inline bold): Read the reference file(s) the agent
   depends on — or, for skill-preloaded agents, name the preloaded skill and the
   protocol path to Read in Phase 0.
4. ## Hard Rules — numbered rules that override everything else
5. Phases — EITHER `## Phase N — Name` sub-sections (inline-specified agents:
   guardian, orchestrator) OR a single `## Phase Table` (skill-backed agents:
   standardizer, review-fix, review-auto)
6. ## Appendix A — Owned files / scope boundaries
7. ## Appendix B — Checklist / audit
8. Agent-specific extra `##` sections may follow Appendix B (e.g. review-auto's
   Scheduling / Failure Recovery / Integration; guardian's Common conflicts)
```

Exactly one H1 per file (the title); every other section is H2 (H3 for nested detail),
with `---` rules between top-level sections. An agent that carries `Operating Modes`
places that table between Hard Rules and the phases.

---

## Finding output

All audit output matches
`.claude/skills/page-consistency-team/references/finding-schema.md`. Do not restate the
JSON shapes in agent files — cite the schema path.

---

## Compliance checklist

This checklist covers **page agents**; workflow-family agents are checked against the
`## Required workflow-agent structure` block above (title + Load-first + Hard Rules +
phases + Appendix A/B, canonical frontmatter, `Agent` spawn token).

| #   | Check                        | Pass criteria                                                     |
| --- | ---------------------------- | ----------------------------------------------------------------- |
| 1   | Frontmatter                  | name, description, tools, model, maxTurns present                 |
| 2   | Name matches file            | `name` == filename stem, lowercase + hyphens                      |
| 3   | Triggers in description      | ≥3 trigger phrases + "Use proactively"                            |
| 4   | Load-first block present     | mandatory Read of playbook + contract before any phase            |
| 5   | No restated playbook content | no Hard Rules P1–P14, modes, or phase prose in agent body         |
| 6   | View-specific rules only     | every rule row is a genuine delta                                 |
| 7   | View binding                 | Appendix A lists owned section ids + components + content paths   |
| 8   | Ownership labels             | guardian-owned components marked audit-only; shelved list present |
| 9   | Checklist scoped             | Appendix B contains only view-specific checks                     |
| 10  | No placeholders              | no TODO/FIXME in production agents                                |
| 11  | Routing sync                 | agent_id/agent_file/shelved_components match `page-routing.csv`   |
