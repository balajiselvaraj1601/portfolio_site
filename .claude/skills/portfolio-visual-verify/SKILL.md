---
name: portfolio-visual-verify
description: >-
  Render, capture, and diff the Astro portfolio reliably - handling the
  reveal-animation and scroll-settle gotchas that otherwise produce blank or
  half-drawn screenshots. Use for "screenshot the site", "visual check",
  "baseline shots", "did my change render", "visual regression", or "capture a
  section". Covers the preview-server prerequisite, the `.reveal` / `is-visible`
  force step, the Vision dual-reveal case, and diffing against the committed
  baselines. Do NOT use for design decisions or cross-view conflicts (that is
  page-consistency-team), or for the correctness of the content values being
  shown (that is portfolio-content-authoring).
---

# Portfolio visual verify Skill

How to render the site and capture stable, non-blank screenshots - then diff them
against the committed reference set. The capture procedure, shot list, and timing
constants all live in scripts; this skill tells you how to drive them and which
traps they exist to avoid. It carries **no** port numbers or timing values of its
own - every value below is cited to the file that owns it.

**Repo:** `/home/engineer/workspace/portfolio_site`

## Authorities (SSOT - do not duplicate their values)

| Source                                               | Owns                                                                              |
| ---------------------------------------------------- | --------------------------------------------------------------------------------- |
| `scripts/baseline-shots.mjs`                         | The capture procedure, the `SHOTS` list, and the reveal/settle helpers            |
| `scripts/ports.mjs`                                  | The preview/dev port values (`PREVIEW_PORT`, `DEV_PORT`)                          |
| `src/scripts/section-views.ts`                       | `PROGRAMMATIC_SCROLL_SETTLE_MS` - the scroll-settle constant the capture mirrors  |
| `docs/troubleshooting.md` §"Local servers and ports" | Port map, stop/restart semantics, and the `--port`/`--host` anti-patterns         |
| `docs/reference/screenshots/`                        | The committed baseline images the capture writes to and you diff against          |
| `package.json` scripts                               | Exact command names: `preview:restart`, `screenshots:baseline`, `smoke:localhost` |

Never restate a port number or a timing constant as if this skill owned it. Cite
the file. Values mentioned below (e.g. 4331, 1400 ms) are for orientation only -
the script is authoritative.

## Core rule

> A screenshot is only trustworthy when **two** preconditions hold: a **preview
> build is already serving** the site, and the target section's `.reveal`
> elements have been forced visible (or waited out). Capture without a running
> preview and you shoot a connection error; capture before the reveal animation
> resolves and you shoot invisible content. `scripts/baseline-shots.mjs` encodes
> both preconditions - run it, don't reinvent it.

## What to do (the short path)

1. **Start preview first.** `npm run preview:restart` - this stops preview, runs a
   fresh `npm run build`, then serves `dist/` on the preview port
   (`scripts/ports.mjs` - `PREVIEW_PORT`, currently 4331). Preview **requires** a
   prior build; dev does not (`AGENTS.md` hard rules).
2. **Capture.** `npm run screenshots:baseline` (- `scripts/baseline-shots.mjs`).
   It launches headless Chromium, walks the `SHOTS` list, and writes PNGs into
   `docs/reference/screenshots/`.
3. **Diff.** Compare the freshly written files against the committed baselines with
   `git diff`/`git status` on `docs/reference/screenshots/`. See
   [references/capture-procedure.md](references/capture-procedure.md).

## The gotchas the script handles for you

- **Preview must exist first - never pass flags to astro.** `AGENTS.md` forbids
  `--port` / `--host` on `astro dev`/`astro preview`; the ports come from
  `scripts/ports.mjs` via `astro.config.mjs` with `strictPort: true`. Use the npm
  scripts only. Details: [references/preview-server-setup.md](references/preview-server-setup.md).
- **`.reveal` sections start hidden.** They only become visible when they gain the
  `is-visible` class on scroll. The capture forces this (`forceReveals` adds
  `is-visible` to every `.reveal` under a root) or waits the scroll-settle interval
  (`waitForScrollSettle`, mirroring `PROGRAMMATIC_SCROLL_SETTLE_MS` from
  `src/scripts/section-views.ts`). Skip this and you screenshot invisible content.
- **The Vision section needs a full force.** `#vision-programs` (which since
  2026-07-06 also contains the impact grid - there is no separate `#vision-impact`
  section) carries `revealAll` in `SHOTS`; `prepareVisionSection` scrolls it into
  view and calls `forceReveals` on the whole root. Full
  explanation: [references/reveal-and-scroll-gotchas.md](references/reveal-and-scroll-gotchas.md).
- **`screenshots:baseline` is the one capture entry point.** It writes to
  `docs/reference/screenshots/`. Don't hand-roll a Playwright script - extend
  `SHOTS` instead.

## When to load references

| If the task involves...                                             | Load                                      |
| ----------------------------------------------------------------- | ----------------------------------------- |
| Running the full build - preview - capture - diff flow            | `references/capture-procedure.md`         |
| A blank/half-drawn shot, reveal timing, or the Vision dual-reveal | `references/reveal-and-scroll-gotchas.md` |
| Server not up, wrong port, `--port`/`--host` mistakes             | `references/preview-server-setup.md`      |
