# Icon standardization — reference

Companion to [SKILL.md](SKILL.md). Load when auditing a specific view or
debugging color/size drift.

---

## Complete token table

All in `src/styles/global.css` `:root` unless noted.

| Token                     | Value                               | Phase | Role                           |
| ------------------------- | ----------------------------------- | ----- | ------------------------------ |
| `--mark-slot`             | 44px                                | 1     | Circular chrome outer diameter |
| `--mark-glyph`            | 22px                                | 1     | Inner glyph size (50% fill)    |
| `--vision-hub-glyph`      | `var(--mark-glyph)`                 | 1     | VisionHub emblems              |
| `--icon-xs` … `--icon-xl` | 14–32px                             | 1     | Lucide `Icon` size prop scale  |
| `--icon-md`               | 20px                                | 1     | Kaggle stat icons              |
| `--icon-sm`               | 16px                                | 1     | Kaggle block icons             |
| `--mark-border-width`     | 1px                                 | 2     | Accented circle border         |
| `--mark-bg-mix`           | 14%                                 | 2     | Circle background wash         |
| `--mark-border-mix`       | 35%                                 | 2     | Circle border tint             |
| `--mark-fg`               | `var(--accent-card, var(--accent))` | 3     | Glyph + wash + border source   |
| `--accent-card`           | contextual                          | 3     | Card/tile accent hook          |
| `--brand-mark`            | `var(--heading)`                    | 3     | Neutral brand icon ink         |
| `--logo-surface`          | `#ffffff`                           | 3     | LogoBadge pill background      |

**Compact override:** `.icon-tile--compact { --mark-slot: 36px; --mark-glyph: 18px; }`

**Vision hub geometry (cqi):**

```css
--vision-hub-node: calc(100cqi * var(--mark-slot) / var(--vision-hub-max));
--vision-hub-center: var(--vision-hub-node);
```

---

## Rendered size matrix

| Context                        | Slot          | Glyph        | Notes                                       |
| ------------------------------ | ------------- | ------------ | ------------------------------------------- |
| Recog tile / award card header | 44            | 22           | `.icon-tile--round.icon-tile--accented`     |
| Education stat / highlight     | 44            | 22           | same                                        |
| Kaggle competition header      | 44            | 22           | same                                        |
| Kaggle stat grid               | —             | 20           | `.blob-icon--md`, color via `--accent-card` |
| Kaggle summary/eval            | —             | 16           | `.blob-icon--sm`, color via `--accent-card` |
| Vision hub node/center         | cqi-scaled 44 | 22           | inherits circular mark chrome               |
| Vision theme-card emblem       | 44            | 22           | `.theme-card__icon`                         |
| Experience project             | 36            | 18           | `.icon-tile--compact.icon-tile--accented`   |
| Contact connect                | 44            | 22           | `CardMark variant="accented"`               |
| Header chrome                  | —             | Lucide md/lg | `Icon.astro` only, no raster                |

---

## Per-view consistency matrix

| View                 | Section IDs                         | Accent source                                   | Tier-1 mark color                             | Tier-3 logos                          |
| -------------------- | ----------------------------------- | ----------------------------------------------- | --------------------------------------------- | ------------------------------------- |
| About                | hero, thirukural, leadership        | `--cat` on focus rows                           | `--accent-card`                               | Collab org logos on white pill        |
| Experience           | experience                          | `--lvl` per role seniority (`.xp-level-*`)      | Projects: compact accented tile (`--lvl` hue) | Company `LogoBadge`                   |
| Research             | publications, conferences, speakers | section ID + `.card-accent`                     | `--accent-card` on fallback icons             | Org logos on white pill               |
| Recognition          | awards, kaggle, education           | `--lvl`, `--medal`, gold                        | `--accent-card` everywhere in card            | None for pipeline marks               |
| Vision (programs)    | vision-programs                     | `accent` key per group/program                  | `--accent-card` via `.vision-accent-*`        | Program org logos, accent-tinted pill |
| Vision (impact grid) | inside vision-programs              | `orgCards[].accent` 3 groups (ai/gxp/strategic) | `--accent-card` via `.vision-accent-*`        | Emblem circle marks                   |
| Contact              | contact                             | `.card-accent`                                  | `--brand-mark` exception in circle            | N/A                                   |

---

## `--accent-card` sources (exhaustive)

| Wrapper class / selector                                                        | Sets `--accent-card` to                                                                               |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `.card-accent`                                                                  | `var(--accent)`                                                                                       |
| `#publications .card-accent`                                                    | `var(--lvl-director)` (teal)                                                                          |
| `#conferences .card-accent`                                                     | `var(--lvl-senior-director)` (blue)                                                                   |
| `#speakers .card-accent`                                                        | `var(--accent-gold)`                                                                                  |
| `#awards .recog-summary .theme-card.card` + `#awards .recog-card` level classes | `var(--lvl-*)` per award level (stat tiles + grid cards)                                              |
| `#awards .recog-chip.is-active` (with `.level-*`)                               | `var(--lvl-*)` per award level (active filter chip)                                                   |
| `.recog-card.blob--silver/bronze`                                               | `var(--medal)`                                                                                        |
| `.edu-accent`                                                                   | `var(--accent-gold)`                                                                                  |
| `.xp-stop` / `.xp-panel` (via `.xp-level-*`)                                    | `var(--lvl)` per role seniority                                                                       |
| `.leadership__card-row.cat-*`                                                   | `var(--cat)`                                                                                          |
| `.vision-accent-{key}` + `.vision-accent-hook`                                  | `var(--cat)` from content `accent` (vision-programs flow + impact grid; VI-001 superseded 2026-07-06) |

When wrapper sets `--accent-card`, circular marks pick it up via `--mark-fg`
without extra props.

---

## Component decision tree

```
Need a visual mark in a card?
│
├─ Multi-color org wordmark? → CardMark logoUrl → LogoBadge (Tier 3)
│
├─ logo_* pipeline slug?
│   ├─ In theme-card / emblem circle? → CardMark mark + context="theme-card"
│   ├─ In accented tile (Recognition, Education stat)? → MarkEmblem in
│   │   .icon-tile.icon-tile--round.icon-tile--accented
│   ├─ In bare stat span (Kaggle)? → MarkEmblem in .blob-icon--md/sm wrapper
│   └─ Vision hub node? → MarkEmblem in .vision-hub__node (chrome inherited)
│
└─ No asset / Lucide fallback?
    ├─ Card has section/level accent? → CardMark variant="accented"
    ├─ Subordinate nested card (Experience project)? → .icon-tile--compact.icon-tile--accented
    └─ Generic soft slot? → .icon-tile (Tier 2)
```

---

## CSS selectors — do not duplicate

These are the **only** accented circular chrome definitions:

```css
.theme-card__icon,
.icon-tile.icon-tile--round.icon-tile--accented,
.vision-hub__node,
.vision-hub__center {
  /* geometry + color via --mark-fg */
}
```

Glyph sizing inside tiles:

```css
.icon-tile :is(svg, .mark-emblem, img:not(.comp-image)),
.theme-card__icon :is(svg, .mark-emblem) {
  width: var(--mark-glyph);
  height: var(--mark-glyph);
}
```

---

## Anti-patterns

| Violation                                                    | Symptom                                    | Fix                                                                 |
| ------------------------------------------------------------ | ------------------------------------------ | ------------------------------------------------------------------- |
| Raster pipeline mark as `<img>`                              | Black box, theme-blind                     | Route to `MarkEmblem`                                               |
| `logo_*` slug in `.comp-image`                               | Cover-fill org-style tile                  | Third branch: MarkEmblem in accented tile                           |
| Hardcoded `width: 22px` on mark                              | Breaks token SSOT                          | Use `--mark-glyph` or `--icon-md/sm`                                |
| `.icon-tile--accented` without `--round`                     | Square accented tile                       | Add `icon-tile--round`                                              |
| Hand-rolled `color-mix` on new slot                          | Drift from 14%/35% recipe                  | Use the circular mark chrome rule                                   |
| `.recog-tile__count { color: var(--accent) }`                | Purple count on gold tile                  | `--accent-card`                                                     |
| `#awards` accent bridge scoped to `.recog-card` only         | Purple stat tiles/chips despite `.level-*` | Include `.recog-summary .theme-card.card` + `.recog-chip.is-active` |
| Fallback icon without `variant="accented"` on `.card-accent` | Purple icon, teal border                   | `CardMark variant="accented"`                                       |
| `.blob-block__icon { color: var(--accent-light) }`           | Wrong hue in medal card                    | `--accent-card`                                                     |
| VisionHub ring uses raw `--accent`                           | Ignores per-item `accent`                  | `.vision-accent-hook` → `--accent-card`                             |
| Per-component scoped `.mark-emblem { width: … }`             | Overrides token hierarchy                  | Delete; use global glyph rule                                       |
| Skip `normalize-mark-viewbox.py` after regen                 | Uneven glyph footprints                    | apply + check                                                       |

---

## Pipeline & verification commands

```bash
# After any marks/ regeneration
python3 scripts/icons/normalize-mark-viewbox.py apply
python3 scripts/icons/normalize-mark-viewbox.py check   # must exit 0

# After icon-sets.json / generator changes
npm run test:icons   # = python3 tests/run-icon-tests.py

# Icon size token SSOT (icon-render.ts vs global.css) — also part of npm run verify
npm run check:tokens

# Build gate
npm run build
```

**Square-center source PNGs** (before vectorize):

```bash
python3 .claude/skills/icon-square-center/scripts/square-and-center-icon.py \
  --src ~/workspace/icon_collections_resized --out ~/workspace/icon_collections_resized --all
```

Install resized PNGs per `docs/icon-collections-install.md`, then generate SVGs.

---

## Related files

| File                                                | Contents                        |
| --------------------------------------------------- | ------------------------------- |
| `src/styles/global.css`                             | Token + chrome SSOT             |
| `src/components/ui/CardMark.astro`                  | Card mark routing               |
| `src/components/ui/MarkEmblem.astro`                | Mask renderer                   |
| `src/components/ui/Icon.astro`                      | Lucide + brand mono             |
| `src/lib/icon-render.ts`                            | Brand mono set, size tokens     |
| `src/lib/logo-display.ts`                           | `logoHasOwnRing`, badge routing |
| `scripts/icons/normalize-mark-viewbox.py`           | Equal ink-footprint gate        |
| `docs/icon-blend-strategy.md`                       | Ratified blend strategy         |
| `.claude/references/design-consistency-contract.md` | §5 card/mark shells             |
