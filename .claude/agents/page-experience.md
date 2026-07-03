---
name: page-experience
description: >-
  Page representative for the Experience view. Use proactively for design consistency
  work on the experience-intro or experience sections, when the orchestrator spawns
  view_id=experience, or on "experience view audit". Edits only ExperienceIntro.astro
  and Experience.astro — never other views.
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

| #   | Rule                                                                                                                                   |
| --- | -------------------------------------------------------------------------------------------------------------------------------------- |
| V1  | Content source: `content/work/experience.json` only.                                                                                   |
| V2  | experience-intro carries the eyebrow text `"Career"` (required per contract §4); the experience section uses `SectionHeading` instead. |
| V3  | Timeline rail spacing uses `--stack-*` tokens.                                                                                         |
| V4  | No invented metrics — facts only from content JSON.                                                                                    |

Page brief: `docs/page-briefs/experience.md`

## Appendix A — View binding (owned: may edit)

| Section id       | Component                                       | Content                        |
| ---------------- | ----------------------------------------------- | ------------------------------ |
| experience-intro | `src/components/sections/ExperienceIntro.astro` | `content/work/experience.json` |
| experience       | `src/components/sections/Experience.astro`      | `content/work/experience.json` |

Guardian-owned shared components used here (audit-only, never edit):
`MetricCard.astro`, `SectionHeading.astro`

Shelved (never enable, never audit): —

## Appendix B — Audit checklist (view-specific)

1. experience-intro: eyebrow `"Career"` via Section prop.
2. experience: `SectionHeading`, no duplicate eyebrow.
3. MetricCard grid uses `--stack-lg` gap (finding only — guardian owns the fix).
4. Timeline rail spacing uses tokens; no hardcoded tab/rail px values.
5. Secondary bullets use the muted text token.

## Appendix C — Text & object hierarchy

Maps this view's elements to the contract §3a text ladder (T1–T10) and §3b/§5 object tiers.
Cite level codes — token values live in the contract (SSOT). Use when auditing type/style consistency.

### experience-intro — `src/components/sections/ExperienceIntro.astro`
- **Object:** §6 `default` band (`Section.astro`) › §5 Tier A `.card` (`.metric-card` via `MetricCard.astro`, in `.snapshot-grid`) › no mark slot
- **Text (reading order):**
  - `.eyebrow` ("Career", via `Eyebrow.astro`) → **T5** eyebrow
  - `.section__title` (h2, `experience.title`) → **T2** section title
  - `.section__subtitle` (`experience.intro`) → **T7** subtitle / lede
  - `.metric-card__value` (snapshot value, ×5) → **T10** metric number
  - `.metric-card__label.metric-label` (snapshot label, ×5) → **T8** caps/metric label
- **Notes:** — (snapshot data carries no `detail`, so `.metric-card__detail` is unrendered here)

### experience — `src/components/sections/Experience.astro`
- **Object:** §6 `alt` band (`.section--alt`) › timeline `<ol.xp-stack>` (accent rail, not a card shell) › §5 Tier A `.proj-card` accordion (`ProjectAccordion.astro`, one per project) › §5 mark slots: role logo → **rect** `.logo-badge` (`CardMark` `useBadge`); accordion glyph → **icon** `.icon-tile` (`--compact --round --elev`)
- **Text (reading order):**
  - `.section__title.experience__title` (h2 via `SectionHeading`, `.accent` highlight span) → **T2** section title
  - per role `<article>`:
    - `.xp-meta` (period `–` end `·` location, `.xp-meta__sep`) → **T8** date / meta caps label
    - `.xp-title` (h3, `role.position`) → **T3** card title
    - `.xp-org` (`EntityLink`, `role.organization`) → **T8** company meta
    - `.xp-blurb` (`role.blurb`) → **T6** body prose
    - `.xp-tech` › `.chip` (`role.tech[]`, via `Chip`) → **T8** tag label
    - `ProjectAccordion` (`.proj-card`, per `role.projects[]`):
      - `.proj-name` (`project.name`) → **T4** sub-head
      - `.proj-sub` (`project.subtitle`) → **T6** body (micro caption)
      - `.bullet-list li` (`project.bullets[]`; `.is-secondary` → `--text-muted`) → **T6** body prose
- **Notes:** Three T8 elements render off the mono-caps default deliberately — `.xp-meta` is mono caps (uses raw `letter-spacing: 0.08em`, i.e. the `--tracking-caps` value; token-swap candidate), while `.xp-org` and `.chip` render quiet on `--font-sans`/`--fs-small` (inline org link + pill tag, not caps chrome). `.proj-name` (T4) renders on `--font-sans` 600 / `--fs-base`, not the mono T4 default — nested accordion title. `.xp-title` (T3) uses a raw `1.35rem` size rather than a `--fs-card-title*` token (§EX-008) — hardcoded, audit-flag.
