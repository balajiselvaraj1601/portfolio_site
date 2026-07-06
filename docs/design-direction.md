# Design Direction

Tech-agnostic visual language. Defines tokens and principles; any stack/CSS approach can
implement them. The site should read as **credible, senior, and technical** — not flashy.

## Principles

- **Minimalist & content-first.** Generous whitespace; the work is the hero (à la Vercel,
  Stripe, Linear, Apple references). No decorative clutter.
- **Professional restraint.** One accent color, used sparingly for emphasis and links.
- **Legible density.** Long-form bullets must stay scannable — short measure, clear hierarchy.
- **Motion as polish, not spectacle.** Subtle entrance/hover transitions; always honor
  `prefers-reduced-motion`.

## Color tokens (semantic — provide both themes)

Purple biopharma palette. Dark theme is the primary design target; light theme uses derived tints.

| Token                    | Dark                    | Light                   | Use                                                                                |
| ------------------------ | ----------------------- | ----------------------- | ---------------------------------------------------------------------------------- |
| `--bg`                   | `#0D0B1E`               | `#FAF8FF`               | Page background                                                                    |
| `--bg-alt` / `--bg-elev` | `#13102B` / `#1A1530`   | `#F0EBFA` / `#FFFFFF`   | Alt sections / cards                                                               |
| `--text`                 | `#E8E0F5`               | `#1A1530`               | Primary text                                                                       |
| `--text-muted`           | `#9085B8`               | `#5C5470`               | Secondary text                                                                     |
| `--border`               | `rgba(108,47,191,0.25)` | `rgba(108,47,191,0.18)` | Dividers, card borders                                                             |
| `--accent`               | `#6C2FBF`               | `#6C2FBF`               | Links, active nav, primary CTA, metric numbers                                     |
| `--accent-light`         | `#9B5EE8`               | `#8348D6`               | Interactive emphasis (links, hovers, `.accent` spans) — light value is AA-adjusted |
| `--accent-ll`            | `#C4A0F5`               | `#7B3FD4`               | Static labels (eyebrows, kickers, group headings)                                  |
| `--accent-red`           | `#C0182A`               | `#C0182A`               | Secondary accent (awards, tags)                                                    |
| `--bg-chip`              | `#211D3A`               | `#E8E0F5`               | Skill/tag pills (`.chip`)                                                          |
| `--logo-surface`         | `#FFFFFF`               | `#FFFFFF`               | Logo badge containers                                                              |
| `--focus-ring`           | `#9B5EE8`               | `#6C2FBF`               | Keyboard focus outline                                                             |

> These are sensible defaults, not mandates. Whatever values are chosen must pass **WCAG AA
> contrast** in both themes (see `accessibility.md`). Verify text/background and accent/background pairs.

### Per-view accent family

One harmonized accent family — matched perceived lightness/chroma, even hue spacing, AA ≥3:1
on `--bg-elev` in both themes. Violet is the dominant brand; the rest are supporting accents.
Per-view accents (`--view-accent-*`), the categorical palette (`--cat-*`, and About's
`--about-cat-*` which now alias `--cat-*`), and award-level tokens (`--lvl-*`) all derive from
these. Changing a level token intentionally moves both its badge and the views/categories that
reference it.

| Family role     | Light (on `#FFF`) | Dark (on `#1A1530`) | Drives                                                   |
| --------------- | ----------------- | ------------------- | -------------------------------------------------------- |
| Violet (anchor) | `#6C2FBF`         | `#9B5EE8`           | brand, about/experience/contact, `--cat-ai`              |
| Indigo          | `#4B46CC`         | `#7F86F2`           | research, `--lvl-senior-director`, `--cat-strategic`     |
| Teal            | `#10897F`         | `#2FD4C0`           | vision, `--lvl-director`, `--cat-platform`               |
| Amber (gold)    | `#B8790A`         | `#F0B429`           | recognition, `--accent-gold`/`--lvl-evp`, `--cat-impact` |
| Rose            | `#CF3168`         | `#F778A8`           | `--lvl-national`, `--cat-people`                         |
| Green           | `#2C8A45`         | `#46CF72`           | `--cat-gxp`                                              |
| Red (semantic)  | `#C0182A`         | `#C0182A`           | errors, `--lvl-associate-director`/`--cat-privacy`       |

## Per-page color assignment

Every nav view gets a primary accent (via `--view-accent-*`) and contextual sub-accents via categorical or level tokens — all drawn from the fixed 7-hue family above. Each accent flows through the cascade: `--view-accent-*` (view fallback) → `--cat-*`/`--lvl-*`/`--medal-*` (per-item) → `--accent-card` (applied on card shells), with no new hues or hardcoded hex literals. This ensures theme coherence: light/dark are locked together by token inheritance.

| View             | Primary (fallback)               | Per-item accents                                                                                                                                                                                         | Notes                                                                                                         |
| ---------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| **About** (home) | Violet (`--accent`, brand)       | Leadership categories via `--cat-*`: Strategy=indigo, Business Impact=amber, Platform=teal, People=rose, AI Governance=violet, Privacy=red, GxP=green. Education=amber (recognition-owned).              | Hero, Thirukural band, About headline use primary violet. Leadership rows use categorical color per role.     |
| **Experience**   | Violet (`--accent`)              | Per career level via `--lvl-*`: principal=violet, staff=indigo, senior=teal, lead=amber, associate=rose, engineer=red. Timeline rail uses violet→red gradient (temporal axis, past→present, see EX-017). | Role badges colored by level; timeline spine is intentional unified gradient, not per-role.                   |
| **Research**     | Indigo (`--lvl-senior-director`) | Publications=indigo, Conferences=teal, Speakers=violet.                                                                                                                                                  | Section-specific accent per content type; view fallback is indigo.                                            |
| **Recognition**  | Amber/gold (`--accent-gold`)     | Awards per level (evp=amber, cio=violet, senior-director=indigo, director=teal, associate-director=red, national=rose); Kaggle medals (gold default, silver, bronze); Education=amber.                   | Card shells tinted by award level or medal. View fallback is amber/gold.                                      |
| **Vision**       | Teal (`--lvl-director`)          | Programs & impact per JSON `accent` field: impact=amber, strategic=indigo, platform=teal, people=rose, privacy=red, ai=violet, gxp=green. Hub nodes IDEA=violet, VISION=teal.                            | Each program/impact card colored by its accent attribute. Hub nodes tinted by hub hue. View fallback is teal. |
| **Contact**      | Violet (`--accent`, brand)       | Social links per platform: LinkedIn=indigo, GitHub=violet, Kaggle=teal, Email=amber, Location=green.                                                                                                     | Each connect card tinted by platform hue via `--cat-*` mappings.                                              |

## Typography

Three font roles — map by **semantic role**, not per-component preference. Tokens live in
`src/styles/global.css` (`--font-display`, `--font-sans`, `--font-mono`).

| Role          | Font             | Use                                                               |
| ------------- | ---------------- | ----------------------------------------------------------------- |
| Display       | DM Serif Display | h1/h2, brand wordmark, editorial pull-quotes                      |
| Body / UI     | Inter Variable   | Body copy, h3/h4 card titles, nav, buttons, content chips         |
| Labels / meta | JetBrains Mono   | Eyebrows, dates, venues, stat numbers, micro-badges, footer strip |

**Canonical mapping**

| Element type                     | Font             | Weight / style                 |
| -------------------------------- | ---------------- | ------------------------------ |
| Primary display heading (h1, h2) | DM Serif Display | 400, tight line-height         |
| Brand wordmark                   | DM Serif Display | 400                            |
| Editorial pull-quote             | DM Serif Display | 400                            |
| Card title (h3)                  | Inter            | 600–700                        |
| Category label (h4)              | Inter            | 600, uppercase, tracked        |
| Body / long-form                 | Inter            | 400                            |
| Nav links, buttons               | Inter            | 500–600                        |
| Skill / content chips            | Inter            | 500                            |
| Eyebrow / kicker                 | JetBrains Mono   | 400, uppercase, wide tracking  |
| Metadata (date, venue, domain)   | JetBrains Mono   | 400                            |
| Stat / metric number             | JetBrains Mono   | 600                            |
| Stat / metric label              | JetBrains Mono   | 400 (utility: `.metric-label`) |
| Micro-badge / status             | JetBrains Mono   | 600, uppercase                 |
| Footer identity strip            | JetBrains Mono   | 400, uppercase                 |
| Quote attribution                | JetBrains Mono   | 400, normal (not italic)       |
| Non-Latin script (e.g. Tamil)    | Inter            | 400 — never DM Serif           |

**Scale (rem):** h1 `clamp(2.8rem, 6vw, 5.5rem)`, h2 `clamp(2rem, 4vw, 3rem)`, body `0.95–1.0625`, eyebrow `0.72`

**Weight tokens:** the numeric weights above map to `--fw-regular` 400 · `--fw-medium` 500 ·
`--fw-semibold` 600 · `--fw-bold` 700 (SSOT — components reference the token, never a literal).

**Do not change:** nav stays Inter (scannability); skill/chip tags stay Inter (readable content tokens).

## Spacing & layout

- Base spacing unit `4px`; use a consistent scale (4, 8, 12, 16, 24, 32, 48, 64).
- Content max-width `1200px` (`--maxw` on `.container`); text blocks narrower (`--maxw-text`, ~`70ch`).
- Section vertical rhythm: large, consistent padding between sections (e.g. 64–96px desktop).
- Responsive breakpoints: `--bp-sm` (560px), `--bp-md` (768px), `--bp-lg` (900px), `--bp-xl` (1024px).

## Section eyebrows

- **View intros** use a section-level eyebrow (`Section`'s `eyebrow` prop, or `Eyebrow.astro` for custom headers) on sections that open a nav view: About (`leadership`), Experience, Research (`publications`), Recognition (`awards`), Vision, Contact. The former standalone intro blocks are gone — each view-opening section carries its own eyebrow + intro subtitle directly.
- **Content sections** inside a multi-section view (`conferences`, `speakers`, `kaggle`, `education`) omit eyebrows — the view label on the opening section provides context.
- Ad-hoc kickers (Vision Board lede, Leadership diff heading) should match `.eyebrow` typography (`--accent-ll`, mono, uppercase).

## Components — visual notes

- **Hero:** name + title + one-line tagline + 2–3 CTAs (Experience, Contact, Résumé). Calm, lots of space.
- **Timeline (Experience):** single rail with role markers; project sub-groups; primary
  bullets full-weight, `secondary` bullets muted.
- **Project cards:** title, domain, one-line summary, tag chips; hover elevation; optional detail.
- **Skill chips:** grouped by category; quiet pill style, not loud badges.
- **Link lists (Publications/Conferences/Kaggle):** label + title, external-link icon, clear hover.

## Motion

- Durations 150–250ms; ease-out for entrances.
- Effects limited to opacity/transform (cheap, smooth); no layout-thrashing animations.
- Wrap all non-essential motion in `@media (prefers-reduced-motion: no-preference)`.

## Imagery

- Optional professional headshot in Hero/About (`assets/images/`).
- One OG/social image (`assets/og/`) — name, title, accent background.
- Keep imagery light; the portfolio is text-led.

## Related docs

- [Assets](./assets.md) — file paths and specs for OG/headshot
- [Accessibility](./accessibility.md) — contrast requirements for tokens above
- [Specification](./specification.md) — component visual notes
