# Full-Site Review & Structured Refactor — 2026-07-05

Complete-coverage review of all 491 tracked files (20+ parallel review agents,
orchestrator-verified findings), followed by four fix waves. Every fix below
was re-verified from primary evidence before shipping; review-agent claims
that failed verification are listed under False Positives so future sweeps
don't re-litigate them.

## Coverage

- 247 text files reviewed in 19 domain batches (src, content, scripts, tests,
  configs, CI, docs, .claude, .cursor, .agents) — every batch returned an
  explicit `FILES REVIEWED n/n` roster.
- 243 binary/SVG assets reference-audited against a grep-count manifest
  (public/, icon_collections_resized/, screenshots, fixtures, src/assets).
- 1 exclusion: package-lock.json (generated).

## Shipped fixes

### Wave A — dead code removal + doc sync (commit `c5f27a8`)

- global.css: removed unused `.snapshot-grid`, `.section-header--center`,
  `.icon-tile--elev` rules; removed dead `.mark-circle` /
  `.mark-circle--accented` selectors (the rule blocks survive under live
  co-selectors `.theme-card__icon`, `.icon-tile--round.icon-tile--accented`,
  `.vision-hub__node/center` — docs now call this the "circular mark chrome"
  rule); removed unconsumed tokens `--accent-red-soft`, `--text-inverse`,
  `--chevron-h/-w/-overlap`, `--fs-board-title/-sub`.
- Education.astro / Header.astro: removed CSS rules with no matching markup
  (`.edu-panel__badge` ×2, `.nav__link::after` overrides ×2).
- ThemeCard.astro: removed deprecated `accent` prop (and its pass-through in
  VisionPrograms.astro — caught by `astro check`).
- CardMark.astro: fixed comment referencing nonexistent `src/lib/card-mark.ts`.
- schemas.ts + profile.json: removed unrendered `credentialHook` (user-approved).
- src/scripts: unexported three internal-only types.
- docs/icon-blend-strategy.md: prettier-fixed (pre-existing verify failure at
  baseline HEAD, ledgered before any edits).
- Gate: `npm run verify` green; dist HTML byte-identical; CSS diff removals-only.

### Wave B — SSOT gates + script hygiene (commit `71d4a48`)

- New `scripts/check-icon-token-sync.mjs` wired into `npm run verify`
  (`check:tokens`): fails on drift between `ICON_SIZE_TOKENS`
  (src/lib/icon-render.ts) and `--icon-*` tokens (global.css) — replaces the
  "keep in sync" comment contract.
- `test:icons` npm script wires the previously manual icon pipeline tests
  (kept out of `verify`: Python dependency would break CI).
- check-skill-sync.sh: diff artifacts moved from bare /tmp into the
  trap-cleaned work dir; page-team-lib.sh: removed dead P1-filter assignment
  that was immediately overwritten by the P2 count; batch-icon-generate.sh:
  extracted duplicated known-sets one-liner into `known_icon_sets()`.

### Wave C — behavior-preserving dedup (commit `aee8a8e`)

- ResearchCard/SpeakingCard: dropped caller-side `logoUsesBadge`
  precomputation; CardMark's internal `useBadgeOverride ?? logoUsesBadge(slug)`
  is the single implementation now.
- SpeakingCard: description `<p>` is conditional (no empty element when a
  future item omits description).
- recog-grid.ts: missing search attributes join as `''`, not `'null'`.
- Gate: dist HTML byte-identical; JS delta exactly the recog-grid fix.
- **Rejected scope:** fully absorbing the logo/icon pre-branch into CardMark
  (auto-resolving `logoSrc(slug)`) — Education.astro passes `slug` without
  `logoUrl` and relies on icon fallback, so auto-resolution would change its
  rendering. The two-branch call sites are intentional presentation branching.

### Close-out (this commit)

- Stale baseline-audit path (`codebase-review-2026-07-02.md`, never existed)
  corrected in 6 files (.claude agents/commands/skills, .cursor script).
- Removed-"projects"-view drift fixed in .cursor state example, page-team
  init/start scripts, and .cursor skill copy (Seven → Six representatives);
  design-contract EX-005 marked historical.
- specification.md: dropped nonexistent `EducationCard`;
  portfolio-icon-audit skill: `HubCircle`/`ProgramBadgeCard` → `ThemeCard`/
  `VisionHub`, `ProjectAccordion` → `XpProjectCard`.
- .gitignore: removed ineffective `~/` pattern; LinkedIn CSV title 2024→2023
  (contradicted its own date and awards.json); draft comp-04 start_date
  2021→2022 (contradicted kaggle.json period).

## Flagged, intentionally NOT changed

- **Design gap:** `--view-accent-experience` / `--view-accent-research` are
  defined in the per-view accent map but consumed nowhere — Experience and
  Research sections may not be wiring their view accents. Route to a
  `/page-team` audit; do not delete the tokens.
- **Content-in-waiting (user decision):** schema+JSON fields with real data
  but no renderer: `profile.headline`, `profile.photo`
  (public/assets/images/balaji.png exists), and the kaggle case-study fields
  (`architecture`, `lessons`, `highlights`, `realWorldImpact`, `teamMembers`,
  `compId` — 47 data occurrences). Render or prune deliberately.
- **Unreferenced assets (classification only):** ~60 `icon_*.png` PNG
  counterparts of shipped SVG marks under public/assets/logos (dormant since
  the SVG migration), 5 tech logos (aws/docker/foundation-models/langchain/
  rag), 8 metric/education/general SVG marks, 18 docs/reference screenshots,
  icons-grid.png, src/assets/icons/_work pair. All kept: pipeline inputs /
  reference material.
- **Orphan-candidate scripts:** analyze-icon-brightness.py,
  render-icon-montage.py (no callers in npm/docs/shell) — kept as manual
  utilities; document or remove deliberately.
- **awards_summary_linkedin.csv:** unreferenced by the build; kept as a manual
  LinkedIn export (title typo fixed above). Consider documenting it in
  content/README.md or generating it from awards.json.
- **Wont-fix (idiomatic/intentional):** scoped micro-CSS repeats (margin:0
  etc. — user decision); `.bullet-list li` padding `1.1rem` vs
  `--list-padding-left: 1.1em` (changing it alters computed padding on
  `--fs-md` text — a design decision, not a token bug); DotNav `aria-current`
  (semantically correct as-is); test fixtures are glob-discovered
  (`icon_*.png`, `*-icon-512.svg`), not orphans.
- **Deferred (concurrent session owns the files):** AGENTS.md LOGO_SUBDIRS
  sample shows 8 entries vs 3 in content.ts, and its image-fallback code
  sample is missing a closing paren (~lines 174-201) — AGENTS.md had live
  uncommitted edits from a parallel dev-ports refactor during this review.
  Untracked `.cursor/agent-schedule.env` says "7 nav views" (example file is
  correct with 6).

## Known false positives (do not re-report)

`vision-accent-*` classes (built dynamically as `vision-accent-${accent}`),
`.skip-link` (Layout.astro), `logo-badge--lg/md` (`logo-badge--${size}`),
`profile.greeting` (Hero), `seo.twitterCard`/`ogImage` (BaseHead),
`logo_metric_kaggle_*` SVGs (CompetitionCard slugs), tests/fixtures binaries
(glob-discovered), Header `::after` overrides were dead but the underlying
`aria-current` styling is live.
