# Box / Card Color History & Architecture

> Consolidated record of how the portfolio site's card/box **accent-color** system
> evolved and how it works today. Assembled from ~160 prior Claude session
> transcripts, the `color-standardization-one-accent-per-view` memory, and the live
> code. Token names and line ranges were cross-checked against
> [`src/styles/global.css`](../src/styles/global.css) and
> [`src/schemas/`](../src/schemas/) on 2026-07-06.

## TL;DR

Box/card colors are **multi-color per view** - restored on **2026-07-05** after a
short-lived "one accent per view" unification. Every card color flows through a single
token, **`--accent-card`**, via the _universal un-suppress pattern_:

```css
--accent-card: var(--<item-token>, var(--view-accent-X));
```

The item's own hue (`--cat` / `--lvl` / `--medal`) wins; the view accent is only a
fallback for items with no category/level/medal class. There are **zero hardcoded hex
values in components** - all hues are theme-aware, with light/dark locked together by
token inheritance.

## Decision timeline

| Date                                             | Event                                                                                                                                                                                             | Status     |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Early-late June 2026                             | Original multi-color scheme (`--cat-*`, `--lvl-*`, `--medal-*`, `--vision-accent-*`)                                                                                                              | superseded |
| 2026-06-28 (commit `77846cd` unify-view-accents) | **Unified to one accent per view**; About re-suppressed to brand purple                                                                                                                           | reversed   |
| 2026-07-05 (session `2b8c0377...`)                 | **Reversal to multi-color per view** at explicit user request ("use multiple colors per page... all views")                                                                                         | **active** |
| 2026-07-05                                       | About given dedicated `--about-cat-*` namespace; Vision positional-per-item; Experience 6-tier seniority timeline added; Research/Contact label fixes; WCAG re-measured; Playwright visual verify | **active** |

## Token architecture (the cascade)

```text
Content JSON key (accent / level / medal)
  - component class      (.vision-accent-impact, .level-evp, .xp-level-senior, .cat-*)
  - CSS var map          (--cat / --lvl / --medal)
  - --accent-card: var(--<item-token>, var(--view-accent-X))
  - card shell + circular mark chrome + prominent labels all inherit --accent-card
  - light/dark applied automatically by the token definitions
```

- **7-hue harmonized family** (no new hues introduced anywhere): indigo, amber/gold,
  teal, rose/pink, violet/purple, red, green. Defined in `global.css` `:root`
  (light ~L278-333, dark ~L368-379).
- **Per-view fallbacks** (`global.css` ~L328-333): `--view-accent-about`,
  `--view-accent-experience`, `--view-accent-research`, `--view-accent-recognition`,
  `--view-accent-vision`, `--view-accent-contact`.
- **About isolation**: `--about-cat-*` is its own namespace that _aliases_ the shared
  `--cat-*` family (`global.css` ~L307-313). Kept separate so About↔Vision never leak
  each other's hues while still inheriting theme tracking for free.
- **Dark mode**: per-item colors get a 12%-4% prominence wash into `--bg-elev` plus an
  accent top edge; light mode is left vivid as-is.

## Per-view color assignment (as shipped 2026-07-05)

| View                     | Dimension        | Mechanism                                                                                                                                                                                                                                                                                                                                               |
| ------------------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **About**                | Category         | `.cat-*` classes - `--about-cat-*` (7 hues). See [`About.astro`](../src/components/sections/About.astro).                                                                                                                                                                                                                                               |
| **Experience**           | Career seniority | `xpLevelSchema`: principal-purple, staff-blue/indigo, senior-teal, lead-gold, associate-pink, engineer-red. Timeline rail keeps its intentional violet-red temporal gradient (exception **EX-017**).                                                                                                                                                    |
| **Research**             | Section          | Publications-`--cat-strategic` (blue/indigo), Conferences-`--cat-platform` (teal), Speakers-`--cat-ai` (purple). `global.css` ~L804-812. `.venue` label fixed to read `--accent-card`.                                                                                                                                                                  |
| **Recognition / Awards** | Award level      | `.level-*` - `--lvl-*` (6 seniority hues). `awardLevelSchema`.                                                                                                                                                                                                                                                                                          |
| **Recognition / Kaggle** | Medal + summary  | `--medal-silver` / `--medal-bronze` on medal stat tiles; `.blob--competitions` - `--cat-people` (rose), `.blob--rank` - `--lvl-director` (teal). `kaggleMedalSchema`.                                                                                                                                                                                   |
| **Vision / programs**    | Per-item content | `.vision-accent-*` classes - `--cat` on `#vision-programs` only. IDEA hub pink, VISION hub teal; program cards multi-color. `global.css` ~L819-847.                                                                                                                                                                                                     |
| **Vision / impact**      | Grouped content  | 3 accent groups via `orgCards[].accent` (2026-07-06, supersedes **VI-001**): awards-`ai` purple, funding-`gxp` green, team-`strategic` blue - distinct from the flow's silver/teal/gold/pink. Grid now lives inside `#vision-programs` (`vision/VisionImpactGrid.astro`); the `#vision-impact` section and `--vision-impact-accent` token were removed. |
| **Contact**              | Single accent    | All cards inherit brand purple via `--view-accent-contact`. `global.css` ~L814-817.                                                                                                                                                                                                                                                                     |
| **Education**            | Single accent    | Gold via `.edu-accent` + `.edu-stats { --accent-card }`; stat cells use 6% gold wash (Kaggle `.blob-stat` pattern). [`Education.astro`](../src/components/sections/Education.astro).                                                                                                                                                                    |

### Content schemas (SSOT for allowed color keys)

Defined in [`src/schemas/`](../src/schemas/); invalid keys fail the build:

- `visionAccentSchema` ([`work.ts`](../src/schemas/work.ts)) - `impact | strategic | platform | people | ai | privacy | gxp`
- `xpLevelSchema` ([`work.ts`](../src/schemas/work.ts)) - `principal | staff | senior | lead | associate | engineer`
- `awardLevelSchema` ([`recognition.ts`](../src/schemas/recognition.ts)) - six executive nominator levels
- `kaggleMedalSchema` ([`recognition.ts`](../src/schemas/recognition.ts)) - `Silver | Bronze`

## Known gaps & notes

- **RecogTile accent bridge (fixed 2026-07-06)**: summary stat tiles render as
  `.theme-card.card` via `RecogTile.astro` (the `.recog-tile` block class was deleted
  in `94269ae`). An accent bridge scoped to `#awards .recog-card` only misses stat
  tiles and active filter chips - they keep brand purple despite `.level-*` setting
  `--lvl`. Bridge must include `#awards .recog-summary .theme-card.card` and
  `#awards .recog-chip.is-active`. See [`Awards.astro`](../src/components/sections/Awards.astro).
- **Dark hero-stat contrast**: `--accent` `#6c2fbf` on `#1a1530` measures 2.34:1
  (pre-existing, decorative; unfixed - candidate fix is `--accent-light`). All
  `--cat-*` / `--lvl-*` / medal hues pass WCAG AA ≥ 3:1.
- **Fallback-only tokens**: `--view-accent-experience` and `--view-accent-research` are
  defined but consumed only as fallbacks (Research uses section-ID selectors instead).
  Flagged as a design gap in the 2026-07-05 audit - **do not delete** the tokens.
- **Verification harness gotchas** (per-view color probing): scope probes by section
  id - `.theme-card` is shared by both About and Vision, so a page-wide probe
  reports two colors and looks like a bug. `.about__card-row` has no `border-top`,
  so its computed border color is `--text`, not the accent - exclude it from accent
  probes.

## Source pointers

- **Primary session** (the reversal): `2b8c0377-9a8f-4bd3-aec5-525e24abf505`
  (2026-07-05 12:01). Supporting: `9e10d947...` (label cascade fixes), `26e7e53d...`
  (concurrent refinements), `1d3db2a2...` (2026-06-28 unify-view-accents).
- **Memory**: `color-standardization-one-accent-per-view.md`,
  `visual-verification-portfolio.md` (probe-scoping notes).
- **Repo**: [`src/styles/global.css`](../src/styles/global.css),
  [`src/schemas/`](../src/schemas/),
  [`docs/design-direction.md`](./design-direction.md) ("Per-view accent family",
  "Per-page color assignment"),
  [`docs/audits/full-site-review-2026-07-05.md`](./audits/full-site-review-2026-07-05.md).
