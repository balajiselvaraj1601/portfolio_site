# Capture procedure — build → preview → capture → diff

End-to-end flow for producing and checking baseline screenshots. Every value here
is owned by a file (cited inline); this doc only sequences the steps.

## 1. Build + start preview

```bash
npm run preview:restart
```

`preview:restart` (→ `scripts/preview-restart.mjs`, per `package.json`) stops any
running preview, runs a fresh `npm run build`, then serves `dist/` on the preview
port. Preview **requires** a prior build — that is exactly why `preview:restart`
bundles the build (`AGENTS.md` hard rules: "Preview requires a prior `npm run
build`; dev does not").

Port comes from `scripts/ports.mjs` (`PREVIEW_PORT`, currently 4331) via
`astro.config.mjs` with `strictPort: true`. Do not pass `--port`/`--host`.

Verify it is up before capturing (`AGENTS.md` §"Verify servers"):

```bash
curl -sf -o /dev/null -w 'preview:%{http_code}\n' http://127.0.0.1:4331/
```

Expect `preview:200`. In sandboxed runs the build/preview may need
`dangerouslyDisableSandbox` — see the repo memory on page-team sandboxing.

## 2. Capture

```bash
npm run screenshots:baseline
```

→ `scripts/baseline-shots.mjs`. It:

- reads the base URL from `PREVIEW_URL` env, defaulting to
  `http://127.0.0.1:${PREVIEW_PORT}` (`scripts/ports.mjs`);
- launches headless Chromium at a 1440×900 viewport;
- for each entry in the `SHOTS` list: navigates to the section's hash, scrolls the
  selector into view, waits the scroll-settle interval, forces/awaits reveal, and
  screenshots just that element;
- logs `wrote <path>` per shot, and on failure prints
  `Failed — is the preview server running at <BASE>?` (the #1 real cause).

To point at a non-default server, set `PREVIEW_URL` rather than editing the script.

## 3. Where output lands

`docs/reference/screenshots/` (the script's `OUT_DIR`). Filenames come from each
`SHOTS[].file` — e.g. `thirukural.png`, `publications.png`, `awards.png`,
`vision-programs.png`, `vision-impact.png`. These are the same committed baselines.

## 4. Diff against the committed baselines

Because the capture overwrites the committed files in place, git _is_ the diff:

```bash
git status --short docs/reference/screenshots/
git diff --stat docs/reference/screenshots/
```

- **No changes** → your change did not alter those sections' rendering.
- **Changed files** → open the modified PNGs and compare visually; if the change is
  intended, commit them as the new baseline, otherwise investigate.

For a lighter functional check of dev (not a visual diff), `AGENTS.md` points to
`npm run smoke:localhost` (→ `.cursor/scripts/smoke-localhost.mjs`).

## Adding or changing a shot

Edit the `SHOTS` array in `scripts/baseline-shots.mjs` — never fork a one-off
Playwright script. Each entry needs `file`, `hash`, `selector`, and optionally
`revealAll: true` for sections whose content is behind `.reveal` animations (see
`reveal-and-scroll-gotchas.md`).
