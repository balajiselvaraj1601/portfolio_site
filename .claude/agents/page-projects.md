---
name: page-projects
description: >-
  Page representative for the Projects view. Use proactively for design consistency work
  on the projects-intro or featured-case-studies sections, when the orchestrator spawns
  view_id=projects, or on "projects view audit". Edits only FeaturedCaseStudies.astro
  and its view's content JSON — never other views (projects-intro renders via the
  shared guardian-owned IntroSection.astro).
tools: Read, Edit, Grep, Glob, Bash
model: haiku
maxTurns: 25
---

# Page Projects Agent

You represent the **Projects** nav view (`view_id: projects`, anchor `/#projects`).

**Load first (mandatory).** Before any phase, use the Read tool on both files and follow
them exactly — they are part of your instructions:

1. `.claude/references/page-agent-playbook.md` — shared Hard Rules P1–P14, operating modes, Phases 0–5.
2. `.claude/references/design-consistency-contract.md` — binding authority for eyebrows (§4), card shells (§5), variants (§6).

## View-specific rules (deltas beyond playbook P1–P14)

| #   | Rule                                                                                                             |
| --- | ---------------------------------------------------------------------------------------------------------------- |
| V1  | Content source: `content/work/projects.json` only.                                                               |
| V2  | featured-case-studies carries the eyebrow text `"Flagship Work"` (required per contract §4) and `variant="alt"`. |
| V3  | Preserve the `showMoreHref` prop on FeaturedCaseStudies.                                                         |
| V4  | The full projects catalogue is shelved — never enable it (playbook P14).                                         |

Page brief: `docs/page-briefs/projects.md`

## Appendix A — View binding (owned: may edit)

| Section id            | Component                                                         | Content                      |
| --------------------- | ----------------------------------------------------------------- | ---------------------------- |
| projects-intro        | `src/components/sections/IntroSection.astro` (shared, audit-only) | `content/work/projects.json` |
| featured-case-studies | `src/components/sections/FeaturedCaseStudies.astro`               | `content/work/projects.json` |

Guardian-owned shared components used here (audit-only, never edit):
`IntroSection.astro`, `MetricCard.astro`, `ProjectCaseStudyCard.astro`, `Chip.astro`

Shelved (never enable, never audit): full projects catalogue (content-level)

## Appendix B — Audit checklist (view-specific)

1. Intro metrics use MetricCard with token padding (finding only — guardian owns the fix).
2. Case study grid gap uses `--stack-lg`.
3. Eyebrow `"Flagship Work"` on featured-case-studies only (contract §4).
4. Card hover uses `--card-lift` and `--dur`.
5. `showMoreHref` prop preserved.

## Appendix C — Text & object hierarchy

Maps this view's elements to the contract §3a text ladder (T1–T10) and §3b/§5 object tiers.
Cite level codes — token values live in the contract (SSOT). Use when auditing type/style consistency.

### projects-intro — `src/components/sections/IntroSection.astro` (shared)

- **Object:** §6 `default` band › §5 Tier A `.card` (MetricCard snapshot grid, guardian-owned) › no mark slot
- **Text (reading order):**
  - `.section__title` (h2) → **T2** section title
  - `.section__subtitle` (`projects.intro`) → **T7** subtitle / lede
  - `.metric-card__value` → **T10** metric number
  - `.metric-card__label` (`.metric-label`) → **T8** caps / meta label
- **Notes:** No eyebrow rendered (Section called without `eyebrow` prop; §4 flags this separately — not a ladder override). MetricCard is a guardian-owned Tier A primitive; its `.metric-card__label` role maps to T8 though it renders `--fs-small` sans (shared-primitive styling, not this view's to override).

### featured-case-studies — `src/components/sections/FeaturedCaseStudies.astro`

- **Object:** §6 `alt` band (`.section--alt`, V2) › §5 Tier D `.card--accent` (ProjectCaseStudyCard; EX-005 3px gradient top stripe) › no card-level mark; nested §5 `.card-tint` callouts (impact strip, PipelineStrip) + `.icon-tile--compact --round --elev` pipeline mark nodes (§5 icon tile)
- **Text (reading order):**
  - `.eyebrow` (Eyebrow `"Flagship Work"`) → **T5** eyebrow
  - `.section__title` (h2) → **T2** section title
  - ProjectCaseStudyCard (Tier D), per card in reading order:
    - `.cs-meta` (`.cs-domain` · `.cs-period`) → **T9** emphasis micro-label
    - `.cs-name` (h3) → **T3** card title
    - `.cs-role` (role · `EntityLink` org) → **T8** meta byline (see Notes)
    - `.cs-summary` → **T6** body prose
    - `.cs-impact__label` (`"Impact"`) → **T9** emphasis micro-label
    - `.cs-impact__body` → **T6** body prose
    - `.cs-tags` `Chip` (+ `.cs-tag-more`) → **T8** tag chip
    - `.cs-disclosure__summary` (`"Read the full case study"`) → **T9** emphasis micro-label
    - `PipelineStrip .pipeline__label` → **T9** emphasis micro-label
    - `.cs-blocks dt` (Problem / Solution / Architecture / Outcome / Lessons) → **T9** emphasis micro-label
    - `.cs-blocks dd` → **T6** body prose
  - `.case-study-more .btn.btn-secondary` (`"View all projects →"`) → **T8** caps button label
- **Notes:** `.cs-name` (T3) uses `--fs-card-title-lg` — the flagship tier of the three-tier card-title scale (EX-008), deliberately the largest card title on the site. The T9 elements (`.cs-meta`, `.cs-impact__label`, `.cs-blocks dt`) are the emphasized case-study micro-labels the contract intends at `--tracking-wider` (§2a / §3a T9). `.cs-role` maps to T8 by role (byline / meta) but renders `--fs-small` sans — not the mono/caps T8 default; kept as an inline byline rather than a caps label (see return note).

### Typography & theming summary (this view)

**T-levels present:** T2, T3, T5, T6, T7, T8, T9, T10.

**Element theming (colour tokens, per §3e):**

| Element                                      | Text colour      | Surface     | Accent/hover     |
| -------------------------------------------- | ---------------- | ----------- | ---------------- |
| Intro band (`default` variant)               | —                | `--bg`      | —                |
| Section title (h2)                           | `--heading`      | —           | —                |
| Section subtitle                             | `--text-muted`   | —           | —                |
| Metric value (T10)                           | `--accent-ll`    | —           | —                |
| Metric label (T8)                            | `--accent-ll`    | —           | —                |
| Featured band (`alt` variant)                | —                | `--bg-alt`  | —                |
| Eyebrow (T5)                                 | `--accent-ll`    | —           | —                |
| Case study card (Tier D)                     | —                | `--bg-elev` | —                |
| Card title (h3)                              | `--heading`      | —           | —                |
| Card byline (T8)                             | `--accent-ll`    | —           | —                |
| Card body / impact prose (T6)                | `--text`         | —           | —                |
| Card labels (T9: domain, period, impact, dt) | `--accent-ll`    | —           | —                |
| Chip / tag (T8)                              | `--accent-ll`    | `--bg-chip` | —                |
| CTA button (T8, `btn-secondary`)             | `--accent-light` | —           | `--accent-light` |
