# Typography

This is the single source of truth for **which font goes where** on the site. The same
role-mapping is mirrored as a comment above the font tokens in
[`src/styles/global.css`](../src/styles/global.css).

## The three typefaces

The site uses exactly three families, defined once as CSS variables in `global.css` and
referenced everywhere via `var(--font-*)`. No component hardcodes a typeface; no new font
should be introduced without updating this doc.

| Token            | Family               | Role in one word | Fallbacks                                       | Loaded via                                        |
| ---------------- | -------------------- | ---------------- | ----------------------------------------------- | ------------------------------------------------- |
| `--font-display` | **DM Serif Display** | Editorial        | Georgia, Times New Roman, serif                 | `@fontsource/dm-serif-display` (400 + 400-italic) |
| `--font-sans`    | **Inter Variable**   | Reading          | system-ui / -apple-system / Segoe UI / Roboto … | `@fontsource-variable/inter`                      |
| `--font-mono`    | **JetBrains Mono**   | Data / labels    | ui-monospace, SF Mono, Menlo, Consolas          | `@fontsource/jetbrains-mono` (400, 600)           |

**Rule of thumb**

> **display** = editorial headings & the brand wordmark ·
> **sans** = anything you read in sentences, plus buttons ·
> **mono** = every small "data/label" token (eyebrows, tags, dates, metrics, metadata).

## Element → font spec

When building a new component, pick the row that matches the element's role and reuse the
token — don't decide per element.

| Element / role                                                                    | Family           | Weight  | Size                  | Notes                                                                      |
| --------------------------------------------------------------------------------- | ---------------- | ------- | --------------------- | -------------------------------------------------------------------------- |
| Hero / page title (`h1`, `.hero__title`)                                          | display          | 400     | `--fs-h1`             | `<em>` renders italic accent                                               |
| Section title (`h2`, `.section__title`, BoardHeader, Contact/Vision titles)       | display          | 400     | `--fs-h2`             | —                                                                          |
| Editorial pull-quote / leadership statement                                       | display          | 400     | large                 | italic                                                                     |
| Brand wordmark (Header `.brand`)                                                  | display          | —       | —                     | identity mark                                                              |
| Sub-heading / card title (`h3`; SpeakingCard, OrgSnapshotCard, Education degree)  | sans             | 600     | `--fs-h3` (1.15rem)   | —                                                                          |
| Kicker / micro-label (`h4`)                                                       | **mono**         | 600     | 0.9rem                | uppercase, tracked — a label, not prose                                    |
| Eyebrow / section label (`.eyebrow`, `Eyebrow`)                                   | mono             | 400–600 | `--fs-eyebrow`        | uppercase, 0.18em                                                          |
| Tag / chip / badge (Chip, ProgramBadge, AvailabilityBadge, HubCircle, gold-badge) | mono             | 600     | ~0.7rem               | uppercase                                                                  |
| Date / venue / metadata (Experience, SpeakingCard, Footer, Contact email)         | mono             | 400–600 | 0.7–0.8rem            | —                                                                          |
| Metric number (`.metric-card__value`, `.hero-stat__num`, Kaggle rank)             | mono             | 600     | `--fs-metric`         | tabular figures                                                            |
| Metric label (`.metric-label`)                                                    | mono             | 400     | `--fs-small`          | descriptor under a number                                                  |
| Quote attribution / author                                                        | mono             | 400     | `--fs-eyebrow`        | —                                                                          |
| Body / paragraph / intro / list items                                             | sans             | 400     | `--fs-body` / 0.88rem | —                                                                          |
| Inline links (`a`, EntityLink, ContactLink)                                       | sans (inherited) | inherit | inherit               | —                                                                          |
| Button (`.btn`)                                                                   | sans             | 600     | `--fs-btn`            | uppercase 0.08em — a distinct interactive role, intentionally **not** mono |

**Weight tokens (SSOT — never hardcode a numeric `font-weight`):** the numeric weights above
resolve to the `--fw-*` ladder — `--fw-regular` 400 · `--fw-medium` 500 · `--fw-semibold` 600 ·
`--fw-bold` 700. Likewise `line-height: 1` → `--lh-none`. See design-consistency-contract.md §3a/§3d.

### Deliberate exceptions

- **Thirukural Tamil quote** (`.kural__tamil`, in `ThirukuralQuote.astro`) uses **sans**, not
  display. DM Serif Display is a Latin-only face and cannot render Tamil glyphs; sans gives a
  cleaner script fallback. Do not "fix" this to display.

### Possible future tweak (not applied)

- The **Monogram** initials currently inherit sans. They could move to `--font-display` to
  match the brand wordmark's identity. Left as-is for now.

## Page-by-page / section-by-section map

Pages are content-driven: `content/site.json` defines the ordered section list per page,
and `src/components/SectionRenderer.astro` maps each section `type` to a component. Below,
each section lists the fonts it actually surfaces.

### Global chrome (on every page, via `Layout.astro`)

| Element                                | Font                       |
| -------------------------------------- | -------------------------- |
| Header brand wordmark (`.brand`)       | display                    |
| Header nav links                       | sans                       |
| Footer branding (`.site-footer__mono`) | mono                       |
| Footer links / text                    | sans                       |
| DotNav                                 | no text (aria labels only) |
| BoardHeader title                      | display                    |

### Home — `/` (About view + full scroll)

| Section               | Component                                     | Fonts surfaced                                                                   |
| --------------------- | --------------------------------------------- | -------------------------------------------------------------------------------- |
| Hero                  | `Hero.astro`                                  | title=display · tag / greeting / stat-number / stat-label=mono · sub & body=sans |
| Thirukural            | `ThirukuralQuote.astro`                       | Tamil quote=sans (exception) · translation=display italic · author=mono          |
| Who I am & how I lead | `LeadershipPhilosophy.astro` | bio & card text=sans · statement=display (italic) · theme titles=sans            |

### Experience — `/#experience`

| Section    | Component          | Fonts surfaced                                         |
| ---------- | ------------------ | ------------------------------------------------------ |
| Experience | `Experience.astro` | h2=display · eyebrow=mono · year & role-meta=mono · role titles/body=sans |

### Research — `/research`

| Section              | Component                                             | Fonts surfaced                                                          |
| -------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------- |
| Publications         | `Publications.astro` → ResearchCard                   | h2=display · venue=mono · title=sans                                    |
| Conferences          | `Conferences.astro` → ResearchLinkGrid → ResearchCard | venue=mono · title=sans · body=sans                                     |
| Speaking Engagements | `Speakers.astro` → SpeakingCard                       | h2=display · role/date/venue=mono · title=sans (600) · description=sans |

### Recognition — `/recognition`

| Section              | Component                        | Fonts surfaced                                                          |
| -------------------- | -------------------------------- | ----------------------------------------------------------------------- |
| Awards & Recognition | `Awards.astro` → recog card grid | h2=display · level kicker=**mono** · award title & detail=sans          |
| Kaggle Competitions  | `Kaggle.astro`                   | h2=display · rank number=mono · rank detail=mono                        |
| Education            | `Education.astro`                | `h4` label=**mono** · degree `h3`=sans · details=sans · gold-badge=mono |

### Vision — `/vision`

| Section         | Component              | Fonts surfaced                                                                        |
| --------------- | ---------------------- | ------------------------------------------------------------------------------------- |
| Vision Programs | `VisionPrograms.astro` | Section h2=display · eyebrow=mono · hub/program kickers=mono · ThemeCard title=sans   |
| Vision Impact   | `VisionImpact.astro`   | h2=display · ThemeCard title=sans, body=sans                                          |

### Contact — `/contact`

| Section | Component       | Fonts surfaced                                |
| ------- | --------------- | --------------------------------------------- |
| Contact | `Contact.astro` | title=display · email/labels=mono · body=sans |

### 404 — `/404` (hardcoded, not content-driven)

| Element                               | Font            |
| ------------------------------------- | --------------- |
| Error code (`.notfound__code`, "404") | mono            |
| Title (`.notfound__title`, `h1`)      | display         |
| Body text                             | sans            |
| Action buttons (`.btn`)               | sans, uppercase |
