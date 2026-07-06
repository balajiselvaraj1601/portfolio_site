#!/usr/bin/env node
/**
 * export-icon-svgs.mjs — emit one wrapped SVG per UI icon for rasterization.
 *
 * Reads the single-source icon geometry from src/lib/icon-paths.json and writes
 * scripts/icons/.icon-stage/<name>.png (SVG content under a .png extension so
 * process_logos.py treats it as a "mislabeled" file and rasterizes it via
 * image_gen/scripts/render.py). Strokes are baked #000 for the light base theme;
 * Icon.astro applies a CSS invert filter for dark mode.
 *
 * Usage:  node scripts/icons/export-icon-svgs.mjs
 * Then:   python3 scripts/icons/process_logos.py --logos-dir scripts/icons/.icon-stage --apply --min-trim-pct 100 --svg-scale 8
 */
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
  rmSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const paths = JSON.parse(
  readFileSync(resolve(root, 'src/lib/icon-paths.json'), 'utf8')
);
const outDir = resolve(here, '.icon-stage');

mkdirSync(outDir, { recursive: true });
for (const entry of readdirSync(outDir)) {
  if (entry === '_originals') continue;
  rmSync(resolve(outDir, entry), { recursive: true, force: true });
}

const wrap = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" ` +
  `fill="none" stroke="#000" stroke-width="1.8" stroke-linecap="round" ` +
  `stroke-linejoin="round">${body}</svg>\n`;

let n = 0;
for (const [name, body] of Object.entries(paths)) {
  writeFileSync(resolve(outDir, `${name}.png`), wrap(body), 'utf8');
  n++;
}
console.log(`wrote ${n} icon SVGs to ${outDir}`);
