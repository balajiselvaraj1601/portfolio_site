---
name: portfolio-icon-patterns
description: >-
  Define and change icon / glyph / mark aspects — size, color, chrome & shape,
  glyph selection, per-view accent — as generic, page-agnostic design patterns,
  and enforce one icon standard across every view. Use for "icon design
  patterns", "change icon size", "resize glyph", "recolor a mark", "change icon
  color", "icon shape / chrome", "standardize icons or glyphs across pages",
  "add a new mark", "icon consistency". Covers the four render components (Icon,
  MarkEmblem, CardMark, LogoBadge), the --mark-slot / --mark-glyph / --mark-fg /
  --accent-card tokens, and the accent cascade. NOT for inventorying or resolving
  missing assets and delegating generation (use portfolio-icon-audit); NOT for
  cropping raster PNGs or trimming SVG viewBoxes (use icon-square-center /
  svg-logo-crop); NOT for the card / box shell around a mark (use
  portfolio-card-shells). For the audit and anti-pattern enforcement pass, see
  portfolio-icon-standardization.
---

# Portfolio Icon Patterns Skill

The page-agnostic reference for how icons, glyphs, and marks are **defined** and
how each of their aspects is **changed** on this Astro portfolio. Every mechanism
below is token- and cascade-driven so one edit propagates to all seven views —
that is how the site keeps a single icon standard. Deep tables and step-by-step
recipes live in `references/`; the inline content answers the common case with
zero reference loads.

## Vocabulary — icon vs glyph vs logo

| Term      | What it is                                                             | Component                             | Color source                        | Size source                     | Content schema                                      |
| --------- | ---------------------------------------------------------------------- | ------------------------------------- | ----------------------------------- | ------------------------------- | --------------------------------------------------- |
| **Icon**  | Lucide (stroked) / Simple Icons (filled) inline SVG, 24×24 viewBox     | `Icon.astro`                          | `currentColor` (stroke or fill)     | `size` prop or `--icon-*` token | `icon: IconName`                                    |
| **Glyph** | A mark rendered as a fill — an icon or a masked logo tinted by context | `MarkEmblem.astro`                    | `currentColor` via `--mark-fg`      | `--mark-glyph` token            | `VisionMark` (`kind: 'icon' \| 'logo'`)             |
| **Logo**  | External brand asset (PNG/SVG/WebP/AVIF)                               | `LogoBadge.astro` / `MarkEmblem` logo | image ink, or masked `currentColor` | `size` prop / CSS constrain     | `logo: <slug>` or `VisionMark {kind:'logo', asset}` |

Registry: `iconNameSchema` / `IconName` in `src/lib/icons.ts` (62 names, `diamond`/`folder` fallbacks). `VisionMark` union in `src/schemas.ts`. Logos resolve by slug through `logoSrc()` against `public/assets/logos/{org,marks}/`.

## Render components

| Component          | Renders                                                                 | Reach for it when                                                         |
| ------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `Icon.astro`       | inline `<svg>` pulled from `icon-paths.json`                            | you have a semantic `IconName`                                            |
| `MarkEmblem.astro` | an `Icon` **or** a CSS-masked logo (discriminated on `VisionMark.kind`) | content supplies a `VisionMark`                                           |
| `CardMark.astro`   | routing layer: picks logo / mark / icon slot inside a card shell        | inside a card; pass `slug` / `logoUrl` / `mark` / `icon` + `iconFallback` |
| `LogoBadge.astro`  | `<img>` logo with optional pill or round chrome; `Icon` fallback        | an external logo asset, optional badge                                    |

Sizing is **CSS-token driven, not pixel props** — components read `--mark-slot` / `--mark-glyph`; only `Icon`'s `size` accepts a token (`xs…xl`) or number.

## The five changeable aspects

The core of this skill. Change an aspect through its mechanism only — never the "Never" column.

| Aspect                | Change via                                                                                                                         | Where                                                     | Never                                              |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------- |
| **Size**              | `--mark-glyph` / `--mark-slot` (circular marks); `--icon-*` token or `size` prop (Icon)                                            | `global.css :root`; Icon call site                        | raw `px` width/height on the component             |
| **Color**             | inherited `currentColor` from `--mark-fg` / `--mark-chrome`, driven by `--accent-card`                                             | wrapper sets `--accent-card`                              | hex literal or hand-rolled `color-mix` on the mark |
| **Chrome / shape**    | `.theme-card__icon` (circular, `border-radius:50%`) or `.icon-tile` (+ `--round` / `--accented`); `--mark-slot`, `--mark-border-*` | class on the slot wrapper                                 | ad-hoc `border-radius` or fixed slot size          |
| **Glyph / selection** | content `icon: IconName`, or `VisionMark {kind:'icon', name}`                                                                      | content JSON                                              | invalid name (fails build); inline emoji / unicode |
| **Logo source**       | content `logo: <slug>` → `logoSrc()`, or `VisionMark {kind:'logo', asset}`                                                         | content JSON; asset in `public/assets/logos/{org,marks}/` | bare `<img src>` hardcoded in markup               |

Step-by-step for each row (exact token, edit order, propagation) → `references/change-recipes.md`.

## The accent cascade (one tint hook)

`--accent-card` is the **single** color hook. Set it once on the owning wrapper; marks derive from it and never re-declare color:

```
--view-accent-<view>            (page wrapper: the view default)
  └─ --accent-card: var(--cat-x, var(--view-accent-<view>))   (section / category override)
       ├─ --mark-fg:     var(--accent-card, var(--accent))    → glyph currentColor
       └─ --mark-chrome: var(--accent-card, var(--mark-fg, var(--accent)))
            → chrome bg  = color-mix(… --mark-chrome --mark-bg-mix …)      (14%)
            → chrome ring = color-mix(… --mark-chrome --mark-border-mix …) (35%)
```

Set `--accent-card` on the wrapper and everything inside re-tints for free. The full per-view / categorical value matrix (`--view-accent-*`, `--cat-*`, `--vision-accent-*`) → `references/token-reference.md`.

## Standardization invariants (must hold in every view)

- **Circular chrome** is `border-radius:50%` on a `--mark-slot`×`--mark-slot` box — never a fixed px circle.
- **Tint** flows only through `--accent-card` inheritance; components carry no color literals.
- **Size** flows only through tokens (`--mark-slot` / `--mark-glyph` / `--icon-*`).
- **Pipeline marks** (slug `logo_*`, `logoHasOwnRing()`) already carry their own drawn ring — don't wrap them in a second chrome circle.
- **Official brand marks** (`github` / `linkedin` / `kaggle` / `gmail`, the `BRAND_MONO_ICONS` set) render in neutral `--brand-mark`, not the context accent.
- **Every mark's SVG is viewBox-normalized** (`normalize-mark-viewbox.py`) so glyphs sit optically centered at one scale.

## Workflows

- **Define a new mark** — raster → SVG via `scripts/batch-icon-generate.sh` → normalize viewBox → drop into `public/assets/logos/marks/` → reference as `VisionMark {kind:'logo', asset:'logo_x'}`, or add a name to `iconNameSchema` for a semantic icon. Full flow → `references/change-recipes.md`.
- **Change one aspect site-wide** — edit the token once in `global.css :root` (the design guardian owns `global.css`) → spot-check the seven views → verify. Full order → `references/change-recipes.md`.
- **Quick consistency check** — run `npm run check:tokens`; scan for the drift signatures in `references/anti-patterns.md`.

## When to load references

| If the task…                                                 | Load                            |
| ------------------------------------------------------------ | ------------------------------- |
| needs exact token names/values or the per-view accent matrix | `references/token-reference.md` |
| changes a specific aspect or adds a mark step-by-step        | `references/change-recipes.md`  |
| audits drift, or a mark renders wrong                        | `references/anti-patterns.md`   |

The common case — _which token, which component, which cascade_ — is answered inline above; no reference load needed.

## Efficiency: batch edits and parallel calls

- **Token-first**: change the value once in `global.css :root` and let inheritance propagate — do not edit N components for a global change.
- Read the affected view components **in parallel** before editing when a change spans views.
- Read a component before editing it; batch multiple edits to the same file into one pass.
- Run `check:tokens` + `build` **once** after the batch, not per file.

## Verification

- `npm run check:tokens` — `ICON_SIZE_TOKENS` ↔ `--icon-*` sync (`scripts/check-icon-token-sync.mjs`).
- `python3 scripts/normalize-mark-viewbox.py check` — mark viewBoxes normalized.
- `npm run build`, or `npm run verify` for the full gate.

## Quick reference: where to go deeper

| Reference                                                      | Load when                                                                                           |
| -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [references/token-reference.md](references/token-reference.md) | you need exact token names/values, the icon size scale, or the per-view / categorical accent matrix |
| [references/change-recipes.md](references/change-recipes.md)   | you're changing an aspect or adding a mark and want the exact file + token steps                    |
| [references/anti-patterns.md](references/anti-patterns.md)     | you're auditing drift or a mark renders wrong; includes the verification commands                   |
