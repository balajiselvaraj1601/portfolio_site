# Refresh icon_collections icons

Repeatable pipeline for installing square-centered raster icons from
`icon_collections_resized/` and updating the live `logo_*.svg` marks the site
renders via `MarkEmblem`.

## Source folder

`icon_collections_resized/` at the repo root holds `icon_*.png` files after
square-and-center processing. Naming follows `icon_<set>_<name>.png` (see
[`AGENTS.md`](../AGENTS.md) Icon / Logo Asset Pipeline).

## Subfolder routing (PNG install)

| Prefix / exact name | Destination |
| --- | --- |
| `icon_education_` | `public/assets/logos/education/` |
| `icon_general_` | `public/assets/logos/general/` |
| `icon_trophy_awards` | `public/assets/logos/awards/` |
| `icon_hub_kaggle_`, `icon_kaggle_`, `icon_metric_kaggle_`, `icon_trophy_kaggle` | `public/assets/logos/kaggle/` |
| `icon_hub_multimodal_`, `icon_vision_` | `public/assets/logos/vision/` |

Slug map for SVG marks: `icon_<stem>` → `logo_<stem>` (e.g.
`icon_education_calendar` → `logo_education_calendar`). Override:
`trophy-awards` → `logo_trophy_badge` (see `scripts/icon-sets.json`).

## Workflow

### 1. Square-center source PNGs

Use [`.claude/skills/icon-square-center/SKILL.md`](../.claude/skills/icon-square-center/SKILL.md):

```bash
S=.claude/skills/icon-square-center/scripts
SRC=~/workspace/icon_collections          # or your source batch
OUT=icon_collections_resized              # repo root, or a staging dir

python3 $S/square-and-center-icon.py --src $SRC --out $OUT --all
python3 $S/validate-square-center.py --src $SRC --out $OUT --all
python3 $S/verify-crop-visual.py --src $SRC --out $OUT --all
```

All three steps must pass before install.

### 2. Install rasters

```bash
./scripts/install-icon-collections-png.sh
# optional custom source:
./scripts/install-icon-collections-png.sh /path/to/resized/dir
```

Copies every `icon_*.png` into the correct `public/assets/logos/{subfolder}/`
by prefix rule. Exits non-zero if any file has no routing rule.

### 3. Regenerate SVG marks

**Do not** run `batch-icon-generate.sh` on this set — it invokes
`normalize-icon-sources.py`, which destroys square-centered line art. Use:

```bash
./scripts/regenerate-marks-from-png.sh
# optional custom source:
./scripts/regenerate-marks-from-png.sh icon_collections_resized
```

This traces each PNG with `svg-icon-generator.py` (`--tight --no-badge
--turdsize 2 --no-circle`) and installs `*-icon-512.svg` outputs to
`public/assets/logos/marks/logo_*.svg` via `install-vision-logos.sh`.

### 4. Normalize mark viewBoxes (mandatory)

After any `marks/` batch regen:

```bash
python3 scripts/normalize-mark-viewbox.py apply
python3 scripts/normalize-mark-viewbox.py check   # must exit 0
```

See [`docs/icon-blend-strategy.md`](./icon-blend-strategy.md) for why this
gate exists.

### 5. Verify

```bash
python3 tests/run-icon-tests.py
npm run build
npm run preview   # spot-check Recognition + Vision views
```

## Icons not in resized set

These four PNGs may exist under `public/assets/logos/` but are often absent
from `icon_collections_resized/` until square-centered separately:

- `icon_trophy_awards.png` → `awards/`
- `icon_trophy_kaggle.png` → `kaggle/`
- `icon_metric_kaggle_evaluation.png` → `kaggle/`
- `icon_metric_kaggle_summary.png` → `kaggle/`

Run the square-center skill on them, add to `icon_collections_resized/`, then
re-run steps 2–5.

## Header chrome

`icon_general_{save,sun,moon}` are installed to `general/` for asset parity.
The header uses Lucide `Icon.astro` only (design contract D1) — no component
changes needed when refreshing these PNGs.

## Related docs

- [`docs/icon-blend-strategy.md`](./icon-blend-strategy.md) — vector delivery rules
- [`scripts/SVG-ICON-GENERATOR.md`](../scripts/SVG-ICON-GENERATOR.md) — trace pipeline
- [`AGENTS.md`](../AGENTS.md) — `logoSrc()` and naming conventions
