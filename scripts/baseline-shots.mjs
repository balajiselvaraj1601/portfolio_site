#!/usr/bin/env node
/**
 * Capture design-reference baseline screenshots for docs/reference/screenshots/.
 *
 * Prerequisite: npm run preview (or dev) serving PREVIEW_URL (default http://127.0.0.1:4331).
 */
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { PREVIEW_PORT } from './ports.mjs';
import {
  waitForReveal,
  waitForScrollSettle,
  scrollUntilStable,
  applyTheme,
  forceReveals,
  prepareVisionSection,
} from './shot-helpers.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const OUT_DIR = resolve(root, 'docs/reference/screenshots');
const BASE = (
  process.env.PREVIEW_URL ?? `http://127.0.0.1:${PREVIEW_PORT}`
).replace(/\/?$/, '/');

/** Both themes are captured: dark into OUT_DIR (committed baselines), light into OUT_DIR/light. */
const THEMES = ['dark', 'light'];

/** @type {{ file: string; hash: string; selector: string; revealAll?: boolean }[]} */
const SHOTS = [
  { file: 'hero.png', hash: '', selector: '#hero' },
  {
    file: 'experience.png',
    hash: '#experience',
    selector: '#experience',
    revealAll: true,
  },
  { file: 'thirukural.png', hash: '#hero', selector: '#thirukural' },
  { file: 'thiruvalluvar.png', hash: '#hero', selector: '.hero-landing' },
  { file: 'publications.png', hash: '#research', selector: '#publications' },
  { file: 'speaking.png', hash: '#research', selector: '#speakers' },
  {
    file: 'awards.png',
    hash: '#recognition',
    selector: '#awards',
    revealAll: true,
  },
  { file: 'kaggle.png', hash: '#recognition', selector: '#kaggle' },
  { file: 'contact_page.png', hash: '#contact', selector: '#contact' },
  {
    file: 'vision-programs.png',
    hash: '#vision',
    selector: '#vision-programs',
    revealAll: true,
  },
];

async function loadPage(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('#hero', { timeout: 15000 });
  await waitForReveal(page, '#hero');
  if (url.includes('#')) {
    await waitForScrollSettle(page);
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  try {
    for (const theme of THEMES) {
      const outDir = theme === 'dark' ? OUT_DIR : resolve(OUT_DIR, theme);
      mkdirSync(outDir, { recursive: true });

      for (const shot of SHOTS) {
        const url = `${BASE.replace(/\/$/, '')}/${shot.hash}`;
        await loadPage(page, url);
        await applyTheme(page, theme);
        await page.waitForSelector(shot.selector, { timeout: 15000 });
        await scrollUntilStable(page, shot.selector);
        await waitForReveal(page, shot.selector);
        if (shot.revealAll) {
          if (shot.selector === '#vision-programs') {
            await prepareVisionSection(page);
          } else {
            await forceReveals(page, shot.selector);
            await page.waitForTimeout(200);
          }
        }
        const outPath = resolve(outDir, shot.file);
        await page.locator(shot.selector).screenshot({ path: outPath });
        console.log(`wrote ${outPath}`);
      }
    }
  } catch (err) {
    console.error(
      `Failed — is the preview server running at ${BASE}? (${err})`
    );
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
