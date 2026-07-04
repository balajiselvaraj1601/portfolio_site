#!/usr/bin/env python3
"""icon_common.py — SSOT for the icon square-and-center toolset.

The foreground-detection rule and the geometry constants live here ONCE. The
cropper, validator, and visual verifier all import from this module so a change
to the threshold or margin can never drift between "make the crop" and "check the
crop" — the classic false-PASS trap (a validator that re-implements the producer's
rule slightly differently can bless a bad output).
"""
import numpy as np

# --- geometry / detection constants (single source of truth) ---
THR = 20          # foreground = max(R,G,B) > THR  (icons sit on a near-black bg)
PROBE_THR = 6     # low probe just above the ~1-2 noise floor, for the dim-tail check
MARGIN = 0.08     # square-canvas padding = round(MARGIN * max(content_w, content_h))


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


def square_side(cw, ch, margin=MARGIN):
    """Side length of the centered square canvas for content of size cw x ch."""
    base = max(cw, ch)
    return base + 2 * int(round(margin * base))


def paste_offset(side, cw, ch):
    """Top-left offset to center cw x ch content on a side x side canvas."""
    return (side - cw) // 2, (side - ch) // 2
