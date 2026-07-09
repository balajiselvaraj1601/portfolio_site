# Token reference

Exact icon / mark token names and values. **These tables mirror the code SSOT** —
`src/styles/global.css` (`:root`) and `src/lib/icon-render.ts`. They are for
lookup and drift-checking, not a second source of truth: if a value here disagrees
with the source file, the source file wins and this table is stale. `npm run
check:tokens` enforces the size-scale half of the mirror.

## Icon size scale

Mirrors `ICON_SIZE_TOKENS` in `src/lib/icon-render.ts`; consumed by `Icon.astro`'s `size` prop (token or number).

| Token | CSS var      | px                 |
| ----- | ------------ | ------------------ |
| `xs`  | `--icon-xs`  | 14                 |
| `sm`  | `--icon-sm`  | 16                 |
| `md`  | `--icon-md`  | 20 (Icon default)  |
| `lg`  | `--icon-lg`  | 24                 |
| `xl`  | `--icon-xl`  | 32                 |
| —     | `--size-dot` | 8 (indicator dots) |

## Mark chrome (circular icon container)

| Token                  | Value               | Role                                                      |
| ---------------------- | ------------------- | --------------------------------------------------------- |
| `--mark-slot`          | `44px`              | container width/height (compact tiles override to `36px`) |
| `--mark-glyph`         | `22px`              | inner glyph size (default)                                |
| `--mark-glyph-compact` | `18px`              | compact in-circle glyph                                   |
| `--vision-mark-glyph`  | `28px`              | unified Vision-page circle-mark glyph (hub + impact)      |
| `--vision-hub-glyph`   | `var(--mark-glyph)` | VisionHub center + satellite emblems                      |
| `--mark-border-width`  | `1px`               | chrome ring width                                         |

> Comment in source: "**change these two values to resize circular icons site-wide**" — `--mark-slot` and `--mark-glyph`.

## Color mixing

| Token               | Value                                               | Role                                                                                             |
| ------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `--mark-fg`         | `var(--accent-card, var(--accent))`                 | glyph / MarkEmblem `currentColor`                                                                |
| `--mark-chrome`     | `var(--accent-card, var(--mark-fg, var(--accent)))` | chrome bg/border hook (set on `.theme-card__icon`)                                               |
| `--mark-bg-mix`     | `14%`                                               | chrome background opacity when mixed with the accent                                             |
| `--mark-border-mix` | `35%`                                               | chrome border opacity when mixed with the accent                                                 |
| `--brand-mark`      | `var(--heading)`                                    | neutral ink for official brand marks; flips near-black (light) / near-white (dark) automatically |
| `--accent-soft`     | `rgba(108,47,191,0.10)` light / `0.15` dark         | soft tile background for `.icon-tile`                                                            |

## Accent hook

`--accent-card` is the single tint hook set on the owning wrapper (`.card-accent` sets `--accent-card: var(--accent)` and re-derives `--mark-fg`). Marks read `--mark-fg` / `--mark-chrome` from it — see the cascade diagram in SKILL.md.

## Per-view accent matrix

Each page wrapper sets a view default; sections/categories override `--accent-card` on top of it.

| View        | `--view-accent-*`           | Resolves to                           |
| ----------- | --------------------------- | ------------------------------------- |
| About       | `--view-accent-about`       | `--accent` (purple, brand)            |
| Experience  | `--view-accent-experience`  | `--accent` (purple)                   |
| Research    | `--view-accent-research`    | `--lvl-senior-director` (indigo/blue) |
| Recognition | `--view-accent-recognition` | `--accent-gold` (gold)                |
| Vision      | `--view-accent-vision`      | `--lvl-director` (teal)               |
| Contact     | `--view-accent-contact`     | `--accent` (purple)                   |

## Categorical accents

Used by Vision board groups and the About section; a section sets `--accent-card: var(--cat-x, var(--view-accent-…))`.

| Token             | Meaning                   | Light value                              |
| ----------------- | ------------------------- | ---------------------------------------- |
| `--cat-ai`        | AI Governance             | `--lvl-cio` (purple `#6c2fbf`)           |
| `--cat-platform`  | Platform & Infrastructure | `--lvl-director` (teal `#10897f`)        |
| `--cat-impact`    | Business & P&L Impact     | `--accent-gold` (gold)                   |
| `--cat-people`    | Team & Org Building       | `--lvl-national` (rose `#cf3168`)        |
| `--cat-strategic` | Strategic                 | indigo/blue family                       |
| `--cat-privacy`   | Privacy                   | red family                               |
| `--cat-gxp`       | GxP Compliance            | green (`#2c8a45` light / `#46cf72` dark) |

Vision mirrors these as `--vision-accent-*` (e.g. `--vision-accent-ai: var(--cat-ai)`), plus `--vision-accent-silver: var(--medal-silver)`. Dark theme redefines the `--lvl-*` / `--cat-*` hex values for contrast; the token names are identical, so referencing tokens (never hex) is what makes marks theme-safe.

## Registry & classification sets (`src/lib/icon-render.ts`)

- `FILLED_ICONS` = `linkedin, kaggle, github, gmail, trophy-cup` — rendered filled (Simple Icons geometry); all others stroked (Lucide, `stroke-width` 1.8).
- `BRAND_MONO_ICONS` = `linkedin, github, kaggle, gmail` — rendered in `--brand-mark` neutral ink, not the context accent. (`trophy-cup` is filled but **not** a brand, so intentionally excluded.)
- `iconBody(name)` swaps `fill="#000"` → `fill="currentColor"` for filled icons at render time.
