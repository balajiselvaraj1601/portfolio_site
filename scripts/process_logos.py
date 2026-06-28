#!/usr/bin/env python3
"""
process_logos.py — Normalize and trim logo images in logos/.

Detects mislabeled formats (SVG/WebP/AVIF saved as .png), rasterizes SVG via
Playwright (image_gen/scripts/render.py), trims unnecessary white borders, and
writes valid PNG files.

Trimming notes (from logo analysis):
  - Bounding boxes must use Pillow's exclusive-right/bottom getbbox semantics.
  - Diff for bbox detection must use RGB/luminance, not RGBA (alpha stays 0).
  - A tolerance (~10/255) removes near-white anti-aliased margins (e.g. logo_aacr).
  - Transparent pixels are composited onto white before measuring borders.

Setup:
    pip install -r scripts/requirements-logos.txt
    python -m playwright install chromium   # if not already installed for image_gen

Usage:
    python scripts/process_logos.py              # dry-run analyze
    python scripts/process_logos.py --apply      # backup + write
"""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
import tempfile
from dataclasses import asdict, dataclass, field
from pathlib import Path
from typing import Literal

from PIL import Image, ImageChops

PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"
SNIFF_BYTES = 32
BACKUP_DIR_NAME = "_originals"
DEFAULT_TOLERANCE = 10
DEFAULT_PADDING = 0
DEFAULT_MIN_MARGIN = 2
DEFAULT_MIN_TRIM_PCT = 1.0
DEFAULT_SVG_SCALE = 2

Action = Literal[
    "skip",
    "reencode",
    "convert",
    "trim",
    "convert+trim",
    "error",
]


@dataclass(frozen=True)
class TrimConfig:
    tolerance: int = DEFAULT_TOLERANCE
    padding: int = DEFAULT_PADDING
    min_margin: int = DEFAULT_MIN_MARGIN
    min_trim_pct: float = DEFAULT_MIN_TRIM_PCT


@dataclass(frozen=True)
class ProcessConfig:
    logos_dir: Path
    trim: TrimConfig = field(default_factory=TrimConfig)
    svg_scale: int = DEFAULT_SVG_SCALE
    render_script: Path | None = None


@dataclass
class ProcessResult:
    output: Image.Image
    source_format: str
    source_pil_format: str | None
    source_size: tuple[int, int]
    did_trim: bool
    trim_pct: float | None = None
    margins: dict[str, int] | None = None
    notes: list[str] = field(default_factory=list)


@dataclass
class FileReport:
    file: str
    detected_format: str
    ext_matches_format: bool
    size_bytes: int
    width: int | None = None
    height: int | None = None
    pil_format: str | None = None
    mislabeled: bool = False
    margins: dict[str, int] | None = None
    trim_pct: float | None = None
    new_size: tuple[int, int] | None = None
    action: Action = "skip"
    error: str | None = None
    notes: list[str] = field(default_factory=list)


def repo_root() -> Path:
    return Path(__file__).resolve().parent.parent


def detect_format(data: bytes) -> str:
    """Identify container format from magic bytes (extension-agnostic)."""
    if len(data) < 4:
        return "unknown"
    if data[:8] == PNG_SIGNATURE:
        return "png"
    if data[:3] == b"GIF":
        return "gif"
    if data[:2] == b"\xff\xd8":
        return "jpeg"
    if data[:4] == b"RIFF" and len(data) > 12 and data[8:12] == b"WEBP":
        return "webp"
    if len(data) >= 12 and data[4:8] == b"ftyp":
        if b"avif" in data[8:16]:
            return "avif"
        return "iso_bmff"
    stripped = data.lstrip()
    if stripped[:5] == b"<?xml" or stripped[:4] == b"<svg":
        return "svg"
    if data[:2] == b"BM":
        return "bmp"
    return "unknown"


def sniff_file_format(path: Path) -> str:
    with path.open("rb") as handle:
        return detect_format(handle.read(SNIFF_BYTES))


def find_render_script(explicit: Path | None) -> Path | None:
    if explicit and explicit.is_file():
        return explicit.resolve()
    for candidate in (
        repo_root().parent / "image_gen" / "scripts" / "render.py",
        repo_root() / "image_gen" / "scripts" / "render.py",
    ):
        if candidate.is_file():
            return candidate.resolve()
    return None


def find_render_python() -> str:
    venv_python = repo_root().parent / "image_gen" / ".venv" / "bin" / "python"
    if venv_python.is_file():
        return str(venv_python)
    return sys.executable


def render_svg_to_png(
    svg_path: Path,
    output_path: Path,
    render_script: Path,
    scale: int,
) -> None:
    cmd = [
        find_render_python(),
        str(render_script),
        str(svg_path),
        "--format",
        "png",
        "--scale",
        str(scale),
        "--background",
        "transparent",
        "--output",
        str(output_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if result.returncode != 0:
        detail = result.stderr.strip() or result.stdout.strip() or "unknown error"
        raise RuntimeError(f"render.py failed ({result.returncode}): {detail}")
    with output_path.open("rb") as handle:
        if handle.read(8) != PNG_SIGNATURE:
            raise RuntimeError(f"render.py did not produce a valid PNG: {output_path}")


def content_bbox(
    img: Image.Image,
    tolerance: int,
    background: tuple[int, int, int] = (255, 255, 255),
) -> tuple[int, int, int, int] | None:
    """
    Return exclusive crop box for non-background pixels.

    Pillow getbbox uses (left, top, right, bottom) with right/bottom exclusive.
    Use luminance of RGB diff — RGBA diff alpha is always zero and breaks getbbox.
    """
    rgba = img.convert("RGBA")
    bg_rgba = Image.new("RGBA", rgba.size, (*background, 255))
    flat = Image.alpha_composite(bg_rgba, rgba).convert("RGB")
    diff = ImageChops.difference(flat, Image.new("RGB", rgba.size, background))
    luminance = ImageChops.lighter(
        ImageChops.lighter(diff.getchannel("R"), diff.getchannel("G")),
        diff.getchannel("B"),
    )
    if tolerance > 0:
        luminance = luminance.point(lambda value: 0 if value <= tolerance else 255)
    return luminance.getbbox()


def clamp_bbox_exclusive(
    bbox: tuple[int, int, int, int],
    width: int,
    height: int,
) -> tuple[int, int, int, int]:
    left, top, right, bottom = bbox
    left = max(0, min(left, width))
    top = max(0, min(top, height))
    right = max(left, min(right, width))
    bottom = max(top, min(bottom, height))
    return left, top, right, bottom


def bbox_margins_exclusive(
    bbox: tuple[int, int, int, int],
    width: int,
    height: int,
) -> dict[str, int]:
    left, top, right, bottom = bbox
    return {
        "top": top,
        "left": left,
        "right": width - right,
        "bottom": height - bottom,
    }


def trim_decision(
    bbox: tuple[int, int, int, int],
    size: tuple[int, int],
    cfg: TrimConfig,
) -> tuple[bool, float, dict[str, int]]:
    width, height = size
    clamped = clamp_bbox_exclusive(bbox, width, height)
    margins = bbox_margins_exclusive(clamped, width, height)
    left, top, right, bottom = clamped
    new_w = right - left
    new_h = bottom - top

    if new_w <= 0 or new_h <= 0:
        return False, 0.0, margins

    trim_pct = round(100 * (1 - (new_w * new_h) / (width * height)), 1)
    if new_w >= width and new_h >= height:
        return False, trim_pct, margins
    if max(margins.values()) < cfg.min_margin:
        return False, trim_pct, margins
    if trim_pct < cfg.min_trim_pct:
        return False, trim_pct, margins
    return True, trim_pct, margins


def apply_trim(img: Image.Image, cfg: TrimConfig) -> tuple[Image.Image, bool, float | None, dict[str, int] | None]:
    bbox = content_bbox(img, cfg.tolerance)
    if bbox is None:
        empty = {"top": 0, "left": 0, "right": 0, "bottom": 0}
        return img, False, 0.0, empty

    should_crop, trim_pct, margins = trim_decision(bbox, img.size, cfg)
    if not should_crop:
        return img, False, trim_pct, margins

    left, top, right, bottom = clamp_bbox_exclusive(bbox, *img.size)
    if cfg.padding > 0:
        width, height = img.size
        left = max(0, left - cfg.padding)
        top = max(0, top - cfg.padding)
        right = min(width, right + cfg.padding)
        bottom = min(height, bottom + cfg.padding)

    return img.crop((left, top, right, bottom)), True, trim_pct, margins


def load_raster(
    path: Path,
    render_script: Path | None,
    svg_scale: int,
) -> tuple[Image.Image, str, str | None, list[str]]:
    data = path.read_bytes()
    fmt = detect_format(data[:SNIFF_BYTES])
    notes: list[str] = []

    if fmt == "svg":
        if render_script is None:
            raise RuntimeError("SVG content requires image_gen/scripts/render.py")
        with tempfile.TemporaryDirectory(prefix="logo_render_") as tmp:
            tmp_dir = Path(tmp)
            svg_path = path if path.suffix.lower() == ".svg" else tmp_dir / f"{path.stem}.svg"
            if svg_path != path:
                svg_path.write_bytes(data)
                notes.append("wrote temp .svg for mislabeled file")
            png_path = tmp_dir / f"{path.stem}.png"
            render_svg_to_png(svg_path, png_path, render_script, svg_scale)
            with Image.open(png_path) as rendered:
                rendered.load()
                notes.append(f"rasterized SVG at scale {svg_scale}")
                return rendered.copy(), "svg", "PNG", notes

    with Image.open(path) as opened:
        opened.load()
        return opened.copy(), fmt, opened.format, notes


def needs_format_conversion(source_format: str, pil_format: str | None) -> bool:
    if source_format != "png":
        return True
    return bool(pil_format and pil_format.upper() != "PNG")


def determine_action(source_format: str, pil_format: str | None, did_trim: bool) -> Action:
    convert = needs_format_conversion(source_format, pil_format)
    if convert and did_trim:
        return "convert+trim"
    if convert:
        return "convert"
    if did_trim:
        return "trim"
    return "reencode"


def save_png_atomic(img: Image.Image, path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(
        suffix=".png",
        dir=path.parent,
        delete=False,
    ) as tmp:
        tmp_path = Path(tmp.name)
    try:
        img.convert("RGBA").save(tmp_path, format="PNG", optimize=True)
        with tmp_path.open("rb") as handle:
            if handle.read(8) != PNG_SIGNATURE:
                raise RuntimeError(f"encoder did not produce a valid PNG: {path}")
        tmp_path.replace(path)
    except Exception:
        tmp_path.unlink(missing_ok=True)
        raise


def process_image(path: Path, config: ProcessConfig) -> ProcessResult:
    img, source_format, pil_format, notes = load_raster(
        path,
        config.render_script,
        config.svg_scale,
    )
    try:
        source_size = img.size
        trimmed, did_trim, trim_pct, margins = apply_trim(img, config.trim)
        if did_trim and trimmed is not img:
            img.close()
            img = trimmed
        return ProcessResult(
            output=img,
            source_format=source_format,
            source_pil_format=pil_format,
            source_size=source_size,
            did_trim=did_trim,
            trim_pct=trim_pct,
            margins=margins,
            notes=notes,
        )
    except Exception:
        img.close()
        raise


def initial_report(path: Path) -> FileReport:
    detected = sniff_file_format(path)
    ext = path.suffix.lower()
    ext_matches = (detected == "png" and ext == ".png") or (detected == "svg" and ext == ".svg")
    return FileReport(
        file=path.name,
        detected_format=detected,
        ext_matches_format=ext_matches,
        size_bytes=path.stat().st_size,
        mislabeled=ext == ".png" and detected != "png",
    )


def handle_png_target(path: Path, config: ProcessConfig, apply: bool) -> FileReport:
    report = initial_report(path)
    try:
        result = process_image(path, config)
    except Exception as exc:
        report.error = str(exc)
        report.action = "error"
        return report

    try:
        report.notes.extend(result.notes)
        report.width, report.height = result.source_size
        report.pil_format = result.source_pil_format
        report.mislabeled = needs_format_conversion(result.source_format, result.source_pil_format)
        report.trim_pct = result.trim_pct
        report.margins = result.margins
        report.new_size = result.output.size
        report.action = determine_action(
            result.source_format,
            result.source_pil_format,
            result.did_trim,
        )

        if apply:
            save_png_atomic(result.output, path)
            report.detected_format = "png"
            report.ext_matches_format = True
            report.mislabeled = False
            report.pil_format = "PNG"
            report.size_bytes = path.stat().st_size
    finally:
        result.output.close()

    return report


def handle_file(path: Path, config: ProcessConfig, apply: bool) -> FileReport:
    ext = path.suffix.lower()
    if ext == ".svg":
        report = initial_report(path)
        report.action = "skip"
        report.notes.append("valid SVG sidecar — left unchanged")
        return report
    if ext != ".png":
        report = initial_report(path)
        report.action = "skip"
        report.notes.append(f"unsupported extension {ext}")
        return report
    return handle_png_target(path, config, apply)


def iter_logo_files(logos_dir: Path) -> list[Path]:
    return sorted(
        path
        for path in logos_dir.iterdir()
        if path.is_file() and not path.name.startswith(".")
    )


def backup_all(logos_dir: Path) -> None:
    backup_dir = logos_dir / BACKUP_DIR_NAME
    for path in iter_logo_files(logos_dir):
        backup_dir.mkdir(parents=True, exist_ok=True)
        dest = backup_dir / path.name
        if not dest.exists():
            shutil.copy2(path, dest)


def print_text_report(reports: list[FileReport]) -> None:
    print(f"{'File':<24} {'Format':<8} {'Size':<14} {'Action':<14} {'Trim%':<7} Notes")
    print("-" * 90)
    for report in reports:
        size = f"{report.width}x{report.height}" if report.width and report.height else "-"
        if report.new_size and report.new_size != (report.width, report.height):
            size = f"{size} -> {report.new_size[0]}x{report.new_size[1]}"
        trim = f"{report.trim_pct:.1f}" if report.trim_pct is not None else "-"
        notes = "; ".join(report.notes)
        if report.error:
            notes = f"ERROR: {report.error}"
        mislabeled = " mislabeled" if report.mislabeled else ""
        print(
            f"{report.file:<24} {report.detected_format:<8} {size:<14} "
            f"{report.action:<14} {trim:<7}{mislabeled} {notes}"
        )


def summarize(reports: list[FileReport]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for report in reports:
        counts[report.action] = counts.get(report.action, 0) + 1
    return counts


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Normalize and trim logo PNGs in logos/.")
    parser.add_argument(
        "--logos-dir",
        type=Path,
        default=repo_root() / "logos",
        help="Directory containing logo files (default: logos/)",
    )
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Backup originals and write processed PNGs (default: dry-run analyze)",
    )
    parser.add_argument("--tolerance", type=int, default=DEFAULT_TOLERANCE)
    parser.add_argument("--padding", type=int, default=DEFAULT_PADDING)
    parser.add_argument("--min-margin", type=int, default=DEFAULT_MIN_MARGIN)
    parser.add_argument("--min-trim-pct", type=float, default=DEFAULT_MIN_TRIM_PCT)
    parser.add_argument("--svg-scale", type=int, default=DEFAULT_SVG_SCALE)
    parser.add_argument(
        "--render-script",
        type=Path,
        default=None,
        help="Path to image_gen/scripts/render.py (auto-detected by default)",
    )
    parser.add_argument("--json", action="store_true", help="Emit JSON report")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    logos_dir = args.logos_dir.resolve()
    if not logos_dir.is_dir():
        print(f"error: logos directory not found: {logos_dir}", file=sys.stderr)
        return 1

    render_script = find_render_script(args.render_script)
    if render_script is None:
        print(
            "warning: image_gen/scripts/render.py not found — SVG files will fail",
            file=sys.stderr,
        )

    config = ProcessConfig(
        logos_dir=logos_dir,
        trim=TrimConfig(
            tolerance=args.tolerance,
            padding=args.padding,
            min_margin=args.min_margin,
            min_trim_pct=args.min_trim_pct,
        ),
        svg_scale=args.svg_scale,
        render_script=render_script,
    )

    if args.apply:
        backup_all(logos_dir)

    reports = [handle_file(path, config, apply=args.apply) for path in iter_logo_files(logos_dir)]

    if args.json:
        print(json.dumps([asdict(report) for report in reports], indent=2))
    else:
        mode = "APPLY" if args.apply else "ANALYZE (dry-run)"
        print(f"Logo processing report — {mode}")
        print(f"Directory: {logos_dir}")
        if render_script:
            print(f"Render script: {render_script}")
        print()
        print_text_report(reports)
        print()
        print("Summary:", ", ".join(f"{key}={value}" for key, value in sorted(summarize(reports).items())))

    return 1 if any(report.action == "error" for report in reports) else 0


if __name__ == "__main__":
    raise SystemExit(main())
