# Contrast check procedure (before editing a token)

Compute the contrast ratio for a proposed token value **before** `design-guardian`
edits `global.css` `:root` — and always in **both** themes. This skill measures;
it does not set the value.

## What the ratio must clear (WCAG 2.1 AA)

| Pair being checked                                      | Minimum ratio |
| ------------------------------------------------------- | ------------- |
| Body text on its background                             | **4.5:1**     |
| Large text (≥ 24px, or ≥ 18.66px bold)                  | **3:1**       |
| UI component boundaries, icon strokes, focus indicators | **3:1**       |

Both light and dark must pass. A token that passes in dark but fails in light
(or vice versa) is a **fail** — the site ships both themes.

## Inputs (read, never copy into this skill)

1. The **proposed** token value (the candidate hex `design-guardian` is
   considering).
2. The **surface** it renders on. Read the surface token's value from
   `src/styles/global.css` `:root`:
   - Light theme block, then the dark theme block (`html[data-theme="dark"]` /
     the dark `:root` override).
   - Surfaces: `--bg` (page), `--bg-alt` (alt sections), `--bg-elev` (cards —
     where accent shells render).
3. Which role the token plays → picks the threshold from the table above
   (body text = 4.5:1; accent border / focus ring / icon = 3:1).

## Steps

1. **Resolve both endpoints to concrete sRGB.** Follow `var()` chains to a
   literal (e.g. `--cat-impact → --accent-gold → #… `; `--lvl-evp → --accent-gold`).
   Do this **per theme** — the same token name resolves to different hex in the
   light vs dark `:root` block.
2. **Compute relative luminance** for each endpoint (WCAG formula): linearize
   each channel `c/255`; if ≤ 0.03928 → `c/12.92`, else →
   `((c+0.055)/1.055)^2.4`; then `L = 0.2126·R + 0.7152·G + 0.0722·B`.
3. **Contrast ratio** = `(L_lighter + 0.05) / (L_darker + 0.05)`.
4. **Compare** to the role's threshold. Record `token · theme · surface ·
measured · required · PASS/FAIL`.
5. **Repeat for the other theme.** Both must pass.
6. If translucent tokens are involved (e.g. `--border` uses `rgba(...)`, shells
   use `color-mix`), composite the color over its surface first, then compute —
   the effective color is what the eye sees.

## Tooling

- Any WCAG contrast formula implementation is fine (a small script, or a known
  checker). The math above is the SSOT for the ratio; do not eyeball it.
- Keep the computation reproducible: log both resolved hex endpoints per theme
  so the report is auditable.

## Output

A per-pair report line, e.g.:

```
--cat-impact · dark · --bg-elev · 3.6:1 · need 3:1 · PASS
--cat-impact · light · --bg-elev · 2.8:1 · need 3:1 · FAIL
```

Hand every FAIL to `design-guardian`. This skill never edits `:root`.
