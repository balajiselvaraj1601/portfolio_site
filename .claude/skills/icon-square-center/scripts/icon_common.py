#!/usr/bin/env python3
"""icon_common.py — SSOT for the icon square-and-center toolset.

The foreground-detection rule and the geometry constants live here ONCE. The
cropper, validator, and visual verifier all import from this module so a change
to the threshold or margin can never drift between "make the crop" and "check the
crop" — the classic false-PASS trap (a validator that re-implements the producer's
rule slightly differently can bless a bad output).
"""
from pathlib import Path

import numpy as np

# --- geometry / detection constants (single source of truth) ---
THR = 20          # foreground = max(R,G,B) > THR  (icons sit on a near-black bg)
PROBE_THR = 6     # low probe just above the ~1-2 noise floor, for the dim-tail check
MARGIN = 0.08     # square-canvas padding = round(MARGIN * max(content_w, content_h))
MIN_PAD = 1       # minimum symmetric pad px each side (avoid zero pad on tiny bboxes)
FULL_BLEED_FILL = 0.92  # crop bbox covering more than this fraction => source problem
INK_ESCALATION = (200, 220, 240)  # stair-step thresholds for full-bleed fallback


class FullBleedSourceError(ValueError):
    """Source ink fills nearly the entire canvas; fix the source asset."""


def content_bbox(arr, thr=THR):
    """Axis-aligned bbox (x0,y0,x1,y1) of foreground pixels, or None if empty.

    Because this returns the min/max over ALL foreground pixels, no foreground
    pixel can ever lie outside the returned box — that invariant is what makes the
    crop provably lossless.
    """
    rgb = arr[:, :, :3] if arr.ndim == 3 else arr[:, :, None]
    lum = rgb.max(axis=2)
    fg = lum > thr
    ys, xs = np.where(fg)
    if len(xs) == 0:
        return None
    return int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1


def bbox_union(a, b):
    """Axis-aligned union of two bboxes (x0,y0,x1,y1 exclusive), or either if one is None."""
    if a is None:
        return b
    if b is None:
        return a
    return (
        min(a[0], b[0]),
        min(a[1], b[1]),
        max(a[2], b[2]),
        max(a[3], b[3]),
    )


def bbox_fill(bb, width, height):
    """Fraction of canvas area covered by bbox."""
    if bb is None or width <= 0 or height <= 0:
        return 0.0
    cw, ch = bb[2] - bb[0], bb[3] - bb[1]
    return (cw * ch) / (width * height)


def crop_bbox(arr):
    """Inclusive crop region: main ink (THR) union dim anti-aliasing tail (PROBE_THR).

    For pathological full-bleed sources, escalates ink threshold before failing.
    Raises FullBleedSourceError when no tight crop is possible — fix the source PNG.
    """
    h, w = arr.shape[:2]
    tbb = content_bbox(arr, THR)
    pbb = content_bbox(arr, PROBE_THR)
    ubb = bbox_union(tbb, pbb)
    if ubb is None:
        return None

    fill = bbox_fill(ubb, w, h)
    if fill <= FULL_BLEED_FILL:
        return ubb

    for thr in INK_ESCALATION:
        bb = content_bbox(arr, thr)
        if bb is None:
            continue
        f = bbox_fill(bb, w, h)
        if 0.15 < f <= FULL_BLEED_FILL:
            return bb

    raise FullBleedSourceError(
        f"crop bbox covers {fill:.1%} of canvas (> {FULL_BLEED_FILL:.0%}) even after "
        f"ink escalation {INK_ESCALATION}; re-render source with more black margin"
    )


def square_side(cw, ch, margin=MARGIN):
    """Side length of the centered square canvas for content of size cw x ch."""
    base = max(cw, ch)
    pad = max(MIN_PAD, int(round(margin * base)))
    return base + 2 * pad


def paste_offset(side, cw, ch):
    """Top-left offset to center cw x ch content on a side x side canvas."""
    return (side - cw) // 2, (side - ch) // 2


def list_png_files(directory):
    """Sorted basenames of *.png in directory."""
    return sorted(p.name for p in Path(directory).glob("*.png"))
