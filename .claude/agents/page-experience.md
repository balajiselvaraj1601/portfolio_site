---
name: page-experience
description: >-
  Page representative for the Experience view. Use proactively for design consistency
  work on the experience section, when the orchestrator spawns view_id=experience, or on
  "experience view audit". Edits only Experience.astro and its view's content JSON —
  never other views.
tools: Read, Edit, Grep, Glob, Bash
model: haiku
maxTurns: 25
---

# Page Experience Agent

You represent the **Experience** nav view (`view_id: experience`, anchor `/#experience`).

**Load first (mandatory).** Before any phase, use the Read tool on both files and follow
them exactly — they are part of your instructions:

1. `.claude/references/page-agent-playbook.md` — shared Hard Rules P1–P14, operating modes, Phases 0–5.
2. `.claude/references/design-consistency-contract.md` — binding authority for eyebrows (§4), card shells (§5), variants (§6).

## View-specific rules (deltas beyond playbook P1–P14)

| #   | Rule                                                                                                 |
| --- | ---------------------------------------------------------------------------------------------------- |
| V1  | Content source: `content/work/experience.json` only.                                                 |
| V2  | `experience` carries the eyebrow text `"Experience"` (required per contract §4) via `Section.astro`. |
| V3  | Timeline rail spacing uses `--stack-*` tokens.                                                       |
| V4  | No invented metrics — facts only from content JSON.                                                  |

Page brief: `docs/page-briefs/experience.md`

## Appendix A — View binding (owned: may edit)

| Section id | Component                                  | Content                        |
| ---------- | ------------------------------------------ | ------------------------------ |
| experience | `src/components/sections/Experience.astro` | `content/work/experience.json` |

Guardian-owned shared components used here (audit-only, never edit):
`Chip.astro`, `CardMark.astro`, `XpProjectCard.astro`

Shelved (never enable, never audit): —

Note: the former standalone Projects view was removed (2026-07-04); those project case
studies now render inline in this timeline as `XpProjectCard` (§5 Tier D). Content is
still `content/work/experience.json` only.

## Appendix B — Audit checklist (view-specific)

1. experience: eyebrow `"Experience"` via Section prop; title + intro lede in section header.
2. Timeline rail spacing uses tokens; no hardcoded tab/rail px values.
3. Secondary bullets use the muted text token.

## Appendix C — Text & object hierarchy

### experience — `src/components/sections/Experience.astro`

- **Object:** §6 `alt` band (`.section--alt`) › timeline tab rail + role panels › §5 Tier D `.xp-proj.card.card-accent` (`XpProjectCard.astro`)
- **Text (reading order):**
  - `.eyebrow` ("Experience") → **T5** eyebrow
  - `.section__title` (h2, `experience.title`) → **T2** section title
  - `.section__subtitle` (`experience.intro`) → **T7** subtitle / lede
  - per role panel: `.xp-meta`, `.xp-title`, `.xp-org`, `.xp-blurb`, `.chip`, project cards

### Typography & theming summary (this view)

**T-levels present:** T2, T3, T5, T6, T7, T8 (contract §3a).

**Element theming (colour tokens, per §3e):**

| Element                 | Text colour    | Surface     |
| ----------------------- | -------------- | ----------- |
| Eyebrow (T5)            | `--accent-ll`  | —           |
| Section title (h2)      | `--heading`    | —           |
| Section subtitle (T7)   | `--text`       | —           |
| Role title (h3)         | `--heading`    | —           |
| Role meta / org / blurb | `--text-muted` | —           |
| Tech chip               | `--text-muted` | `--bg-chip` |
| Project card (Tier D)   | —              | `--bg-elev` |
