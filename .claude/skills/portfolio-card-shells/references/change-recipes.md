# Change recipes

Step-by-step procedures for defining and changing boxes. Each: goal → files → steps
→ verify. Always prefer a token edit over per-component literals.

## A — Resize padding / radius / lift for all cards

**Goal:** move every card's spacing at once.
**Files:** `src/styles/global.css` `:root`.
**Steps:**

1. Edit the single token: `--card-padding`, `--card-padding-lg`, `--radius-xl`, or
   `--card-lift`. Do not touch component classes.
2. If only one tier should change, edit that tier's padding token, not the base rule.
   **Verify:** `grep -n '--card-padding' src/styles/global.css` shows one definition;
   `npm run verify`; visually confirm all tiers moved together.

## B — Recolor one card or group (per-item)

**Goal:** a card carries its own hue from a content key.
**Files:** `src/schemas/`, `src/styles/global.css`, the section component.
**Steps:**

1. If the hue is new, add the enum value to the relevant schema
   (`visionAccentSchema` / `xpLevelSchema` / `awardLevelSchema`).
2. Ensure the item token exists in `:root` (`--cat-*` / `--lvl-*` / `--medal-*`);
   add it (light + dark) if missing.
3. Add the hook-class → item-token map, e.g.
   `.vision-accent-<key> { --cat: var(--<token>); }`.
4. Confirm the card wrapper carries both the hook class and `*-accent-hook`
   (which sets `--accent-card: var(--<item-token>, var(--view-accent-X))`).
5. Set the key in the content JSON (`accent` / `level` / `medal`).
   **Verify:** the card's shell top-border and marks show the new hue in both themes;
   `npm run verify` (schema validates the enum).

## C — Give a whole view one accent (per-view)

**Goal:** all cards in a view share a single hue.
**Files:** `src/styles/global.css`.
**Steps:**

1. Set the view's `--view-accent-X` token, or set `--accent-card` on the section
   wrapper (`#<section> .card-accent { --accent-card: var(--<token>); }`).
2. Remove any per-item hook classes if switching multi-color → single.
   **Verify:** every card in the section matches; other views unaffected;
   `npm run verify`. Re-read `docs/box-color-history.md` first — view strategy has
   been reversed before (e.g. VI-001 pinned the Vision impact tiles to single blue
   before the 2026-07-06 move to 3 accent groups via `orgCards[].accent`).

## D — Add a new card tier or shell variant

**Goal:** a genuinely new surface the four tiers don't cover.
**Files:** `src/styles/global.css`; possibly a new component in `src/components/cards/`.
**Steps:**

1. Prefer extending the base rule selector (`.card, .recog-card, …, .new-shell`) so
   the variant inherits gradient/border/radius/hover automatically.
2. Add only the delta (e.g. a new padding token) — do not re-declare the shared recipe.
3. Register the tier in `design-consistency-contract.md` §5 and, if it introduces a
   sanctioned deviation, add an EX-### entry in §11.
   **Verify:** the new shell recolors via `--accent-card`; `npm run verify`; contract
   updated so the tier is not later flagged as drift.

## E — Add or adjust a state (hover / focus / active)

**Goal:** change interaction feedback.
**Files:** `src/styles/global.css`.
**Steps:**

1. **Hover** lives in the `@media (prefers-reduced-motion: no-preference)` block on
   the base selector — keep it there so reduced-motion users are respected.
2. **Focus** uses the global `:focus-visible { outline: 2px solid var(--focus-ring) }`
   — do not add a bespoke card focus ring unless the tier needs a distinct one.
3. Drive any new state value from a token (`--card-lift`, `--shadow-md`, `--focus-ring`).
   **Verify:** keyboard-tab shows the focus ring; hover lift respects reduced-motion;
   `npm run verify`.

## F — Replace a hardcoded value with a token

**Goal:** kill a magic number on a card.
**Files:** the offending component + `src/styles/global.css`.
**Steps:**

1. Find the token that already represents the value (padding, radius, gap, shadow).
2. If none exists and the value recurs, add a token to `:root` first, then reference it.
3. Replace the literal; batch all replacements in one Edit per file.
   **Verify:** the anti-patterns grep (`references/anti-patterns.md`) returns nothing new;
   `npm run verify`.

## Cross-reference

Changing the **mark or glyph inside** a card (size, circular chrome, `--mark-fg`
color) is owned by `portfolio-icon-standardization` — use that skill, not these recipes.
