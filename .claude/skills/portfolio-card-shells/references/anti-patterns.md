# Anti-patterns and verification

Recurring box-shell mistakes and how to catch them. Shell-specific; for mark/glyph
anti-patterns see `portfolio-icon-standardization/references/accent-matrix-and-anti-patterns.md`.

## Recurring mistakes

| Violation                                                            | Symptom                                             | Fix                                                   |
| -------------------------------------------------------------------- | --------------------------------------------------- | ----------------------------------------------------- |
| Hardcoded `padding: 20px` / `border-radius: 8px` on a card           | Drifts from token SSOT; breaks a global resize      | Use `--card-padding`/`-lg`, `--radius-xl`             |
| `color: var(--accent)` on a card part                                | Purple leaks onto a gold/teal card                  | Read `var(--accent-card, var(--accent))`              |
| Card should follow the view accent but has no `.card-accent` wrapper | Card stays brand-purple instead of the section hue  | Add the section's `--accent-card` wrapper             |
| Hand-rolled `color-mix()` wash on a new surface                      | Ratios drift from the 6%/2%/40% recipe              | Reuse the base `.card` selector, don't re-mix         |
| New shell not added to the base selector                             | No gradient/hover/radius; looks flat                | Add the class to `.card, .recog-card, ...`              |
| Re-declaring the shared gradient/border in a component               | Two sources of truth; dark-mode desyncs             | Delete; inherit from the base rule                    |
| Item hue set but card lacks `*-accent-hook`                          | `--accent-card` never un-suppressed; stays fallback | Add the hook class that reads the item token          |
| Bespoke card `:focus` ring                                           | Inconsistent focus affordance                       | Use global `:focus-visible` / `--focus-ring`          |
| New padding value between 24 and 32px                                | Off-grid spacing                                    | Pick a tier; if truly new, add a token (recipe §D/§A) |

## Verification gotchas (from box-color-history.md)

- `.theme-card` is shared by **About and Vision** - a page-wide color probe
  reports two hues for it. Scope probes by section id, not by `.theme-card`.
- `.about__card-row` has **no `border-top`**, so its computed top border resolves
  to `--text`, not the accent. Don't read the accent off that selector.
- Dark hero-stat contrast: `--accent` `#6c2fbf` on `#1a1530` measures ~2.34:1
  (decorative, intentionally unfixed) - don't "correct" it as a shell bug.

## Verify a box change

1. **No new hardcoded values** - grep the touched components:
   ```bash
   grep -nE 'padding:\s*[0-9]+px|border-radius:\s*[0-9]+px|#[0-9a-fA-F]{3,6}' \
     src/components/**/*.astro
   ```
   Expect no new matches on card shells (tokens only).
2. **One `--accent-card` source per card** - the wrapper sets it; children only read it.
3. **Both themes** - check the card in light and dark; the gradient/border/stripe
   should track `--accent-card` in each.
4. **Build gate** - `npm run verify` (schema + build). In sandbox this fails on
   `bwrap`; run with the sandbox disabled or note it must run outside the sandbox.
5. **Visual** - render the affected view via the portfolio render/verify skill and
   confirm the shell, not just the mark, recolored.
