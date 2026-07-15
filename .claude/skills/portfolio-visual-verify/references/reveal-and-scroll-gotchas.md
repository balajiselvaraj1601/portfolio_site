# Reveal / is-visible and scroll-settle gotchas

Why a "capture the section" that looks correct can produce a blank or half-drawn
image, and how `scripts/baseline-shots.mjs` defends against it. All mechanics are
owned by that script and by `src/scripts/section-views.ts`.

## Trap 1 - `.reveal` sections start hidden

Sections animate in: a `.reveal` element is invisible until it gains the
`is-visible` class. If you screenshot before that class is applied, you capture
transparent/empty content even though the element exists in the DOM.

`baseline-shots.mjs` guards this two ways:

- **`waitForReveal(page, selector)`** - polls until the element either has the
  `is-visible` class **or** computed `opacity > 0.5`, up to a 15 s timeout.
- **`forceReveals(page, rootSelector)`** - the deterministic hammer: selects every
  `.reveal` under a root and adds `is-visible` directly, so nothing depends on
  animation timing. Used for shots flagged `revealAll` in `SHOTS`.

If you extend `SHOTS` and the target lives behind a reveal animation, set
`revealAll: true` so `forceReveals` runs for it.

## Trap 2 - scroll must settle before capture

Navigation to a section hash triggers a programmatic smooth scroll. Shooting
mid-scroll captures the wrong offset or a section still animating.

- `src/scripts/section-views.ts` owns `PROGRAMMATIC_SCROLL_SETTLE_MS` (currently
  1200 ms) - the window during which scroll-spy is suppressed after a programmatic
  scroll.
- `baseline-shots.mjs` mirrors it as `SCROLL_SETTLE_MS` (currently 1400 ms) - the
  section-views value **plus a smooth-scroll buffer**, per the comment in the
  script. `waitForScrollSettle` waits this interval after each `scrollIntoViewIfNeeded`.

These two constants are intentionally kept in step: the capture waits at least as
long as the app suppresses scroll-spy. If the app constant changes, the capture
buffer should be revisited - but the app file is the SSOT; do not treat the
capture's number as the source.

## Trap 3 - the Vision section needs a full reveal force

`#vision-programs` (since the 2026-07-06 merge it also contains the impact grid;
there is no separate `#vision-impact` section) is the `SHOTS` entry handled by
`prepareVisionSection(page)`, which:

1. scrolls `#vision-programs` into view (`scrollIntoViewIfNeeded`);
2. waits the scroll-settle interval (`waitForScrollSettle`);
3. calls `forceReveals` on the whole `#vision-programs` root - the section is
   tall (flow + sub-heading + impact grid) and holds multiple `.reveal` blocks,
   so forcing only the block in the viewport still leaves later blocks
   un-revealed and bleeds a blank region into the frame;
4. waits a final 200 ms.

## The order the script uses per shot

For every `SHOTS` entry, `main()` runs: `loadPage` (goto + wait `#hero` +
`waitForReveal` + settle) - `waitForSelector` - `scrollIntoViewIfNeeded` -
`waitForScrollSettle` - `waitForReveal(selector)` - if `revealAll`,
`prepareVisionSection` - element `.screenshot()`. Reproduce this order if you ever
capture a section manually; skipping the settle or the reveal wait is what
produces blank shots.
