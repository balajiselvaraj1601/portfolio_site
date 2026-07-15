# Preview server setup and anti-patterns

The capture script talks to a running server; getting that server right is half the
job. All ports and semantics below are owned by `scripts/ports.mjs` and
`docs/troubleshooting.md` §"Local servers and ports" - cited, not redefined here.

## Port map (SSOT: `scripts/ports.mjs`)

| Mode                    | Port | npm script        | Owner constant |
| ----------------------- | ---- | ----------------- | -------------- |
| Dev (HMR)               | 4321 | `npm run dev`     | `DEV_PORT`     |
| Preview (built `dist/`) | 4331 | `npm run preview` | `PREVIEW_PORT` |

Ports flow `scripts/ports.mjs` - `astro.config.mjs` (`strictPort: true`) - the npm
scripts. Legacy port 4322 is cleared on stop but never served. **The capture uses
the preview server (4331)**, since screenshots should reflect the built `dist/`,
not HMR dev.

## Which restart to use

| Script                    | Scope                                | Use when                                           |
| ------------------------- | ------------------------------------ | -------------------------------------------------- |
| `npm run preview:restart` | 4331 + `astro preview` only          | **Visual verify** - stop preview - build - preview |
| `npm run dev:restart`     | 4321 + `astro dev` only              | Restart dev without touching preview               |
| `npm run dev:stop`        | All 4300-4399 + both astro processes | Nuclear cleanup of stale/orphan listeners          |

For screenshots, **`preview:restart` is the right call**: preview needs a prior
`npm run build`, and `preview:restart` bundles the build - serve on 4331. The
selective-stop scripts mean it won't kill a dev server you have running (`AGENTS.md`
stop/restart semantics).

## Verify the server before capturing

```bash
ss -tlnp | grep -E ':(4321|4331)\s'
curl -sf -o /dev/null -w 'preview:%{http_code}\n' http://127.0.0.1:4331/
```

Expect the preview port LISTENing and a `200`. If `curl` fails, fix the server
first - do not assume a port-forwarding problem. (`baseline-shots.mjs`'s own error
message, "is the preview server running at ...?", points at this.)

## Hard rules - anti-patterns (from `AGENTS.md`)

- **Never** pass `--port` / `--host` to `astro dev` or `astro preview`. Ports are
  owned by `scripts/ports.mjs`; use the npm scripts only.
- **Never** run `astro preview --port 4321` - it squats the dev port and leaves
  4331 empty; the symptom masquerades as "preview not running."
- **Never** start multiple `npm run dev` / `npm run preview` sessions without
  stopping first.
- **Preview requires a prior `npm run build`; dev does not.** This is why you must
  start preview _before_ running `screenshots:baseline`, and why `preview:restart`
  (which builds) is the safe entry point.

## Sandbox / remote notes

- Build and preview commands may fail under the command sandbox; rerun with
  `dangerouslyDisableSandbox: true` when you see "Operation not permitted" or
  connection failures (repo memory: page-team sandbox).
- On remote/Cursor hosts, servers bind `host: true`; `localhost:4331` in the user's
  browser only works if 4331 is forwarded. If remote `curl` passes but the browser
  fails, forward the port - don't touch the server.

## Pointing the capture elsewhere

`baseline-shots.mjs` reads `PREVIEW_URL` (env) and defaults to
`http://127.0.0.1:${PREVIEW_PORT}`. To capture against a different origin, set
`PREVIEW_URL` rather than editing the script or passing astro flags.
