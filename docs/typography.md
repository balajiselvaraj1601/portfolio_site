# Typography

This is the single source of truth for **which font goes where** on the site. The same
role-mapping is mirrored as a comment above the font tokens in
[`src/styles/global.css`](../src/styles/global.css).

## The three typefaces

The site uses exactly three families, defined once as CSS variables in `global.css` and
referenced everywhere via `var(--font-*)`. No component hardcodes a typeface; no new font
should be introduced without updating this doc.

| Token | Family | Role in one word | Fallbacks | Loaded via |
|-------|--------|------------------|-----------|------------|
| `--font-display` | **DM Serif Display** | Editorial | Georgia, Times New Roman, serif | `@fontsource/dm-serif-display` (400 + 400-italic) |
| `--font-sans` | **Inter Variable** | Reading | system-ui / -apple-system / Segoe UI / Roboto … | `@fontsource-variable/inter` |
| `--font-mono` | **JetBrains Mono** | Data / labels | ui-monospace, SF Mono, Menlo, Consolas | `@fontsource/jetbrains-mono` (400, 600) |

**Rule of thumb**

> **display** = editorial headings & the brand wordmark ·
> **sans** = anything you read in sentences, plus buttons ·
> **mono** = every small "data/label" token (eyebrows, tags, dates, metrics, metadata).

## Element → font spec

When building a new component, pick the row that matches the element's role and reuse the
token — don't decide per element.

| Element / role | Family | Weight | Size | Notes |
|----------------|--------|--------|------|-------|
| Hero / page title (`h1`, `.hero__title`) | display | 400 | `--fs-h1` | `<em>` renders italic accent |
| Section title (`h2`, `.section__title`, BoardHeader, Contact/Vision titles) | display | 400 | `--fs-h2` | — |
| Editorial pull-quote / leadership statement | display | 400 | large | italic |
| Brand wordmark (Header `.brand`) | display | — | — | identity mark |
| Sub-heading / card title (`h3`; SpeakingCard, OrgImpactCard, Education degree) | sans | 600 | `--fs-h3` (1.15rem) | — |
| Kicker / micro-label (`h4`) | **mono** | 600 | 0.9rem | uppercase, tracked — a label, not prose |
| Eyebrow / section label (`.eyebrow`, `Eyebrow`) | mono | 400–600 | `--fs-eyebrow` | uppercase, 0.18em |
| Tag / chip / badge (TechIconRow, ProgramBadge, AvailabilityBadge, HubCircle, gold-badge) | mono | 600 | ~0.7rem | uppercase |
| Date / venue / metadata (Experience, SpeakingCard, Footer, Contact email) | mono | 400–600 | 0.7–0.8rem | — |
| Metric number (`.metric-card__value`, `.hero-stat__num`, Kaggle rank) | mono | 600 | `--fs-metric` | tabular figures |
| Metric label (`.metric-label`) | mono | 400 | `--fs-small` | descriptor under a number |
| Quote attribution / author | mono | 400 | `--fs-eyebrow` | — |
| Body / paragraph / intro / list items | sans | 400 | `--fs-body` / 0.88rem | — |
| Inline links (`a`, EntityLink, ContactLink) | sans (inherited) | inherit | inherit | — |
| Button (`.btn`) | sans | 600 | 0.82rem | uppercase 0.08em — a distinct interactive role, intentionally **not** mono |

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

| Element | Font |
|---------|------|
| Header brand wordmark (`.brand`) | display |
| Header nav links | sans |
| Footer branding (`.site-footer__mono`) | mono |
| Footer links / text | sans |
| DotNav | no text (aria labels only) |
| BoardHeader title | display |

### Home — `/`

| Section | Component | Fonts surfaced |
|---------|-----------|----------------|
| Hero | `Hero.astro` | title=display · tag / greeting / stat-number / stat-label=mono · sub & body=sans |
| Thirukural | `ThirukuralQuote.astro` | Tamil quote=sans (exception) · translation=display italic · author=mono |
| Who I am & how I lead | `LeadershipPhilosophy.astro` → LeadershipCard | bio & card text=sans · statement=display (italic) · theme titles=sans |
| Technology Expertise | `Skills.astro` | h2=display · eyebrow=mono · category `h4`=**mono** · skill tags=sans |
| Affiliations | `Affiliations.astro` → EntityLink | org names/links=sans |
| Publications | `Publications.astro` → ResearchCard | h2=display · venue=mono · title=sans |
| Contact | `Contact.astro` | title=display · email/connect labels=mono · body=sans |

### Experience — `/experience`

| Section | Component | Fonts surfaced |
|---------|-----------|----------------|
| Experience (intro) | `ExperienceIntro.astro` → MetricCard | h2=display · eyebrow=mono · metric number & label=mono |
| Experience | `Experience.astro` | year & role-meta=mono · role titles/body=sans |
| Mentorship | `Mentorship.astro` | bullet list=sans |
| Strategic Impact | `Impact.astro` | h2=display · eyebrow=mono · list=sans |
| Contact | `Contact.astro` | as above |

### Projects — `/projects`

| Section | Component | Fonts surfaced |
|---------|-----------|----------------|
| Selected Projects (intro) | `ProjectsIntro.astro` → MetricCard | h2=display · eyebrow=mono · metric=mono |
| Flagship Case Studies | `FeaturedCaseStudies.astro` | h2=display · meta=mono · body=sans |
| Other Work | `Projects.astro` | h2=display · project meta=mono · body=sans |
| Contact | `Contact.astro` | as above |

### Research — `/research`

| Section | Component | Fonts surfaced |
|---------|-----------|----------------|
| Generative AI | `GenerativeAI.astro` | h2=display · bullet list=sans |
| Publications | `Publications.astro` → ResearchCard | h2=display · venue=mono · title=sans |
| Conferences | `Conferences.astro` → ResearchLinkGrid → ResearchCard | venue=mono · title=sans · body=sans |
| Speaking Engagements | `Speakers.astro` → SpeakingCard | h2=display · role/date/venue=mono · title=sans (600) · description=sans |
| Contact | `Contact.astro` | as above |

### Recognition — `/recognition`

| Section | Component | Fonts surfaced |
|---------|-----------|----------------|
| Awards & Recognition | `Awards.astro` → AwardPill | h4 kicker=**mono** · award name & detail=sans |
| Kaggle Competitions | `Kaggle.astro` | h2=display · rank number=mono · rank detail=mono |
| Education | `Education.astro` | `h4` label=**mono** · degree `h3`=sans · details=sans · gold-badge=mono |
| Contact | `Contact.astro` | as above |

### Vision — `/vision`

| Section | Component | Fonts surfaced |
|---------|-----------|----------------|
| Vision | `VisionBoard.astro` | BoardHeader=display · Hub/Program labels=mono · OrgImpactCard title=sans, body=sans |

### Contact — `/contact`

| Section | Component | Fonts surfaced |
|---------|-----------|----------------|
| Contact | `Contact.astro` | title=display · email/labels=mono · body=sans |

### 404 — `/404` (hardcoded, not content-driven)

| Element | Font |
|---------|------|
| Error code (`.notfound__code`, "404") | mono |
| Title (`.notfound__title`, `h1`) | display |
| Body text | sans |
| Action buttons (`.btn`) | sans, uppercase |
