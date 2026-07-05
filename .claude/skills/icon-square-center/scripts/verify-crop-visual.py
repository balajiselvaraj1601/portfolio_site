#!/usr/bin/env python3
"""verify-crop-visual.py — did any important region/object get cropped?

Two independent, FALSIFIABLE checks per source/output pair:

  A. DETERMINISTIC preservation proof: source[crop_bbox] must be byte-identical
     to output[paste-region]. If identical, every detected content pixel is present
     verbatim -> nothing within the object was cropped.

  B. VISUAL composite designed so it CAN show a failure (learned the hard way: a
     rectangle drawn ON the tight bbox always visually "touches" the object, so
     "touches" is uninformative). Instead:
       - the kept-region rectangle is drawn with a small OUTWARD gap, so when nothing
         is clipped there is visible black between the object and the line;
       - any ink pixel (PROBE_THR) lying OUTSIDE the kept crop_bbox is painted MAGENTA.
         With a correct crop this set is empty, so a clean composite shows NO magenta.
     LEFT = source with gap-rectangle + magenta overlay; RIGHT = output.

Emits verify_report.json; exit 0 iff all pairs are byte-identical AND magenta-free.
"""
import argparse
import json
import os
import sys
from PIL import Image, ImageDraw
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from icon_common import crop_bbox, paste_offset, list_png_files, PROBE_THR

VIEW = 320  # per-panel view size (downscale for the composite ONLY; deliverable untouched)


def verify_one(src_path, out_path, out_verify_dir):
    src = Image.open(src_path).convert("RGB")
    out = Image.open(out_path).convert("RGB")
    s = np.asarray(src)
    o = np.asarray(out)
    name = os.path.basename(src_path)
    sh, sw = s.shape[:2]

    sbb = crop_bbox(s)
    x0, y0, x1, y1 = sbb
    cw, ch = x1 - x0, y1 - y0

    px, py = paste_offset(o.shape[0], cw, ch)
    src_region = s[y0:y1, x0:x1]
    out_region = o[py:py + ch, px:px + cw]
    identical = src_region.shape == out_region.shape and bool(np.array_equal(src_region, out_region))

    lum = s[:, :, :3].max(axis=2)
    fg = lum > PROBE_THR
    outside = fg.copy()
    outside[y0:y1, x0:x1] = False
    n_outside = int(outside.sum())

    src_touches_edge = x0 <= 1 or y0 <= 1 or x1 >= sw - 1 or y1 >= sh - 1

    marked = src.copy()
    mk = np.asarray(marked).copy()
    mk[outside] = (255, 0, 255)
    marked = Image.fromarray(mk)
    d = ImageDraw.Draw(marked)
    gap = max(3, sw // 100)
    d.rectangle(
        [
            max(0, x0 - gap),
            max(0, y0 - gap),
            min(sw - 1, x1 - 1 + gap),
            min(sh - 1, y1 - 1 + gap),
        ],
        outline=(80, 200, 80),
        width=max(2, sw // 300),
    )
    left = marked.resize((VIEW, VIEW))
    right = out.resize((VIEW, VIEW))
    comp = Image.new("RGB", (VIEW * 2 + 12, VIEW), (25, 25, 25))
    comp.paste(left, (0, 0))
    comp.paste(right, (VIEW + 12, 0))
    os.makedirs(out_verify_dir, exist_ok=True)
    comp.save(os.path.join(out_verify_dir, name))

    return {
        "file": name,
        "content_identical": identical,
        "fg_pixels_outside_crop": n_outside,
        "content_wh": [int(cw), int(ch)],
        "src_touches_edge": bool(src_touches_edge),
        "clean": bool(identical and n_outside == 0),
    }


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
    ap.add_argument("--verify-dir", default=None)
    ap.add_argument("--json-out", default=None)
    a = ap.parse_args()
    vdir = a.verify_dir or os.path.join(a.out, "_verify")
    names = resolve_files(a.src, a.files, a.all)
    results = [
        verify_one(os.path.join(a.src, n), os.path.join(a.out, n), vdir) for n in names
    ]
    payload = json.dumps(results, indent=2)
    if a.json_out:
        open(a.json_out, "w").write(payload)
    print(payload)
    sys.exit(0 if all(r["clean"] for r in results) else 3)


if __name__ == "__main__":
    main()
