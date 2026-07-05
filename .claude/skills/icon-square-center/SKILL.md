---
name: icon-square-center
description: Square-and-center black-background raster icons (PNG) WITHOUT resizing — crop to content, center on a square canvas, trim excess black margin. Trigger on "square the icons", "center the icons", "trim black margins", "icons aren't square", "icon not centered", or when a batch of raster icons has uneven/large black borders. NOT for SVG logos (use svg-logo-crop) or icon acquisition (use ui-icon-acquisition).
---

# icon-square-center

Fixes a folder of raster icons that sit on a near-black background but are **non-square**,
**off-center**, or have **large uneven black margins** — producing square, centered icons with
a small symmetric margin. **Pixels are never resized/resampled** — content is cropped and
translated verbatim, so it is provably lossless.

## When to use

- AI-generated or exported PNG icons on a black/near-black field that need to be uniform tiles.
- Any batch where "make them square and centered without losing the artwork" is the ask.

Do **not** use for: SVG/vector logos (`svg-logo-crop`), acquiring new icons (`ui-icon-acquisition`),
or recoloring/normalizing ink luminance (`scripts/normalize-icon-ink.py`).

## How it works (no resizing)

1. **Inclusive crop bbox** (`crop_bbox`): union of main ink (`max(R,G,B) > THR`, default 20) and
   dim anti-aliasing tail (`> PROBE_THR`, default 6). Crops all non-black ink down to the noise
   floor — no faint halos left in the source black field.
2. **Full-bleed guard**: if the union bbox covers **>92%** of the source canvas, stair-step to
   higher ink thresholds (200 → 240). If still >92%, **fail fast** (`FullBleedSourceError`) —
   re-render the source with more black margin (glyph too large for the artboard).
3. Crop **exactly** to `crop_bbox` (never inside it), then paste **centered** on a square black
   canvas of side `max(cw,ch) + 2·max(1, round(MARGIN·max(cw,ch)))` (default MARGIN 0.08 ≈ 8%
   each side; per-icon proportional, not a constant batch size).
4. Result: square + exactly centered + symmetric black margin; every content pixel copied
   verbatim. Non-square inputs are absorbed as symmetric padding, never stretched.

Constants live once in `scripts/icon_common.py` (`THR`, `PROBE_THR`, `MARGIN`, `MIN_PAD`,
`FULL_BLEED_FILL`, `content_bbox`, `crop_bbox`, `square_side`, `paste_offset`). The cropper,
validator, and verifier all import them so the "make the crop" rule and the "check the crop"
rule can never drift.

## Usage

Run in batches (Haiku sub-agents are fine for parallel execution; see discipline note below).
`icon_collections_fixed/` typically lives outside the repo, so writes may need
`dangerouslyDisableSandbox` — the sandbox write-allowlist does not cover arbitrary workspace dirs.

```bash
S=.claude/skills/icon-square-center/scripts
SRC=~/workspace/icon_collections
OUT=~/workspace/icon_collections_fixed

# Batch: every *.png in --src
python3 $S/square-and-center-icon.py --src $SRC --out $OUT --all

# Or explicit file list
python3 $S/square-and-center-icon.py --src $SRC --out $OUT --files a.png b.png

# 2. validate (independent 2nd measurement; exit 0 = all PASS)
python3 $S/validate-square-center.py --src $SRC --out $OUT --all

# 3. prove nothing was cropped + build falsifiable side-by-side composites into <OUT>/_verify/
python3 $S/verify-crop-visual.py --src $SRC --out $OUT --all
```

Flags: `--margin` (default 0.08; use `0` for flush square with no breathing room). All scripts
take arbitrary `--src/--out` and accept either `--files NAME ...` or `--all`.

## Verification (two independent measurements + a falsifiable eye check)

This follows the repo's existing convention — see `scripts/verify-icon.py`: _"the generator's own
`_verify()` asserts its output during a run; this is the second, independent measurement … two
independent measurements agreeing is far stronger evidence than one."_

- **`validate-square-center.py`** re-derives geometry from the finished OUTPUT and byte-compares
  `source[crop_bbox]` against `output[paste-region]` (`content_identical`) — the authoritative
  no-loss gate. Also checks square, centered, no-edge-clip, and `probe_sanity` (zero ink pixels
  above `PROBE_THR` outside `crop_bbox` on the source).
- **`verify-crop-visual.py`** additionally counts ink pixels (`PROBE_THR`) lying **outside** the
  kept `crop_bbox` (`fg_pixels_outside_crop`, must be 0) and renders composites where any such
  pixel is painted magenta. Clean crop → no magenta, and the green frame has a visible black gap
  around the object.

## Verification discipline (lessons — read before trusting a check)

1. **Prove a metric measures what you claim, and audit the FALSE-PASS direction.** A no-loss check
   on foreground _count_ + bbox _dims_ can pass even if pixels were altered (same count, same box).
   That is why check 4 is a **byte-identity** comparison, not a count. When you invent a metric,
   state in one line what value separates pass from fail and why, then confirm it on real data
   before you trust it. (An earlier "ring just outside the bbox < strict_thr" check was discarded:
   the ring is bounded by the same threshold it compared against, so it was near-tautological.)

2. **Back a metric check with a check that can FALSIFY it.** The first composite drew the rectangle
   _on_ the tight bbox — the object always visually "touches" a tight box, so vision reviewers can't
   distinguish "touches" (fine) from "exceeds" (bad), and they raised false alarms. The fix: an
   outward-gapped frame plus a magenta overlay of any genuinely-excluded pixel — a picture that is
   blank when correct and unmistakable when wrong.

3. **Sub-agent fan-out over a deterministic script is parallel EXECUTION, not verification.** Fanning
   Haiku agents across a batch to run this cropper adds throughput, not correctness — the real gate
   is the deterministic scripts above. Reserve sub-agents for genuine per-item _judgment_ (e.g. the
   vision pass), and treat their subjective flags as candidates to reconcile against the deterministic
   proof, not as ground truth.

## Files

- `scripts/icon_common.py` — SSOT detection rule + geometry constants (`crop_bbox`, full-bleed guard)
- `scripts/square-and-center-icon.py` — the crop-and-center producer (no resize)
- `scripts/validate-square-center.py` — independent validator (byte-identity no-loss gate)
- `scripts/verify-crop-visual.py` — deterministic proof + falsifiable comparison composites
