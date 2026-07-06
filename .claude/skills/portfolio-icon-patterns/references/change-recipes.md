# Change recipes

Step-by-step for each aspect and for adding a mark. Ownership note: `global.css`
is the design guardian's file — token changes land there; content JSON and
view-specific markup are the page agents' files. Always **read before edit** and
batch edits to one file into a single pass.

## Change size

1. Circular marks site-wide: edit `--mark-slot` and/or `--mark-glyph` in `global.css :root`. One edit resizes every circular icon.
2. One context only: override `--mark-glyph` (and `--mark-slot` if needed) on that context's wrapper class — do not touch `:root`. Compact tiles already do this via `--mark-glyph-compact`.
3. A standalone `Icon`: pass `size="lg"` (token) or `size={number}`; prefer the `--icon-*` token names over raw numbers.
4. Verify: `npm run check:tokens` (guards the `--icon-*` ↔ `ICON_SIZE_TOKENS` mirror), then `npm run build`.

## Change color

1. Never set a hex or `color-mix` on the mark itself. Set `--accent-card` on the owning wrapper.
2. View default: change `--view-accent-<view>` in `global.css`.
3. Section/category: set `--accent-card: var(--cat-x, var(--view-accent-<view>))` on the section wrapper.
4. The mark re-tints automatically: `--mark-fg` drives glyph `currentColor`; `--mark-chrome` drives chrome bg (`--mark-bg-mix` 14%) and ring (`--mark-border-mix` 35%).
5. Brand marks (`BRAND_MONO_ICONS`) intentionally ignore the accent and use `--brand-mark` — leave them alone.

## Change chrome / shape

1. Circular chrome: use `.theme-card__icon` (a `--mark-slot` box with `border-radius:50%`, `--mark-chrome`-mixed bg/ring). Adjust ring weight via `--mark-border-width`, opacity via `--mark-bg-mix` / `--mark-border-mix`.
2. Soft tile: use `.icon-tile` (accent-soft background); add `--accented` for accent-mixed bg, `--round` for a circle, `--compact` for the 36/18 size.
3. Do not hand-write `border-radius` or a fixed slot px on a mark — pick the variant class.
4. Pipeline marks (`logo_*`) already draw their own ring (`logoHasOwnRing()`) — render them bare, not inside a second chrome circle.

## Change glyph / selection

1. Semantic icon: set `icon: "<IconName>"` in the content JSON. Name must exist in `iconNameSchema` (`src/lib/icons.ts`) or the build fails; use `resolveIcon()`'s fallback (`folder` / `diamond`) only as a deliberate placeholder.
2. Add a brand-new semantic icon: add the name to `iconNameSchema`, add its path markup to `src/lib/icon-paths.json` (24×24; filled icons use `fill="#000"` which is swapped to `currentColor` at render), and — if filled/brand — add it to `FILLED_ICONS` / `BRAND_MONO_ICONS` in `icon-render.ts`.
3. Card slot: pass `icon` + `iconFallback` to `CardMark`, or a `VisionMark {kind:'icon', name}` via `mark`.
4. Never inline an emoji or unicode glyph in markup — route through the icon system.

## Change logo source

1. Add the asset file to `public/assets/logos/org/` (org logos) or `public/assets/logos/marks/` (pipeline marks). Extensions resolve in order `png, svg, webp, avif` via `logoSrc()`.
2. Reference by **slug** in content: `logo: "<slug>"`, or `VisionMark {kind:'logo', asset:'<slug>'}`. Never a bare `<img src>`.
3. Badge vs bare: `LogoBadge` adds a white pill by default; `PLAIN_LOGO_SLUGS` opt out. `logoHasOwnRing()` (slug `logo_*`) skips extra chrome. Slot shape resolves through `resolveLogoSlot()`.

## Define a new pipeline mark (raster → SVG → wired)

1. Generate: `./scripts/icons/batch-icon-generate.sh <src-dir> [flags]` (per-archetype mask flags — e.g. `--colored-glyph`, `--alpha-glyph` — trace raster PNG → optimized recolorable SVG on a 24×24 canvas). Requires `potrace` + `svgo`.
2. Normalize: `python3 scripts/icons/normalize-mark-viewbox.py apply` so the glyph sits optically centered at one scale.
3. Install: place the `logo_<name>.svg` in `public/assets/logos/marks/`.
4. Wire: reference it as `VisionMark {kind:'logo', asset:'logo_<name>'}` (or a semantic `icon` if it's a UI glyph, per "Change glyph").
5. Test the pipeline itself with `python3 tests/run-icon-tests.py` (golden byte-diff + semantic centering).

## Change one aspect across all views (batch)

1. Decide the single token that owns the aspect (e.g. `--mark-glyph` for glyph size, `--view-accent-<view>` for view tint).
2. Edit it **once** in `global.css :root` (guardian's file).
3. Read the affected view components in parallel and spot-check that none hardcode the value (see `anti-patterns.md`); fix any that bypass the token.
4. Verify once: `npm run check:tokens` → `python3 scripts/icons/normalize-mark-viewbox.py check` → `npm run build` (or `npm run verify`).
