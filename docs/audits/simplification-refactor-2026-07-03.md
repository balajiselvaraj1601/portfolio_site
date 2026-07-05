# Simplification Refactor — 2026-07-03

> **Historical** — site is now final at 6 nav views / 13 sections. Shelved restore infrastructure
> and `_shelved/` archive were removed in the 2026-07-05 cleanup.

Zero-impact codebase simplification on branch `refactor/simplify` (baseline:
`5a3cdd8`). Every phase was gated on `npm run verify` plus a normalized
`dist/` diff against the baseline build (data-astro-cid stripped, hashed
asset names stabilized, CSS compared at rule level), and the final build was
checked section-by-section for identical subpixel box sizes and
within-noise pixel diffs.

## What changed

| Phase | Change | Net |
| ----- | ------ | --- |
| 1 | Removed dead shelved features: `Impact.astro`, `GenerativeAI.astro`, orphaned cards (`JourneyRow`, `JourneyNode`, `LeadershipCard`, `ResearchDomainMap`), their content JSONs, schema/loader closure, `impact` Section variant, dead `.logo-mark*`/`.section--impact` CSS, Publications' unreachable `showMoreHref` CTA, `logo_persister.svg`. `_shelved/` excluded from `astro check`. | −684 / +17 |
| 2 | `ExperienceIntro`/`ProjectsIntro`/`VisionIntro` (≈95% identical, no scoped styles) → shared `IntroSection.astro`, dispatched by `sectionId` via `SectionRenderer.sectionProps`. Page-team docs + routing CSV updated: intro sections are guardian-owned shared surface. | −108 / +98 |
| 3 | Awards/Kaggle summary tiles → shared `ui/RecogTile.astro` (spreads `...rest` so parent scope attrs and `level-*`/`blob--*` accent classes keep matching — verified in built HTML). | −55 / +55 |
| 5 | Merged byte-identical `.rcard-media`/`.rcard-video` frame rules in `ResearchCard.astro`. | −11 / +2 |

## Deliberate non-goals (evaluated, rejected — do not re-propose)

- **Publications + Conferences merge** — after removing the dead CTA both are
  ~14 lines differing in id/title/variant/spacing; merging costs more renderer
  plumbing than it saves.
- **Awards + Kaggle mega-component** — shared structure already lives in
  `RecogControls`/`RecogCardShell`/global `.recog-*`/`initRecogGrid`; the
  remaining logic genuinely differs (award-level taxonomy + per-level accents
  vs medal tiers + percentile sort + profile CTA slot).
- **Cross-file card-CSS extraction to global utilities** (`.card-title`,
  divider, 16/9 media frames) and **grid `auto-fit` unification** — Astro's
  attribute scoping strategy means scoped→global moves lower specificity and
  risk cascade flips; the differing `minmax` floors are intentional. Not worth
  ~80 LOC under a zero-visual-impact constraint.

## Verification notes for future passes

- Two CSS bundles share the `index.<hash>.css` stem; any hash-normalizing
  diff must number same-stem bundles by HTML link order or one silently
  clobbers the other.
- Rendered-noise floor at 1440×900: ~0.1–0.2% pixels (max channel delta ≈30)
  on sections with reveal animations, and ±1px element-screenshot heights from
  scroll-offset rounding — compare `getBoundingClientRect` for exact layout
  equality instead.
