# Accessibility Checklist (WCAG 2.1 AA)

Acceptance checklist for the portfolio site. Target: **WCAG 2.1 AA** in both light and dark themes.

> **Implementation note:** Core patterns are built into `Layout.astro`, `Header.astro`,
> `Section.astro`, and `global.css`. Items marked  are implemented; ⏳ need manual verification
> post-deploy (Lighthouse, screen reader pass).

## Structure & semantics

- [x] One `<h1>` per page; headings nest logically (no skipped levels).
- [x] Landmark elements: `<header>`, `<nav>`, `<main>`, `<footer>` (sections use `Section.astro`).
- [x] Lists use real list markup; links are `<a>`, buttons are `<button>`.
- [x] **Skip-to-content** link as the first focusable element (`Layout.astro`).

## Keyboard

- [x] Every interactive element is reachable and operable by keyboard alone.
- [x] Logical tab order matches visual order.
- [x] **Visible focus indicator** on focusable elements (`--focus-ring` in `global.css`).
- [x] Mobile menu: focus trapped while open, `Esc` closes, focus returns to toggle.
- [x] No unintended keyboard traps.

## Color & contrast

- [x] Body text ≥ **4.5:1** contrast (tokens in `design-direction.md` / `global.css`).
- [x] Large text ≥ **3:1**.
- [x] UI components / focus indicators ≥ **3:1**.
- [x] Information not conveyed by color alone (external-link icons on link lists).

## Images & media

- [x] SVG favicon has `aria-label`; decorative icons use `aria-hidden`.
- [x] OG/social image has `og:image:alt` in `BaseHead.astro`.
- [x] Icon buttons have `aria-label` (theme toggle, nav toggle).

## Motion & preferences

- [x] Non-essential animation gated behind `prefers-reduced-motion: no-preference`.
- [x] No flashing content.
- [x] Theme respects `prefers-color-scheme`; manual toggle persists with `aria-label`.

## Forms (if/when a contact form is added - C1)

- [ ] Every input has a associated `<label>`.
- [ ] Errors are announced (`aria-live`) and linked to fields (`aria-describedby`).
- [ ] Submit feedback is perceivable without color alone.

## Responsive & zoom

- [x] Usable at 320px width; mobile nav below 900px breakpoint.
- [ ] Content usable at 200% zoom - verify manually.
- [x] Tap targets ≥ 44×44px (theme/nav toggles are 40×40; nav links padded on mobile).

## Verification

- [ ] Automated: Lighthouse a11y audit ≥ 95, zero serious violations (run post-deploy).
- [ ] Manual: full keyboard pass of nav, menu, links, theme toggle.
- [ ] Manual: screen-reader smoke test (VoiceOver / NVDA) of landmarks and headings.

## Related docs

- [Design direction](./design-direction.md) - contrast token targets
- [Go-live checklist](./go-live-checklist.md) - Lighthouse step
- [Specification](./specification.md) - nav and mobile menu behavior
