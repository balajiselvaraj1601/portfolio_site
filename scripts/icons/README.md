# scripts/icons/ — icon & logo pipeline

Tooling that turns raster icon sources (PNG) into the optimized, recolorable
SVG marks and UI glyphs the site ships (`public/assets/logos/`,
`src/assets/icons/`, `src/lib/icon-paths.json`). Build/dev tooling stays at
`scripts/` top level; everything icon/logo-only lives here.

## Entry points

| Command                                              | Purpose                                                                  |
| ---------------------------------------------------- | ------------------------------------------------------------------------ |
| `./scripts/icons/batch-icon-generate.sh [DIR] [...]` | Trace every `icon_*.png` in a set → tight SVG (per-archetype mask flags) |
| `./scripts/icons/generate-icon.sh SRC NAME [...]`    | One-off wrapper around the generator                                     |
| `python3 scripts/icons/svg-icon-generator.py`        | Canonical 7-phase trace pipeline (SSOT — see `SVG-ICON-GENERATOR.md`)    |
| `python3 scripts/icons/verify-icon.py *.svg`         | Independent margin/flush/centering check (used by `npm run test:icons`)  |
| `python3 scripts/icons/normalize-mark-viewbox.py`    | `apply`/`check` — equal ink-footprint gate for `logos/marks/`            |
| `./scripts/icons/regenerate-marks-from-png.sh`       | PNG → `logo_*.svg` marks without the batch normalizer                    |
| `./scripts/icons/install-icon-collections-png.sh`    | Copy square-centered PNGs into `public/assets/logos/{subdir}/`           |
| `./scripts/icons/install-vision-logos.sh`            | Install `*-icon-512.svg` outputs as `logo_*` marks                       |
| `node scripts/icons/export-icon-svgs.mjs`            | Stage UI icon SVGs into `.icon-stage/` for geometry refresh              |
| `node scripts/icons/refresh-icon-geometry.mjs`       | Rewrite `src/lib/icon-paths.json` from staged assets                     |
| `python3 scripts/icons/process_logos.py`             | Logo trim/normalize (Pillow; `pip install -r requirements-logos.txt`)    |

Config SSOT: `icon-sets.json` (set registry, mask archetypes, install
overrides). Tuning template: `icon-generator-example.json`. Golden tests:
`npm run test:icons` → `tests/run-icon-tests.py`.

## Dormant manual utilities (kept for reference)

`analyze-icon-brightness.py` and `render-icon-montage.py` are dormant one-off
analysis/preview tools (brightness audits, montage screenshots). Not wired
into any npm script or gate.

## Sources

PNG sources live in `assets/icon-collections-resized/` (in-repo) and the
external `~/workspace/icon_collections*` folders — filenames follow a
name-parity contract (same stem across folders; see
`docs/icon-collections-install.md`). `.icon-stage/` is a gitignored working
area created by `export-icon-svgs.mjs`.
