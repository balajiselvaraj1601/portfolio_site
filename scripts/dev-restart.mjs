#!/usr/bin/env node
/**
 * dev-restart.mjs — stop stale Astro listeners and start a fresh dev server on 4321.
 *
 * Usage: npm run dev:restart
 */
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stopDevServer } from './dev-stop.mjs';
import { DEV_PORT } from './ports.mjs';

await stopDevServer();

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const astroBin = resolve(root, 'node_modules/.bin/astro');

const child = spawn(astroBin, ['dev'], {
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

console.log(`Starting Astro dev on http://localhost:${DEV_PORT}/`);
