# SVG Icon Generation Skill — Complete Setup

Professional-grade raster → vector icon pipeline for the portfolio site.

## What You Now Have

```
scripts/
├── svg-icon-generator.py          # Main pipeline — CANONICAL source of truth
├── verify-icon.py                 # Independent margin/flush/centering check on a finished SVG
├── batch-icon-generate.sh         # Convert every icons_box/icon_*.png in one pass (tight + cropped)
├── check-skill-sync.sh            # Assert the .skill bundle ships the canonical script (no drift)
├── svg-icon-generation-guide.md   # Full methodology + troubleshooting
├── SVG-ICON-GENERATOR.md          # Quick-start guide
├── icon-generator-example.json    # Config template for advanced tuning
└── generate-icon.sh               # Convenience shell wrapper
```

> **Single source of truth.** `svg-icon-generator.py` is the one canonical
> implementation. The `svg-icon-generator.skill` bundle carries a *verbatim,
> auto-synced* copy (as `icon_pipeline.py`, marked `#SYNC#`) — never hand-edit the
> bundled copy; edit the canonical script and re-run `check-skill-sync.sh`.

## One-Time Setup

Install required tools:

```bash
# System dependency
apt-get install -y potrace

# Python packages
pip install pillow numpy svgelements --break-system-packages

# Node package (for optimization)
npm install -g svgo
```

Verify:
```bash
potrace --version
npm list -g svgo
python3 -c "from svgelements import Path; print('✓ ready')"
```

## Quick Start

### Generate a single icon

```bash
cd /home/engineer/workspace/portfolio_site

python3 scripts/svg-icon-generator.py \
  --source path/to/source.png \
  --name trophy
```

This creates:
- `src/assets/icons/trophy-icon-24.svg` — small icon
- `src/assets/icons/trophy-icon-512.svg` — base asset
- `src/assets/icons/trophy-badge-24.svg` — badge variant (small)
- `src/assets/icons/trophy-badge-512.svg` — badge variant (large)

### Using the convenience wrapper

```bash
./scripts/generate-icon.sh ~/Downloads/icon.png my-icon
./scripts/generate-icon.sh icon.png badge --sizes 24,32,48,512
./scripts/generate-icon.sh icon.png skill --light-threshold 170 --no-badge
```

## How It Works

The pipeline runs 7 automated phases:

1. **Perceive** — Inspect source dimensions, detect colors and proportions
2. **Mask** — Build clean binary image, constrain to container region (circle, etc.)
3. **Trace** — potrace vectorizes pixels into bezier curves
4. **Flatten** — Bake transformation matrix into absolute coordinates
5. **Normalize** — Rescale to target viewBox sizes while preserving aspect ratio
6. **Compose** — (If badge) Merge circle background with glyph cutout via `fill-rule="evenodd"`
7. **Optimize** — svgo minifies path data (~70–80% size reduction)

All 7 phases run automatically when you call the script.

## Configuration

### CLI flags (quick tweaks)

```bash
# Adjust foreground/background brightness threshold (0-255; default 180).
# Only tune if the default misses faint edges — try 150–170, not lower.
--light-threshold 180

# Dark glyph on a light background (default assumes light glyph on dark)
--dark-glyph

# Colored/gradient glyph on a white field (non-white mask; handles saturated
# hues that a per-channel dark/light threshold would shatter). Optional cutoff:
--colored-glyph            # [--white-threshold 235]

# Transparent-background PNG — mask the opaque region via alpha (color-agnostic,
# the most robust mode when the source actually has transparency). Optional cutoff:
--alpha-glyph              # [--alpha-threshold 128]

# Source has no circular container to mask out
--no-circle

# Output multiple sizes
--sizes 24,32,48,64,512

# Skip badge variant
--no-badge

# Suppress noise specks smaller than N px (lower = keeps finer detail)
--turdsize 2

# Borderless output: non-square viewBox wrapping the glyph exactly
# (glyph flush to all four edges — no padding). Implies single glyph, no badge.
--tight

# Also write the white-border-cropped source image alongside the SVG
--save-cropped path/to/icon_name_cropped.png

# Custom output directory
--output src/assets/custom-icons
```

**Removing empty borders (image + SVG).** These source badges carry a white
margin around the purple circle. Auto-crop (on by default) removes it before
masking — safe because the glyph is white *inside* the circle, so the non-white
bounding box equals the circle and no glyph pixels are lost. Pair `--tight` with
`--save-cropped` to emit both a border-free PNG and a border-free SVG in one pass.
`scripts/batch-icon-generate.sh [DIR] [flags…]` does this for every
`icon_*.png` in a directory (default `icons_box`), passing any extra flags through
— e.g. `batch-icon-generate.sh …/icon_multimodal --colored-glyph --no-circle` for
a colored-glyph-on-white set.

### Config file (full control)

Create a JSON config (or copy `icon-generator-example.json`) with precise tuning:

```bash
python3 scripts/svg-icon-generator.py \
  --source icon.png \
  --name icon \
  --config my-config.json
```

Available config keys:
- `foreground_is_light` — bool, true if glyph is lighter than background (legacy; superseded by `foreground_mode`)
- `foreground_mode` — `"light"` | `"dark"` | `"nonwhite"` | `"alpha"`; `nonwhite` masks any off-white ink (colored/gradient glyphs), `alpha` masks the opaque region of a transparent-background source. Overrides `foreground_is_light` when set
- `white_threshold` — 0-255, off-white cutoff for `nonwhite` mode (default 235)
- `alpha_threshold` — 0-255, opacity cutoff for `alpha` mode (default 128)
- `light_threshold` — 0-255, brightness cutoff for mask
- `constrain_to_circle` — bool, true if icon is in a circular badge
- `circle_inset` — 0.99-0.999, shrink circle radius to avoid AA noise
- `opttolerance` — 0.05-0.2, curve-fitting precision (lower = more nodes)
- `alphamax` — 1.0-1.5, corner-smoothing threshold
- `turdsize` — 2-8, suppress noise specks (lower preserves small details)
- `sizes` — array, output pixel sizes (e.g. `[24, 512]`)
- `glyph_fill_fraction` — 0.8-0.95, glyph size relative to its canvas
- `badge` — object or null, circular badge options

See `icon-generator-example.json` for detailed comments on each.

## Output Format

Every generated SVG has this structure:

```xml
<svg xmlns="http://www.w3.org/2000/svg" 
     width="24" height="24" 
     viewBox="0 0 24 24" 
     fill="currentColor">
  <path fill-rule="evenodd" d="..."/>
</svg>
```

**Guarantees:**
- ✓ `fill="currentColor"` — inherits CSS `color` property from parent
- ✓ Explicit `width`/`height` — sensible default size (overridable by CSS)
- ✓ `viewBox` — fully scalable without quality loss
- ✓ Single `<path>` — no embedded raster, no metadata
- ✓ Badge uses `evenodd` — correct cutout rendering

### Using in HTML/Astro

Inline in template:

```astro
---
import { readFileSync } from 'fs'

const trophySvg = readFileSync('src/assets/icons/trophy-icon-24.svg', 'utf-8')
---

<div style="color: #e11d48">
  <Fragment set:html={trophySvg} />
</div>
```

Or import as component:

```astro
---
import TrophyIcon from '../assets/icons/trophy-icon-24.svg?raw'
---

<div class="award" set:html={TrophyIcon} />

<style>
  .award {
    color: var(--accent-color); /* SVG inherits this */
  }
</style>
```

## Debugging & Verification

The generator asserts its own framing during a run (the `✓ verified` line: bbox
flush for `--tight`, center offset ~0 for the default square). For an **independent
second measurement** taken straight from the finished file, run:

```bash
python3 scripts/verify-icon.py src/assets/icons/*-icon-512.svg
```

It reports each SVG's per-edge margins and a `tight`/`centered` verdict, exiting
non-zero if any file is off — two independent measurements agreeing is far stronger
than one.

### Icon looks inverted (background filled, glyph hollow)

potrace detected foreground/background backwards.

```bash
# Nudge the threshold down from the 180 default (try 150–170):
--light-threshold 160

# If the glyph is genuinely dark-on-light (rare), flip the polarity instead:
--dark-glyph
```

### Most of the icon is missing (only one piece survives)

The output shows a single fragment of the source — e.g. a dashboard renders as just its header bar, a globe loses its location pins, a target keeps only the arrow. This happens when the glyph has **multiple disconnected regions**: potrace emits one `<path>` element per region group, and only the first was being kept.

The pipeline now combines **all** `<path>` elements in Phase 4 (`extract_flat_path` uses `re.findall`, not `re.search`). If you write custom post-processing on potrace output, never assume a single `<path>` — collect every one and join the `d` strings. Concatenation is safe under `fill-rule="evenodd"` because potrace regions don't self-overlap.

### Small details vanish (handles, thin junctions, terminal balls)

`turdsize` is suppressing intentional detail as noise. Lower it:

```bash
python3 scripts/svg-icon-generator.py \
  --source icon.png \
  --name icon \
  --config icon-config.json  # edit: "turdsize": 2 (default is 4)
```

### Background corners contaminate the glyph

The mask wasn't constrained to the actual shape. Verify in config:

```json
{
  "constrain_to_circle": true,
  "circle_inset": 0.995
}
```

### Icon looks disproportionate (too big/small in its container)

Before running the full pipeline, inspect the source to understand proportions:

```python
from PIL import Image
import numpy as np

img = np.array(Image.open("icon.png").convert("RGB"))
print(img.shape)  # (height, width, 3)

# Visually check: Is the glyph really centered?
# Is it the size you expect relative to the container?
```

Then adjust in config:
- `glyph_fill_fraction` — size of glyph in its own canvas
- `badge.glyph_fraction_of_diameter` — size of glyph relative to circle
- `badge.vertical_center_offset` — nudge glyph up/down (optical centering)

### Why is currentColor not working in `<img>`?

`currentColor` only works when SVG is **inlined**. With `<img src="icon.svg">`, the SVG is in its own document context and doesn't inherit the page's CSS.

- ✓ Works: inline `<svg>` or component (inherits parent's `color`)
- ✗ Doesn't work: `<img src="icon.svg">` (separate document context)

## Files Reference

| File | Purpose |
|---|---|
| `svg-icon-generator.py` | Main pipeline — 7 phases, full Python implementation (canonical) |
| `verify-icon.py` | Independent margin/flush/centering check on a finished SVG |
| `batch-icon-generate.sh` | Batch-convert every `icons_box/icon_*.png` (tight + cropped) in one pass |
| `check-skill-sync.sh` | Assert the `.skill` bundle's script hasn't drifted from the canonical one |
| `svg-icon-generation-guide.md` | Deep methodology — every phase explained in detail |
| `SVG-ICON-GENERATOR.md` | Quick-start — common tasks, CLI flags, troubleshooting |
| `icon-generator-example.json` | Config template with all tunable parameters |
| `generate-icon.sh` | Bash wrapper — makes CLI invocation easier |

## Architecture Notes

- **Single binary mask** — cleaner, more predictable than multi-layer approaches
- **potrace's native format (PBM)** — 1-bit input, optimized for tracing
- **Absolute coordinates** — potrace's transform matrix baked in; no side effects
- **evenodd fill-rule** — composites background + glyph-cutout without path booleans
- **One path per output** — easy to reuse (drop into sprites, copy into React components, embed in CSS)
- **Responsive sizing** — proportions preserved across all output sizes via normalization math

## Integration with Portfolio

Generated icons are designed for:
- **Skill badges** — circular icon in `ProgramBadgeCard.astro`
- **Section headers** — lightweight SVG glyphs
- **Social links** — recolorable by CSS
- **Award/achievement indicators** — consistent styling

Store all outputs in `src/assets/icons/` and reference via `IconName` in `src/lib/icon-paths.json`.

See `portfolio-icon-audit` skill for managing the full icon inventory.

## Dependencies

All dependencies optional at install time; pipeline will tell you what's missing:

```bash
# Verify each:
potrace --version                    # system
npm list -g svgo                     # npm global
python3 -c "import pillow, numpy, svgelements"  # pip
```

If any fail, installation instructions appear in `SVG-ICON-GENERATOR.md`.

## Next Steps

1. **Set up dependencies** (one-time, ~2 min)
2. **Generate your first icon** (`./scripts/generate-icon.sh source.png icon-name`)
3. **Verify visually** (check proportions, detail preservation, scaling)
4. **Integrate into portfolio** (reference via `IconName` in `icon-paths.json`)
5. **Tune as needed** (adjust `light_threshold`, `turdsize`, or bbox proportions per icon)

---

**References:**
- Phase-by-phase guide: `svg-icon-generation-guide.md`
- Quick troubleshooting: `SVG-ICON-GENERATOR.md`
- Config template: `icon-generator-example.json`
- Implementation: `svg-icon-generator.py` (~350 lines, well-commented)
