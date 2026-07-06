#!/usr/bin/env node
/**
 * dev-stop.mjs — stop all Astro dev/preview listeners on 43xx ports.
 *
 * Clears pinned ports (4321, 4331), legacy fallback (4322), and any orphan
 * agent sessions in 4300–4399. Never kills broad node processes.
 *
 * Usage: npm run dev:stop
 */
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { DEV_PORT, LEGACY_PORTS, PREVIEW_PORT } from './ports.mjs';

const RELEASE_MS = 500;

function killPort(port) {
  try {
    execSync(`fuser -k ${port}/tcp`, { stdio: 'ignore' });
  } catch {
    /* nothing listening */
  }
}

function killAstroProcesses(patterns) {
  for (const pattern of patterns) {
    try {
      execSync(`pkill -f '${pattern}'`, { stdio: 'ignore' });
    } catch {
      /* no matching processes */
    }
  }
}

/** @returns {Promise<void>} */
export async function stopDevServer() {
  killPort(DEV_PORT);
  for (const port of LEGACY_PORTS) {
    killPort(port);
  }
  killAstroProcesses(['astro dev']);
  await new Promise((resolve) => setTimeout(resolve, RELEASE_MS));
}

/** @returns {Promise<void>} */
export async function stopPreviewServer() {
  killPort(PREVIEW_PORT);
  killAstroProcesses(['astro preview']);
  await new Promise((resolve) => setTimeout(resolve, RELEASE_MS));
}

/** @returns {Promise<void>} */
export async function stopAstroServers() {
  for (let port = 4300; port <= 4399; port += 1) {
    killPort(port);
  }

  killAstroProcesses(['astro dev', 'astro preview']);

  await new Promise((resolve) => setTimeout(resolve, RELEASE_MS));
}

const isMain =
  process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  await stopAstroServers();
  console.log('Stopped Astro listeners on ports 4300–4399.');
}
