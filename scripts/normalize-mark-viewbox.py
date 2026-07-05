#!/usr/bin/env python3
"""normalize-mark-viewbox.py — equal-footprint viewBox normalization for marks/*.svg.

MarkEmblem renders each mark with `mask: center / contain` inside a square slot,
so a glyph's rendered footprint is its ink bbox as a fraction of its viewBox.
Tight viewBoxes (generator --tight) make every glyph's LONGEST side fill the
slot, which leaves elongated glyphs looking smaller than square ones. This tool
gives each glyph in a section group a square viewBox sized so the ink-bbox AREA
fraction is identical across the group (the "equal visual footprint" rule):

    A_group = min over group of (min_dim / max_dim)   # most elongated member
    S_slug  = sqrt(ink_w * ink_h / A_group)           # square viewBox side
    viewBox centered on the ink bbox centre; width/height attrs stripped.

Groups are DERIVED, not hand-listed: every logo_* slug referenced anywhere in
content/**/*.json or src/**/*.{astro,ts} that resolves to marks/<slug>.svg is
assigned to a family by slug prefix (families map 1:1 to render contexts).
Slugs outside every family become singletons (square-pad only, zero shrink).

Usage:
    python3 scripts/normalize-mark-viewbox.py list                # show groups
    python3 scripts/normalize-mark-viewbox.py apply [--group G] [--dry-run]
    python3 scripts/normalize-mark-viewbox.py check [--group G]

Idempotent: re-running apply after a marks/ batch regen (which re-traces tight
viewBoxes) restores normalization. Run it after ANY regeneration of marks/ —
see docs/icon-blend-strategy.md.
"""

import argparse
import math
import re
import sys
from pathlib import Path

from svgelements import Path as SVGPath

ROOT = Path(__file__).resolve().parent.parent
MARKS = ROOT / "public" / "assets" / "logos" / "marks"

# Ordered longest-prefix-first. Each family is one render context (identical
# slots), which is exactly the scope where footprint equality must hold.
FAMILIES = [
    ("hub-idea", "logo_hub_kaggle_"),
    ("hub-multimodal", "logo_hub_multimodal_"),
    ("kaggle-metrics", "logo_metric_kaggle_"),
    ("kaggle-competitions", "logo_kaggle_"),
    ("vision-impact", "logo_vision_"),
    ("education-metrics", "logo_education_"),
]

SLUG_RE = re.compile(r"\blogo_[a-z0-9_]+\b")
VIEWBOX_RE = re.compile(
    r'viewBox="([\d.eE+-]+)[ ,]+([\d.eE+-]+)[ ,]+([\d.eE+-]+)[ ,]+([\d.eE+-]+)"'
)
# Spread tolerance for footprint fractions within a group (absolute).
FRACTION_TOL = 0.01
CENTER_TOL = 0.02


def referenced_slugs():
    """All logo_* slugs referenced by content JSON or src code."""
    refs = set()
    for f in (ROOT / "content").rglob("*.json"):
        refs |= set(SLUG_RE.findall(f.read_text()))
    for pattern in ("*.astro", "*.ts"):
        for f in (ROOT / "src").rglob(pattern):
            refs |= set(SLUG_RE.findall(f.read_text()))
    return refs


def group_of(slug):
    for name, prefix in FAMILIES:
        if slug.startswith(prefix):
            return name
    return f"single:{slug}"


def build_groups():
    """{group_name: [slug, ...]} for referenced slugs backed by a marks/ SVG."""
    groups, skipped = {}, []
    for slug in sorted(referenced_slugs()):
        if (MARKS / f"{slug}.svg").exists():
            groups.setdefault(group_of(slug), []).append(slug)
        else:
            skipped.append(slug)  # resolves in org/ or root, or is stale
    return groups, skipped


def ink_bbox(svg_text, label):
    """Union of per-path bboxes. Never concatenate d attrs: a leading relative
    moveto is absolute only at the start of its own path."""
    boxes = [SVGPath(d).bbox() for d in re.findall(r'<path[^>]*\bd="([^"]+)"', svg_text)]
    if not boxes:
        raise SystemExit(f"{label}: no path data")
    xs0, ys0, xs1, ys1 = zip(*boxes)
    return min(xs0), min(ys0), max(xs1), max(ys1)


def fmt(v):
    s = f"{v:.3f}".rstrip("0").rstrip(".")
    return "0" if s in ("", "-0") else s


def plan_group(slugs):
    """Compute the group target A and per-slug square viewBox."""
    inks = {}
    for slug in slugs:
        text = (MARKS / f"{slug}.svg").read_text()
        x0, y0, x1, y1 = ink_bbox(text, slug)
        inks[slug] = (text, x0, y0, x1 - x0, y1 - y0)
    target = min(min(w, h) / max(w, h) for _, _, _, w, h in inks.values())
    plans = {}
    for slug, (text, x0, y0, w, h) in inks.items():
        side = math.sqrt(w * h / target)
        cx, cy = x0 + w / 2, y0 + h / 2
        plans[slug] = (text, cx - side / 2, cy - side / 2, side, w, h)
    return target, plans


def apply_group(name, slugs, dry):
    target, plans = plan_group(slugs)
    print(f"\n[{name}] target footprint {target:.3f} "
          f"(longest-side factor {math.sqrt(target):.3f})")
    for slug, (text, nx, ny, side, w, h) in plans.items():
        m = VIEWBOX_RE.search(text)
        if not m:
            raise SystemExit(f"{slug}: no viewBox")
        new_vb = f'viewBox="{fmt(nx)} {fmt(ny)} {fmt(side)} {fmt(side)}"'
        out = text[: m.start()] + new_vb + text[m.end():]
        out = re.sub(r'\s(width|height)="[\d.]+(px)?"', "", out, count=2)
        if not dry:
            (MARKS / f"{slug}.svg").write_text(out)
        print(f'  {slug:42s} {m.group(0):32s} -> {new_vb}'
              f'  longest-side {max(w, h) / side:.3f}')


def check_group(name, slugs):
    errs, fracs = [], {}
    for slug in slugs:
        text = (MARKS / f"{slug}.svg").read_text()
        m = VIEWBOX_RE.search(text)
        if not m:
            errs.append(f"{slug}: no viewBox")
            continue
        x, y, w, h = (float(v) for v in m.groups())
        if abs(w - h) > 0.01:
            errs.append(f"{slug}: viewBox not square ({w}x{h})")
            continue
        x0, y0, x1, y1 = ink_bbox(text, slug)
        iw, ih = x1 - x0, y1 - y0
        if max(iw, ih) > w + 0.01:
            errs.append(f"{slug}: ink overflows viewBox")
        fracs[slug] = (iw * ih) / (w * h)
        dx = abs((x0 - x) - ((x + w) - x1)) / w
        dy = abs((y0 - y) - ((y + h) - y1)) / h
        if dx > CENTER_TOL or dy > CENTER_TOL:
            errs.append(f"{slug}: ink off-center dx={dx:.3f} dy={dy:.3f}")
    if fracs:
        spread = max(fracs.values()) - min(fracs.values())
        if spread > FRACTION_TOL:
            detail = ", ".join(f"{s}={v:.3f}" for s, v in sorted(fracs.items()))
            errs.append(f"footprint spread {spread:.3f} > {FRACTION_TOL}: {detail}")
    return errs


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("command", choices=["list", "apply", "check"])
    ap.add_argument("--group", help="restrict to one group name")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    groups, skipped = build_groups()
    if args.group:
        if args.group not in groups:
            raise SystemExit(f"unknown group {args.group!r}; have: {', '.join(groups)}")
        groups = {args.group: groups[args.group]}

    if args.command == "list":
        for name, slugs in groups.items():
            print(f"{name} ({len(slugs)})")
            for s in slugs:
                print(f"  {s}")
        if skipped:
            print(f"\nreferenced logo_* slugs with no marks/ SVG (org/root or stale): "
                  f"{', '.join(sorted(skipped))}")
        return

    if args.command == "apply":
        for name, slugs in groups.items():
            apply_group(name, slugs, args.dry_run)
        if args.dry_run:
            print("\n(dry run — nothing written)")
        return

    failures = 0
    for name, slugs in groups.items():
        errs = check_group(name, slugs)
        status = "FAIL" if errs else "PASS"
        print(f"[{name}] {status} ({len(slugs)} marks)")
        for e in errs:
            print(f"  - {e}")
        failures += len(errs)
    sys.exit(1 if failures else 0)


if __name__ == "__main__":
    main()
