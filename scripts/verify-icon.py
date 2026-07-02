#!/usr/bin/env python3
"""
verify-icon.py — independent margin/flush/centering check for a generated SVG.

The generator's own `_verify()` asserts its output during a run. This is the
*second, independent* measurement (Verification step 3 in the deep-dive): it
re-derives the glyph bounding box straight from the finished SVG file — no shared
state with the generator — and reports per-edge margins as a fraction of the
viewBox. Two independent measurements agreeing is far stronger evidence than one.

Usage:
    python3 scripts/verify-icon.py path/to/icon.svg [more.svg ...]

Exit code 0 if every file passes its detected mode's tolerance, 1 otherwise.
A "tight" verdict is inferred when all four margins are ~0; otherwise the file is
treated as padded/centered and checked for symmetric margins.

Requires: svgelements  (pip install svgelements)
"""

import re
import sys
from pathlib import Path

from svgelements import Path as SVGPath

TIGHT_TOL = 0.01   # flush: every margin within 1% of the long side
CENTER_TOL = 0.02  # centered: left≈right and top≈bottom within 2%


def measure(svg_path):
    """Return (viewbox_w, viewbox_h, margins) where margins is a dict of
    left/right/top/bottom as fractions of the viewBox, or raise on bad input."""
    text = Path(svg_path).read_text()

    vb = re.search(r'viewBox="([^"]+)"', text)
    if not vb:
        raise ValueError("no viewBox")
    _, _, vw, vh = (float(n) for n in vb.group(1).split())

    d_list = re.findall(r'<path[^>]*\bd="([^"]+)"', text)
    if not d_list:
        raise ValueError("no <path>")
    xmin, ymin, xmax, ymax = SVGPath(" ".join(d_list)).bbox()

    long_side = max(vw, vh)
    margins = {
        "left": xmin / long_side,
        "right": (vw - xmax) / long_side,
        "top": ymin / long_side,
        "bottom": (vh - ymax) / long_side,
    }
    return vw, vh, margins


def verdict(vw, vh, margins):
    """Return (ok: bool, mode: str, detail: str)."""
    m = margins
    flush = all(abs(v) <= TIGHT_TOL for v in m.values())
    if flush:
        worst = max(abs(v) for v in m.values())
        return True, "tight", f"flush on all edges (max margin {worst*100:.2f}%)"

    # Padded → require symmetry (centered glyph).
    dx = abs(m["left"] - m["right"])
    dy = abs(m["top"] - m["bottom"])
    ok = dx <= CENTER_TOL and dy <= CENTER_TOL
    detail = (
        f"L/R {m['left']*100:.1f}/{m['right']*100:.1f}% "
        f"(Δ{dx*100:.2f}), T/B {m['top']*100:.1f}/{m['bottom']*100:.1f}% (Δ{dy*100:.2f})"
    )
    return ok, "centered", detail


def main(argv):
    if not argv:
        print(__doc__.strip())
        return 2

    all_ok = True
    for svg in argv:
        try:
            vw, vh, margins = measure(svg)
            ok, mode, detail = verdict(vw, vh, margins)
        except Exception as e:  # noqa: BLE001 — surface any parse failure per file
            print(f"✗ {Path(svg).name}: {e}")
            all_ok = False
            continue
        mark = "✓" if ok else "✗"
        print(f"{mark} {Path(svg).name}: {int(vw)}×{int(vh)} [{mode}] {detail}")
        all_ok = all_ok and ok

    return 0 if all_ok else 1


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
