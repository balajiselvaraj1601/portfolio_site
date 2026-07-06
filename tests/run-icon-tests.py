#!/usr/bin/env python3
"""
run-icon-tests.py — golden-regression harness for the SVG icon pipeline.

No pytest, no dependency beyond what the generator already needs. Run it:

    python3 tests/run-icon-tests.py                # verify against committed goldens
    python3 tests/run-icon-tests.py --update-goldens   # regenerate goldens on purpose

Three layers:
  1. GOLDEN BYTE-DIFF — regenerate each fixture with its mask mode's flags and
     assert the optimized SVG is byte-identical to the committed golden. This
     locks all four mask modes (light/nonwhite/alpha) + tight framing + auto-crop.
  2. SEMANTIC — run verify-icon.py on the goldens; assert it exits 0 (flush).
  3. GUARD — assert the pipeline raises on the mode/source mismatches and bad
     config that used to fail silently or deep in the pipeline.

Goldens are tied to the installed potrace/svgo versions. If those change, the
byte-diff will fail by design — re-run with --update-goldens to adopt the new
output deliberately, and eyeball the rendered result before committing.
"""

import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GENERATOR = ROOT / "scripts" / "icons" / "svg-icon-generator.py"
VERIFY = ROOT / "scripts" / "icons" / "verify-icon.py"
FIXTURES = Path(__file__).resolve().parent / "fixtures"

# One representative source per mask mode. Each dir holds exactly one icon_*.png
# source and its committed <name>-icon-512.svg golden. Flags mirror how
# batch-icon-generate.sh drives that archetype.
MODE_FLAGS = {
    "light": [],                              # icon_box: white glyph on a solid circle
    "nonwhite": ["--colored-glyph", "--no-circle"],   # icon_multimodal
    "alpha": ["--alpha-glyph", "--no-circle"],        # icon_kaggle
}
BASE_FLAGS = ["--sizes", "512", "--no-badge", "--tight", "--turdsize", "2"]

PASS, FAIL = "✓", "✗"
failures = []


def _source_and_golden(mode_dir):
    src = next(mode_dir.glob("icon_*.png"))
    golden = next(mode_dir.glob("*-icon-512.svg"))
    name = golden.name[: -len("-icon-512.svg")]
    return src, golden, name


def _generate(src, name, flags, outdir):
    cmd = ["python3", str(GENERATOR), "--source", str(src), "--name", name,
           "--output", str(outdir), *BASE_FLAGS, *flags]
    return subprocess.run(cmd, capture_output=True, text=True)


def golden_tests(update):
    for mode, flags in MODE_FLAGS.items():
        mode_dir = FIXTURES / mode
        if not mode_dir.is_dir():
            failures.append(f"{mode}: fixture dir missing ({mode_dir})")
            print(f"  {FAIL} {mode}: no fixture dir")
            continue
        src, golden, name = _source_and_golden(mode_dir)
        with tempfile.TemporaryDirectory() as tmp:
            r = _generate(src, name, flags, tmp)
            if r.returncode != 0:
                failures.append(f"{mode}: generator failed\n{r.stderr[-400:]}")
                print(f"  {FAIL} {mode}: generator exited {r.returncode}")
                continue
            produced = Path(tmp) / f"{name}-icon-512.svg"
            if update:
                golden.write_bytes(produced.read_bytes())
                print(f"  {PASS} {mode}: golden updated ({name})")
                continue
            if produced.read_bytes() == golden.read_bytes():
                print(f"  {PASS} {mode}: byte-identical ({name})")
            else:
                failures.append(f"{mode}: output differs from golden ({name})")
                print(f"  {FAIL} {mode}: DIFFERS from golden ({name})")


def semantic_tests():
    goldens = [next((FIXTURES / m).glob("*-icon-512.svg")) for m in MODE_FLAGS]
    r = subprocess.run(["python3", str(VERIFY), *map(str, goldens)],
                       capture_output=True, text=True)
    if r.returncode == 0:
        print(f"  {PASS} verify-icon: all goldens flush/centered")
    else:
        failures.append(f"verify-icon exited {r.returncode}\n{r.stdout}")
        print(f"  {FAIL} verify-icon reported issues")


def _expect_fail(label, src, flags):
    with tempfile.TemporaryDirectory() as tmp:
        r = _generate(src, "guard", flags, tmp)
    if r.returncode != 0:
        print(f"  {PASS} {label} (rejected as expected)")
    else:
        failures.append(f"{label}: expected non-zero exit, got 0")
        print(f"  {FAIL} {label}: was accepted but should have failed")


def guard_tests():
    opaque = next((FIXTURES / "edge").glob("opaque_*.png"), None)
    if opaque:
        _expect_fail("--alpha-glyph on opaque source", opaque,
                     ["--sizes", "512", "--no-badge", "--tight", "--alpha-glyph", "--no-circle"])
    else:
        failures.append("edge/opaque_*.png fixture missing")
        print(f"  {FAIL} edge fixture missing")
    any_src = next((FIXTURES / "light").glob("icon_*.png"))
    # out-of-range threshold → _validate_config range check
    _expect_fail("out-of-range --alpha-threshold (999)", any_src,
                 ["--sizes", "512", "--no-badge", "--alpha-threshold", "999", "--alpha-glyph", "--no-circle"])
    # illegal foreground_mode via config → _validate_config enum check
    with tempfile.TemporaryDirectory() as tmp:
        cfg = Path(tmp) / "bad.json"
        cfg.write_text('{"foreground_mode": "bogus", "sizes": [512]}')
        _expect_fail("illegal foreground_mode (config)", any_src,
                     ["--no-badge", "--tight", "--config", str(cfg)])


def main():
    update = "--update-goldens" in sys.argv[1:]
    print("== Golden byte-diff ==")
    golden_tests(update)
    if not update:
        print("== Semantic (verify-icon) ==")
        semantic_tests()
        print("== Guard / validation ==")
        guard_tests()

    print()
    if failures:
        print(f"{FAIL} {len(failures)} failure(s):")
        for f in failures:
            print(f"  - {f}")
        return 1
    print(f"{PASS} all checks passed")
    return 0


if __name__ == "__main__":
    sys.exit(main())
