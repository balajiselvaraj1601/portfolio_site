# Anti-patterns and fixes

Drift signatures that break the one-standard goal, each with its symptom and fix.
Scan for these when auditing a view or when a mark renders wrong. For the deeper
audit / accent matrix, `portfolio-icon-standardization` owns the full enforcement
pass; this list is the fast field guide.

| #   | Anti-pattern                                  | Symptom                                                       | Fix                                                                                                  |
| --- | --------------------------------------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1   | Hardcoded px `width`/`height` on a mark       | one icon out of scale with peers; ignores `--mark-glyph`      | remove the literal; let the token size it                                                            |
| 2   | Hex color / hand-rolled `color-mix` on a mark | icon doesn't re-tint per view or theme                        | delete the literal; set `--accent-card` on the wrapper and let `--mark-fg`/`--mark-chrome` derive it |
| 3   | Pipeline mark (`logo_*`) wrapped in chrome    | double ring - drawn ring inside a chrome circle               | render bare; `logoHasOwnRing()` should route it out of `.theme-card__icon`                           |
| 4   | Raster/logo dropped in as bare `<img src>`    | bypasses badge/fallback logic; no theme ink                   | reference by slug (`logo: "<slug>"` / `VisionMark`), render through `LogoBadge`/`CardMark`           |
| 5   | Missing circular chrome                       | square/rounded-rect where a circle is expected                | use `.theme-card__icon` (`border-radius:50%` on a `--mark-slot` box), not an ad-hoc radius           |
| 6   | Brand mark tinted with the accent             | github/linkedin/etc. shows purple/teal instead of neutral ink | ensure it's in `BRAND_MONO_ICONS`; it should render `--brand-mark`                                   |
| 7   | Un-normalized mark SVG                        | glyph sits off-center at the shared scale                     | run `normalize-mark-viewbox.py apply`                                                                |
| 8   | Inline emoji / unicode glyph in markup        | inconsistent metrics, no tint, no a11y label                  | replace with a semantic `IconName` through the icon system                                           |
| 9   | Icon name absent from `iconNameSchema`        | build fails, or silently falls back to `folder`/`diamond`     | add the name (+ path in `icon-paths.json`), or pick an existing name                                 |
| 10  | New size as a raw number instead of a token   | `--icon-*` ↔ `ICON_SIZE_TOKENS` drift                         | use the `xs...xl` token; keep both sides in sync (guarded by `check:tokens`)                           |
| 11  | Duplicating a token value into a component    | future global change misses this copy                         | reference the token; a global change must be a single `:root` edit                                   |
| 12  | Fallback icon shipped as if intentional       | generic `folder`/`diamond` where a real mark belongs          | resolve the real asset (see `portfolio-icon-audit`) before shipping                                  |

## Verification commands

- `npm run check:tokens` - `scripts/check-icon-token-sync.mjs`; fails on `--icon-*` ↔ `ICON_SIZE_TOKENS` drift (anti-pattern #10).
- `python3 scripts/icons/normalize-mark-viewbox.py check` - reports un-normalized mark viewBoxes (anti-pattern #7).
- `npm run build` - catches invalid icon names / schema violations (anti-pattern #9).
- `npm run verify` - full gate (check + tokens + lint + format + build) before handoff.
