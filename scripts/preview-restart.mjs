#!/usr/bin/env node
/**
 * preview-restart.mjs — stop preview listeners, rebuild, and serve dist/ on 4331.
 *
 * Usage: npm run preview:restart
 */
import { spawn, spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stopPreviewServer } from './dev-stop.mjs';
import { PREVIEW_PORT } from './ports.mjs';

await stopPreviewServer();

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const build = spawnSync('npm', ['run', 'build'], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});

if (build.status !== 0) {
  process.exit(build.status ?? 1);
}

const astroBin = resolve(root, 'node_modules/.bin/astro');

const child = spawn(astroBin, ['preview'], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});

console.log(`Starting Astro preview on http://localhost:${PREVIEW_PORT}/`);
