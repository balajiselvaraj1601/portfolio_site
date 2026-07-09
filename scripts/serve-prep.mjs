#!/usr/bin/env node
/**
 * serve-prep.mjs — stop stale Astro listeners, production build, print serve steps.
 *
 * Usage: npm run serve
 *
 * After this script completes, start both servers in separate terminals:
 *   Terminal 1: npm run dev:restart
 *   Terminal 2: npm run preview:restart  (or npm run preview — dist already built)
 */
import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stopAstroServers } from './dev-stop.mjs';
import { DEV_PORT, PREVIEW_PORT } from './ports.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

console.log('Stopping stale Astro listeners on ports 4300–4399…');
await stopAstroServers();

console.log('\nRunning production build…');
const build = spawnSync('npm', ['run', 'build'], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

console.log(`
✓ Build complete. Start both servers in separate terminals:

  Terminal 1 (dev, HMR):
    npm run dev:restart
    → http://localhost:${DEV_PORT}/

  Terminal 2 (preview, built dist/):
    npm run preview
    → http://localhost:${PREVIEW_PORT}/
    (or npm run preview:restart to rebuild before serving)

  Stop both later:
    npm run dev:stop
`);
