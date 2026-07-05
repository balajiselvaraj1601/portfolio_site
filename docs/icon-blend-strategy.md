# Icon Blend Strategy — icon_collections raster set

> **Agent skill:** operational SSOT for size, chrome, and color standardization —
> [`.claude/skills/portfolio-icon-standardization/SKILL.md`](../.claude/skills/portfolio-icon-standardization/SKILL.md)

Status: RATIFIED by design-guardian with amendments (2026-07-04). Amendments
are folded into the text below; binding constraints BC1–BC5 at the end.
Scope: the 46 `icon_*.png` assets sourced from `~/workspace/icon_collections`,
installed under `public/assets/logos/{kaggle,vision,education,awards,general}/`.

## Ground truth (verified, not inferred)

1. **Every one of the 46 PNGs is monochrome**: a white line-art glyph on a solid
   opaque black square (RGB, no alpha channel, chroma ≈ 0, 1254×1254; a cropped
   variant set exists at `~/workspace/icon_collections_fixed`). There is no
   color to lose in vectorization. `icon_trophy_awards.png` and
   `icon_trophy_kaggle.png` are identical files.
2. Rendered as raw `<img>` today, each icon appears as a **black box with a
   white glyph** — theme-blind in both modes. `.icon-tile--accented` tinting
   and `.blob-stat__icon { color: var(--medal) }` cannot reach raster pixels.
3. The blended mechanism already exists and is proven: `logo_<stem>.svg`
   (traced, tight, currentColor) rendered by `MarkEmblem.astro` via CSS
   `mask` + `background: currentColor`, or Lucide paths via `Icon.astro`.
   MarkEmblem masks by **alpha**, so opaque PNGs can never pass through it —
   vector assets are a hard requirement for tinting.
4. **23 `logo_*.svg` pipeline outputs already sit in
   `public/assets/logos/marks/`** and are currently orphaned: the vision
   refactor re-pointed `vision-board.json` to the `icon_hub_*`/`icon_vision_*`
   PNGs. Most hub/vision PNG concepts have an existing SVG equivalent.
5. Header `save`/`sun`/`moon` have working `<Icon>` (Lucide) fallback branches;
   the PNGs win only because `logoSrc()` resolves them first.
6. Pipeline SSOT: `scripts/icon-sets.json` (+ `svg-icon-generator.py`,
   `batch-icon-generate.sh`, golden tests `tests/run-icon-tests.py`). The
   legacy source dirs (`icon_box`, `icon_kaggle`, `icon_multimodal`) are gone;
   `icon_collections` is the only live source.

## The generalizable rule

> **Monochrome semantics ⇒ vector delivery.** Any icon whose meaning survives a
> single ink color must reach the page as currentColor vector — `Icon.astro`
> (Lucide) for UI chrome, `MarkEmblem` + `logo_<stem>.svg` for content marks.
> Raster `<img>` is reserved for genuinely multi-color brand art (org
> wordmarks, collaboration logos), which renders in `.logo-badge` /
> `.comp-image` contexts with documented `object-fit` rules.

Since all 46 icons in this set are monochrome, **the whole set converts**; the
per-page question is only _which vector route_ and _which container_.

## Decision matrix

| #   | Icon group (count)                               | Route                                                                                                                                                                                                                                                                                                                                                                               | Container / tint                                                                                                                   | Owner                                        |
| --- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| 1   | Header chrome `icon_general_{save,sun,moon}` (3) | Drop `logoSrc()` branches; the existing `<Icon>` Lucide fallbacks become primary                                                                                                                                                                                                                                                                                                    | 36px header buttons; currentColor                                                                                                  | design-guardian                              |
| 2   | Kaggle metric stats `icon_metric_kaggle_*` (8)   | Pipeline → `logo_metric_<stem>.svg`; render via MarkEmblem in `.blob-stat__icon`/`.blob-block__icon`                                                                                                                                                                                                                                                                                | inherits `color: var(--medal)`; sizes BINDING: `--icon-md` (20px) in `.blob-stat__icon`, `--icon-sm` (16px) in `.blob-block__icon` | guardian + page-recognition                  |
| 3   | Education stats `icon_education_*` (4)           | Pipeline → `logo_education_<stem>.svg`; MarkEmblem inside `.icon-tile.icon-tile--accented`                                                                                                                                                                                                                                                                                           | inherits `--accent-card` gold; size via `--mark-glyph` (22px)                                                                      | guardian + page-recognition                  |
| 4   | Trophies `icon_trophy_*` (2 files, 1 unique)     | Pipeline → single `logo_trophy_badge.svg`, referenced by both Awards and Kaggle tiles (dedup). AMENDED: RecogTile.astro must first replace its `imgSrc` `<img>` path with a MarkEmblem path (guardian-owned; blocks page-recognition)                                                                                                                                               | RecogTile slot; `--accent-card` per level/medal                                                                                    | guardian + page-recognition                  |
| 5   | Competition entity marks `icon_kaggle_*` (9)     | Pipeline → `logo_kaggle_<stem>.svg`; MarkEmblem in card header tile replaces `object-fit: cover` black square. AMENDED: CompetitionCard needs a third routing branch — resolved slugs matching `logo_*` go to MarkEmblem inside `.icon-tile--accented`, NOT `.comp-image` cover-fill (guardian-owned; blocks page-recognition). `.comp-image` stays intact for genuine org logos | `.icon-tile--accented` medal tint                                                                                                  | guardian + page-recognition                  |
| 6   | Vision hub nodes `icon_hub_*` (13)               | **Reuse existing `marks/logo_*.svg`** (name-map below); pipeline only for unmatched stems; kills raster/vector orbit mixing                                                                                                                                                                                                                                                         | MarkEmblem at the vector node ratio (52%); `--accent-ll`                                                                           | page-vision (+ guardian for VisionHub.astro) |
| 7   | Vision impact marks `icon_vision_*` (7)          | **Reuse existing `marks/logo_*.svg`**; pipeline for unmatched; emblem-in-circle per contract §5 instead of rect pill                                                                                                                                                                                                                                                                | ThemeCard emblem; `--accent-card`                                                                                                  | page-vision (+ guardian for ThemeCard)       |

Out of scope (explicitly NOT this set, stays raster): org/collaboration brand
logos (`org/*.png` — astrazeneca, broad-institute, aacr, biorxiv, gaia, jitc,
…). They are multi-color wordmarks; keep `.logo-badge` PNG rendering and record
a §11 exception. The research view's "convert org logos" recommendation is
rejected on brand-fidelity grounds.

## Candidate hub/vision → existing SVG name map (verify visually at execution)

| PNG asset                        | Existing SVG candidate                                                                                                                                                              |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| icon_hub_multimodal_center_brain | logo_brain                                                                                                                                                                          |
| icon_hub_multimodal_document     | logo_document_file                                                                                                                                                                  |
| icon_hub_multimodal_table        | logo_grid_table                                                                                                                                                                     |
| icon_hub_multimodal_image        | logo_photo_image                                                                                                                                                                    |
| icon_hub_multimodal_cube         | logo_cube_3d                                                                                                                                                                        |
| icon_hub_multimodal_signal       | logo_pulse_activity                                                                                                                                                                 |
| icon_hub_multimodal_graph        | logo_network_nodes                                                                                                                                                                  |
| icon_hub_kaggle_idea             | logo_innovation_idea                                                                                                                                                                |
| icon_hub_kaggle_globe            | logo_global_location                                                                                                                                                                |
| icon_hub_kaggle_knowledge        | logo_learning_education                                                                                                                                                             |
| icon_hub_kaggle_partnership      | logo_partnership_handshake                                                                                                                                                          |
| icon_hub_kaggle_analytics        | logo_analytics_dashboard                                                                                                                                                            |
| icon_hub_kaggle_bullseye         | logo_target_goal                                                                                                                                                                    |
| icon_vision_award                | logo_achievement_award                                                                                                                                                              |
| icon_vision_secure_funds         | logo_financial_growth                                                                                                                                                               |
| icon_vision_scaling_team         | logo_team_growth                                                                                                                                                                    |
| icon_vision_scorecard            | logo_analytics_dashboard (shared) or generate                                                                                                                                       |
| icon_vision_positioning          | logo_global_analytics or generate                                                                                                                                                   |
| icon_vision_global_team          | logo_global_location (shared) or generate                                                                                                                                           |
| icon_vision_gaia                 | logo_business_presentation (RESOLVED: card is "Gartner Submission", alt "Business presentation" — name coincidence with the GAIA org; `org/gaia.png` in speakers view is untouched) |

Rule: visual mismatch ⇒ generate from the PNG rather than force-fit.

## Final slug map (EXECUTED 2026-07-04 — the interface page agents consume)

All 20 reuse rows above verified visually and adopted as-is, except
`icon_vision_positioning` (puzzle glyph ≠ `logo_global_analytics`) which was
generated as **`logo_vision_positioning`**. Newly generated (23 files, all
1-path currentColor, flush viewBox, installed in `marks/`):

- `logo_metric_kaggle_{entrants,evaluation,medal,percentile,rank,role,summary,time_period}`
- `logo_education_{calendar,cgpa,institution,medal}`
- `logo_kaggle_{blindness,contrails,electricity,gi_tract,handwriting,sign,single_cell,speech,whale}`
- `logo_trophy_badge` (shared by Awards and Kaggle — the two trophy PNGs were
  identical), `logo_vision_positioning`

`icon_general_{save,sun,moon}` have no SVG: header is Lucide `Icon.astro` only.
Caveat: `batch-icon-generate.sh` on the registered `icon_collections` set would
apply source normalization that destroys this line art — the 23 SVGs were
generated with targeted `svg-icon-generator.py` runs
(`--sizes 512 --no-badge --tight --turdsize 2 --no-circle`).
Pre-flight results: `logo_network_nodes.svg` contains exactly 1 path — BC1
noise gate passes. `org/persist-seq.svg` exists, so the persist-seq badge
lookup resolves (vision G6 was a false alarm; page-vision re-confirms render).

## Pipeline configuration (new set)

Add to `scripts/icon-sets.json`:

```json
"icon_collections": {
  "dir": "icon_collections",
  "mask_mode": "light",
  "circle_archetype": false,
  "scale_luminance": false,
  "output_alpha": false,
  "generator_flags": ["--no-circle"]
}
```

White glyph on solid dark field = the `light` mask archetype (no flags beyond
`--no-circle`). Generate only stems without a reusable SVG. Install as
`public/assets/logos/marks/logo_<stem>.svg` per existing convention (respect
the `logo_target_goal` collision rule). Run `python3 tests/run-icon-tests.py`
after any config/generator change; visually spot-check every output before
install (noise-path shatter gate).

### ViewBox normalization — MANDATORY after any marks/ (re)generation

The generator's `--tight` mode emits non-square viewBoxes (aspects 0.58–1.83),
which makes elongated glyphs render visually smaller than square ones inside
MarkEmblem's `mask: contain` slots. After generating or batch-regenerating ANY
file in `public/assets/logos/marks/`, run:

```bash
python3 scripts/normalize-mark-viewbox.py apply   # idempotent
python3 scripts/normalize-mark-viewbox.py check   # gate: must exit 0
```

This gives every glyph in a section group (groups derive from slug prefixes,
e.g. `logo_hub_multimodal_*`) a square viewBox sized for equal ink-footprint
area — the "same size per section" rule ratified 2026-07-04. Skipping this
step reintroduces the uneven-icon regression.

## Token & contract changes (guardian-owned)

1. **Extend the tile glyph rule** in `global.css`:
   `.icon-tile :is(svg, .mark-emblem)` → `.icon-tile :is(svg, .mark-emblem, img:not(.comp-image))`
   so any residual raster inherits `--mark-glyph`. Removes the four per-view
   rem literals (1rem/1.125rem/1.25rem/1.375rem). The three-tier stat-size
   token proposal is **rejected** — the drift was accidental, not a hierarchy.
2. Bare-span icon contexts (`.blob-stat__icon`, `.blob-block__icon`) size via
   existing `--icon-md`/`--icon-sm`; no new tokens.
3. Contract §5 addition — raster rule (AMENDED wording; criterion is asset
   TYPE, not color count): "Raster `<img>` is permitted only for
   org/collaboration brand marks (wordmarks, logotypes, brand identities) in
   `.logo-badge` containers. All monochrome semantic icons — regardless of
   whether an existing SVG exists — must be delivered as vector via
   `Icon.astro` (Lucide) or `MarkEmblem` + `logo_*.svg`. Header chrome action
   buttons are `Icon.astro`-only. `object-fit: cover` is exclusively
   `.comp-image` for the org-logo header tile in CompetitionCard."
4. Document `object-fit` split: `cover` is exclusively `.comp-image`;
   everything else `contain`.
5. VisionHub center and satellite emblems bind to `--mark-glyph` (alias
   `--vision-hub-glyph`); hub orbit geometry stays cqi-based.
6. Adopt guardian constraints C1–C9 (no per-component raster sizing classes,
   no raster in Header, preserve `logoSrc() → <Icon>` fallback, CardMark SSOT,
   cqi sizing in VisionHub, no copying the Education `color-mix` one-off).

## Rendered icon sizes (SSOT, 2026-07-05)

All `icon_collections` marks render as `MarkEmblem` SVG masks. Effective pixel
size is set by CSS tokens in `src/styles/global.css`, not PNG dimensions.

| Context | Token / rule | Px |
| --- | --- | --- |
| Card / summary tile chrome | `--mark-slot` | 44 |
| Card / summary tile glyph | `--mark-glyph` | 22 |
| Competition card stat row | `--icon-md` (`.blob-icon--md`) | 20 |
| Competition summary / eval block | `--icon-sm` (`.blob-icon--sm`) | 16 |
| Vision hub center + satellite emblem | `--mark-glyph` / `--vision-hub-glyph` | 22 |
| Vision impact theme card | `--mark-slot` / `--mark-glyph` | 44 / 22 |
| Compact tile override | `.icon-tile--compact` | 36 / 18 |

### Circular mark chrome (SSOT, 2026-07-05 phase 2)

Accented pipeline marks share `.mark-circle` / `.mark-circle--accented` in
`global.css` (composed onto `.theme-card__icon`,
`.icon-tile.icon-tile--round.icon-tile--accented`, `.vision-hub__node`, and
`.vision-hub__center`):

| Aspect | Token / rule | Value |
| --- | --- | --- |
| Shape | `border-radius: 50%` | circle |
| Slot | `--mark-slot` | 44px (hub scales via cqi at live stage width) |
| Glyph fill | `--mark-glyph / --mark-slot` | 50% |
| Border | `--mark-border-width` | 1px |
| Background wash | `--mark-bg-mix` | 14% `--accent-card` |
| Border tint | `--mark-border-mix` | 35% `--accent-card` |

Hub node/center diameters: `--vision-hub-node: calc(100cqi * var(--mark-slot) / var(--vision-hub-max))`
(center equals node).

**Recognition view:** summary tiles, award/Kaggle card headers, and Education
stat tiles all use circular accented chrome (44px slot + 22px glyph). Kaggle
competition cards keep an intentional in-card hierarchy (22 → 20 → 16) for
header vs stats vs blocks.

**Vision view:** hub node/center circles and theme-card icons share the same
chrome recipe; glyphs match `--mark-glyph`.

### Color blending (SSOT, 2026-07-05 phase 3)

Foreground and background tints for pipeline marks flow through one hook:
**`--accent-card`** on the owning wrapper (card shell, tile, hub accent div,
level/medal class). Circular chrome reads it via **`--mark-fg`**
(`var(--accent-card, var(--accent))`).

| Layer | Token / mechanism | Resolves to |
| --- | --- | --- |
| Glyph (MarkEmblem / Lucide) | parent `color` → `--mark-fg` | `--accent-card` on wrapper |
| Circle background wash | `--mark-bg-mix` (14%) | `color-mix(--mark-fg …)` |
| Circle border tint | `--mark-border-mix` (35%) | `color-mix(--mark-fg …)` |
| Card shell border/top | `--accent-card` | level / medal / section hue |

**Three delivery tiers:**

| Tier | Delivery | Color behavior |
| --- | --- | --- |
| 1 — Vector tinted | `MarkEmblem` mask + `Icon` `currentColor` | Inherits `--mark-fg` from accented circle or bare span |
| 2 — Soft tile | `.icon-tile` without `--accented` | Site purple (`--accent-soft` / `--accent-ll`) |
| 3 — Full-color | `LogoBadge` `<img>` on `--logo-surface` | Brand pixels unchanged; optional accent-tinted pill bg |

**Intentional exceptions (do not “fix”):**

- **Contact brand icons** — `.icon--brand` forces `--brand-mark` (neutral heading
  ink) inside accented circles for official logo fidelity.
- **Experience project icons** — `.icon-tile--elev` (neutral slot, no accent wash).
- **Org wordmarks** — Tier 3 raster; never masked or recolored.

**Research fallback icons:** `CardMark variant="accented"` on cards inside
`.card-accent` so icon circles match section-hued top borders (teal / blue / gold).

**Kaggle competition cards:** all MarkEmblem contexts (header, stats, summary/eval
blocks) use `--accent-card` / medal tint — size hierarchy (22 → 20 → 16) unchanged.

**Vision board:** hubs, program cards, and impact cards use categorical
`accent` keys in `vision-board.json` (`impact`, `strategic`, `platform`,
`people`, `ai`, `privacy`, `gxp`) mapped to site `--cat-*` tokens via
`.vision-accent-{key}` + `.vision-accent-hook` in `global.css`.

## Cleanup

- After re-pointing, the 46 `icon_*.png` under `public/assets/logos/` are
  unreferenced → delete (sources persist in `~/workspace/icon_collections`).
- Fix `persist-seq` badge lookup in `vision-board.json` (currently resolves to
  nothing → empty mark slot).
- Recognition JSON/content slugs move from `icon_*` to `logo_*` stems.

## Execution order (with binding constraints BC1–BC5)

1. In parallel (disjoint files):
   - Mapping + pipeline agent: verify name map visually, add set config,
     generate missing SVGs, install to `marks/`, run icon golden tests.
   - design-guardian: global.css TC1 rule, Header.astro Icon-only (D1),
     RecogTile MarkEmblem path (D4), CompetitionCard third branch (D5),
     contract §5 text (TC3/TC4) + adopt C1–C9. Fallback conditionals stay
     (BC5). The 72% `.vision-hub__node-img` rule stays until TC5's gate.
2. page-recognition and page-vision in parallel, AFTER step 1 lands (BC2):
   re-point content JSON and view-owned markup to `logo_*` slugs / MarkEmblem.
3. Verify: `npm run build`, icon tests, light+dark screenshots of
   recognition / vision / header; prettier/verify vs baseline (2 pre-existing
   md warnings).
4. Cleanup, strictly last (BC3): delete the 46 `icon_*.png` only after
   re-point + clean build; then remove the dead 72% rule (TC5, after a
   screenshot pass confirms zero raster nodes) and optionally simplify
   fallback conditionals (BC5).

## Binding constraints (guardian)

- BC1: network_nodes noise gate — PASSED (1 path).
- BC2: guardian primitives (TC1, D4, D5) must land before page agents edit.
- BC3: PNG deletion only after all re-pointing and a clean build.
- BC4: gaia disambiguation — RESOLVED (logo_business_presentation).
- BC5: `logoSrc() ? <img> : <Icon/MarkEmblem>` conditionals stay until PNGs
  are confirmed deleted.
