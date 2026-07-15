# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.6.1] - 2026-07-14

Awards filter label update.

### Changed

- Awards featured filter chip label: Leadership - Default

## [1.6.0] - 2026-07-09

About view restructure, Thirukural alignment, and recognition filter updates.

### Added

- `HeroLanding.astro` wrapper for hero + Thirukural band (replaces `AboutLanding`)
- About section (`#about`) replaces standalone leadership section - focus areas, collaborations, and intro unified under one view
- `serve-prep.mjs` - stop stale listeners, build, print serve steps (`npm run serve`)
- Page-about agent Appendix D - owner preferences for Thirukural spacing and text-portrait alignment
- Design contract EX-018 - desktop Thirukural copy height matches portrait via `space-between`

### Changed

- Section id `leadership` - `about`; components renamed (`About.astro`, `AboutFocusAreas`, `AboutCollaborations`)
- Thirukural: `3lh` surround spacing; desktop text lines distributed across portrait height; mobile tight `--kural-text-gap`
- About section spacing: restored `--section-py-start`, wider filter-to-grid gap, card-row rhythm
- Hero landing uses `justify-content: flex-start` (no viewport vertical centering)
- Awards: Director / Associate Director levels in schema; default filter shows EVP through National Level
- Hero metrics and about copy refreshed in `profile.json`
- Refreshed reference screenshots (dark + light)
- Baseline shot selector: `.about-landing` - `.hero-landing`

### Fixed

- Awards filter `includes` type check for extended award levels

## [1.5.1] - 2026-07-07

Education panel layout and wrapped card title line spacing.

### Changed

- Education hero left column: logo + degree grouped in top cluster, field anchored at bottom via `space-between`
- `--lh-snug` and `--lh-normal` bumped from 1.35/1.4 - **1.45** for clearer gap on two-line card titles (Awards, Kaggle, all T3 surfaces)

## [1.5.0] - 2026-07-07

Unified heading and sub-heading typography across all nav views.

### Added

- Global heading utilities: `.card-title` (T3), `.subhead-eyebrow`, `.subhead-kicker`, `.subhead-bar`

### Changed

- Standard card titles normalized to `--fs-card-title` / `--lh-snug` (vision-impact, edu-field, contact, experience)
- Ad-hoc kicker/sub-head styles migrated to shared subhead utilities (leadership, awards, vision programs, experience)
- Speaking card event name demoted to T7 subtitle so talk title reads as primary
- `XpProjectCard` project name uses `<h3>` for correct heading order
- Design contract and typography docs updated for new utilities

## [1.4.1] - 2026-07-07

Collapsible recognition cards and improved wrapped-line spacing for card titles.

### Added

- Opt-in collapsible body on `RecogCardShell` with Details/Hide toggle (Awards, Kaggle)
- `recog-grid.ts` toggle wiring and grid-template-rows collapse animation (JS-gated, no-script fallback)

### Changed

- `--lh-snug` bumped from 1.25 to 1.35 for card titles; applied to `.theme-card__title` and `.xp-proj__name`
- Recognition card title typography aligned to `--fs-card-title` / `--fw-semibold`
- Awards grid switched from subgrid to flex column to support collapsible shell structure
- Refreshed reference screenshots (dark + light)

## [1.4.0] - 2026-07-06

Vision view consolidation and page-label eyebrows across all nav views.

### Added

- Page-label eyebrows on view-opening sections: About, Experience, Research, Recognition (Vision and Contact unchanged)
- `VisionImpactGrid.astro` - org-impact tiles rendered inside `vision-programs`

### Changed

- Vision view merged into a single `vision-programs` section; impact grid follows programs below an `h3` sub-heading
- Experience eyebrow: Career - Experience
- Design contract, page briefs, typography, and page-agent docs updated for eyebrow rules
- Refreshed vision reference screenshots; baseline capture targets updated

### Removed

- Standalone `vision-impact` section (`VisionImpact.astro`) and its baseline screenshots

## [1.3.0] - 2026-07-06

Post-refactor site review pass: design consistency, accessibility, content fixes, and follow-up hygiene.

### Added

- Location contact card restored to the contact grid as a static block
- Visually hidden screen-reader hints for external links in Contact
- Dual-theme visual baselines (dark + light) with hero and experience shots; re-scroll-until-stable capture guard in `baseline-shots.mjs`
- `docs/audits/open-tasks-2026-07-06.md` - verified open items for follow-up agents

### Changed

- Card shell padding, typography tokens, kicker colors, mobile breakpoints, object-fit, and vision icon sizes standardized across sections
- Awards summary grid refactored; `RecogCardShell` composition updated
- Smoke test imports `DEV_PORT` from `scripts/ports.mjs` (ports SSOT)
- Docs aligned to current schemas (`content-editing.md`, `specification.md`, `page-recognition.md`); refactor ledger follow-ups marked resolved

### Fixed

- `AGENTS.md` code-example syntax typo; design consistency contract updated

## [1.2.0] - 2026-07-06

Internal zero-visual-change refactor (dist-diff gated against `refactor-baseline`); the only
visual change is the Contact copy/spacing edit. Full ledger: `docs/audits/refactor-2026-07-06.md`.

### Added

- `scripts/dist-diff.mjs` zero-visual-change refactor gate (strict + `--loose` modes) and `refactor-baseline` tag
- Theme-token drift gate `scripts/check-theme-token-sync.mjs` wired into `check:tokens` (`THEME_BG` ↔ `--bg`)
- `src/lib/views.ts` shared structural constants (dot ids, selectors, scroll-settle timing)
- `scripts/icons/README.md` documenting icon-pipeline entry points and dormant utilities

### Changed

- Contact view copy and spacing: title "important" - "impactful"; subtitle moved below the section header (only visual change in this release)
- `src/schemas.ts` split into `src/schemas/` modules behind the `@schemas` barrel; icon/logo pipeline scripts moved to `scripts/icons/`
- Root restructure: `icons-grid.png` - `docs/reference/`, `SVG-ICON-SKILL-SETUP.md` - `docs/`, `icon_collections_resized/` - `assets/source/icon-collections-resized/`
- Large components decomposed into sub-components (Experience, VisionPrograms, Hero, LeadershipPhilosophy, CompetitionCard, Education, SpeakingCard) - dist-verified render-identical
- SSOT consolidation: typed `SECTIONS` registry, derived `homeViewAnchor`, table-driven content validation, `isContentPage` dedup, `medalCount()` helper
- Agent-infra consolidation: page-agent skeletons deduplicated into the shared playbook, ports documentation SSOT moved to `docs/troubleshooting.md`, `AGENT-SYSTEM-SUMMARY.md` refreshed

### Removed

- `TASKS.md` and `CURSOR.md` root pointer/relic files
- 79 dead CSS lines (orphaned `.recog-tile`/`.recog-badge` rules, unused view-accent tokens, `.accent-red`, stale `.theme-toggle` print rule)
- Unrendered content fields (`profile.headline`/`photo`; kaggle `headline`, `architecture`/`lessons`/`highlights`, and stray unvalidated keys)

## [1.1.0] - 2026-07-06

### Added

- Self-hosted DM Serif Display and Inter Variable fonts (`fonts-critical` / `fonts-deferred` CSS)
- WebP/AVIF siblings for portrait and section images; image optimize pipeline (`scripts/optimize-images.mjs`)
- Lighthouse check script (`scripts/lighthouse-check.mjs`)
- `asset-guard` and `init-sections` client scripts (dot nav, back-to-top, section inits)
- `docs/icon-size-inventory.md` and expanded `docs/README.md` agent/docs index
- Page-level dot navigation: seven dots (Hero + six nav views) with `sectionToDotNav` scroll-spy

### Changed

- HeroCanvas, Portrait, and card components (CompetitionCard, SpeakingCard, ResearchCard, XpProjectCard) polish and icon standardization
- Chrome: BaseHead font preload, Header/Footer/SiteChromeBoot cleanup
- Section updates: Awards, Education, Experience, Hero, Kaggle, LeadershipPhilosophy, ThirukuralQuote, LogoBadge, VisionHub
- Refreshed SVG logo marks and reference screenshots across views
- Dot nav scroll-spy maps sections to view dots (hero/thirukural - Hero, leadership - About)
- Removed `dotNav` / `dotNavLabel` from section schema (dots derived from nav views)

## [1.0.1] - 2026-07-06

### Added

- Shared `scroll-to-section` helper with compact-header offset and About landing scroll boundary
- Portfolio agent skills: content authoring, visual verify, SEO meta, a11y contrast, icon patterns
- `--header-h-compact` design token for scrolled header height

### Changed

- About landing layout: `#about-landing` hero band ends flush above leadership; About nav scroll hides hero band
- Section `scroll-margin-top` includes header breathing room (`--space-4`)
- Inline `Icon` sizes standardized to `size="sm"` in Hero, Contact, and CompetitionCard
- Header compact state uses `--header-h-compact` token instead of hardcoded `52px`

## [1.0.0] - 2026-07-06

First production release of the Balaji Selvaraj portfolio site.

### Added

- Astro 4 static site with six nav views and thirteen content sections on a single-page home
- Zod-validated JSON content layer under `content/` (build fails on schema violations)
- GitHub Actions CI (`validate.yml`) and GitHub Pages deploy pipeline (`deploy.yml`)
- Icon and mark standardization pipeline with PNG logo assets and token SSOT drift gate
- Multi-agent design consistency and site review system (page team, site-review-fix)
- Scroll-spy section views, mobile nav, save-page export, and reveal animations
- SEO: meta tags, Open Graph, Twitter cards, JSON-LD Person schema, sitemap, robots.txt
- Résumé PDF as a static asset at `/assets/resume/balaji-selvaraj-resume.pdf`

### Changed

- Dark-only theme (removed header theme toggle; `data-theme="dark"` on load)
- About view scroll target: leadership section first in `viewSections`
- Education stat tiles use Recognition gold hairline grid (aligned with Kaggle summary pattern)
- Vision board IDEA lane uses `silver` accent for medal/recognition semantics

[Unreleased]: https://github.com/balajiselvaraj1601/portfolio_site/compare/v1.6.1...HEAD
[1.6.1]: https://github.com/balajiselvaraj1601/portfolio_site/compare/v1.6.0...v1.6.1
[1.6.0]: https://github.com/balajiselvaraj1601/portfolio_site/compare/v1.5.1...v1.6.0
[1.2.0]: https://github.com/balajiselvaraj1601/portfolio_site/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/balajiselvaraj1601/portfolio_site/compare/v1.0.1...v1.1.0
[1.0.1]: https://github.com/balajiselvaraj1601/portfolio_site/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/balajiselvaraj1601/portfolio_site/releases/tag/v1.0.0
