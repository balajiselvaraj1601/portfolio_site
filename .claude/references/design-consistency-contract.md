# Design Consistency Contract

Agent-checkable checklist distilled from `docs/design-direction.md`, `docs/typography.md`,
and `src/styles/global.css`. Page agents audit against this; Design Guardian resolves
cross-view conflicts using these rules as binding authority.

**Do not duplicate token values elsewhere** — cite this contract and `global.css`.

---

## 1. Section wrapper

Every live section must use `Section.astro` (`src/components/ui/Section.astro`) unless
wrapped by `AboutLanding.astro` (hero + thirukural band).

| Check | Rule                                                                    | Evidence                             |
| ----- | ----------------------------------------------------------------------- | ------------------------------------ |
| S1    | Section has `id` matching section registry key                          | `content/site.json → sections`       |
| S2    | Uses `.section` class via `Section.astro`                               | No ad-hoc `<section>` without tokens |
| S3    | Inner layout uses `.container`                                          | Provided by `Section.astro`          |
| S4    | Variant matches intent: `default`, `alt`, `full`                        | `variant` prop or equivalent class   |
| S5    | Section vertical padding uses `--section-py-start` / `--section-py-end` | `.section` in global.css             |
| S6    | Mobile section padding reduces per global.css media query               | ≤768px: 64px/48px                    |

---

## 2. Spacing tokens (mandatory)

Use CSS variables — never raw px for layout rhythm.

| Token                      | Value                  | Use                                             |
| -------------------------- | ---------------------- | ----------------------------------------------- |
| `--space-0-5`              | 2px                    | Hairline stack gaps (line-height compensation)  |
| `--space-1` … `--space-24` | 4px scale              | All spacing                                     |
| `--pill-padding-y` / `-x`  | 8px / 16px             | Pill / nav / tag chip padding (one shared pair) |
| `--section-py-start`       | 96px (64px mobile)     | Section top padding                             |
| `--section-py-end`         | 64px (48px mobile)     | Section bottom padding                          |
| `--gutter-inline`          | clamp(24px, 4vw, 64px) | Container horizontal                            |
| `--stack-sm`               | 16px                   | Tight vertical stacks                           |
| `--stack-md`               | 24px                   | Default stacks                                  |
| `--stack-lg`               | 32px                   | Card grids, section internals                   |
| `--stack-xl`               | 48px                   | Major section sub-blocks                        |
| `--card-padding`           | 24px                   | Standard card inner                             |
| `--card-padding-lg`        | 32px                   | Large cards                                     |
| `--section-cta-gap`        | 32px                   | CTA button groups                               |
| `--text-gap-pair`          | 2px                    | T8→T6 label/value pairs (dt/dd, meta pairs)     |
| `--text-gap-inline`        | 8px                    | T3→T6 title→body within a card                  |
| `--text-gap-block`         | 16px                   | T5→T2, T2→T7 within section header              |
| `--text-gap-section`       | 32px                   | Section header block → first content            |

**Violation:** Hardcoded `padding: 20px`, `gap: 18px`, or `margin: 30px` where a token exists.
**Violation:** Text-stack vertical gaps using raw `--space-*` or hardcoded px where a `--text-gap-*` token applies.

### 2a. Tracking & line-height tokens (mandatory)

Character tracking and line-height are tokenized — **never hardcode an `em` or unit-less
line-height where a token exists.** Tracking stays in `em` so it scales with font-size.

| Tracking token       | Value   | Use                                                |
| -------------------- | ------- | -------------------------------------------------- |
| `--tracking-tight`   | -0.02em | Display headings (h1/h2), monogram mark            |
| `--tracking-flat`    | 0.02em  | Brand wordmark, board header                       |
| `--tracking-snug`    | 0.05em  | h4 kickers, stat labels, Tamil couplet             |
| `--tracking-caps`    | 0.08em  | Uppercase UI: buttons, nav, badges, meta labels    |
| `--tracking-wide`    | 0.10em  | Pipeline/footer/hero labels, standard micro-labels |
| `--tracking-wider`   | 0.14em  | Emphasized theme / case-study micro-labels         |
| `--tracking-eyebrow` | 0.18em  | Section eyebrows (max tracking)                    |

| Line-height token | Value | Use                                  |
| ----------------- | ----- | ------------------------------------ |
| `--lh-tight`      | 1.1   | Headings h1–h4                       |
| `--lh-snug`       | 1.25  | Recognition / card titles            |
| `--lh-normal`     | 1.4   | Metrics, metadata, dense caps labels |
| `--lh-relaxed`    | 1.6   | Card descriptions, recog body        |
| `--lh-body`       | 1.75  | Loose body prose, section subtitle   |

**Violation:** Hardcoded `letter-spacing: 0.12em` or `line-height: 1.5` where a token exists.

---

## 3. Typography roles

| Element                     | Token / class                 | Font role        |
| --------------------------- | ----------------------------- | ---------------- |
| h1, h2, section titles      | `--font-display`, `--fs-h2`   | DM Serif Display |
| h3, h4, card titles         | `--font-sans`, `--fs-h3`      | Inter 600–700    |
| Body                        | `--font-sans`, `--fs-body`    | Inter 400        |
| Eyebrows, metadata, metrics | `--font-mono`, `--fs-eyebrow` | JetBrains Mono   |
| Tamil / non-Latin           | Inter only                    | Never DM Serif   |

### 3a. Type hierarchy ladder (SSOT for text levels)

Every text run on the site belongs to **one** of these levels. The level fixes its font,
size, tracking, and line-height token — pick the level by the element's role in the reading
order, then apply the tokens. Page agents map each section's text to these codes in their
**Appendix C** (they cite the code, never re-list token values). This is what keeps type
consistent across views: two elements at the same level look identical everywhere.

| Code | Level                           | Font (§3)        | Weight                                       | Size token                   | Tracking                               | Line-height                  |
| ---- | ------------------------------- | ---------------- | -------------------------------------------- | ---------------------------- | -------------------------------------- | ---------------------------- |
| T1   | Display (h1)                    | `--font-display` | `--fw-regular`                               | `--fs-h1`                    | `--tracking-tight`                     | `--lh-tight`                 |
| T2   | Section title (h2)              | `--font-display` | `--fw-regular`                               | `--fs-h2`                    | `--tracking-tight`                     | `--lh-tight`                 |
| T3   | Card title (h3)                 | `--font-sans`    | `--fw-semibold` (recog `--fw-bold`)          | `--fs-card-title*` (§EX-008) | `normal`                               | `--lh-snug`                  |
| T4   | Kicker / sub-head (h4)          | `--font-mono`    | `--fw-semibold`                              | `--fs-h4`                    | `--tracking-snug`                      | `--lh-tight`                 |
| T5   | Eyebrow                         | `--font-mono`    | `--fw-regular`                               | `--fs-eyebrow`               | `--tracking-eyebrow`                   | `--lh-tight`                 |
| T6   | Body prose                      | `--font-sans`    | `--fw-regular`                               | `--fs-body`                  | `normal`                               | `--lh-body` / `--lh-relaxed` |
| T7   | Subtitle / lede                 | `--font-sans`    | `--fw-regular`                               | `--fs-subtitle`              | `normal`                               | `--lh-body`                  |
| T8   | Caps label (nav/tag/badge/meta) | `--font-mono`    | `--fw-semibold` labels · `--fw-regular` tags | `--fs-2xs` / `--fs-eyebrow`  | `--tracking-caps`                      | `--lh-normal`                |
| T9   | Emphasis micro-label            | `--font-mono`    | `--fw-semibold`                              | `--fs-2xs`                   | `--tracking-wide` / `--tracking-wider` | `--lh-normal`                |
| T10  | Metric number                   | `--font-mono`    | `--fw-semibold`                              | `--fs-metric`                | `--tracking-snug`                      | `--lh-tight`                 |

**Rule (T-consistency):** an element's level must be the same across every view. If a label
reads as T8 in one section it must not be styled as T9 in another. New elements pick a level;
they never invent a font/size/weight/tracking combination outside the ladder. Every axis —
font, **weight**, size, tracking, line-height — resolves to a token; no numeric literal.

### 3b. Object hierarchy (surface levels)

Text sits inside surfaces; the surface hierarchy is fixed by the card tiers in **§5**
(A compact → B content → C recognition → D special) and the section band variants in **§6**
(`default` / `alt` rhythm). Page **Appendix C** records the object nesting per section —
which band variant wraps which card tier wraps which mark slot (§5 logo/mark table) — so the
box hierarchy is auditable the same way the text hierarchy is.

### 3c. Font-size scale (mandatory)

ONE ladder — never hardcode a `rem`/`clamp` font-size where a token exists.

**Fixed ramp:** `--fs-3xs` 0.65 · `--fs-2xs` 0.7 · `--fs-xs` 0.75 · `--fs-sm` 0.8 ·
`--fs-md` 0.875 · `--fs-base` 0.9 · `--fs-lg` 0.95 · `--fs-ml` 1.05 · `--fs-xl` 1.15 ·
`--fs-xxl` 1.35 · `--fs-2xl` 1.5 (rem).

**Display (fluid clamps, tunable from `:root`):** `--fs-h1`, `--fs-h2`, `--fs-metric`,
`--fs-metric-xl` (recog count), `--fs-hero`, `--fs-hero-metric`, `--fs-board-title`,
`--fs-board-sub`, `--fs-kural`, `--fs-kural-trans`, `--fs-edu-lg`, `--fs-edu-sm`.

**Semantic aliases:** `--fs-card-title-sm/·/-lg` (EX-008), `--fs-h3`, `--fs-h4`, `--fs-body`,
`--fs-small`, `--fs-eyebrow`, `--fs-subtitle`, `--fs-btn`.

**Violation:** hardcoded `font-size: 1.2rem` or `font-size: clamp(...)` where a token exists.

### 3d. Weight & line-height ladders (mandatory)

ONE ladder each — never hardcode a numeric `font-weight` or unitless `line-height`.

**Weight:** `--fw-regular` 400 (body, display headings, form inputs) · `--fw-medium` 500
(nav & footer links, quote emphasis) · `--fw-semibold` 600 (card titles, labels, metric
numbers, buttons) · `--fw-bold` 700 (monogram, recognition titles, statement emphasis).

**Line-height:** `--lh-none` 1 (solid leading — display numbers, monogram, badge glyphs) ·
`--lh-tight` 1.1 (headings) · `--lh-snug` 1.25 (card titles) · `--lh-normal` 1.4 (metrics,
dense labels) · `--lh-relaxed` 1.6 (body blocks) · `--lh-body` 1.75 (loose prose).

**Violation:** `font-weight: 600` or `line-height: 1` where the token (`--fw-semibold` /
`--lh-none`) exists.

### 3e. Element theming (colour by role)

Colour is not part of the T-ladder — it is set per element from the semantic colour tokens so
theming stays consistent across light/dark. Page **Appendix C** records the colour token each
element resolves to. Standard mappings:

- **Text:** `--heading` (h1–h4, card/section titles) · `--text` (body) · `--text-muted`
  (subtitles, metadata values, captions, blurbs).
- **Accent labels:** `--accent-ll` (eyebrows, kickers, mono caps labels, dt labels, venues,
  metric numbers) · `--accent-light` (inline links, CTAs) · `--accent-red-light` (red eyebrow variant).
- **Categorical accents:** `--lvl-*` (award/role levels), `--medal-*` (competition medals),
  `--status-*` (availability) — applied via `--accent-card` on the owning card shell (§5).
- **Surfaces:** `--bg` / `--bg-alt` (section bands, §6) · `--bg-elev` (card shells) ·
  `--bg-chip` (chips/pills).

**Violation:** a hardcoded hex/rgb on a text or surface element where a semantic colour token exists.

---

## 4. Eyebrow rules

Per `docs/design-direction.md § Section eyebrows`:

| Section type                                  | Eyebrow                                                      |
| --------------------------------------------- | ------------------------------------------------------------ |
| View intros with metrics/custom h2            | **Required** — `Eyebrow.astro` via `Section` prop            |
| Content sections inside a view                | **Omit** — nav provides context                              |
| Ad-hoc kickers (Vision lede, Leadership diff) | Match `.eyebrow` typography (`--accent-ll`, mono, uppercase) |

**View intros with eyebrows:** `vision-programs`, Contact (if eyebrow used).

**Content sections without eyebrows:** `leadership`, `publications`, `conferences`, `speakers`, `awards`, `kaggle`, `education`, `experience` (uses SectionHeading instead), `vision-impact`.

---

## 5. Card shells

Four tiers govern box/card surfaces. **Default shell (2026-07-03):** `.card`, `.content-card`,
`.recog-card`, and `.recog-tile` share the recognition-style treatment — accent top border
(`--accent-card`), `--radius-xl`, gradient background, hover lift. Set `--accent-card` on a
wrapper (`.card-accent`, level/medal/category class) for contextual colour.

| Tier                | Shell class                                | Padding token              | Used by                                                              |
| ------------------- | ------------------------------------------ | -------------------------- | -------------------------------------------------------------------- |
| **A — compact**     | `.card`                                    | `--card-padding` (24px)    | theme-card, connect-card, proj-card accordion                        |
| **B — content**     | `.content-card`                            | `--card-padding-lg` (32px) | ResearchCard, SpeakingCard                                           |
| **C — recognition** | `.recog-card`, `.recog-tile`, `.edu-panel` | `--card-padding` (24px)    | Awards, Kaggle, Education — **aliases of the default `.card` shell** |
| **D — special**     | `.card--accent`, `.hub__ring`              | varies                     | Vision hub circle                                                    |

Shared primitives:

| Pattern                | Location                                                                                                                       | Notes                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------- |
| Icon tile              | `.icon-tile` + modifiers in `global.css`                                                                                       | Fallback icons; `--round`, `--compact`, `--recog`, `--accented` |
| Logo rect              | `.logo-badge` via `LogoBadge.astro`                                                                                            | Horizontal wordmarks                                            |
| Logo round             | `.logo-badge--round`                                                                                                           | Square emblems in circular pill                                 |
| Card tint              | `.card-tint`, `.card-tint--accent`                                                                                             | Nested highlight callouts inside cards                          |
| Recognition stack      | `RecogCardShell.astro` + `CompetitionCard.astro`                                                                               | Tier C                                                          |
| Research links         | `ResearchCard.astro` / `ResearchLinkGrid.astro`                                                                                | Tier B — **cross-view reference** for hover lift                |
| Education              | `Education.astro`                                                                                                              | Tier C                                                          |
| Vision groups & impact | `ProgramBadgeCard.astro`, `OrgSnapshotCard.astro` (with `CardMark.astro` + `MarkEmblem.astro` for vision-programs group cards) | Tier A                                                          |
| Card mark              | `CardMark.astro`                                                                                                               | All card logo/icon/emblem slots                                 |

**Cross-view rule:** The Research link-list shell (`ResearchCard.astro`) is the reference
implementation for hover lift (`--card-lift` + `--shadow-md`). Tier C cards may diverge on
radius, top accent, and gradient background only when documented in §11.

### Logo / mark slots (inside card shells)

**Sizing SSOT:** `:root { --mark-slot: 44px; --mark-glyph: 22px; }` in `src/styles/global.css`.
Change these two tokens to resize standard circular marks site-wide. Contextual overrides reuse
the same names: `.icon-tile--compact { --mark-slot: 36px; --mark-glyph: 18px; }`.
VisionHub emblems bind to `--mark-glyph` (alias `--vision-hub-glyph`); hub node/center
diameters track `--mark-slot` via cqi on `.vision-hub__stage`.

**Chrome SSOT:** `.mark-circle` + `.mark-circle--accented` in `global.css` — composed
onto `.theme-card__icon`, `.icon-tile.icon-tile--round.icon-tile--accented`,
`.vision-hub__node`, and `.vision-hub__center`. Tokens: `--mark-border-width` (1px),
`--mark-bg-mix` (14%), `--mark-border-mix` (35%). Do not hand-roll accent washes on
new mark slots.

**Color SSOT (phase 3):** Set `--accent-card` on the owning wrapper; circular marks
resolve glyph + wash + border through **`--mark-fg`** (`var(--accent-card, var(--accent))`).
`.card-accent` also sets `--mark-fg` for card shells. Bare-span marks (e.g.
`.blob-stat__icon`) set `color: var(--accent-card, …)` directly. Never hand-roll
`color-mix` on new mark slots — use `--mark-bg-mix` / `--mark-border-mix`.

**In-card hierarchy (Kaggle competition cards only):** card header glyph
`--mark-glyph` (22px); stat grid `--icon-md` (20px); summary/eval blocks
`--icon-sm` (16px). All three tiers share the same **medal tint**
(`--accent-card` / `--mark-fg`). Do not collapse sizes to a single value.

**Component SSOT:** `CardMark.astro` — all new card marks go through this component; it calls
`resolveLogoSlot()` in `src/lib/logo-display.ts`. Do not hand-roll logo/badge branching in cards.

| Shape                | CSS / component                                                    | When                                                                |
| -------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------- |
| **rect**             | `CardMark` → `.logo-badge` (rounded rect, white surface)           | Horizontal wordmarks (most org logos)                               |
| **round**            | `CardMark` → `.logo-badge--round` or `.icon-tile.icon-tile--round` | Square emblem logos in circular chrome                              |
| **plain**            | `CardMark` → `.logo-badge--plain`                                  | Dark/light marks on card bg (`jitc`, `hcl`)                         |
| **emblem-in-circle** | `CardMark` → `.theme-card__icon` + `MarkEmblem` (`.mark-circle--accented`) | Vision org/program theme cards (pipeline `logo_*` in accent circle) |
| **emblem bare**      | `MarkEmblem` without chrome                                                | Self-ringed assets off-card (not hub nodes — hub uses accented circles) |
| **icon**             | `CardMark` → `.icon-tile` (+ modifiers)                            | Lucide fallback when no logo asset                                  |

**Reference implementations (do not redesign):** Contact connect cards (round Lucide via
`CardMark`), Recognition summary tiles (`.icon-tile.icon-tile--round.icon-tile--accented`).

Icon tile modifiers: `--round` (circle; required with `--accented` for pipeline marks),
`--compact` (36px slot / 18px glyph), `--accented` (composed via `.mark-circle--accented`
when paired with `--round`), `--elev` (white node on tinted callout).

### Card colour highlights

Set `--accent-card` on a wrapper (`.card-accent` or level/medal class) to tint Tier C shells.
Use shared callout primitives for nested emphasis — do not reimplement `color-mix` per component.

| Pattern     | Class                                          | Use                                                                  |
| ----------- | ---------------------------------------------- | -------------------------------------------------------------------- |
| Soft tint   | `.card-tint`                                   | Nested callouts (`--accent-soft` wash): pipeline, impact strip       |
| Accent tint | `.card-tint--accent`                           | Contextual `--accent-card` wash: edu highlight, level-coloured bands |
| Top stripe  | `.card--accent::before` or Tier C `border-top` | Card-level category emphasis (see §11)                               |
| Radial wash | `.recog-tile::after`, `.edu-panel::before`     | Tier C hero/stat tiles only                                          |

**Contextual `--accent-card` sources:** Awards (`--lvl` per level), Kaggle (`--medal`), Education
(`--accent-gold`), CompetitionCard (`--medal` per card).

### Raster icon rule (TC3, 2026-07-04)

Ratified from `docs/icon-blend-strategy.md`. The permission criterion is asset *type*, not color count. Org brand marks stay raster regardless of whether they happen to be monochrome.

> **Raster `<img>` is permitted only for org/collaboration brand marks (wordmarks, logotypes, brand identities) in `.logo-badge` / `.logo-badge--round` / `.logo-badge--plain` containers.** All monochrome semantic icons — regardless of whether an existing SVG is available — must be delivered as vector via `Icon.astro` (Lucide) or `MarkEmblem` + `logo_*.svg`. Header chrome action buttons are `Icon.astro`-only. `object-fit: cover` is exclusively `.comp-image` for the org-logo header tile in `CompetitionCard`; all other raster uses apply `object-fit: contain`.

| Context | Delivery | Notes |
| ------- | -------- | ----- |
| Header chrome (`save-btn`, `theme-toggle`, `nav-toggle`) | `Icon.astro` only | No raster ever |
| `.icon-tile` stat/metric glyphs | `MarkEmblem` + `logo_*.svg` (currentColor tinting) | `Icon.astro` fallback while SVG pending (BC5) |
| Org/collaboration logos | `.logo-badge` raster PNG | Brand-fidelity; never vectorize regardless of color count |
| Competition entity marks | `MarkEmblem` via `logo_kaggle_*.svg` in `.icon-tile--accented` | Medal tint via `currentColor` |
| `object-fit: cover` | Exclusively `.comp-image` in `CompetitionCard` | All other raster: `object-fit: contain` |

**`logo_*` slug detection:** Any slug starting with `logo_` is a pipeline SVG (`marks/` directory) and must route to `MarkEmblem`, not `<img src>`. The `logoHasOwnRing()` helper in `src/lib/logo-display.ts` encodes this rule. `ThemeCard` with `markDisplay='auto'` routes `logo_*` marks to emblem-in-circle automatically.

---

## 6. Section variants

SSOT for variant naming. `Section.astro` accepts a single `variant` prop
(`'default' | 'alt' | 'full'`); additional variant classes may be layered via
its `class` prop.

| `variant` prop | Emitted class    | When                                                                                                                           |
| -------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `default`      | (none)           | Standard band                                                                                                                  |
| `alt`          | `.section--alt`  | Alternate background (`--bg-alt`); Kaggle, Publications, Speakers, Contact, vision-programs, experience |
| `full`         | `.section--full` | Full-bleed layout (deprecated as of Vision rewrite)                                                                            |

Adjacent sections should alternate `default` / `alt` where possible for visual rhythm.
Agents cite this table — never ad-hoc class strings.

**Same-view pairs:** When consecutive sections belong to one nav view (e.g. intro → content),
apply `.section--compact-bottom` on the first and `.section--compact-top` on the second to
halve stacked `--section-py-*` at the boundary (`--stack-xl` each side). See EX-014.

---

## 7. Breakpoints

Use token media queries — prefer `var(--bp-md)` etc. over raw `768px`.

| Token     | Value  |
| --------- | ------ |
| `--bp-sm` | 560px  |
| `--bp-md` | 768px  |
| `--bp-lg` | 900px  |
| `--bp-xl` | 1024px |

---

## 8. Accessibility

| Check | Rule                                                         |
| ----- | ------------------------------------------------------------ |
| A1    | Text/background pairs pass WCAG AA (`docs/accessibility.md`) |
| A2    | Focus visible via `--focus-ring`                             |
| A3    | Sections have accessible names (title h2 or `ariaLabel`)     |
| A4    | Images/logos have alt text from content JSON                 |
| A5    | Motion wrapped in `prefers-reduced-motion: no-preference`    |

---

## 9. Content wiring

| Check | Rule                                                                     |
| ----- | ------------------------------------------------------------------------ |
| C1    | Section order from `content/site.json → home.sections` only              |
| C2    | Each section id in exactly one `viewSections` group                      |
| C3    | Copy changes in `content/` paths listed in site.json `sections.*.source` |
| C4    | Schema changes precede content (`src/schemas.ts`)                        |

---

## 10. Severity guide (for findings)

| Severity | Examples                                                                   |
| -------- | -------------------------------------------------------------------------- |
| **P0**   | Build failure, schema violation, WCAG AA failure, broken section wiring    |
| **P1**   | Cross-view padding/card inconsistency, wrong eyebrow pattern, token bypass |
| **P2**   | Minor visual polish, copy tone, non-blocking spacing drift                 |

---

## 11. Documented exceptions

Intentional divergences from this contract, recorded by the Design Guardian during
Implement (Hard Rule: document exceptions). This table — not agent memory — is the SSOT
for approved divergences. Append rows; never delete history.

| exception_id | views                                          | rule waived                  | reason                                                                                                                                                                                                          | date       |
| ------------ | ---------------------------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| EX-001       | recognition                                    | §5 `--radius` default        | `.recog-card` / `.recog-tile` use `--radius-xl` (14px) to pair with top accent stripe                                                                                                                           | 2026-07-02 |
| EX-002       | recognition                                    | §5 solid `--bg-elev` shell   | `.recog-card` gradient background elevates recognition band above standard cards                                                                                                                                | 2026-07-02 |
| EX-003       | recognition                                    | §5 no top accent             | `.recog-card` / `.edu-panel` use 2px solid `border-top: var(--accent-card)` as categorical colour identifier                                                                                                    | 2026-07-02 |
| EX-004       | recognition                                    | §5 standard shell bg         | `.edu-panel::before` dotted radial overlay — education hero treatment unique within Tier C                                                                                                                      | 2026-07-02 |
| EX-005       | projects                                       | §5 recog-style top accent    | `.card--accent::before` 3px gradient stripe (decorative emphasis vs recog 2px solid)                                                                                                                            | 2026-07-02 |
| EX-006       | vision                                         | §5 rectangular `.card` shell | `.hub__ring` circular surface — hover-only `--shadow-md` (not persistent at rest); emblem layout requirement. **Note (2026-07-03):** Superseded by Vision multi-section rewrite; hub-and-spoke diagram retired. | 2026-07-02 |
| EX-007       | home                                           | §5 `--radius` on logo tiles  | `.leadership__collab-mark` uses `--radius-md` (8px) for compact logo grid cells                                                                                                                                 | 2026-07-02 |
| EX-008       | home, research, projects, recognition, contact | §3 single card-title token   | Three-tier `--fs-card-title` scale (0.95rem / var(--fs-h3) / 1.5rem) preserves intentional research-compact / standard / flagship title hierarchy                                                               | 2026-07-03 |
| EX-009       | research                                       | §2 single grid-col-min token | Two-tier `--grid-col-min` scale (320px compact vs 420px full) matches different content grid widths across research and speaking sections                                                                       | 2026-07-03 |
| EX-010       | recognition                                    | §2 tokenized gap             | `CompetitionCard` stats grid uses a `1px` hairline `gap` as a visual cell divider (grid background shows through) — not a rhythm value; intentionally off the `--space-*` scale                                 | 2026-07-03 |
| EX-011       | home                                           | §2 tokenized gap             | `ThirukuralQuote` band uses a responsive `clamp(1rem, 2.5vw, 1.75rem)` gap for the fluid couplet layout; endpoints intentionally straddle `--space-4`/`--space-6` and stay a clamp, not a fixed token           | 2026-07-03 |
| EX-012       | all (BoardHeader)                              | §2 tokenized margin          | `.bhead__chev :global(svg)` uses `margin-inline: -5px` as an optical overlap nudge to tuck chevrons toward the title — negative icon kerning, not layout rhythm; off the positive `--space-*` grid by design    | 2026-07-03 |
| EX-013       | home                                           | §1 S5 section py             | `AboutLanding.astro` uses `padding-block: var(--stack-xl)` (48px) instead of full `--section-py-*` — landing band is wrapped outside `Section.astro` and vertically centers hero + thirukural in the viewport   | 2026-07-03 |
| EX-014       | all multi-section views                        | §1 S5 section py             | `.section--compact-top` / `.section--compact-bottom` halve stacked section padding at same-view boundaries (intro→content, content→content within a nav view)                                                   | 2026-07-03 |
| EX-015       | all (org/collab logos)                         | §5 raster rule color-count   | Org/collaboration brand marks (`.logo-badge` containers) remain as raster PNG regardless of chromatic properties. Brand-fidelity requirement overrides the monochrome-→-vector general rule. Research view's recommendation to vectorize org logos was rejected on these grounds. | 2026-07-04 |
| EX-016       | vision (VisionHub)                             | §5 uniform node fill ratio   | `.vision-hub__node-img` raster nodes use 72% fill vs 52% for MarkEmblem/SVG nodes — raster PNGs require proportionally more area to read legibly against tinted circles. Rule dies with the raster branch (TC5 cleanup gate). | 2026-07-04 |

---

## 12. Page agent constraints — icon and raster surfaces

Binding on all page agents from 2026-07-04 (ratified TC6, `docs/icon-blend-strategy.md`).
Design Guardian is the sole editor of all `.icon-tile` CSS and shared icon primitives.

| Code | Constraint |
| ---- | ---------- |
| IC1  | **No per-component raster img sizing classes.** Any `<img>` inside `.icon-tile` inherits `--mark-glyph` via the global TC1 rule (see `global.css`). Page agents must not add new scoped rem-literal sizing classes for icon images. New size needs go to the guardian for a token decision. |
| IC2  | **No raster in Header chrome.** `Header.astro` action buttons (`save-btn`, `theme-toggle`, `nav-toggle`) use `Icon.astro` exclusively. No `<img>` or `logoSrc()` icon calls in that context. |
| IC3  | **`object-fit: cover` is exclusively `.comp-image`.** Only the org-logo header tile in `CompetitionCard` uses `cover`. All other raster contexts use `contain`. |
| IC4  | **`.icon-tile--accented` tinting does not propagate to `<img>`.** The `color: var(--accent-card)` tint applies only to SVG/MarkEmblem children. Page agents must not rely on raster PNGs inside accented tiles receiving the contextual hue. |
| IC5  | **Do not add raster to `XpProjectCard`.** Its icon slot resolves via `resolveIcon()` → `IconName` → `Icon.astro`. No `logoSrc()` call should be added; the card is intentionally SVG-only. |
| IC6  | **Do not bypass `CardMark.astro` in `ResearchCard`.** All logo/icon/emblem rendering in `ResearchCard` flows through `CardMark` → `resolveLogoSlot()`. Direct `<img>` outside `CardMark` in that card is a §5 violation. |
| IC7  | **VisionHub node sizing is proportional (`cqi`).** Do not convert hub node or center dimensions to `px` or `rem`. The hub is a container-query layout; all sizing stays as percentage-of-node. The `.vision-hub__node-img` 72% rule is retained until TC5's screenshot gate passes (see EX-016 + cleanup step in `docs/icon-blend-strategy.md`). |
| IC8  | **Preserve `logoSrc() → <Icon/MarkEmblem>` fallback pattern (BC5).** While the 46 `icon_*.png` files remain on disk, every component must retain the conditional fallback so the Icon branch activates when the SVG asset is not yet available. Remove conditionals only after PNG deletion and a clean build confirm zero raster icon references. |
| IC9  | **Stat cell background surface is guardian-owned.** The `color-mix(in srgb, var(--bg) 55%, var(--bg-elev))` in `Education.astro` `.edu-stat` is a documented §5 gap. Page agents must not copy this pattern into new components; new stat-cell surface tokens require a guardian token decision. |

---

## Audit procedure (mechanical)

1. Read owned section Astro files and their CSS (scoped or `:global`).
2. Grep for hardcoded px in owned files: `padding|margin|gap` with numeric px.
3. Confirm `Section.astro` usage and variant.
4. Compare card shell classes to sibling views (Recognition vs Research).
5. Check eyebrow presence against §4 table.
6. Emit one finding per violation with `contract_ref` citing section above.
