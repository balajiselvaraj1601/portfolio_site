#!/usr/bin/env node
/**
 * dev-restart.mjs — kill stale Astro dev listeners and start a fresh server on 4321.
 *
 * Clears ports 4321 and 4322 (legacy fallback from before strictPort) so the browser
 * URL http://localhost:4321 always matches the running process.
 *
 * Usage: npm run dev:restart
 */
import { execSync, spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const PORTS = [4321, 4322];
const RELEASE_MS = 500;

function killPort(port) {
  try {
    execSync(`fuser -k ${port}/tcp`, { stdio: 'ignore' });
  } catch {
    /* nothing listening */
  }
}

for (const port of PORTS) {
  killPort(port);
}

await new Promise((resolve) => setTimeout(resolve, RELEASE_MS));

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
