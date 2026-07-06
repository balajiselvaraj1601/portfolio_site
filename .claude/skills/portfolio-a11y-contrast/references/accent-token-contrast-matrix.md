# Accent-token contrast matrix

Every accent family and the surface it must be checked against. Reference token
**names** only — the values live in `src/styles/global.css` `:root` (light + dark
blocks), owned by `design-guardian`. Per `docs/design-direction.md`, the accent
family is tuned to clear **AA ≥ 3:1 on `--bg-elev`** in both themes; this matrix
is what you walk to verify that claim.

## Rule of thumb

- Accents render as **card top-borders, icon strokes, badges, and eyebrow /
  link text** — all UI/large-text roles → **≥ 3:1** against their surface.
- When an accent is used as **body-size text** (e.g. inline links), the ≥ 4.5:1
  body threshold applies instead — check the role, not just the token.
- The **surface** for card-shell accents is `--bg-elev` (cards); page-level
  accent text is on `--bg` / `--bg-alt`. Check each accent against the surface
  it actually paints on.
- Check **both themes.** Each token name resolves to a different hex in the
  light vs dark `:root` block.

## Token families to audit

| Family                | Token names                                                                                                                                               | Rendered on                                                 | Threshold                  |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------- |
| Per-view accents      | `--view-accent-about`, `--view-accent-experience`, `--view-accent-research`, `--view-accent-recognition`, `--view-accent-vision`, `--view-accent-contact` | `--bg-elev` card shells; view eyebrows on `--bg`/`--bg-alt` | ≥ 3:1                      |
| Categorical           | `--cat-strategic`, `--cat-impact`, `--cat-platform`, `--cat-people`, `--cat-ai`, `--cat-privacy`, `--cat-gxp`                                             | `--bg-elev` card shells                                     | ≥ 3:1                      |
| About categorical     | `--about-cat-*` (alias `--cat-*`)                                                                                                                         | `--bg-elev`                                                 | ≥ 3:1                      |
| Career-level          | `--lvl-evp`, `--lvl-cio`, `--lvl-senior-director`, `--lvl-director`, `--lvl-associate-director`, `--lvl-national`                                         | `--bg-elev` role badges / shells                            | ≥ 3:1                      |
| Kaggle medals         | `--medal-silver`, `--medal-bronze` (gold = default accent path)                                                                                           | `--bg-elev` recognition shells                              | ≥ 3:1                      |
| Brand / semantic text | `--accent`, `--accent-light`, `--accent-ll`, `--accent-red`, `--accent-gold`                                                                              | text on `--bg`/`--bg-alt`/`--bg-elev`                       | body ≥ 4.5:1 / large ≥ 3:1 |
| Focus indicator       | `--focus-ring`                                                                                                                                            | outline on any surface                                      | ≥ 3:1                      |

## Notes on aliasing (follow the chain before measuring)

- Many tokens are `var()` aliases (e.g. `--cat-impact` → `--accent-gold`;
  `--lvl-evp` → `--accent-gold`; `--about-cat-*` → `--cat-*`; `--view-accent-*`
  point at `--accent` / `--lvl-*` / `--accent-gold`). Resolve to the literal hex
  **in each theme block** before computing — see
  `contrast-check-procedure.md`.
- Because tokens alias, one failing base token cascades to every view/category
  that references it. Report the **base** token, and note the downstream views
  affected (mapping lives in `docs/design-direction.md` "Per-page color
  assignment").

## Output

For each family × surface × theme, a PASS/FAIL line with the measured ratio.
Collate FAILs by base token and hand to `design-guardian`. This skill does not
edit `:root`.
