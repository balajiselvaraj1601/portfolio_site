#!/usr/bin/env python3
"""validate-square-center.py — independent 2nd measurement of a square/center crop.

This re-derives everything from the finished OUTPUT file (no shared state with the
producer beyond the SSOT detection rule in icon_common) and compares against the
SOURCE. Two independent measurements agreeing is far stronger than the producer
asserting its own success. Emits a JSON array; exit 0 iff every file PASSes.

Checks per file:
  1 square            : out w == h
  2 centered          : out content centroid offset <= ctr_tol each axis
  3 no_clipping       : out content does NOT touch the canvas edge (margin >= edge_min)
  4 content_identical : AUTHORITATIVE no-loss gate. source[crop_bbox] is byte-identical to
                        output[paste-region].
  5 probe_sanity      : no ink pixels (PROBE_THR) lie outside crop_bbox on source.
"""
import argparse
import json
import os
import sys
from PIL import Image
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from icon_common import (
    content_bbox,
    crop_bbox,
    paste_offset,
    list_png_files,
    THR,
    PROBE_THR,
)


def fg_count(arr, thr):
    rgb = arr[:, :, :3] if arr.ndim == 3 else arr[:, :, None]
    return int((rgb.max(axis=2) > thr).sum())


def ink_outside_crop(arr, bb, thr):
    """Count foreground pixels strictly outside crop bbox."""
    if bb is None:
        return 0
    x0, y0, x1, y1 = bb
    lum = arr[:, :, :3].max(axis=2)
    fg = lum > thr
    outside = fg.copy()
    outside[y0:y1, x0:x1] = False
    return int(outside.sum())


def check(src_path, out_path, edge_min=0.02, ctr_tol=0.01):
    s = np.asarray(Image.open(src_path).convert("RGB"))
    o = np.asarray(Image.open(out_path).convert("RGB"))
    sh, sw = s.shape[:2]
    oh, ow = o.shape[:2]
    sbb = crop_bbox(s)
    obb = content_bbox(o, THR)
    r = {"file": os.path.basename(src_path)}

    r["square"] = ow == oh

    if obb:
        ox0, oy0, ox1, oy1 = obb
        cx, cy = (ox0 + ox1) / 2 / ow, (oy0 + oy1) / 2 / oh
        r["center_offset"] = [round(cx - 0.5, 4), round(cy - 0.5, 4)]
        r["centered"] = abs(cx - 0.5) <= ctr_tol and abs(cy - 0.5) <= ctr_tol
        m = min(ox0, oy0, ow - ox1, oh - oy1) / ow
        r["edge_margin"] = round(m, 4)
        r["no_clipping"] = m >= edge_min
    else:
        r["centered"] = r["no_clipping"] = False

    scw, sch = (sbb[2] - sbb[0], sbb[3] - sbb[1]) if sbb else (0, 0)
    ocw, och = (obb[2] - obb[0], obb[3] - obb[1]) if obb else (0, 0)
    r["src_content"], r["out_content"] = [scw, sch], [ocw, och]

    identical = False
    if sbb and r["square"]:
        px, py = paste_offset(ow, scw, sch)
        src_region = s[sbb[1]:sbb[3], sbb[0]:sbb[2]]
        out_region = o[py:py + sch, px:px + scw]
        identical = src_region.shape == out_region.shape and bool(np.array_equal(src_region, out_region))
    r["content_identical"] = identical
    r["no_loss_counts"] = (fg_count(s, PROBE_THR) == fg_count(o, PROBE_THR)) and (scw == ocw) and (sch == och)

    outside = ink_outside_crop(s, sbb, PROBE_THR)
    r["ink_outside_crop"] = outside
    r["probe_sanity"] = outside == 0

    r["src_touches_edge"] = bool(
        sbb and (sbb[0] <= 1 or sbb[1] <= 1 or sbb[2] >= sw - 1 or sbb[3] >= sh - 1)
    )
    r["PASS"] = bool(
        r["square"]
        and r["centered"]
        and r["no_clipping"]
        and r["content_identical"]
        and r["probe_sanity"]
    )
    return r


def resolve_files(src_dir, files, use_all):
    if use_all:
        if files:
            raise SystemExit("error: use --files or --all, not both")
        return list_png_files(src_dir)
    if not files:
        raise SystemExit("error: specify --files NAME ... or --all")
    return files


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--src", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--files", nargs="*", default=[])
    ap.add_argument("--all", action="store_true")
    a = ap.parse_args()
    names = resolve_files(a.src, a.files, a.all)
    results = [check(os.path.join(a.src, n), os.path.join(a.out, n)) for n in names]
    print(json.dumps(results, indent=2))
    sys.exit(0 if all(x["PASS"] for x in results) else 2)


if __name__ == "__main__":
    main()
