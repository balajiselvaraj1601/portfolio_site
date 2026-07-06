---
name: portfolio-icon-standardization
description: >-
  Enforce portfolio site icon size, circular chrome, and color-blending SSOTs
  when adding marks, auditing consistency, or fixing icon drift. Covers
  MarkEmblem/Icon delivery tiers, --mark-slot/--mark-glyph/--mark-fg tokens,
  circular mark chrome, --accent-card inheritance, CardMark routing,
  and per-view accent hooks. Trigger on "icon standardization", "standardize
  icons", "icon size consistency", "icon chrome", "icon color blending",
  "mark tokens", "accent-card icons", or before shipping new card/header marks.
---

# Portfolio icon standardization Skill

Binding SSOT for **size** (phase 1), **circular chrome** (phase 2), and **color
blending** (phase 3) across the Astro portfolio. Ratified in
`docs/icon-blend-strategy.md` and `.claude/references/design-consistency-contract.md` §5.

**Repo:** `/home/engineer/workspace/portfolio_site`

## When to use

- Adding or moving a mark on any card, tile, hub, or section
- Auditing icon size / shape / tint drift across nav views
- Wiring a new `logo_*.svg` pipeline mark into a component
- Reviewing a PR that touches `MarkEmblem`, `CardMark`, `.icon-tile`, or mark CSS

**Related skills (load when needed, do not duplicate):**

| Task                                 | Skill                   |
| ------------------------------------ | ----------------------- |
| Square-center source PNGs            | `icon-square-center`    |
| Crop SVG viewBox / visible ink       | `svg-logo-crop`         |
| Full asset inventory / missing logos | `portfolio-icon-audit`  |
| Cross-view design conflicts          | `page-consistency-team` |

---

## Core rule

> **Monochrome semantics ⇒ vector delivery.** Any icon whose meaning survives a
> single ink color must render as `currentColor` vector — `Icon.astro` (Lucide /
> Simple Icons) for UI chrome, `MarkEmblem` + `logo_*.svg` for content marks.

Raster `<img>` is **Tier 3 only** — org wordmarks in `.logo-badge` /
`.comp-image`. Opaque PNGs cannot be tinted; never route pipeline marks through
`<img>`.

---

## Three delivery tiers

| Tier                  | Mechanism                                          | Color                                   | When                                           |
| --------------------- | -------------------------------------------------- | --------------------------------------- | ---------------------------------------------- |
| **1 — Vector tinted** | `MarkEmblem` (CSS mask) or `Icon` (`currentColor`) | `--mark-fg` / parent `color`            | Pipeline `logo_*`, Lucide fallbacks, hub nodes |
| **2 — Soft tile**     | `.icon-tile` without `--accented`                  | `--accent-soft` bg, `--accent-ll` glyph | Generic fallback when no section accent needed |
| **3 — Full-color**    | `LogoBadge` `<img>`                                | Brand pixels unchanged                  | Org wordmarks, collaboration logos             |

**Intentional exceptions (do not “fix”):**

- Contact connect tiles: brand icons use `.icon--brand` → `--brand-mark` inside accented circles
- Experience nested projects: `.icon-tile--compact.icon-tile--accented` (seniority-hued, subordinate to company block)
- Org logos: never mask or recolor

---

## Token SSOT (`src/styles/global.css`)

Change **these tokens** to resize or retint marks site-wide — never hardcode px/rem
on mark slots.

### Size (phase 1)

| Token                 | Default                 | Use                                    |
| --------------------- | ----------------------- | -------------------------------------- |
| `--mark-slot`         | 44px                    | Circular chrome diameter               |
| `--mark-glyph`        | 22px                    | Inner glyph (50% of slot)              |
| `--vision-hub-glyph`  | alias of `--mark-glyph` | VisionHub center + satellites          |
| `--icon-md`           | 20px                    | Kaggle stat row (`.blob-icon--md`)     |
| `--icon-sm`           | 16px                    | Kaggle summary/eval (`.blob-icon--sm`) |
| `.icon-tile--compact` | 36 / 18                 | Compact tiles (Experience projects)    |

**Kaggle in-card size hierarchy (binding):** header 22px → stats 20px → blocks 16px.
Do not collapse to one size.

### Chrome (phase 2)

Shared primitive: the circular mark chrome rule in global.css, whose selectors are:

- `.theme-card__icon`
- `.icon-tile.icon-tile--round.icon-tile--accented`
- `.vision-hub__node`, `.vision-hub__center`

| Aspect          | Token                 | Value  |
| --------------- | --------------------- | ------ |
| Shape           | `border-radius: 50%`  | circle |
| Border          | `--mark-border-width` | 1px    |
| Background wash | `--mark-bg-mix`       | 14%    |
| Border tint     | `--mark-border-mix`   | 35%    |

**Required class pairing:** pipeline marks in cards use **both** `icon-tile--round`
and `icon-tile--accented`. Never hand-roll accent washes on new slots.

### Color (phase 3)

| Token           | Resolves to                               | Use                                       |
| --------------- | ----------------------------------------- | ----------------------------------------- |
| `--accent-card` | set on wrapper                            | Card border, tile accent, level/medal hue |
| `--mark-fg`     | `var(--accent-card, var(--accent))`       | Glyph + circle wash + border              |
| `.card-accent`  | sets both `--accent-card` and `--mark-fg` | Default purple card shells                |

**Color flow:** wrapper sets `--accent-card` → the circular mark chrome rule reads
`--mark-fg` → `MarkEmblem` mask fills with `currentColor`.

Section overrides (Research): `#publications .card-accent` (teal),
`#conferences` (blue), `#speakers` (gold).

---

## Component routing

### `CardMark.astro` — SSOT for card marks

| Input                                               | Renders as                            |
| --------------------------------------------------- | ------------------------------------- |
| `logoUrl`                                           | `LogoBadge` (Tier 3)                  |
| `mark` + `context="theme-card"` or `emblemInCircle` | `.theme-card__icon` + MarkEmblem/Icon |
| `logo_*` slug, bare                                 | `MarkEmblem` only                     |
| `icon` fallback                                     | `.icon-tile` (+ modifiers)            |

**Variants:**

- `variant="accented"` or `variant="recog"` → adds `icon-tile--accented`
- `variant="compact"` → 36/18 slot
- On `.card-accent` shells with section hue: always pass `variant="accented"` for Lucide fallbacks

### `MarkEmblem.astro`

- Mask + `background: currentColor`; `--emblem: url(...)` inline
- Parent must set `color` (via accented circle or explicit `color:` on bare span)
- Slug must resolve under `public/assets/logos/marks/logo_*.svg`

### Bare-span sizing (Kaggle stats/blocks)

```astro
<span class="blob-stat__icon" aria-hidden="true">
  <span class="blob-icon--md">
    <MarkEmblem mark={{ kind: 'logo', asset: slug }} />
  </span>
</span>
```

`.blob-stat__icon` / `.blob-block__icon`: `color: var(--accent-card, var(--medal))`.

### `Icon.astro`

- Default: `currentColor`
- Brand mono (`gmail`, `linkedin`, `github`, `kaggle`): `.icon--brand` → `--brand-mark`

---

## Per-view accent sources

Set `--accent-card` on the **owning wrapper**; marks inherit automatically.

| View / section     | `--accent-card` source                                                                    |
| ------------------ | ----------------------------------------------------------------------------------------- |
| Awards             | `--lvl` per award level                                                                   |
| Kaggle tiles/cards | `--medal` (silver/bronze classes)                                                         |
| Education          | `.edu-accent { --accent-card: var(--accent-gold) }`                                       |
| Experience         | `.xp-level-*` sets `--lvl`; `.xp-stop`/`.xp-panel` map it to `--accent-card`              |
| Leadership         | `--cat` per category row                                                                  |
| Research cards     | `.card-accent` + section ID override                                                      |
| Vision (all slots) | `accent` key in JSON → `.vision-accent-{key}` + `.vision-accent-hook` (`--cat-*` palette) |
| Contact            | default `.card-accent` (purple)                                                           |

Full matrix: [references/accent-matrix-and-anti-patterns.md](references/accent-matrix-and-anti-patterns.md).

---

## Workflows

### A — Add a new pipeline mark

```
Progress:
- [ ] Source PNG square-centered (icon-square-center) if from icon_collections
- [ ] Generate logo_<stem>.svg → public/assets/logos/marks/
- [ ] normalize-mark-viewbox.py apply && check
- [ ] npm run test:icons (if generator config changed)
- [ ] Wire slug in content JSON as { kind: "logo", asset: "logo_..." }
- [ ] Render via MarkEmblem inside correct tier (accented circle vs bare span)
- [ ] Set --accent-card on wrapper if contextual hue needed
- [ ] npm run build
```

Generator flags for icon_collections line art:
`--sizes 512 --no-badge --tight --turdsize 2 --no-circle` (do **not** run full
batch-icon-generate on this set — destroys line art).

### B — Audit icon consistency on a view

1. List every mark slot in the view (tiles, card headers, stats, hubs)
2. For each slot, verify:
   - **Delivery tier** correct (vector vs logo badge)
   - **Size** uses token (not hardcoded px on component)
   - **Chrome** uses the circular mark chrome recipe if accented
   - **Color** glyph + wash match card `--accent-card` (check `.recog-tile__count` too)
3. Flag drift using [references/accent-matrix-and-anti-patterns.md § Anti-patterns](references/accent-matrix-and-anti-patterns.md#anti-patterns)
4. Fix guardian-owned tokens in `global.css` first; then page-owned markup

### C — Verify before handoff

```bash
python3 scripts/icons/normalize-mark-viewbox.py check
npm run check:tokens
npm run build
```

Spot-check light + dark: Recognition (level/medal hues), Research (section-hued
fallback icons), Vision (hub ring + nodes), Contact (brand neutral marks).

---

## Guardian vs page-agent ownership

| Change                                                              | Owner                 |
| ------------------------------------------------------------------- | --------------------- |
| New/changed tokens in `:root`, circular mark chrome, `.card-accent` | design-guardian       |
| `CardMark`, `MarkEmblem`, `VisionHub`, `global.css` mark primitives | design-guardian       |
| Content JSON slug re-pointing, section markup, per-view wrappers    | page-* agents         |
| `docs/icon-blend-strategy.md`, design contract §5                   | either (keep in sync) |

**Order:** guardian primitives land before page agents edit dependent markup (BC2).

---

## Quick reference — common markup

**Recognition summary tile:**

```astro
<div class="icon-tile icon-tile--round icon-tile--accented" aria-hidden="true">
  <MarkEmblem mark={{ kind: 'logo', asset: 'logo_trophy_badge' }} />
</div>
```

**Research fallback (section-hued):**

```astro
<CardMark icon={icon} iconFallback="document" variant="accented" />
```

**Vision hub accent wrapper:**

```astro
<div
  class:list={[
    'vision-hub-accent',
    'vision-accent-hook',
    `vision-accent-${group.accent}`,
  ]}
>
  <VisionHub group={group} />
</div>
```

---

## When to load references

| If the task involves…                                     | Load                                              |
| --------------------------------------------------------- | ------------------------------------------------- |
| The full per-view accent matrix or an anti-pattern check  | `references/accent-matrix-and-anti-patterns.md`   |
| Ratified blend decisions / design-contract wording        | `docs/icon-blend-strategy.md`, design contract §5 |
| Adding or auditing a mark with the tokens above (default) | Inline guidance — no reference needed             |

## Efficiency: batch edits and parallel calls

- **Guardian tokens first:** edit `global.css` tokens in one pass, then page markup — never interleave.
- **Batch edits:** combine multiple token or markup changes to one file into a single Edit call.
- **Parallel checks:** run `normalize-mark-viewbox.py check` and the `npm run build` verification together.

## Quick reference: where to go deeper

| Topic                                             | Reference file                                                                                 |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Per-view accent matrix, accent map, anti-patterns | [references/accent-matrix-and-anti-patterns.md](references/accent-matrix-and-anti-patterns.md) |
| Blend strategy (ratified decisions)               | `docs/icon-blend-strategy.md`                                                                  |
| Design contract §5 (card/mark shells)             | `.claude/references/design-consistency-contract.md`                                            |
| Asset pipeline                                    | `docs/assets.md`                                                                               |
