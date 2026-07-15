# SVG bbox methods - comparison

Use this reference when choosing how to measure artwork bounds for logo crops.

## Method ranking (best - worst)

| Rank | Method                            | Accuracy                                            | Use when                           |
| ---- | --------------------------------- | --------------------------------------------------- | ---------------------------------- |
| 1    | **Visible-ink raster scan**       | Matches human perception                            | All portfolio logo crops (default) |
| 2    | Relative path walk + arc sampling | Good for solid fills; may over-estimate hollow arcs | Playwright unavailable             |
| 3    | Naive token pairing on path `d`   | **Unsafe** - never use for crop                     | Never                              |

## Failure mode: naive arc parsing

Illustrator exports relative elliptical arcs:

```text
... H216.78 a78.44,78.44,0,1,0,-126.1,62.35 ...
```

A naive parser reads `-126.1` and `62.35` as absolute `(x,y)`, producing:

- `min_x ≈ -126` (phantom left extent)
- Wrong `translate()` and clipped or padded crops

The correct endpoint is `(216.78 - 126.1, y + 62.35)` - relative to the current pen position.

## Failure mode: arc sampling without visible ink

Proper arc sampling includes the full sweep of an elliptical arc - including regions
that are **geometrically on the path but not filled** (hollow ring segments, interior
of a thick stroke path that uses even-odd fill).

PERSIST-SEQ emblem (`cls-3`): path bbox `max_y ≈ 336`, visible ink `max_y ≈ 239`.
Using path bbox alone left **~96 px empty bottom border**.

## Visible-ink scan algorithm

1. Parse `viewBox` from source SVG - `(0, 0, width, height)` or explicit origin
2. Render SVG in headless Chromium at exactly `width × height` CSS pixels
3. Read canvas `ImageData` alpha channel
4. Find min/max `(x,y)` where `alpha > 0`
5. Map pixel bounds back to SVG user units (1:1 when render size = viewBox size)
6. Set new root `viewBox="{minX} {minY} {maxX-minX} {maxY-minY}"`

## Relative path commands to handle

At minimum when implementing Method 2:

| Command   | Relative form                                     |
| --------- | ------------------------------------------------- |
| Move/line | `m`, `l`, `h`, `v`                                |
| Curves    | `c`, `q`, `s`, `t`                                |
| Arcs      | `a` (7 params; last two are Δx, Δy when relative) |
| Close     | `z`                                               |

Absolute commands (`M`, `L`, `H`, `V`, `C`, `Q`, `A`) appear in many Illustrator exports
after the initial `M`.

## Post-crop margin targets

| Edge                     | Target                        |
| ------------------------ | ----------------------------- |
| top, bottom, left, right | ≤ 1 px at native render scale |

If margins exceed 1 px after visible-ink crop, check for semi-transparent anti-aliasing
fringe (acceptable) vs incorrect render scale (bug).
