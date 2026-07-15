---
name: portfolio-a11y-contrast
description: >-
  Enforce WCAG 2.1 AA across the Astro portfolio - especially the contrast of
  the per-view accent tokens (--view-accent-*, --cat-*, --lvl-*) against their
  actual surfaces, in BOTH light and dark themes, plus the post-deploy
  Lighthouse gate. Use for "accessibility", "a11y", "contrast", "WCAG",
  "Lighthouse", "focus ring", "reduced motion", or a "screen reader check". This
  skill AUDITS and reports; it computes ratios before a token change and hands
  the edits off. Do NOT use for SETTING token values - design-guardian owns
  `global.css` `:root`; this skill never edits the `:root` block itself. For the
  shell/box recipe use portfolio-card-shells; for cross-view design conflicts
  use page-consistency-team.
---

# Portfolio a11y & contrast Skill

The acceptance gate for **WCAG 2.1 AA** on this site. It verifies that every
color pair - text on background, and each accent hue on its surface - clears the
required contrast ratio in **both** the light and dark themes, that focus and
motion behavior is honored, and that the automated Lighthouse pass is green
post-deploy.

This skill is a **verifier, not a setter**. It measures, reports, and lists the
tokens that need to move; the actual `:root` edit is owned by `design-guardian`.

**Repo:** `/home/engineer/workspace/portfolio_site`

## Authorities (SSOT - do not duplicate their values)

| Source                                         | Owns                                                                                                                                                                      |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/accessibility.md`                        | The WCAG 2.1 AA acceptance checklist (structure, keyboard, contrast, motion)                                                                                              |
| `docs/design-direction.md` (contrast section)  | The contrast targets + which accent drives which view/surface                                                                                                             |
| `src/styles/global.css` `:root` (light + dark) | Every color token value - `--view-accent-*`, `--cat-*`, `--lvl-*`, `--medal-*`, `--focus-ring` - and the `prefers-reduced-motion` gating. **Owned by `design-guardian`.** |
| `docs/go-live-checklist.md` (Phase 3)          | The Lighthouse ≥ 95 gate + post-deploy verification                                                                                                                       |

Cite these; never paste a hex value or token definition into this skill or its
edits. Every token value lives once, in `global.css` `:root`.

## Core rule

> **Audit - report - hand token edits to `design-guardian`.**
> This skill computes contrast ratios and finds violations; it does **not** edit
> `global.css` `:root`. When a token fails, name the token and the failing
> theme/surface pair, then hand the fix to `design-guardian`.
>
> Every color pair must pass **WCAG 2.1 AA in BOTH the light and dark themes**:
>
> - **Body text ≥ 4.5:1** against its background (`--text` / `--text-muted` on
>   `--bg` / `--bg-alt` / `--bg-elev`).
> - **Large text ≥ 3:1**, and **UI components / focus indicators ≥ 3:1**
>   (`--focus-ring`, accent top-borders, icon strokes).
> - **Each accent hue passes against its actual surface** - every
>   `--view-accent-*`, `--cat-*` (incl. `--about-cat-*`), `--lvl-*`, and
>   `--medal-*` must clear its required ratio on the surface it is rendered on
>   (accents render on `--bg-elev` card shells; see the matrix reference).
> - **Information is never conveyed by color alone** - a color signal must be
>   paired with text, an icon, or shape (e.g. external-link icons on link lists).
> - **Lighthouse accessibility ≥ 95, zero serious violations, run post-deploy**
>   (`docs/go-live-checklist.md` Phase 3).

## What to check (map to the SSOT)

| Concern                       | Requirement                                                                       | SSOT                                         |
| ----------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------- |
| Body text contrast            | ≥ 4.5:1, both themes                                                              | `docs/accessibility.md` · design-direction   |
| Large text / UI / focus ring  | ≥ 3:1, both themes                                                                | `docs/accessibility.md`                      |
| Accent hue vs its surface     | Each `--view-accent-*` / `--cat-*` / `--lvl-*` / `--medal-*` ≥ 3:1 on `--bg-elev` | `references/accent-token-contrast-matrix.md` |
| Color not sole signal         | Pair color with text/icon/shape                                                   | `docs/accessibility.md`                      |
| Focus visible                 | `--focus-ring` outline on `:focus-visible`, ≥ 3:1                                 | `global.css` (owned by design-guardian)      |
| Reduced motion                | Non-essential motion gated behind `prefers-reduced-motion: no-preference`         | `global.css` · `docs/accessibility.md`       |
| Lighthouse gate               | a11y ≥ 95, zero serious, post-deploy                                              | `docs/go-live-checklist.md`                  |
| Keyboard + screen-reader pass | Manual passes of nav/menu/links/landmarks                                         | `references/lighthouse-and-manual-passes.md` |

## Workflow

1. **Scope.** Identify which tokens or surfaces changed (or are proposed to
   change). A token change touches every view that inherits it.
2. **Compute (before editing).** For a proposed token value, compute the
   contrast ratio against its surface in **both** themes _before_ anyone edits
   `:root` - see `references/contrast-check-procedure.md`.
3. **Audit the matrix.** Walk every accent family against its surface using
   `references/accent-token-contrast-matrix.md`.
4. **Report.** List each failing pair as `token · theme · surface · measured
ratio · required ratio`. Do not edit `:root`.
5. **Hand off.** Give the report to `design-guardian`, the sole editor of
   `global.css` `:root`, to apply token value changes.
6. **Gate.** After deploy, run the Lighthouse a11y audit and the manual
   keyboard/screen-reader passes - see
   `references/lighthouse-and-manual-passes.md`.

## When to load references

| If the task involves...                                        | Load                                         |
| ------------------------------------------------------------ | -------------------------------------------- |
| Computing a contrast ratio for a proposed token, both themes | `references/contrast-check-procedure.md`     |
| Which accent family is checked against which surface         | `references/accent-token-contrast-matrix.md` |
| The Lighthouse gate + manual keyboard/screen-reader passes   | `references/lighthouse-and-manual-passes.md` |
