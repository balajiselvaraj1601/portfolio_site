---
name: portfolio-card-shells
description: >-
  Define, restyle, and recolor the box/card shells across the Astro portfolio -
  padding, radius, border, gradient, hover/focus states, and per-card accent
  routing through --accent-card. Use for "card shell", "box design", "change card
  padding", "card border" / "card radius", "recolor a card", "add a card tier",
  "box hover state", "accent-card", or auditing shell/token drift. Covers the four
  card tiers, the shell token SSOTs in global.css, and the JSON-class---accent-card
  cascade. Do NOT use for the size/chrome/color of the mark or glyph *inside* a box
  (that is portfolio-icon-standardization), or for cross-view design conflicts
  (that is page-consistency-team).
---

# Portfolio card shells Skill

Binding patterns for the **box shell** - the surface every card/tile/panel shares:
structure, spacing, border, gradient, states, and how it gets its accent color.
This is generic design-pattern knowledge, not per-page facts.

**Repo:** `/home/engineer/workspace/portfolio_site`

## Authorities (SSOT - do not duplicate their values)

| Source                                                        | Owns                                                                 |
| ------------------------------------------------------------- | -------------------------------------------------------------------- |
| `src/styles/global.css` `:root` + `.card` base rule (~L659)   | The token values and the shared shell recipe                         |
| `.claude/references/design-consistency-contract.md` §5-6, §11 | The four tiers, colour-highlight patterns, binding exceptions (EX-*) |
| `docs/box-color-history.md`                                   | Accent cascade + per-view/per-item decision timeline + gotchas       |
| `portfolio-icon-standardization` skill                        | The mark/glyph _inside_ a box (size, chrome, `--mark-fg`)            |

Name tokens; never re-hardcode a hex or px that already lives in `:root`.

## Core rule

> Every box color flows through **one** token:
> `--accent-card: var(--<item-token>, var(--view-accent-X))`.
> The item's own hue (category / level / medal) wins; the view accent is
> fallback-only. Components carry **zero** hardcoded hex or px - every shell value
> is a token, so light/dark and recolors happen at the source.

## The four tiers

All four share the same base shell (accent top border, `--radius-xl`, gradient,
hover lift); they differ only in padding and role. See
[references/card-tiers-and-tokens.md](references/card-tiers-and-tokens.md).

| Tier            | Shell class                                  | Padding token              | Radius        | Used by                                        |
| --------------- | -------------------------------------------- | -------------------------- | ------------- | ---------------------------------------------- |
| A - compact     | `.card`                                      | `--card-padding` (24px)    | `--radius-xl` | `.theme-card`, connect-card, proj accordion    |
| B - content     | `.content-card`                              | `--card-padding-lg` (32px) | `--radius-xl` | `ResearchCard`, `SpeakingCard`                 |
| C - recognition | `.recog-card` / `.recog-tile` / `.edu-panel` | `--card-padding` (24px)    | `--radius-xl` | Awards, Kaggle, Education (aliases of `.card`) |
| D - special     | `.card--accent`, hub ring                    | varies                     | varies        | Vision hub circle (see EX rules)               |

## Anatomy of a box shell

The shared base rule (`global.css` ~L659). Each line is driven by a token -
change the token, not the rule:

```css
.card,
.recog-card,
.recog-tile,
.content-card {
  background: linear-gradient(
    180deg,
    /* accent wash 6%-2% light, 12%-4% dark */
    color-mix(in srgb, var(--accent-card, var(--accent)) 6%, var(--bg-elev)),
    color-mix(in srgb, var(--accent-card, var(--accent)) 2%, var(--bg-elev))
  );
  border: 1px solid /* hairline, 40% accent-tinted */
    color-mix(in srgb, var(--accent-card, var(--accent)) 40%, var(--border));
  border-top: 2px solid var(--accent-card, var(--accent)); /* the categorical stripe (EX-003) */
  border-radius: var(--radius-xl); /* 14px */
}
/* hover (prefers-reduced-motion: no-preference): translateY(--card-lift) + --shadow-md,
   border-color - --accent-card. focus-visible: global 2px --focus-ring outline. */
```

Every part reads `var(--accent-card, var(--accent))` - set `--accent-card` on a
wrapper and the whole shell recolors. Never set `--accent` directly on a card.

## How a box gets its color (80% case)

Three-hop cascade - content key - hook class - token:

```
JSON accent/level/medal key   -   .<name>-accent-hook class   -   --accent-card
  "impact"                        .vision-accent-impact           var(--cat, var(--view-accent-vision))
```

- **Per-view (single accent):** the section wrapper sets `--accent-card` to the
  view's `--view-accent-*`; all cards match (Research, Contact, Education).
- **Per-item (multi-color):** each card carries a `.<name>-accent-<key>` class that
  sets an item token (`--cat` / `--lvl` / `--medal`); the card un-suppresses it via
  `--accent-card: var(--<item-token>, var(--view-accent-X))` (Vision programs,
  Experience by level, Awards by level).

Full sources table, schema wiring, and the per-view-vs-per-item decision:
[references/accent-routing.md](references/accent-routing.md).

## Changing a box

| The change you want                          | Recipe                                                       |
| -------------------------------------------- | ------------------------------------------------------------ |
| Resize padding / radius / lift for all cards | `change-recipes.md` §A - edit the token in `:root` once      |
| Recolor one card / group per-item            | `change-recipes.md` §B - enum + hook class + item token      |
| Give a whole view one accent                 | `change-recipes.md` §C - `--view-accent-X` / section wrapper |
| Add a new card tier or shell variant         | `change-recipes.md` §D                                       |
| Add / adjust hover, focus, active state      | `change-recipes.md` §E                                       |
| Replace a hardcoded value with a token       | `change-recipes.md` §F                                       |
| Change the mark/glyph _inside_ the card      | Use `portfolio-icon-standardization`, not this skill         |

See [references/change-recipes.md](references/change-recipes.md).

## When to load references

| If the task involves...                                                      | Load                                  |
| -------------------------------------------------------------------------- | ------------------------------------- |
| Tier selection, full token tables, binding exceptions                      | `references/card-tiers-and-tokens.md` |
| The full `--accent-card` sources table, schema enums, per-view vs per-item | `references/accent-routing.md`        |
| A step-by-step change procedure                                            | `references/change-recipes.md`        |
| Auditing drift / a recurring mistake / verifying a change                  | `references/anti-patterns.md`         |
| A simple shell tweak with the tokens above (default)                       | Inline guidance - no reference needed |

## Efficiency: batch edits and parallel calls

- **Token-wide changes:** edit the single `:root` declaration in `global.css` once -
  never touch each component.
- **Batch edits:** combine all changes to one file (a schema enum + its class map)
  into a single Edit call.
- **Parallel calls:** run independent checks (`npm run verify` + a hardcoded-value
  grep) in one message.
- **Read before edit:** read `global.css` and the target component once, plan every
  change, then apply the fewest edits.

## Quick reference: where to go deeper

| Topic                                                                                   | Reference file                                                             |
| --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Four tiers, shell token tables, tier decision tree, binding exceptions                  | [references/card-tiers-and-tokens.md](references/card-tiers-and-tokens.md) |
| `--accent-card` un-suppress pattern, sources table, schema wiring, per-view vs per-item | [references/accent-routing.md](references/accent-routing.md)               |
| Step-by-step procedures for defining and changing boxes                                 | [references/change-recipes.md](references/change-recipes.md)               |
| Recurring mistakes, verification gotchas, change checklist                              | [references/anti-patterns.md](references/anti-patterns.md)                 |
