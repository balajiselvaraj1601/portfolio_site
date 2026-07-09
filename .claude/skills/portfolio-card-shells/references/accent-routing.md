# Accent routing

How a box shell gets its color. The full mechanism behind the `--accent-card` core
rule. SSOT for the timeline and rationale is `docs/box-color-history.md`; schema
enums live in `src/schemas/`.

## The un-suppress pattern

```
--accent-card: var(--<item-token>, var(--view-accent-X));
```

A card's shell always reads `var(--accent-card, var(--accent))`. Three ways to feed it:

1. **Nothing set** → falls back to `--accent` (brand purple).
2. **View wrapper sets it** → all cards in the section share one hue.
3. **Item hook class sets an item token** (`--cat` / `--lvl` / `--medal`) and the
   card reads `var(--<item-token>, var(--view-accent-X))` — the item hue "un-suppresses"
   over the view fallback.

Example (Vision programs, `global.css` ~L851):

```css
.vision-accent-impact {
  --cat: var(--vision-accent-impact);
} /* item token */
.vision-accent-hook {
  --accent-card: var(--cat, var(--view-accent-vision));
}
```

`<li class="vision-accent-hook vision-accent-impact">` → `--cat` = gold →
`--accent-card` = gold → shell + marks recolor. Drop the item class and the card
falls back to the view's teal.

## What sets `--accent-card` (exhaustive)

| Wrapper class / selector                                                        | Sets `--accent-card` to                                                                                                                      |
| ------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `.card-accent`                                                                  | `var(--accent)` (brand purple)                                                                                                               |
| `#publications .card-accent`                                                    | `var(--cat-strategic)` (blue)                                                                                                                |
| `#conferences .card-accent`                                                     | `var(--cat-platform)` (teal)                                                                                                                 |
| `#speakers .card-accent`                                                        | `var(--cat-ai)` (purple)                                                                                                                     |
| `#awards .recog-summary .theme-card.card` + `#awards .recog-card` level classes | `var(--lvl-*)` per award level (stat tiles + grid cards)                                                                                     |
| `#awards .recog-chip.is-active` (with `.level-*`)                               | `var(--lvl-*)` per award level (active filter chip)                                                                                          |
| `.recog-card.blob--silver / --bronze`                                           | `var(--medal-*)`                                                                                                                             |
| `#kaggle .recog-summary .blob--competitions`                                    | `var(--cat-people)` (rose — Competitions tile)                                                                                               |
| `#kaggle .recog-summary .blob--rank`                                            | `var(--lvl-director)` (teal — Global Rank tile)                                                                                              |
| `.edu-accent`                                                                   | `var(--accent-gold)`                                                                                                                         |
| `.xp-stop` / `.xp-panel` via `.xp-level-*`                                      | `var(--lvl-*)` per role seniority                                                                                                            |
| `.about__card-row.cat-*`                                                        | `var(--about-cat-*)` per category                                                                                                            |
| `.vision-accent-{key}` + `.vision-accent-hook`                                  | `var(--cat, --view-accent-vision)` (flow + impact grid; impact orgCards use 3 accent groups ai/gxp/strategic — VI-001 superseded 2026-07-06) |

## Per-view fallback tokens

`global.css` `:root` (~L329) — one accent per nav view, used only as the fallback
arm of the un-suppress `var()`:

```
--view-accent-about / -experience / -contact  → var(--accent)   (purple)
--view-accent-research     → var(--lvl-senior-director)  (blue)
--view-accent-recognition  → var(--accent-gold)          (gold)
--view-accent-vision       → var(--lvl-director)         (teal)
```

`--view-accent-experience` and `--view-accent-research` are **fallback-only** (their
views use per-item hues). They look unused but are load-bearing fallbacks — do not delete.

## Schema wiring (content JSON → box color)

Per-item accents are typed enums in `src/schemas/`. A JSON key maps to a hook class
maps to an item token.

| Schema (line)              | JSON key | Values                                                                  | Hook class prefix |
| -------------------------- | -------- | ----------------------------------------------------------------------- | ----------------- |
| `visionAccentSchema` (L35) | `accent` | impact, strategic, platform, people, ai, privacy, gxp, silver           | `.vision-accent-` |
| `xpLevelSchema` (L271)     | `level`  | principal, staff, senior, lead, associate, engineer                     | `.xp-level-`      |
| `awardLevelSchema` (L340)  | `level`  | EVP, CIO, Senior Director, Director, Associate Director, National Level | `.level-`         |
| `kaggleMedalSchema` (L390) | medal    | Silver, Bronze                                                          | `.blob--`         |

Adding a new accent value means: extend the enum → add the class→token map in
`global.css` → ensure the item token exists (`--cat-*` / `--lvl-*` / `--medal-*`).
See `change-recipes.md` §B.

## Per-view (single) vs per-item (multi-color) — decide

| Choose single per-view accent when…                                          | Choose per-item multi-color when…                                         |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Cards are peers with no meaningful category (Contact links, Education stats) | Cards encode a real dimension — seniority, category, medal, program theme |
| The section reads as one band                                                | Color carries information the reader should decode                        |
| Fewer than ~3 distinct hues would apply                                      | A typed enum already exists for the dimension                             |

Current shipped direction is **multi-color per view** (reverted 2026-07-05); the wash
was universalized 2026-07-06. Confirm the current intent in `box-color-history.md`
before flipping a view's strategy — this has been reversed before.
