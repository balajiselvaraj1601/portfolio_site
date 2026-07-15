# Refresh icon_collections icons

Repeatable pipeline for square-centered raster icons from `~/workspace/icon_collections/`
and updating the live `logo_*.svg` marks the site renders via `MarkEmblem`.

## Source folder

Use `~/workspace/icon_collections/` (external workspace) for raw and square-centered
`icon_*.png` batches. Naming follows `icon_<set>_<name>.png` (see
[`AGENTS.md`](../AGENTS.md) Icon / Logo Asset Pipeline).

Slug map for SVG marks: `icon_<stem>` - `logo_<stem>` (e.g.
`icon_education_calendar` - `logo_education_calendar`). Override:
`trophy-awards` - `logo_trophy_badge` (see `scripts/icons/icon-sets.json`).

## Workflow

### 1. Square-center source PNGs

Use [`.claude/skills/icon-square-center/SKILL.md`](../.claude/skills/icon-square-center/SKILL.md):

```bash
S=.claude/skills/icon-square-center/scripts
SRC=~/workspace/icon_collections          # raw source batch
OUT=~/workspace/icon_collections/resized  # square-centered output dir

python3 $S/square-and-center-icon.py --src $SRC --out $OUT --all
python3 $S/validate-square-center.py --src $SRC --out $OUT --all
python3 $S/verify-crop-visual.py --src $SRC --out $OUT --all
```

All three steps must pass before mark regeneration.

### 2. Regenerate SVG marks

**Do not** run `batch-icon-generate.sh` on this set - it invokes
`normalize-icon-sources.py`, which destroys square-centered line art. Use:

```bash
./scripts/icons/regenerate-marks-from-png.sh ~/workspace/icon_collections/resized
```

This traces each PNG with `svg-icon-generator.py` (`--tight --no-badge
--turdsize 2 --no-circle`) and installs `*-icon-512.svg` outputs to
`public/assets/logos/marks/logo_*.svg` via `install-vision-logos.sh`.

### 3. Normalize mark viewBoxes (mandatory)

After any `marks/` batch regen:

```bash
python3 scripts/icons/normalize-mark-viewbox.py apply
python3 scripts/icons/normalize-mark-viewbox.py check   # must exit 0
```

See [`docs/icon-blend-strategy.md`](./icon-blend-strategy.md) for why this
gate exists.

### 4. Verify

```bash
python3 tests/run-icon-tests.py
npm run build
npm run preview   # spot-check Recognition + Vision views
```

## Legacy PNG install (optional)

`./scripts/icons/install-icon-collections-png.sh` still exists for copying
square-centered PNGs into `public/assets/logos/{education,general,kaggle,vision,awards}/`
if you need raster fallbacks. The live site renders `logo_*.svg` marks only.

## Header chrome

`icon_general_{save,sun,moon}` remain available in the external icon set for
asset parity. The header uses Lucide `Icon.astro` only (design contract D1) -
no component changes needed when refreshing these sources.

## Related docs

- [`docs/icon-blend-strategy.md`](./icon-blend-strategy.md) - vector delivery rules
- [`scripts/icons/SVG-ICON-GENERATOR.md`](../scripts/icons/SVG-ICON-GENERATOR.md) - trace pipeline
- [`AGENTS.md`](../AGENTS.md) - `logoSrc()` and naming conventions
