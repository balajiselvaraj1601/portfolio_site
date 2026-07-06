---
name: page-vision
description: >-
  Page representative for the Vision view. Use proactively for design consistency work
  on the vision-programs and vision-impact sections, when the orchestrator
  spawns view_id=vision, or on "vision view audit". Edits only VisionPrograms.astro,
  VisionImpact.astro, and its view's content JSON — never other views.
tools: Read, Edit, Grep, Glob, Bash
model: haiku
maxTurns: 25
---

# Page Vision Agent

You represent the **Vision** nav view (`view_id: vision`, anchor `/#vision`).

**Load first (mandatory).** Before any phase, use the Read tool on both files and follow
them exactly — they are part of your instructions:

1. `.claude/references/page-agent-playbook.md` — shared Hard Rules P1–P14, operating modes, Phases 0–5.
2. `.claude/references/design-consistency-contract.md` — binding authority for eyebrows (§4), card shells (§5), variants (§6).

## View-specific rules (deltas beyond playbook P1–P14)

| #   | Rule                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V1  | Content source: `content/work/vision-board.json` only.                                                                                                                                                                                                                                                                                                                                                                                    |
| V2  | Single section (2026-07-06): `vision-programs` variant=alt with required eyebrow "Vision" (contract §4); the impact grid renders inside it below an `h3.vision-impact__heading` sub-heading (`visionBoard.orgHeader`). No separate `vision-impact` section; no `section--full` or `section--impact` layering.                                                                                                                             |
| V3  | Group hubs use `VisionHub.astro` with fluid cqi node sizing and `--mark-fg` chrome; hub accent from `group.accent` in JSON → `.vision-accent-*` + `.vision-accent-hook` (site `--cat-*` palette). Program/impact marks use `CardMark` + `MarkEmblem` (contract §5).                                                                                                                                                                       |
| V4  | Ad-hoc kickers match `.eyebrow` typography (contract §4).                                                                                                                                                                                                                                                                                                                                                                                 |
| V5  | Section titles via `Section.astro` props. Programs grid uses `.theme-grid` with `--theme-cols: 2`; the impact grid (`vision/VisionImpactGrid.astro`) uses an 8-half-track scoped grid (each tile spans 2) so the 3-tile bottom row centres while tile widths match a plain 4-col layout.                                                                                                                                                  |
| V6  | **Impact tiles (supersedes VI-001, 2026-07-06):** the 7 orgCards use 3 accent groups from `orgCards[].accent` → `.vision-accent-*` + `.vision-accent-hook` on each `<li>`: awards=`ai` purple, funding=`gxp` green, team=`strategic` blue. Do **not** reintroduce a single shared accent or reuse the flow's hues (silver/platform/impact/people). `#vision-programs` flow stays multi-color per `groups[].accent` / `programs[].accent`. |

Page brief: `docs/page-briefs/vision.md`

## Appendix A — View binding (owned: may edit)

| Section id      | Component                                                                                                           | Content                          |
| --------------- | ------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| vision-programs | `src/components/sections/VisionPrograms.astro` (+ `sections/vision/` sub-components incl. `VisionImpactGrid.astro`) | `content/work/vision-board.json` |

Guardian-owned shared components used here (audit-only, never edit):
`ThemeCard.astro` (`src/components/cards/`, renders program & impact cards), `VisionHub.astro` (`src/components/ui/`, renders group hubs)

Shelved (never enable, never audit): —

## Appendix B — Audit checklist (view-specific)

1. Single `vision-programs` section uses `Section.astro` variant=alt (V2).
2. `vision-programs` has eyebrow prop set to "Vision" (contract §4).
3. `vision-programs` grid uses `.theme-grid` with `--theme-cols: 2` (V5).
4. Impact grid (`vision/VisionImpactGrid.astro`) uses the 8-half-track centred layout with 3 accent groups (V5, V6), below the `h3` sub-heading.
5. Program badge and impact cards use `CardMark.astro` with proper icon-tile modifiers (V3).

## Appendix C — Text & object hierarchy

Note: the `ProgramBadgeCard` / `OrgSnapshotCard` pair (contract §5 row) was merged into the
single `ThemeCard.astro` SSOT (see its header, DG-006); `PipelineStrip` is not rendered in this view.

### vision-programs — VisionPrograms.astro

- **Object:** §6 `alt` band › §5 Tier A `.theme-card.card`, two grids:
  - Group cards (`.vgroups`): §5 emblem-in-circle lead mark (`CardMark emblemInCircle` → `.theme-card__icon` + MarkEmblem) + satellite mark row of §5 `icon`/emblem tiles `.icon-tile--round.icon-tile--compact` (MarkEmblem, aria-hidden)
  - Program cards (`.vision-programs__grid`, ThemeCard): Tier A `.theme-card.card`, Tier D `.card--accent` top stripe when `accent`; §5 mark slot = emblem-in-circle (`.theme-card__icon`) or rect `.logo-badge` (`.program-card__mark`) when an entity logo file exists
- **Text (reading order):**
  - `Eyebrow "Vision"` (Eyebrow.astro via `eyebrow` prop) → **T5** eyebrow
  - `h2.section__title` (`visionBoard.header`) → **T2** section title
  - `p.section__subtitle` (`visionBoard.intro`) → **T7** subtitle / lede
  - Group card `h3.theme-card__title` → **T3** card title
  - Program card `h3.theme-card__title` (may wrap `EntityLink`) → **T3** card title
  - Program card `p.program-card__label` → **T9** emphasis micro-label
  - Program card `ul.program-card__lines li` → **T6** body prose
- **Notes:** `.program-card__label` uses mono uppercase `letter-spacing: 0.14em` = `--tracking-wider` + `--accent-ll`, so it maps to **T9** (emphasized theme micro-label) rather than the T4 kicker level (`--tracking-snug`); this is the emphasized-micro-label variant per §2a/§3a, not a plain h4 kicker.

### impact grid — vision/VisionImpactGrid.astro (inside vision-programs)

- **Object:** same §6 `alt` band › §5 Tier A `.theme-card.card` (ThemeCard, prose mode) › §5 emblem-in-circle mark slot (`.theme-card__icon` + MarkEmblem; rect `.logo-badge` if an entity logo file exists)
- **Text (reading order):**
  - `h3.vision-impact__heading` (`visionBoard.orgHeader`) → sub-heading (fs-2xl, below T2)
  - `h3.theme-card__title` → **T3** card title
  - `p.theme-card__desc` (`lines` joined) → **T6** body prose
- **Notes:** —

### Typography & theming summary (this view)

**T-levels present:** T2, T3, T5, T6, T7, T8, T9, T10 (contract §3a).

**Element theming (colour tokens, per §3e):**

| Element                                | Text colour     | Surface                      | Accent/hover                                                                                      |
| -------------------------------------- | --------------- | ---------------------------- | ------------------------------------------------------------------------------------------------- |
| Eyebrow                                | `--accent-ll`   | —                            | —                                                                                                 |
| Section h2 title                       | `--heading`     | —                            | —                                                                                                 |
| Section subtitle                       | `--text-muted`  | —                            | —                                                                                                 |
| Card shell (Tier A)                    | —               | `--bg-elev`                  | —                                                                                                 |
| Card h3 title                          | `--heading`     | —                            | —                                                                                                 |
| Metric value                           | `--accent`      | —                            | —                                                                                                 |
| Stat label                             | `--text-muted`  | —                            | —                                                                                                 |
| Program/group label                    | `--accent-card` | —                            | —                                                                                                 |
| Body prose                             | `--text-muted`  | —                            | —                                                                                                 |
| Mark icon circle (`.theme-card__icon`) | `--mark-fg`     | color-mix w/ `--mark-fg`     | —                                                                                                 |
| Vision hub ring/spokes/rule            | —               | color-mix w/ `--accent-card` | —                                                                                                 |
| Vision hub center/nodes/label          | `--mark-fg`     | color-mix w/ `--mark-fg`     | —                                                                                                 |
| Vision hub accent source               | —               | —                            | `group.accent` → `.vision-accent-{key}` + `.vision-accent-hook` (`--cat-*` tokens)                |
| Vision program cards                   | `--accent-card` | logo pill tint               | `programs[].accent` per card                                                                      |
| Vision impact cards                    | `--accent-card` | emblem circle wash           | `orgCards[].accent` → `.vision-accent-{key}` + `.vision-accent-hook` (3 groups: ai/gxp/strategic) |
