# SVG Icon Generation Guide

Raster → SVG icon pipeline. Three approaches ranked by quality, with full methodology for approach #3 (auto-trace + normalize).

## 0. Philosophy

| Approach | Result | Use when |
|---|---|---|
| Embed PNG in `<img>` or data URI | Not a vector. Doesn't scale, doesn't recolor. | Never — not actually SVG |
| Hand-draw bezier curves by eye | Real vector, but slow, curves rarely match precisely | Small icon collections (<5), unlimited time |
| **Auto-trace, then normalize & optimize** | Real vector, pixel-accurate, minutes not hours | Standard badge/glyph icons (this guide) |

The core idea: let **potrace** do the hard geometric work of finding accurate bezier curves along pixel boundaries (this is what it's built for), then spend your effort on what a tracer can't do — cleaning up coordinates, composing multi-color icons into one recolorable shape, verifying results.

---

## 1. Toolchain (one-time setup)

```bash
apt-get install -y potrace
pip install pillow numpy svgelements --break-system-packages
npm install -g svgo
pip install cairosvg --break-system-packages   # optional: for rendering SVG → PNG verification
```

| Tool | Job |
|---|---|
| **potrace** | Raster → vector tracing (bezier-fitting the pixel boundary) |
| **Pillow + numpy** | Pixel inspection, color sampling, mask building |
| **svgelements** | Parse SVG paths, apply transforms, flatten to absolute coords |
| **svgo** | Minimize path data, clean up coordinates |
| cairosvg | Render SVG back to PNG to verify each step (optional but recommended) |

---

## 2. Phase 1 — Planning & Inspection

Do this **before** running potrace. All downstream failures trace back to wrong assumptions here.

### 2.1 — Get exact dimensions and inspect colors

```python
from PIL import Image
import numpy as np
img = np.array(Image.open("source.png").convert("RGB"))
print(img.shape)                 # (height, width, 3)
print(img[0,0], img[-1,-1])      # corner colors
```

### 2.2 — Identify layers

- Is this one flat-color glyph, or a glyph-on-a-background-shape (badge)?
- A badge needs two shapes traced (or one composed path using `evenodd` fill-rule).
- A plain glyph needs one.
- Decide now; it changes the mask you build in Phase 2.

### 2.3 — Sample colors precisely (don't eyeball hex)

Anti-aliasing makes single-pixel samples unreliable. Take a patch:

```python
from collections import Counter
patch = img[500:510, 500:510].reshape(-1,3)
print(Counter(map(tuple, patch)).most_common(3))
```

### 2.4 — Measure proportions

If there's a container (circle, rounded square), find its bounding box, then the glyph's bbox as a **percentage of the container**. This ratio is what makes the final SVG look proportionally right, not "close enough."

```python
# glyph width/height as % of a circular container's diameter
cx, cy, radius = 500, 500, 450
glyph_bbox_w = xs.max() - xs.min()
glyph_bbox_h = ys.max() - ys.min()
print(f"w={100*glyph_bbox_w/(2*radius):.1f}%  h={100*glyph_bbox_h/(2*radius):.1f}%")
```

### 2.5 — Zoom into fine details

Crop and upscale corners, terminals, thin junctions. Small gaps that are invisible at full-image view become obvious after 4× zoom. If you build the mask without noticing these, `turdsize` (Phase 3) will erase them as "specks."

### 2.6 — Decide deliverable variants up front

Which sizes (24px, 512px, etc.)? Standalone glyph vs. full badge vs. both? Fixing this now means you compute normalization math once.

---

## 3. Phase 2 — Build a Clean Mask

**Goal:** binary bitmap containing **only** the shape you want traced. Nothing else.

The foreground test depends on how the glyph separates from its background —
pick the mode (`--dark-glyph`, `--colored-glyph`, `--alpha-glyph`, or the light
default) that matches the source:

```python
r, g, b = img[...,0].astype(int), img[...,1].astype(int), img[...,2].astype(int)
mn = np.minimum(np.minimum(r, g), b)

is_glyph = (r > 180) & (g > 180) & (b > 180)   # light : glyph brighter than bg
# is_glyph = (r < 180) & (g < 180) & (b < 180) # dark  : glyph darker than bg
# is_glyph = mn < 235                           # nonwhite: colored/gradient ink on white
# is_glyph = alpha > 128                         # alpha : opaque region of a transparent PNG
```

**Match the mode to the source.** A per-channel dark/light threshold fails on
**colored** glyphs (a saturated red pixel has a high R channel, so "all channels
dark" drops it — the trace shatters into speckles); use the non-white test there.
For a **transparent-background** PNG, mask the alpha channel directly — it's
color-agnostic and the most robust option. Never `convert("RGB")` a transparent
source blindly: the transparent field becomes solid black and defeats every
color test.

### Pitfall — Out-of-bounds contamination

If the source is a glyph inside a circle on a square canvas, the square's corners (outside the circle) are background-colored too, and a naive threshold includes them in your "glyph" mask. potrace then traces the glyph *fused with the four corners* as one shape.

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

---

## 4. Phase 3 — Vectorize

```bash
potrace -s -O 0.1 -a 1.3 -t 4 mask.pbm -o traced.svg
```

| Flag | Meaning | Notes |
|---|---|---|
| `-s` | Output SVG | |
| `-O` opttolerance | Curve-fit tolerance | Lower = more accurate/more nodes. 0.1–0.2 is good for detailed icons |
| `-a` alphamax | Corner-smoothing threshold | ~1–1.3 keeps sharp corners sharp without over-rounding |
| `-t` turdsize | Suppress specks smaller than N px | Too high erases small intentional details (handles, thin gaps). Start low (2–4) |
| `-i` | Invert foreground/background | Use if output is backwards |

**Immediately render and look at it** — this takes 10 seconds and catches the two most common failures:

```python
import cairosvg
cairosvg.svg2png(url="traced.svg", write_to="check.png", output_width=400)
```

### Wrong polarity

potrace traces **black** pixels as foreground by default. If your mask's foreground ended up white (backwards), the output is inverted — background filled, glyph hollow.

**Fix:** Add `-i` flag, or flip the mask's 0/255 mapping.

### Missing holes

Internal cutouts (a star inside a cup, letter counters) should appear as unfilled regions. potrace handles this via nested-contour winding, **as long as the mask in Phase 2 was clean**. If a hole is missing, it's a mask problem, not a potrace problem.

---

## 5. Phase 4 — Flatten & Normalize Coordinates

potrace's raw output looks like:

```xml
<g transform="translate(0,1200) scale(0.1,-0.1)" fill="#000000">
<path d="M3750 9561 c-275 -6 ..."/>
</g>
```

Large integer coordinates plus a translate+scale+Y-flip transform. It's valid SVG, but the numbers are meaningless and carrying a transform makes the path harder to reuse.

> **Note — potrace emits one `<path>` per disconnected region.** A glyph made of separate pieces (a globe **plus** two location pins, a dashboard header **above** its body, bars **beside** a coin) produces several `<path>` tags. Collect **all** of them (`re.findall`, then join the `d` strings) before baking the transform — grabbing only the first silently drops every other shape and leaves an icon that's just a fragment of the source. Concatenation is safe under `fill-rule="evenodd"` since potrace regions never self-overlap.

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

### Borderless / tight output (`--tight`)

For an icon that must sit flush in its frame with **no empty margin**, skip the
centered-in-square step above and instead make the viewBox wrap the glyph
exactly. Scale so the longest side hits the target, translate the bbox to the
origin, and emit a **non-square** viewBox equal to the scaled bbox:

```python
xmin, ymin, xmax, ymax = p.bbox()
bw, bh = xmax - xmin, ymax - ymin
scale = longest / max(bw, bh)
m = Matrix(); m.post_translate(-xmin, -ymin); m.post_scale(scale, scale)
p *= m; p.reify()
W, H = round(bw * scale), round(bh * scale)   # viewBox="0 0 W H"
```

svgo preserves the non-square viewBox. Pair with white-margin auto-crop on the
source (see `--save-cropped`) so neither the PNG nor the SVG carries empty space.

The generator's `_verify()` re-measures the output and asserts the glyph is flush
to `[0,0,W,H]` (tight) or centered (default square) before shipping it. For an
independent second measurement straight from the finished file, run
`python3 scripts/verify-icon.py <file>.svg` — it re-derives the per-edge margins
and returns a `tight`/`centered` verdict with a non-zero exit on failure.

### Pitfall — Path object aliasing

`Path(p)` in svgelements does not reliably give you an independent copy in every version. Applying a transform to what you think is a copy can silently mutate the shared source. The second output (e.g., a different size variant) comes out oddly tiny or with the wrong bbox.

**Fix:** Re-parse a fresh `Path(d_string)` from the original `d` string for **every** independent transform branch. Never reuse a possibly-mutated object.

---

## 6. Phase 5 — Compose Multi-Layer Icons (badges, two-tone icons)

For an icon that's a background shape (circle, rounded square) with the glyph as a cutout — one `currentColor` shape, not two colors — concatenate the background's path data with the glyph's path data into a **single path** with `fill-rule="evenodd"`:

```python
circle_d = f"M{cx+r},{cy}A{r},{r} 0 1 0 {cx-r},{cy}A{r},{r} 0 1 0 {cx+r},{cy}Z"
combined_d = circle_d + " " + glyph_d
```

```xml
<path fill-rule="evenodd" d="{combined_d}"/>
```

**Why this works without manually reversing winding directions:**

`evenodd` fills based on crossing-count parity, not direction. The glyph path (as traced) already alternates correctly: solid glyph, unfilled star-hole, filled dot-inside-the-hole, etc. Wrapping one more enclosing contour (the circle) around that shifts every depth by exactly one level: what was "filled" becomes "hole," what was "hole" becomes "filled" again. That's precisely the transformation needed to turn *"white glyph on a colored circle"* into *"colored circle with a glyph-shaped cutout"*.

Concatenation is the whole trick — no boolean path-ops library required.

---

## 7. Phase 6 — Optimize

```bash
npx svgo -i raw.svg -o final.svg --pretty --precision=2
```

Typically a 70–80% size reduction. Rounds coordinates, merges redundant commands, strips potrace metadata.

**Precision levels:**
- `precision=2` — good default for a 24-unit viewBox
- `precision=1` — for very large viewBoxes (512+), same relative precision with fewer decimal places

---

## 8. Phase 7 — Verify Before Calling It Done

Three checks, all cheap, all worth doing every time:

### Multi-size legibility

Render at 16/24/32/64px and look at the small end. Detail that reads fine at 512px can turn to mud at 16px.

### currentColor via the real mechanism

Not string-substituting the fill color (which only proves path data is right). Prove CSS inheritance works:

```python
import cairosvg
content = svg_text.replace('<svg ', '<svg style="color:#e11d48" ', 1)
cairosvg.svg2png(bytestring=content.encode(), write_to="check.png")
```

If this renders in red, `currentColor` will correctly pick up an ancestor's CSS `color` in a real browser.

### Side-by-side against the source

Render your SVG at roughly the source's resolution, place them next to each other. Look for proportion drift (glyph too big/small relative to container, off-center).

---

## 9. Output Conventions

Every icon file this pipeline produces should have:

- `viewBox="0 0 N N"` **and** explicit `width`/`height` — gives a sensible default size when dropped in raw, while remaining fully overridable by CSS or a `width`/`height` prop
- `fill="currentColor"` on the `<svg>` root; **no** `fill` on the `<path>` — let it inherit
- `fill-rule="evenodd"` on any path with holes or composed layers
- One `<path>`, no embedded raster, no editor metadata, no hardcoded colors

### currentColor caveat

`currentColor` only resolves when the SVG is **inlined**:
- ✓ Inline `<svg>` in HTML
- ✓ Used as a React/Vue component
- ✗ `<img src="icon.svg">` reference does **not** inherit page CSS

An `<img>` will render with `currentColor` as black (or whatever `color` defaults to) regardless of your stylesheet.

---

## 10. Quick-Reference Checklist

- [ ] **Perceive:** Inspect dimensions, sample patches, measure proportions, zoom into corners
- [ ] **Mask:** Build binary mask constrained to the relevant region (circle, square, etc.)
- [ ] **Trace:** `potrace -s -O 0.1 -a 1.3 -t 4 mask.pbm -o raw.svg`
- [ ] **Verify:** Render immediately — check polarity and holes survived
- [ ] **Flatten:** Parse + reify transform, producing absolute-coordinate `d` string
- [ ] **Normalize:** Fresh `Path()` parse per size branch, rescale to target viewBox
- [ ] **Compose:** (If multi-layer) Concatenate paths, set `fill-rule="evenodd"`
- [ ] **Optimize:** `svgo --precision=2`
- [ ] **Verify:** Multi-size render, real currentColor test, side-by-side vs. source
- [ ] **Confirm:** Output has `currentColor` root fill, no path-level fill, sane viewBox + width + height

---

## 11. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Corners/background fused into the glyph shape | Mask not constrained to the container | Add explicit region mask (Phase 2 pitfall) |
| Whole image inverted | potrace's black/white polarity doesn't match your mask | Add `-i` flag or flip mask's 0/255 mapping |
| Internal holes missing | Mask wasn't clean at that spot | Re-check threshold at that specific region |
| Small intentional details vanish | `turdsize` too high | Lower it; only raise if you see actual noise |
| Second normalized output oddly tiny | Reused a mutated `Path` object | Re-parse a fresh `Path(d_string)` per branch |
| Badge composite shows glyph as solid instead of cutout | Wrong fill-rule or path order | Use `evenodd`; order doesn't matter but rule does |
| Icon doesn't scale cleanly at small sizes | Not enough detail in source, or too much optimization | Lower `precision` in svgo, or increase source resolution |

---

## Implementation Reference

See `svg-icon-generator.py` for an end-to-end implementation of Phases 1–7.

Key decisions made in code:
- Binary mask stored as PBM for potrace (1-bit, native format)
- Transform always parsed from potrace's `<g transform>` (never guessed)
- Fresh `Path()` parse per normalize call (avoids aliasing bug)
- Badge circle computed as two arcs, not a single path (both equivalent; this matches `potrace` conventions)
- `fill-rule="evenodd"` used universally (works for simple glyphs too; more predictable than `nonzero`)
- svgo precision set to 2 by default (good balance for typical icon sizes)
