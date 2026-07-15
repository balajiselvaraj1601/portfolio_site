# SVG Icon Generator

Production-grade raster - vector icon pipeline for the portfolio site. Converts PNG/JPG icons into clean, recolorable SVG with automatic badge support.

## Quick Start

### One-time setup

```bash
apt-get install -y potrace
npm install -g svgo
pip install pillow numpy svgelements cairosvg
```

### Generate an icon

```bash
# From source PNG, outputs to src/assets/icons/{name}-icon-*.svg
python3 scripts/icons/svg-icon-generator.py \
  --source path/to/source.png \
  --name trophy \
  --output src/assets/icons
```

This generates:

- `trophy-icon-24.svg` - 24px icon
- `trophy-icon-512.svg` - 512px icon (base asset)
- `trophy-badge-24.svg` - 24px with circular badge
- `trophy-badge-512.svg` - 512px with circular badge

## How It Works

The pipeline implements **7 phases**:

1. **Perceive** - Inspect source dimensions, sample colors, measure glyph proportions
2. **Mask** - Build clean binary mask, constrain to container region
3. **Trace** - potrace vectorizes pixels into bezier curves
4. **Flatten** - Bake transform matrix into absolute coordinates
5. **Normalize** - Rescale to target viewBox, preserving aspect ratio
6. **Compose** - (If badge) Concatenate circle + glyph with `fill-rule="evenodd"`
7. **Optimize** - svgo reduces file size ~70-80%

All seven happen automatically in `python3 scripts/icons/svg-icon-generator.py`.

## Philosophy

| Approach                                  | Result                                               | Use when                                    |
| ----------------------------------------- | ---------------------------------------------------- | ------------------------------------------- |
| Embed PNG in `<img>` or data URI          | Not a vector. Doesn't scale, doesn't recolor.        | Never - not actually SVG                    |
| Hand-draw bezier curves by eye            | Real vector, but slow, curves rarely match precisely | Small icon collections (<5), unlimited time |
| **Auto-trace, then normalize & optimize** | Real vector, pixel-accurate, minutes not hours       | Standard badge/glyph icons (this guide)     |

The core idea: let **potrace** do the hard geometric work of finding accurate bezier curves along pixel boundaries (this is what it's built for), then spend your effort on what a tracer can't do - cleaning up coordinates, composing multi-color icons into one recolorable shape, verifying results.

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

**Mask mode - pick the one that matches how the glyph separates from its
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
high R channel) - use `--colored-glyph` there. For a **transparent** PNG use
`--alpha-glyph` (color-agnostic, most robust). For a whole set, run
`scripts/icons/batch-icon-generate.sh [DIR] [flags...]`.

### Config file (full tuning)

```bash
python3 scripts/icons/svg-icon-generator.py \
  --source icon.png \
  --name icon \
  --config scripts/icons/icon-generator-example.json
```

Edit `icon-generator-example.json` (all keys documented there with `comment_*`):

- `foreground_mode` - `"light"` | `"dark"` | `"nonwhite"` | `"alpha"` (null - use `foreground_is_light`)
- `light_threshold` / `white_threshold` / `alpha_threshold` / `crop_threshold` - cutoffs (0-255) for the respective modes and auto-crop
- `opttolerance` - curve fitting precision (lower = more nodes, more accurate)
- `turdsize` - suppress noise specks smaller than N pixels
- `glyph_fill_fraction` - glyph size vs its canvas (default 0.875; ignored when `tight`)
- `tight` / `save_cropped_path` - borderless output / also emit the cropped source
- `badge.glyph_fraction_of_diameter`, `badge.vertical_center_offset` - glyph size / optical nudge inside the badge circle (nested under `badge`; set `badge` to null to skip)

## Detailed Methodology

### Phase 1 - Planning & Inspection

Do this **before** running potrace. All downstream failures trace back to wrong assumptions here.

**1.1 - Get exact dimensions and inspect colors:**

```python
from PIL import Image
import numpy as np
img = np.array(Image.open("source.png").convert("RGB"))
print(img.shape)                 # (height, width, 3)
print(img[0,0], img[-1,-1])      # corner colors
```

**1.2 - Identify layers:**

- Is this one flat-color glyph, or a glyph-on-a-background-shape (badge)?
- A badge needs two shapes traced (or one composed path using `evenodd` fill-rule).
- A plain glyph needs one.
- Decide now; it changes the mask you build in Phase 2.

**1.3 - Sample colors precisely (don't eyeball hex):**

Anti-aliasing makes single-pixel samples unreliable. Take a patch:

```python
from collections import Counter
patch = img[500:510, 500:510].reshape(-1,3)
print(Counter(map(tuple, patch)).most_common(3))
```

**1.4 - Measure proportions:**

If there's a container (circle, rounded square), find its bounding box, then the glyph's bbox as a **percentage of the container**. This ratio is what makes the final SVG look proportionally right, not "close enough."

```python
# glyph width/height as % of a circular container's diameter
cx, cy, radius = 500, 500, 450
glyph_bbox_w = xs.max() - xs.min()
glyph_bbox_h = ys.max() - ys.min()
print(f"w={100*glyph_bbox_w/(2*radius):.1f}%  h={100*glyph_bbox_h/(2*radius):.1f}%")
```

**1.5 - Zoom into fine details:**

Crop and upscale corners, terminals, thin junctions. Small gaps that are invisible at full-image view become obvious after 4× zoom. If you build the mask without noticing these, `turdsize` (Phase 3) will erase them as "specks."

**1.6 - Decide deliverable variants up front:**

Which sizes (24px, 512px, etc.)? Standalone glyph vs. full badge vs. both? Fixing this now means you compute normalization math once.

### Phase 2 - Build a Clean Mask

**Goal:** binary bitmap containing **only** the shape you want traced. Nothing else.

The foreground test depends on how the glyph separates from its background - pick the mode that matches the source:

```python
r, g, b = img[...,0].astype(int), img[...,1].astype(int), img[...,2].astype(int)
mn = np.minimum(np.minimum(r, g), b)

is_glyph = (r > 180) & (g > 180) & (b > 180)   # light : glyph brighter than bg
# is_glyph = (r < 180) & (g < 180) & (b < 180) # dark  : glyph darker than bg
# is_glyph = mn < 235                           # nonwhite: colored/gradient ink on white
# is_glyph = alpha > 128                         # alpha : opaque region of a transparent PNG
```

**Match the mode to the source.** A per-channel dark/light threshold fails on **colored** glyphs (a saturated red pixel has a high R channel, so "all channels dark" drops it - the trace shatters into speckles); use the non-white test there. For a **transparent-background** PNG, mask the alpha channel directly - it's color-agnostic and the most robust option. Never `convert("RGB")` a transparent source blindly: the transparent field becomes solid black and defeats every color test.

**Pitfall - Out-of-bounds contamination:**

If the source is a glyph inside a circle on a square canvas, the square's corners (outside the circle) are background-colored too, and a naive threshold includes them in your "glyph" mask. potrace then traces the glyph _fused with the four corners_ as one shape.

**Fix:** constrain the mask explicitly to the region that matters:

```python
Y, X = np.mgrid[0:h, 0:w]
inside_circle = (X-cx)**2 + (Y-cy)**2 < (radius*0.995)**2   # inset slightly
glyph_mask = is_glyph & inside_circle
```

Save as 1-bit PBM (potrace's native input):

```python
binary = np.where(glyph_mask, 0, 255).astype(np.uint8)
Image.fromarray(binary).convert("1").save("mask.pbm")
```

### Phase 3 - Vectorize

```bash
potrace -s -O 0.1 -a 1.3 -t 4 mask.pbm -o traced.svg
```

| Flag              | Meaning                           | Notes                                                                           |
| ----------------- | --------------------------------- | ------------------------------------------------------------------------------- |
| `-s`              | Output SVG                        |                                                                                 |
| `-O` opttolerance | Curve-fit tolerance               | Lower = more accurate/more nodes. 0.1-0.2 is good for detailed icons            |
| `-a` alphamax     | Corner-smoothing threshold        | ~1-1.3 keeps sharp corners sharp without over-rounding                          |
| `-t` turdsize     | Suppress specks smaller than N px | Too high erases small intentional details (handles, thin gaps). Start low (2-4) |
| `-i`              | Invert foreground/background      | Use if output is backwards                                                      |

**Immediately render and look at it** - this takes 10 seconds and catches the two most common failures:

```python
import cairosvg
cairosvg.svg2png(url="traced.svg", write_to="check.png", output_width=400)
```

**Wrong polarity:**

potrace traces **black** pixels as foreground by default. If your mask's foreground ended up white (backwards), the output is inverted - background filled, glyph hollow.

**Fix:** Add `-i` flag, or flip the mask's 0/255 mapping.

**Missing holes:**

Internal cutouts (a star inside a cup, letter counters) should appear as unfilled regions. potrace handles this via nested-contour winding, **as long as the mask in Phase 2 was clean**. If a hole is missing, it's a mask problem, not a potrace problem.

### Phase 4 - Flatten & Normalize Coordinates

potrace's raw output looks like:

```xml
<g transform="translate(0,1200) scale(0.1,-0.1)" fill="#000000">
<path d="M3750 9561 c-275 -6 ..."/>
</g>
```

Large integer coordinates plus a translate+scale+Y-flip transform. It's valid SVG, but the numbers are meaningless and carrying a transform makes the path harder to reuse.

> **Note - potrace emits one `<path>` per disconnected region.** A glyph made of separate pieces (a globe **plus** two location pins, a dashboard header **above** its body, bars **beside** a coin) produces several `<path>` tags. Collect **all** of them (`re.findall`, then join the `d` strings) before baking the transform - grabbing only the first silently drops every other shape and leaves an icon that's just a fragment of the source. Concatenation is safe under `fill-rule="evenodd"` since potrace regions never self-overlap.

**Bake the transform into absolute coordinates:**

```python
from svgelements import Path, Matrix
p = Path(d_string_from_potrace)
p *= transform_matrix     # translate + scale, matching the <g transform="...">
p.reify()                 # applies the matrix permanently into the path's coordinates
flat_d = p.d()
```

**Rescale into a clean target viewBox**, preserving aspect ratio:

```python
xmin, ymin, xmax, ymax = p.bbox()
# Scale off the LARGER dimension so a tall or wide glyph can't overflow (clip)
# the canvas the way a naive width-only scale would.
scale = target_width / max(xmax - xmin, ymax - ymin)
m = Matrix()
m.post_translate(-xmin, -ymin)
m.post_scale(scale, scale)
m.post_translate(offset_x, offset_y)   # centers it
p *= m
p.reify()
```

**Borderless / tight output (`--tight`):**

For an icon that must sit flush in its frame with **no empty margin**, skip the centered-in-square step above and instead make the viewBox wrap the glyph exactly. Scale so the longest side hits the target, translate the bbox to the origin, and emit a **non-square** viewBox equal to the scaled bbox:

```python
xmin, ymin, xmax, ymax = p.bbox()
bw, bh = xmax - xmin, ymax - ymin
scale = longest / max(bw, bh)
m = Matrix(); m.post_translate(-xmin, -ymin); m.post_scale(scale, scale)
p *= m; p.reify()
W, H = round(bw * scale), round(bh * scale)   # viewBox="0 0 W H"
```

svgo preserves the non-square viewBox. Pair with white-margin auto-crop on the source (see `--save-cropped`) so neither the PNG nor the SVG carries empty space.

The generator's `_verify()` re-measures the output and asserts the glyph is flush to `[0,0,W,H]` (tight) or centered (default square) before shipping it.

**Pitfall - Path object aliasing:**

`Path(p)` in svgelements does not reliably give you an independent copy in every version. Applying a transform to what you think is a copy can silently mutate the shared source. The second output (e.g., a different size variant) comes out oddly tiny or with the wrong bbox.

**Fix:** Re-parse a fresh `Path(d_string)` from the original `d` string for **every** independent transform branch. Never reuse a possibly-mutated object.

### Phase 5 - Compose Multi-Layer Icons (badges, two-tone icons)

For an icon that's a background shape (circle, rounded square) with the glyph as a cutout - one `currentColor` shape, not two colors - concatenate the background's path data with the glyph's path data into a **single path** with `fill-rule="evenodd"`:

```python
circle_d = f"M{cx+r},{cy}A{r},{r} 0 1 0 {cx-r},{cy}A{r},{r} 0 1 0 {cx+r},{cy}Z"
combined_d = circle_d + " " + glyph_d
```

```xml
<path fill-rule="evenodd" d="{combined_d}"/>
```

**Why this works without manually reversing winding directions:**

`evenodd` fills based on crossing-count parity, not direction. The glyph path (as traced) already alternates correctly: solid glyph, unfilled star-hole, filled dot-inside-the-hole, etc. Wrapping one more enclosing contour (the circle) around that shifts every depth by exactly one level: what was "filled" becomes "hole," what was "hole" becomes "filled" again. That's precisely the transformation needed to turn _"white glyph on a colored circle"_ into _"colored circle with a glyph-shaped cutout"_.

Concatenation is the whole trick - no boolean path-ops library required.

### Phase 6 - Optimize

```bash
npx svgo -i raw.svg -o final.svg --pretty --precision=2
```

Typically a 70-80% size reduction. Rounds coordinates, merges redundant commands, strips potrace metadata.

**Precision levels:**

- `precision=2` - good default for a 24-unit viewBox
- `precision=1` - for very large viewBoxes (512+), same relative precision with fewer decimal places

### Phase 7 - Verify Before Calling It Done

**Multi-size legibility:**

Render at 16/24/32/64px and look at the small end. Detail that reads fine at 512px can turn to mud at 16px.

**currentColor via the real mechanism:**

Not string-substituting the fill color (which only proves path data is right). Prove CSS inheritance works:

```python
import cairosvg
content = svg_text.replace('<svg ', '<svg style="color:#e11d48" ', 1)
cairosvg.svg2png(bytestring=content.encode(), write_to="check.png")
```

If this renders in red, `currentColor` will correctly pick up an ancestor's CSS `color` in a real browser.

**Side-by-side against the source:**

Render your SVG at roughly the source's resolution, place them next to each other. Look for proportion drift (glyph too big/small relative to container, off-center).

## Output Format

Every SVG includes:

```xml
<svg xmlns="..." width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
  <path fill-rule="evenodd" d="..."/>
</svg>
```

**Guarantees:**

-  `fill="currentColor"` - inherits CSS `color` property
-  Explicit `width`/`height` - sensible default size
-  `viewBox` - fully scalable, overridable by CSS
-  One `<path>` only - no embedded raster, no metadata
-  Badge variant uses `evenodd` for correct cutout rendering

**currentColor caveat:**

`currentColor` only resolves when the SVG is **inlined**:

-  Inline `<svg>` in HTML
-  Used as a React/Vue component
-  `<img src="icon.svg">` reference does **not** inherit page CSS

An `<img>` will render with `currentColor` as black (or whatever `color` defaults to) regardless of your stylesheet.

## Common Issues

### Icon comes out inverted (background filled, glyph hollow)

The mask mode doesn't match the source's polarity.

```bash
# Dark glyph on a light background:
--dark-glyph
```

### Colored/gradient glyph traces as broken speckles

A per-channel dark/light test drops saturated hues (a red pixel has a high R channel). Switch to the non-white mask:

```bash
--colored-glyph            # tune with --white-threshold if needed
```

### Whole image gets traced, or transparent areas fill in

The source is a transparent PNG but you used a color mode (which sees PIL's transparent-as-black), or you used `--alpha-glyph` on a fully opaque source (the script now errors on the latter). For a genuinely transparent source:

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

### Corners/background fused into the glyph shape

Mask not constrained to the container. Add explicit region mask (Phase 2 pitfall).

### Internal holes missing

Mask wasn't clean at that spot. Re-check threshold at that specific region.

### Small intentional details vanish

`turdsize` too high. Lower it; only raise if you see actual noise.

### Second normalized output oddly tiny

Reused a mutated `Path` object. Re-parse a fresh `Path(d_string)` per branch.

### Badge composite shows glyph as solid instead of cutout

Wrong fill-rule or path order. Use `evenodd`; order doesn't matter but rule does.

### Icon doesn't scale cleanly at small sizes

Not enough detail in source, or too much optimization. Lower `precision` in svgo, or increase source resolution.

## Verification (before integration)

Quick automated checks:

```bash
python3 scripts/icons/verify-icon.py src/assets/icons/*-icon-512.svg   # margins/flush/centered, exit!=0 on failure
python3 tests/run-icon-tests.py                                  # golden-regression harness (all modes)
```

After generation, **always** also:

1. **Render at multiple sizes** - check legibility at 16px

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

3. **Compare side-by-side with source** at ~original resolution - check for proportion drift or off-centering.

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
pip install pillow numpy svgelements cairosvg --break-system-packages
python3 -c "from svgelements import Path; print('OK')"
```

## Architecture Notes

- **Single binary mask** - cleaner, more predictable traces than multi-layer approaches
- **evenodd fill-rule** - composites background + glyph-cutout without path booleans
- **One path per output** - easier to reuse (drop into sprites, copy into React components)
- **Absolute coordinates** - potrace's transform matrix baked in; no side effects
- **Normalized viewBox** - aspect ratio preserved; size overridable by CSS

## References

- Example Python code: `scripts/icons/svg-icon-generator.py` (Phases 1-7)
- potrace docs: `man potrace` or https://potrace.sourceforge.net/
- svgelements: https://github.com/meerk40t/svgelements
- SVG fill-rule: https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill-rule
