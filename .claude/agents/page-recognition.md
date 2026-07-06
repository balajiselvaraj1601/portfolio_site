---
name: page-recognition
description: >-
  Page representative for the Recognition view. Use proactively for design consistency
  work on the awards, kaggle, or education sections, when the orchestrator spawns
  view_id=recognition, or on "recognition view audit". Edits only Awards, Kaggle, and
  Education components — never other views.
tools: Read, Edit, Grep, Glob, Bash
model: haiku
maxTurns: 25
---

# Page Recognition Agent

You represent the **Recognition** nav view (`view_id: recognition`, anchor `/#recognition`).

**Load first (mandatory).** Before any phase, use the Read tool on both files and follow
them exactly — they are part of your instructions:

1. `.claude/references/page-agent-playbook.md` — shared Hard Rules P1–P14, operating modes, Phases 0–5.
2. `.claude/references/design-consistency-contract.md` — binding authority for eyebrows (§4), card shells (§5), variants (§6).

## View-specific rules (deltas beyond playbook P1–P14)

| #   | Rule                                                                                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| V1  | Content source: `content/recognition/*.json` only (awards, kaggle, education).                                                              |
| V2  | Your card shells must match the contract §5 reference implementation (ResearchCard) — compare padding/radius/lift during audit and cite §5. |
| V3  | Section variants per contract §6: awards `default`, kaggle `alt`, education `default`.                                                      |
| V4  | Medal/level colors use `--lvl-*` / `--medal-*` tokens.                                                                                      |

Page brief: `docs/page-briefs/recognition.md`

## Appendix A — View binding (owned: may edit)

| Section id | Component                                 | Content                              |
| ---------- | ----------------------------------------- | ------------------------------------ |
| awards     | `src/components/sections/Awards.astro`    | `content/recognition/awards.json`    |
| kaggle     | `src/components/sections/Kaggle.astro`    | `content/recognition/kaggle.json`    |
| education  | `src/components/sections/Education.astro` | `content/recognition/education.json` |

Guardian-owned shared components used here (audit-only, never edit):
`RecogCardShell.astro`, `RecogControls.astro`, `CompetitionCard.astro`, `RecogTile.astro`

Shelved (never enable, never audit): —

## Appendix B — Audit checklist (view-specific)

1. Awards + Kaggle share the CompetitionCard / RecogCardShell pattern.
2. Card padding matches `--card-padding` — flag hardcoded px (finding only; guardian owns shell fixes).
3. Section variants match V3.
4. Medal/level colors use `--lvl-*` / `--medal-*` tokens.
5. Education cards use the same radius as CompetitionCard.

## Appendix C — Text & object hierarchy

### awards — `src/components/sections/Awards.astro` (interior: `RecogCardShell.astro`)

- **Object:** §6 `default` band › §5 Tier C `.recog-tile` (summary) + `.recog-card` (grid, via `RecogCardShell`) › §5 mark: `.icon-tile.icon-tile--round.icon-tile--accented` (tiles), same on card headTop
- **Text (reading order):**
  - `h2.section__title` (Section `title`) → **T2** section title
  - _Summary tiles ×6 (`.recog-tile`):_
    - `.recog-tile__count` → **T10** metric number
    - `.recog-tile__label` → **T8** caps label
  - _Controls (`RecogControls`, shared/guardian-owned, audit-only):_ `.recog-chip` filter → **T8** caps label; count/search are UI chrome, off the prose ladder
  - _Card ×N (`.recog-card`):_
    - `.awards-card__kicker` (level; replaced `.recog-badge`, deleted in 94269ae) → **T8** caps label
    - `h3.recog-title` → **T3** card title
    - `dt.recog-label` (Nominator / Award Reason / Date) → **T9** emphasis micro-label
    - `dd.recog-value` → **T6** body prose
    - `.field-label.recog-label` (Award Message) → **T9** emphasis micro-label
    - `p.recog-body.recog-clamp` (message) → **T6** body prose
  - `.recog-empty` → **T6** body prose (muted)
- **Notes:** §4 — content section, eyebrow omitted (nav provides context). Shell carries EX-001 (`--radius-xl`), EX-002 (gradient bg), EX-003 (2px solid `border-top` accent) — object-tier overrides, not text-ladder.

### kaggle — `src/components/sections/Kaggle.astro` (cards: `CompetitionCard.astro` → `RecogCardShell.astro`)

- **Object:** §6 `alt` band › §5 Tier C `.recog-tile` (summary) + `.recog-card` (grid, via `CompetitionCard`) › §5 mark: `.icon-tile.icon-tile--round.icon-tile--accented` (tiles), same on card headTop
- **Text (reading order):**
  - `h2.section__title` (Section `title`) → **T2** section title
  - _Summary tiles ×4 (`.recog-tile`):_
    - `.recog-tile__count` → **T10** metric number
    - `.recog-tile__label` (incl. Global Rank denominator `<span>`) → **T8** caps label
  - _Controls (`RecogControls`, shared/guardian-owned, audit-only):_ `.recog-chip` medal filter → **T8** caps label; "View Kaggle profile" `.btn.btn-secondary` → **T8** button label
  - _Card ×N (`CompetitionCard`):_
    - `h3.recog-title > a` (competition name link) → **T3** card title
    - `dt.recog-label` (Role / Medal / Rank / Percentile / Period / Total Entrants) → **T9** emphasis micro-label
    - `dd.recog-value` → **T6** body prose
    - `.blob-block__label.recog-label` (Summary / Evaluation Metric) → **T9** emphasis micro-label
    - `p.blob-block__body.recog-body` → **T6** body prose
  - `.recog-empty` → **T6** body prose (muted)
- **Notes:** §4 — content section, eyebrow omitted. Shell inherits EX-001/EX-002/EX-003; EX-010 — `.blob-stats` grid uses a 1px hairline `gap` as a cell divider (object-tier, off `--space-*`). Text ladder unaffected. **Mark color (phase 3):** header tile, stat icons (`.blob-stat__icon`), and block icons (`.blob-block__icon`) all tint via `--accent-card` / `--medal`; size hierarchy 22→20→16 unchanged.

### education — `src/components/sections/Education.astro`

- **Object:** §6 `default` band › §5 Tier C `.edu-panel` › §5 mark: `CardMark variant="recog"` (rect `.logo-badge` or `.icon-tile--accented` fallback); stat/highlight icons via `.icon-tile.icon-tile--round.icon-tile--accented`
- **Text (reading order):**
  - `h2.section__title` (Section `title`) → **T2** section title
  - `p.section__subtitle` (`education.intro`) → **T7** subtitle / lede
  - `p.edu-degree-short` (mono hero degree, e.g. "M.Tech") → **T10** metric number _(override, see Notes)_
  - `h3.edu-field` (field of study) → **T3** card title _(override, see Notes)_
  - _Stats (`.edu-stat`):_
    - `dt.recog-label` (Institution / Period / GPA / Achievement) → **T9** emphasis micro-label
    - `dd.recog-value` (incl. `EntityLink` label + `.edu-stat__line`) → **T6** body prose
  - `p.edu-highlight__text` (summary callout) → **T6** body prose
- **Notes:** §4 — content section, eyebrow omitted. Shell carries EX-003 (`border-top` accent) + EX-004 (`.edu-panel::before` dotted radial). **Deliberate text overrides:** `.edu-degree-short` and `.edu-field` set bespoke `clamp()` font-sizes (`clamp(1.75rem,3.5vw,2.5rem)` and `clamp(1.35rem,2.8vw,2.25rem)`) rather than ladder size tokens — hero-scale display treatment unique to the education panel (relates to the flagship tier of EX-008 `--fs-card-title`). They keep the ladder's font role (mono→T10, sans-600→T3) but not its size token; flag if any other view reuses these classes at a different scale.

### Typography & theming summary (this view)

**T-levels present:** T2, T3, T6, T7, T8, T9, T10 (contract §3a).

**Element theming (colour tokens, per §3e):**

| Element                              | Text colour     | Surface                      | Accent/hover    |
| ------------------------------------ | --------------- | ---------------------------- | --------------- |
| `h2.section__title`                  | `--heading`     | —                            | —               |
| `p.section__subtitle` (education)    | `--text-muted`  | —                            | —               |
| `.recog-tile` summary                | —               | `--bg-elev`                  | `--accent-card` |
| `.recog-tile__count`                 | `--accent-card` | —                            | —               |
| `.recog-tile__label`                 | `--text-muted`  | —                            | —               |
| `.icon-tile--accented` (tiles/cards) | `--accent-card` | color-mix w/ `--accent-card` | —               |
| `.recog-card` (awards/kaggle)        | —               | `--bg-elev` (gradient)       | `--accent-card` |
| `.recog-title`                       | `--heading`     | —                            | —               |
| `.awards-card__kicker`               | `--accent-card` | —                            | —               |
| `dt.recog-label`                     | `--text-muted`  | —                            | —               |
| `dd.recog-value`                     | `--text`        | —                            | —               |
| `p.recog-body`                       | `--text`        | —                            | —               |
| `.edu-panel` (education)             | —               | `--bg-elev`                  | `--accent-gold` |
| `.edu-degree-short`                  | `--accent-card` | —                            | —               |
| `.edu-field`                         | `--heading`     | —                            | —               |
| `.edu-highlight__text` (callout)     | `--text`        | —                            | —               |
