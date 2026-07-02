# SVG Icon Generator

Production-grade raster → vector icon pipeline for the portfolio site. Converts PNG/JPG icons into clean, recolorable SVG with automatic badge support.

## Quick Start

### One-time setup

```bash
apt-get install -y potrace
npm install -g svgo
pip install pillow numpy svgelements
```

### Generate an icon

```bash
cd /home/engineer/workspace/portfolio_site

# From source PNG, outputs to src/assets/icons/{name}-icon-*.svg
python3 scripts/svg-icon-generator.py \
  --source path/to/source.png \
  --name trophy \
  --output src/assets/icons
```

This generates:

- `trophy-icon-24.svg` — 24px icon
- `trophy-icon-512.svg` — 512px icon (base asset)
- `trophy-badge-24.svg` — 24px with circular badge
- `trophy-badge-512.svg` — 512px with circular badge

## How It Works

The pipeline implements **7 phases** (reference: `svg-icon-generation-guide.md`):

1. **Perceive** — Inspect source dimensions, sample colors, measure glyph proportions
2. **Mask** — Build clean binary mask, constrain to container region
3. **Trace** — potrace vectorizes pixels into bezier curves
4. **Flatten** — Bake transform matrix into absolute coordinates
5. **Normalize** — Rescale to target viewBox, preserving aspect ratio
6. **Compose** — (If badge) Concatenate circle + glyph with `fill-rule="evenodd"`
7. **Optimize** — svgo reduces file size ~70–80%

All seven happen automatically in `python3 scripts/svg-icon-generator.py`.

## Configuration

### CLI flags (quick adjustments)

```bash
# Output multiple sizes / custom directory
--sizes 24,32,48,512
--output src/assets/custom-icons

# Skip badge variant
--no-badge

# Borderless: non-square viewBox wrapping the glyph exactly (flush, no padding)
--tight

# Also write the auto-cropped source image (transparency preserved)
--save-cropped path/to/icon_name_cropped.png
```

**Mask mode — pick the one that matches how the glyph separates from its
background** (default = light glyph on a dark/colored circle):

```bash
--dark-glyph              # dark glyph on a light background
--colored-glyph          # colored/gradient ink on a WHITE field  [--white-threshold 235]
--alpha-glyph            # TRANSPARENT-background PNG (mask via alpha)  [--alpha-threshold 128]
--no-circle              # source has no circular container to mask out
--no-auto-crop           # keep the source's empty border
--light-threshold 170    # brightness cutoff for light/dark modes (default 180)
```

A per-channel dark/light threshold shatters **colored** glyphs (a red pixel has a
high R channel) — use `--colored-glyph` there. For a **transparent** PNG use
`--alpha-glyph` (color-agnostic, most robust). For a whole set, run
`scripts/batch-icon-generate.sh [DIR] [flags…]`.

### Config file (full tuning)

```bash
python3 scripts/svg-icon-generator.py \
  --source icon.png \
  --name icon \
  --config scripts/icon-generator-example.json
```

Edit `icon-generator-example.json` (all keys documented there with `comment_*`):

- `foreground_mode` — `"light"` | `"dark"` | `"nonwhite"` | `"alpha"` (null → use `foreground_is_light`)
- `light_threshold` / `white_threshold` / `alpha_threshold` / `crop_threshold` — cutoffs (0-255) for the respective modes and auto-crop
- `opttolerance` — curve fitting precision (lower = more nodes, more accurate)
- `turdsize` — suppress noise specks smaller than N pixels
- `glyph_fill_fraction` — glyph size vs its canvas (default 0.875; ignored when `tight`)
- `tight` / `save_cropped_path` — borderless output / also emit the cropped source
- `badge.glyph_fraction_of_diameter`, `badge.vertical_center_offset` — glyph size / optical nudge inside the badge circle (nested under `badge`; set `badge` to null to skip)

## Output Format

Every SVG includes:

```xml
<svg xmlns="..." width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
  <path fill-rule="evenodd" d="..."/>
</svg>
```

**Guarantees:**

- ✓ `fill="currentColor"` — inherits CSS `color` property
- ✓ Explicit `width`/`height` — sensible default size
- ✓ `viewBox` — fully scalable, overridable by CSS
- ✓ One `<path>` only — no embedded raster, no metadata
- ✓ Badge variant uses `evenodd` for correct cutout rendering

## Common Issues

### Icon comes out inverted (background filled, glyph hollow)

The mask mode doesn't match the source's polarity.

```bash
# Dark glyph on a light background:
--dark-glyph
```

### Colored/gradient glyph traces as broken speckles

A per-channel dark/light test drops saturated hues (a red pixel has a high R
channel). Switch to the non-white mask:

```bash
--colored-glyph            # tune with --white-threshold if needed
```

### Whole image gets traced, or transparent areas fill in

The source is a transparent PNG but you used a color mode (which sees PIL's
transparent-as-black), or you used `--alpha-glyph` on a fully opaque source (the
script now errors on the latter). For a genuinely transparent source:

```bash
--alpha-glyph              # masks the opaque region via the alpha channel
```

### Small details vanish (handles, terminals, thin gaps)

The `turdsize` parameter is suppressing intentional detail as noise.

```bash
# Lower turdsize (default 4):
--config myconfig.json  # edit turdsize: 2
```

### Background contamination (corners fused into the glyph)

The mask isn't constrained to the actual shape.

```bash
# Verify constrain_to_circle is true in config:
--config myconfig.json  # constrain_to_circle: true
```

### Icon looks disproportionate (too big/small relative to container)

The output's proportions don't match the source.

**Debug:** Before running the full pipeline, inspect the source:

```python
from PIL import Image
import numpy as np
img = np.array(Image.open("icon.png").convert("RGB"))
print(img.shape)  # (height, width, 3)
# Visually check: is the glyph really centered? Is it the size you expect?
```

Then adjust `glyph_fill_fraction` and `vertical_center_offset` in the config.

## Verification (before integration)

Quick automated checks:

```bash
python3 scripts/verify-icon.py src/assets/icons/*-icon-512.svg   # margins/flush/centered, exit!=0 on failure
python3 tests/run-icon-tests.py                                  # golden-regression harness (all modes)
```

After generation, **always** also:

1. **Render at multiple sizes** — check legibility at 16px

   ```bash
   # Use any SVG viewer or browser dev tools to preview
   ```

2. **Test currentColor inheritance** in browser DevTools:

   ```html
   <div style="color: #e11d48">
     <svg src="icon.svg">...</svg>
   </div>
   ```

   Should render in red if `currentColor` is working.

3. **Compare side-by-side with source** at ~original resolution — check for proportion drift or off-centering.

## Integration with Portfolio

Icons generated here are meant for:

- Skill badges (circular icon in `ProgramBadgeCard.astro`)
- Section headers
- Social links
- Award/achievement indicators

Store in `src/assets/icons/` and reference via `IconName` in `src/lib/icon-paths.json`.

Reference: `portfolio-icon-audit` skill manages the inventory.

## Troubleshooting Dependencies

**Missing potrace:**

```bash
apt-get install -y potrace
potrace --version  # verify
```

**Missing svgo:**

```bash
npm install -g svgo
svgo --version  # verify
```

**Missing Python packages:**

```bash
pip install pillow numpy svgelements --break-system-packages
python3 -c "from svgelements import Path; print('OK')"
```

## Architecture Notes

- **Single binary mask** → cleaner, more predictable traces than multi-layer approaches
- **evenodd fill-rule** → composites background + glyph-cutout without path booleans
- **One path per output** → easier to reuse (drop into sprites, copy into React components)
- **Absolute coordinates** → potrace's transform matrix baked in; no side effects
- **Normalized viewBox** → aspect ratio preserved; size overridable by CSS

## References

- Full methodology: `scripts/svg-icon-generation-guide.md`
- Example Python code: `scripts/svg-icon-generator.py` (Phases 1–7)
- potrace docs: `man potrace` or https://potrace.sourceforge.net/
- svgelements: https://github.com/meerk40t/svgelements
- SVG fill-rule: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill-rule
