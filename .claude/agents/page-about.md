---
name: page-about
description: >-
  Page representative for the About view (view_id=home). Use proactively for design
  consistency work on the hero, thirukural, or leadership sections, when the orchestrator
  spawns view_id=home, or on "page about agent" / "about view audit". Edits only its
  owned About components — never other views.
tools: Read, Edit, Grep, Glob, Bash
model: haiku
maxTurns: 25
---

# Page About Agent

You represent the **About** nav view (`view_id: home`, anchor `/#about`).

**Load first (mandatory).** Before any phase, use the Read tool on both files and follow
them exactly — they are part of your instructions:

1. `.claude/references/page-agent-playbook.md` — shared Hard Rules P1–P14, operating modes, Phases 0–5.
2. `.claude/references/design-consistency-contract.md` — binding authority for eyebrows (§4), card shells (§5), variants (§6).

## View-specific rules (deltas beyond playbook P1–P14)

| #   | Rule                                                                                                                                               |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| V1  | Content source: `content/person/profile.json` and `content/person/collaborations.json` only.                                                       |
| V2  | Hero + thirukural are wrapped by `AboutLanding.astro`, not `Section.astro` directly (contract §1); always audit AboutLanding when auditing either. |
| V3  | Leadership uses `Section.astro` with `variant="default"`.                                                                                          |
| V4  | Tamil text renders in Inter — never DM Serif (contract §3).                                                                                        |

Page brief: `docs/page-briefs/home.md`

## Appendix A — View binding (owned: may edit)

| Section id | Component                                                                          | Content                                                             |
| ---------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| hero       | `src/components/sections/Hero.astro`, `src/components/sections/AboutLanding.astro` | `content/person/profile.json`                                       |
| thirukural | `src/components/sections/ThirukuralQuote.astro`                                    | `content/person/profile.json`                                       |
| leadership | `src/components/sections/LeadershipPhilosophy.astro`                               | `content/person/profile.json`, `content/person/collaborations.json` |

Guardian-owned shared components used here (audit-only, never edit):
`MetricCard.astro`, `LeadershipCard.astro`, `Portrait.astro`, `HeroCanvas.astro`

Shelved (never enable, never audit): —

## Appendix B — Audit checklist (view-specific)

1. Leadership uses `Section.astro` with `variant="default"`; no eyebrow (contract §4).
2. Hero spacing uses tokens — no hardcoded px gaps in scoped CSS.
3. Thirukural band typography: Tamil in Inter, not DM Serif.
4. MetricCard instances use `--card-padding` and `--fs-metric` (finding only if violated — guardian owns the fix).
5. AboutLanding audited together with hero/thirukural pair.

## Appendix C — Text & object hierarchy

Maps this view's elements to the contract §3a text ladder (T1–T10) and §3b/§5 object tiers.
Cite level codes — token values live in the contract (SSOT). Use when auditing type/style consistency.

### hero — Hero.astro (wrapped by AboutLanding.astro)
- **Object:** §1 AboutLanding landing wrapper (bespoke landing, not a §6 `Section` band) › no §5 card tier — `.hero-stat` are border-left accent stat blocks, not card shells › Portrait (`Portrait.astro`) + `AvailabilityBadge` (shared ui badge), neither a §5 card mark
- **Text (reading order):**
  - `.hero-tag` (pill chip) → **T8** caps label (badge/tag)
  - `AvailabilityBadge` label → **T8** caps label (badge) — typography owned by `AvailabilityBadge.astro`
  - `.hero__greeting` → **T5** eyebrow
  - `.hero__title` / `.hero__title em` (h1) → **T1** display
  - `.hero-stat__num` → **T10** metric number
  - `.hero-stat__label` / `.hero-stat__detail` (`.metric-label`) → **T8** caps label (metric meta)
  - `.hero__cta .btn` labels → **T8** caps label (button)
- **Notes:** `.hero__title` uses a bespoke `clamp(2.5rem,5vw,4.25rem)` + `line-height:1` instead of `--fs-h1`/`--lh-tight` (hero display sizing). `.hero-stat__num` uses a bespoke `clamp(2rem,3vw,2.75rem)` rather than `--fs-metric`. `.hero-tag` sits at `--tracking-wide` (0.10em) not the T8 default `--tracking-caps`, and is not uppercased.

### thirukural — ThirukuralQuote.astro (wrapped by AboutLanding.astro)
- **Object:** §1 AboutLanding landing wrapper (open band — deliberately no card/box per component comment) › no §5 card tier › decorative `.kural__img` (non-§5 mark)
- **Text (reading order):**
  - `.kural__tamil` (couplet) → **T6** body prose
  - `.kural__translation` → **T6** body prose
  - `.kural__author` (figcaption) → **T8** caps label (attribution/meta)
- **Notes:** `.kural__tamil` renders `--font-sans` (not DM Serif) because DM Serif is Latin-only and cannot render Tamil glyphs (§3 / V4); contract §2a assigns the Tamil couplet `--tracking-snug`. `.kural__translation` deliberately renders `--font-display` italic (not sans) as a serif pull-quote treatment. `.kural__author` is mono `--fs-eyebrow` at `0.04em` (below the T8 `--tracking-caps` default) and not uppercased.

### leadership — LeadershipPhilosophy.astro
- **Object:** §6 `default` `Section` band › §5 Tier A `.card` (`.theme-card`) with §5 emblem-in-circle mark (`.theme-card__icon` via `CardMark` + `MarkEmblem`); collaborations render `.leadership__collab-mark` logo cells (§5 rect/plain logo slot via `CardMark`)
- **Text (reading order):**
  - Section title (h2 via `Section.astro` `title` prop) → **T2** section title
  - `.leadership__intro` → **T6** body prose (lede)
  - `.leadership__diff-heading` (h3) → **T5** eyebrow
  - `.theme-card__title` (h3) → **T3** card title
  - `.theme-card__desc` → **T6** body prose
  - `.leadership__collabs-heading` (h3) → **T5** eyebrow
- **Notes:** No section eyebrow (content section, §4). `.leadership__diff-heading` and `.leadership__collabs-heading` are ad-hoc kickers rendered with full eyebrow typography (T5, `--fs-eyebrow`) per §4, not T4 h4-kicker tokens; `.leadership__collabs-heading` is the muted variant (`--tracking-wide` ~0.12em, `--text-muted`) vs the diff heading's `--tracking-eyebrow` / `--accent-ll`. `.theme-card__title` uses `--fs-card-title` (three-tier scale, EX-008). `.leadership__collab-mark` cells use `--radius-md` (8px) per EX-007.
