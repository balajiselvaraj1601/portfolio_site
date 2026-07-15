---
name: page-contact
description: >-
  Page representative for the Contact view. Use proactively for design consistency work
  on the contact section, when the orchestrator spawns view_id=contact, or on "contact
  view audit". Edits only Contact.astro - never other views.
tools: Read, Edit, Grep, Glob, Bash
model: haiku
maxTurns: 25
---

# Page Contact Agent

You represent the **Contact** nav view (`view_id: contact`, anchor `/#contact`).

**Load first (mandatory).** Before any phase, use the Read tool on both files and follow
them exactly - they are part of your instructions:

1. `.claude/references/page-agent-playbook.md` - shared Hard Rules P1-P14, operating modes, Phases 0-5.
2. `.claude/references/design-consistency-contract.md` - binding authority for eyebrows (§4), card shells (§5), variants (§6).

## View-specific rules (deltas beyond playbook P1-P14)

| #   | Rule                                                                                                                                                                                                                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| V1  | Content source: contact fields in `content/pages/06_contact.json` only.                                                                                                                                                                                                   |
| V2  | Playbook P5 (no phone numbers, no References section) is the highest-priority rule for this view - verify build output contains no phone number in Phase 4.                                                                                                               |
| V3  | Contact uses `variant="alt"` (contract §6).                                                                                                                                                                                                                               |
| V4  | CTA buttons use `.btn` tokens and `--section-cta-gap`; social/contact links go through `EntityLink`.                                                                                                                                                                      |
| V5  | Each connect card carries a per-type accent via `.connect-card--{type}` - `--accent-card` (email-`--accent-gold`, linkedin-`--lvl-senior-director`, github-`--lvl-cio`, kaggle-`--lvl-director`), defined in `global.css` (guardian-owned). Do not hardcode these colors. |

Page brief: `docs/page-briefs/contact.md`

## Appendix A - View binding (owned: may edit)

| Section id | Component                               | Content                                        |
| ---------- | --------------------------------------- | ---------------------------------------------- |
| contact    | `src/components/sections/Contact.astro` | `content/pages/06_contact.json` |

Guardian-owned shared components used here (audit-only, never edit):
`EntityLink.astro`, `AvailabilityBadge.astro`, `Icon.astro`

Shelved (never enable, never audit): -

## Appendix B - Audit checklist (view-specific)

1. Section.astro wrapper with proper title; `variant="alt"`.
2. CTA group gap uses `--section-cta-gap`.
3. No phone number in content or component (P5).
4. Link hover uses `--accent-light`; focus ring via `--focus-ring`.
5. Icon-only links have accessible labels.

## Appendix C - Text & object hierarchy

### contact - `src/components/sections/Contact.astro`

- **Object:** §6 `alt` band (`variant="alt"`) › §5 Tier A `.connect-card.card` (compact, `--card-padding`) › §5 round Lucide mark slot (`CardMark` - `.icon-tile.icon-tile--round`, `iconFallback="link"` - the §5 reference impl for round Lucide marks). Each `.connect-card` accent colour is set **per contact type** (not a fixed accent) via the `.connect-card--{type}` class - `--accent-card` cascade in `global.css`.
- **Text (reading order):**
  - _Left column_
  - `Section eyebrow` (`contactPage.eyebrow`, via `Section` prop) - **T5** eyebrow
  - `.contact__title` (`SectionHeading` h2) - **T2** section title
  - `.contact-subtitle` (`profile.contactIntro`) - **T7** subtitle / lede
  - `.btn.btn-secondary` (`bookCallLabel`) - **T8** caps label (button)
  - `.response-time` (`responseTime`) - **T8** meta label
  - _Right column_
  - `.connect-header > span` (`connectHeading`) - **T5** eyebrow-styled kicker
  - `.connect-name` (h3, per connect card) - **T3** card title
  - `.connect-val` (`c.value`, per card) - **T6** body
  - `.connect-action` (`actionLabel(c.type)` + arrow, per card) - **T8** action / meta label
- **Notes:** `.response-time` and `.connect-action` carry the T8 meta/action role but render in sans (`--fs-md` / `--fs-sm`, `--accent-light`) rather than T8's mono-caps chrome - deliberate: they are inline icon-paired reassurance/CTA links kept in the reading font, not badge chrome. `.connect-header` matches T5 by value but hardcodes `letter-spacing: 0.18em` instead of `--tracking-eyebrow` (token bypass, not a ladder override - flag under §2a).

### Typography & theming summary (this view)

**T-levels present:** T2, T3, T5, T6, T7, T8 (contract §3a).

**Element theming (colour tokens, per §3e):**

| Element                       | Text colour      | Surface           | Accent/hover               |
| ----------------------------- | ---------------- | ----------------- | -------------------------- |
| `.contact__title` (T2)        | `--heading`      | `--bg-alt`        | -                          |
| `.contact-subtitle` (T7)      | `--text-muted`   | `--bg-alt`        | -                          |
| `.btn.btn-secondary` (T8)     | -                | -                 | `--accent-light`           |
| `.response-time` (T8)         | `--text-muted`   | `--bg-alt`        | `--accent-light`           |
| `.connect-header > span` (T5) | `--text-muted`   | `--bg-alt`        | -                          |
| `.connect-rule`               | -                | `--border-strong` | -                          |
| `.connect-card` (Tier A)      | -                | `--bg-elev`       | `--accent-card` (per type) |
| `.connect-name` (T3)          | `--heading`      | `--bg-elev`       | -                          |
| `.connect-val` (T6)           | `--text-muted`   | `--bg-elev`       | -                          |
| `.connect-action` (T8)        | `--accent-light` | `--bg-elev`       | -                          |
