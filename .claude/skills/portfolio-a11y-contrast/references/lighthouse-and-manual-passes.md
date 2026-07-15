# Lighthouse gate + manual passes

The automated and manual verification steps that close the a11y gate. Sourced
from `docs/accessibility.md` ("Verification") and `docs/go-live-checklist.md`
(Phase 3). Run these **post-deploy** - they are the acceptance gate, not an
edit step.

## Automated: Lighthouse

- **Target:** Accessibility **≥ 95**, with **zero serious violations**.
- **When:** post-deploy, against the live URL
  (`https://balajiselvaraj1601.github.io`) - `docs/go-live-checklist.md`
  Phase 3.
- Go-live checklist also expects Lighthouse **≥ 95 on Performance, Best
  Practices, and SEO**; this skill owns the **Accessibility** score specifically.
- A score ≥ 95 does **not** waive the manual passes below - automated tooling
  misses keyboard-flow and screen-reader issues.

## Manual: keyboard pass (`docs/accessibility.md`)

Walk the site with the keyboard only:

- Every interactive element is reachable and operable by keyboard alone; tab
  order matches visual order; no unintended keyboard traps.
- A **visible focus indicator** (`--focus-ring`, ≥ 3:1) appears on each
  focusable element via `:focus-visible`.
- **Skip-to-content** link is the first focusable element.
- Mobile menu: focus is trapped while open, `Esc` closes it, and focus returns
  to the toggle.
- Confirm on nav, mobile menu, links, and the theme toggle.

## Manual: screen-reader smoke test

- VoiceOver / NVDA pass of **landmarks** (`<header>`, `<nav>`, `<main>`,
  `<footer>`) and **heading order** (one `<h1>`, no skipped levels).
- Icon buttons announce a label (`aria-label` on theme + nav toggles).
- Decorative icons are `aria-hidden`; the SVG favicon and OG image carry alt
  text.

## Manual: motion & preferences

- With **reduced motion** requested by the OS, non-essential animation is
  suppressed - motion is gated behind `prefers-reduced-motion: no-preference`
  in `global.css` (owned by `design-guardian`). No flashing content.
- Theme respects `prefers-color-scheme`; the manual toggle persists and carries
  an `aria-label`. **Both** resulting themes must pass the contrast matrix.

## Other manual checks flagged in the checklist

- Content usable at **200% zoom** (verify manually).
- Tap targets ≥ 44×44px where feasible (toggles are 40×40; mobile nav links are
  padded).

## Reporting

Record each item as pass/fail with a note. Contrast or focus-ring failures that
trace to a token value are handed to `design-guardian`; this skill does not edit
`global.css` `:root`.
