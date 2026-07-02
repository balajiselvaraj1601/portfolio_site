#!/usr/bin/env node
/**
 * refresh-icon-geometry.mjs — rewrite src/lib/icon-paths.json from canonical sources.
 *
 * Semantic UI icons are pulled from Lucide (outline, 24×24, stroke); brand marks
 * Lucide does not carry (linkedin, kaggle, github) come from Simple Icons as filled
 * single-path glyphs. Only the inner SVG body is stored — the export pipeline
 * (export-icon-svgs.mjs) wraps it in a 24×24 <svg fill="none" stroke="#000" …>.
 *
 * Brand marks are filled, so their path is rewritten to carry fill="#000"
 * stroke="none" (otherwise the fill="none" wrapper would render only a hairline).
 *
 * Usage:  node scripts/refresh-icon-geometry.mjs          # rewrite icon-paths.json
 *         node scripts/refresh-icon-geometry.mjs --dry     # print, don't write
 *
 * After running, regenerate PNGs:
 *   node scripts/export-icon-svgs.mjs
 *   python3 scripts/process_logos.py --logos-dir scripts/.icon-stage --apply --min-trim-pct 100 --svg-scale 8
 *   cp scripts/.icon-stage/*.png public/assets/icons/ui/
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const jsonPath = resolve(root, 'src/lib/icon-paths.json');

const LUCIDE =
  'https://raw.githubusercontent.com/lucide-icons/lucide/main/icons';
const SIMPLE =
  'https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons';

// key -> canonical Lucide icon name (semantic, stroke family)
const LUCIDE_MAP = {
  email: 'mail',
  linkedin: null,
  kaggle: null,
  github: null,
  clock: 'clock',
  calendar: 'calendar',
  'arrow-right': 'arrow-right',
  location: 'map-pin',
  external: 'external-link',
  download: 'download',
  sun: 'sun',
  moon: 'moon',
  menu: 'menu',
  close: 'x',
  'arrow-up': 'arrow-up',
  chevron: 'chevron-down',
  'chevron-right': 'chevron-right',
  trophy: 'trophy',
  // Local custom badge (512×512 filled evenodd trophy glyph, stored in icon-paths.json).
  // No remote source — null keeps it in the falsy branch so refresh preserves it verbatim.
  'trophy-cup': null,
  brain: 'brain',
  rocket: 'rocket',
  pill: 'pill',
  institution: 'landmark',
  microscope: 'microscope',
  presentation: 'presentation',
  chart: 'chart-column',
  funding: 'circle-dollar-sign',
  target: 'target',
  link: 'link',
  team: 'users',
  globe: 'globe',
  blocks: 'layout-grid',
  document: 'file-text',
  graduation: 'graduation-cap',
  diamond: 'diamond',
  folder: 'folder',
  layers: 'layers',
  scan: 'scan',
  graph: 'waypoints',
  dna: 'dna',
  vision: 'eye',
  lightbulb: 'lightbulb',
  book: 'book-open',
  handshake: 'handshake',
  table: 'table',
  pulse: 'activity',
  image: 'image',
  save: 'save',
  refresh: 'refresh-cw',
  dashboard: 'layout-dashboard',
  clipboard: 'clipboard-check',
  mic: 'mic',
  fish: 'fish',
  cloud: 'cloud',
  hand: 'hand',
  zap: 'zap',
  'pen-line': 'pen-line',
};

// key -> Simple Icons slug (filled brand glyphs)
const BRAND_MAP = { linkedin: 'linkedin', kaggle: 'kaggle', github: 'github' };

// Brands removed from Simple Icons' default branch (e.g. LinkedIn, by brand request).
// Canonical 24×24 filled glyphs, stored verbatim; used when the remote slug 404s.
const INLINE_BRAND = {
  linkedin:
    'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z',
};

const innerBody = (svg) =>
  svg
    .replace(/<\?xml[\s\S]*?\?>/g, '')
    .replace(/<svg[^>]*>/i, '')
    .replace(/<\/svg>/i, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

// Simple Icons ship one <path d="…"/>; make it render filled within the wrapper.
const asFilledPath = (body) => {
  const m = body.match(/<path[^>]*\bd="([^"]+)"[^>]*\/?>/i);
  if (!m) throw new Error('no path d in brand svg');
  return `<path fill="#000" stroke="none" d="${m[1]}"/>`;
};

async function fetchSvg(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

const existing = JSON.parse(readFileSync(jsonPath, 'utf8'));
const out = {};

for (const key of Object.keys(existing)) {
  try {
    if (BRAND_MAP[key]) {
      try {
        const svg = await fetchSvg(`${SIMPLE}/${BRAND_MAP[key]}.svg`);
        out[key] = asFilledPath(innerBody(svg));
        console.log(
          `brand   ${key.padEnd(14)} <- simpleicons:${BRAND_MAP[key]}`
        );
      } catch (e) {
        if (!INLINE_BRAND[key]) throw e;
        out[key] = `<path fill="#000" stroke="none" d="${INLINE_BRAND[key]}"/>`;
        console.log(
          `brand   ${key.padEnd(14)} <- inline (simpleicons:${BRAND_MAP[key]} ${e.message})`
        );
      }
    } else if (LUCIDE_MAP[key]) {
      const svg = await fetchSvg(`${LUCIDE}/${LUCIDE_MAP[key]}.svg`);
      out[key] = innerBody(svg);
      console.log(`lucide  ${key.padEnd(14)} <- ${LUCIDE_MAP[key]}`);
    } else {
      out[key] = existing[key];
      console.log(`keep    ${key.padEnd(14)} (no mapping)`);
    }
  } catch (e) {
    out[key] = existing[key];
    console.log(`FAIL    ${key.padEnd(14)} ${e.message} — kept existing`);
  }
}

if (process.argv.includes('--dry')) {
  console.log(JSON.stringify(out, null, 2));
} else {
  writeFileSync(jsonPath, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`\nwrote ${Object.keys(out).length} icons -> ${jsonPath}`);
}
