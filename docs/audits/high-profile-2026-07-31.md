# High-Profile Visual Upgrade — Findings Ledger (2026-07-31)

Diagnosis for the `feat/high-profile-visual-upgrade` branch. Method: impeccable
`audit` + `craft-floor` + `frontend-design` skill, applied to the recon of the six
nav views. Goal (user): *increase quality, visual appeal, overall standard* —
**tasteful depth polish, identity preserved** (refinement, not redesign).

## Mode & track

- **Mode = Experience** (impeccable): a portfolio — the artifact leads from the first
  viewport, the interface recedes.
- **Track = Refinement**: keep the committed identity — DM Serif Display / Inter /
  JetBrains Mono, purple accent family, per-view accents, particle field, card shells.
  No new biographical facts, no fabricated credentials.

## Deliberate divergences from impeccable's craft-floor defaults (identity wins)

impeccable's craft-floor treats several devices as anti-pattern defaults. The portfolio
adopted them **deliberately and documents them** (`design-consistency-contract.md`,
`docs/typography.md`, `docs/box-color-history.md`). impeccable's own top rule —
*"the committed visual world overrides anything here; your own habit does not"* — means
we KEEP these. Recorded so the divergence is conscious, not silent:

| craft-floor default | Portfolio's committed use | Verdict |
|---|---|---|
| Eyebrow/kicker above heading ("hard ban") | Mono eyebrow = section category, per-view accent-colored (`ui/Section.astro`) — encodes real info (`frontend-design`: keep if it does) | **KEEP** |
| Colored `border-top` >1px on cards | 2px/3px accent `border-top` is the core card-shell identity (`global.css:704`, EX-documented) | **KEEP** |
| Hero-metric template (big number/small label) | Hero metric tiles + Recognition stat tiles are the data story | **KEEP**, refine hierarchy |
| Monospace as "technical" costume | JetBrains Mono for eyebrows/labels/numerals — consistent, intentional | **KEEP** |

## Audit health (impeccable 5-dimension, 0–4)

| # | Dimension | Score | Key finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 3 | Mature: `portfolio-a11y-contrast` skill + `docs/accessibility.md` AA checklist, reduced-motion gated, focus-ring token. Verify accent-on-surface ratios hold after new tokens (Phase 4). |
| 2 | Performance | 3 | Self-hosted fonts, preloaded criticals, deferred faces. Watch: global particle `<canvas>` + any new blur/filter motion must stay GPU-cheap and reduced-motion gated. |
| 3 | Theming | 4 | Full token ladders (type/space/radius/weight/tracking), light+dark, token-sync CI. Exemplary. |
| 4 | Responsive | 3 | Fluid container, clamp gutters, mobile section shrink. Verify weak-view redesigns + new decorative art don't overflow at ≤768px. |
| 5 | Implementation Integrity | 3 | Coherent product-specific system; drift is the *sameness* below, not incoherence. |
| **Total** | | **16/20** | **Good** — address the weak dimensions; the gap is visual distinction, not correctness. |

The score says it plainly: this is a technically sound site whose ceiling is **visual
distinction**, not fixing brokenness. That's why the work is depth + motion + weak-view
elevation, not a rebuild.

## Findings by severity (the real levers)

**P1 — the two named anti-patterns (highest visual ROI)**

- **[P1] One identical entrance on every section.** `global.css:1299-1311`: a single
  `.reveal` opacity+translateY(24px) fade is the *only* scroll motion, applied uniformly
  site-wide. impeccable craft-floor: *"one authored moment, not one identical entrance on
  every section… reach past transform and opacity: blur, backdrop-filter, clip-path, mask,
  shadow."* → **Fix (Phase 2+3):** staggered child reveals + a small set of differentiated
  reveal variants; add depth/clip to the signature moments. Reduced-motion gated.
  Command analogue: `animate`.
- **[P1] Same-size cards as the page structure** ("the lazy container"). The uniform
  card walls: `about/AboutFocusAreas.astro` (6 categories × identical `theme-grid`),
  `vision/VisionImpactGrid.astro` (7 uniform `theme-card`s), and the three Research grids
  (`Publications.astro`/`Conferences.astro`/`ResearchCard.astro`) differ only by accent
  hue. → **Fix (Phase 3):** hierarchy + a featured/lead treatment per wall; break the
  grid monotony. Command analogue: `layout` / `bolder`.

**P2 — depth & weak-view entries**

- **[P2] Depth is flat.** 4 ad-hoc shadows, no elevation scale; card "depth" is a
  zero-offset accent wash + border (halo, not elevation — craft-floor flags this).
  → **Fix (Phase 2):** a real elevation scale (offset+blur), applied on hover/featured.
- **[P2] Research view has no entry / flat hierarchy.** Three stacked identical
  heading+grid blocks read as a link list. → **Fix (Phase 3, first):** a lightweight
  section-lead + featured-item treatment; differentiate the three blocks.
- **[P2] Contact view is generic.** `Contact.astro` `connect-card` grid, no visual
  ambition. → **Fix (Phase 3):** depth + one decorative gradient/SVG accent (Experience
  mode: let it feel like an invitation).

**P3 — polish**

- **[P3] Section header rhythm.** Verify computed space *above* each heading > space
  below (craft-floor). `ui/Section.astro` / `.section-header`.
- **[P3] Heading balance.** Ensure display headings use `text-wrap: balance`; tracking
  floor -0.04em on large display.
- **[P3] Imagery scarcity.** One portrait, one quote image. Per user: self-made abstract
  SVG / gradient-mesh dividers allowed (NO fake photos/credentials) — use as weak-view
  section-lead backdrops and dividers, one signature per view (`frontend-design`:
  "spend your boldness in one place").

## Positive findings (preserve, replicate)

- The home hero (portrait + serif-italic H1 + metric tiles + thirukural art) is a genuine
  Experience-mode thesis — the model to lift the weak views toward.
- Token system, theme fidelity, and token-sync CI are exemplary — extend the ladders,
  never inline literals.
- Experience timebar + Vision hub/flow-chevrons are distinctive interactive moments —
  leave them; only add stagger.

## Work mapping

- **Phase 2 (design-guardian, `global.css`):** elevation scale; motion/choreography
  tokens + a few gated `@keyframes` + stagger-delay system; reveal variants;
  `--view-accent-research/-experience/-contact` for SSOT parity.
- **Phase 3 (page-* agents):** research → contact → the three card walls; a reusable
  accent-driven decorative SVG/gradient primitive (one signature per view).
- **Phase 4:** re-score (target ≥18/20), a11y contrast light+dark, visual-verify
  before/after, PR.
