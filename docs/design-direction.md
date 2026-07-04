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

- **View intros** use a section-level eyebrow (`Section`'s `eyebrow` prop, or `Eyebrow.astro` for custom headers) on sections that open a nav view: Experience, Vision, Contact. The former standalone intro blocks are gone — each view-opening section carries its own eyebrow + intro subtitle directly.
- **Content sections** inside a view (Publications, Awards, Leadership, etc.) omit eyebrows — the view label in header nav provides context.
- Ad-hoc kickers (Vision Board lede, Leadership diff heading) should match `.eyebrow` typography (`--accent-ll`, mono, uppercase).

## Components — visual notes

- **Hero:** name + title + one-line tagline + 2–3 CTAs (Projects, Contact, Résumé). Calm, lots of space.
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
