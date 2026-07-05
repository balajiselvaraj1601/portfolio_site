# Finding and decision schema

Structured JSON shapes for page-team phase outputs. Written to
`.cursor/page-team.state.json` by orchestrator and sub-agents.

---

## Finding

```json
{
  "id": "recognition-001",
  "view_id": "recognition",
  "section_id": "awards",
  "category": "padding|typography|eyebrow|card-shell|structure|a11y|content|icon",
  "severity": "P0|P1|P2",
  "summary": "One-line description",
  "evidence": "src/components/sections/Awards.astro:42 or --card-padding",
  "contract_ref": "design-consistency-contract.md §5",
  "proposed_fix": "Use var(--card-padding) instead of 20px",
  "file": "src/components/cards/CompetitionCard.astro"
}
```

### Category definitions

| Category   | Covers                                    |
| ---------- | ----------------------------------------- |
| padding    | Section py, stack gaps, card padding      |
| typography | Font role, size tokens                    |
| eyebrow    | Missing/extra eyebrows                    |
| card-shell | Card border, radius, hover, shared shells |
| structure  | Section wrapper, variant, wiring          |
| a11y       | Contrast, focus, aria                     |
| content    | JSON/component copy mismatch              |
| icon       | Logo/icon size, brightness, emblem scale  |

---

## Conflict

```json
{
  "conflict_id": "C-001",
  "category": "card-shell",
  "views": ["recognition", "research"],
  "finding_ids": ["recognition-001", "research-003"],
  "description": "Recognition cards use 20px padding; Research uses --card-padding"
}
```

---

## Decision (Guardian ultimatum)

```json
{
  "decision_id": "DG-001",
  "severity": "P1",
  "binding_text": "All CompetitionCard instances use padding: var(--card-padding)",
  "contract_ref": "design-consistency-contract.md §5",
  "affected_views": ["recognition"],
  "implementation_owner": "page-recognition|design-guardian",
  "files": ["src/components/cards/CompetitionCard.astro"],
  "status": "binding|deferred"
}
```

---

## Accept response (page agent)

```json
{
  "view_id": "recognition",
  "accepted": true,
  "objection": null
}
```

If `accepted: false`, `objection` must cite evidence. Only one objection per view per run.

---

## State file shape

```json
{
  "run_id": "2026-07-02T120000Z",
  "mode": "full|audit|change|implement",
  "goal": "User goal string",
  "phase": "init|audit_complete|synthesized|ultimatum|accepted|implemented|verified",
  "enabled": true,
  "active_views": [
    "home",
    "experience",
    "research",
    "recognition",
    "vision",
    "contact"
  ],
  "findings": [],
  "conflicts": [],
  "decisions": [],
  "acceptances": [],
  "implementations": [],
  "build": null
}
```

---

## Implementation record

```json
{
  "owner": "page-vision|design-guardian",
  "decision_id": "DG-002",
  "files": ["src/components/cards/HubCircle.astro"],
  "summary": "Normalized emblem filter brightness"
}
```
