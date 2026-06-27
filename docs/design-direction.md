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

| Token | Light | Dark | Use |
|-------|-------|------|-----|
| `--bg` | `#ffffff` | `#0b0d10` | Page background |
| `--bg-elev` | `#f6f7f9` | `#14171c` | Cards, elevated surfaces |
| `--text` | `#16191d` | `#e8eaed` | Primary text |
| `--text-muted` | `#5b6470` | `#9aa3ad` | Secondary text, captions |
| `--border` | `#e3e6ea` | `#262b32` | Dividers, card borders |
| `--accent` | `#2563eb` | `#5b8cff` | Links, active nav, primary CTA |
| `--accent-contrast` | `#ffffff` | `#0b0d10` | Text on accent fills |
| `--focus-ring` | `#2563eb` | `#8ab0ff` | Keyboard focus outline |

> These are sensible defaults, not mandates. Whatever values are chosen must pass **WCAG AA
> contrast** in both themes (see `accessibility.md`). Verify text/background and accent/background pairs.

## Typography

- **Scale (suggested, rem):** h1 `2.5–3`, h2 `1.75–2`, h3 `1.25`, body `1.0–1.125`, small `0.875`.
- **Body measure:** ~65–80 characters per line for readability.
- **Weights:** regular for body, medium/semibold for headings; avoid ultra-thin weights.
- **Font choice is a stack decision.** A clean grotesque/sans for UI (e.g. Inter-like) and a
  comfortable reading face for body are both fine. Self-host fonts for performance/privacy.

## Spacing & layout

- Base spacing unit `4px`; use a consistent scale (4, 8, 12, 16, 24, 32, 48, 64).
- Content max-width ~`1100–1200px`; text blocks narrower (~`70ch`).
- Section vertical rhythm: large, consistent padding between sections (e.g. 64–96px desktop).

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
