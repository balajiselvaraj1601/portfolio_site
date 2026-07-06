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

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const OUT_DIR = resolve(root, 'docs/reference/screenshots');
const BASE = (
  process.env.PREVIEW_URL ?? `http://127.0.0.1:${PREVIEW_PORT}`
).replace(/\/?$/, '/');

/** Match section-views.ts PROGRAMMATIC_SCROLL_SETTLE_MS + smooth scroll buffer. */
const SCROLL_SETTLE_MS = 1400;

/** @type {{ file: string; hash: string; selector: string; revealAll?: boolean }[]} */
const SHOTS = [
  { file: 'thirukural.png', hash: '#about', selector: '#thirukural' },
  { file: 'thiruvalluvar.png', hash: '#about', selector: '.about-landing' },
  { file: 'publications.png', hash: '#research', selector: '#publications' },
  { file: 'speaking.png', hash: '#research', selector: '#speakers' },
  { file: 'awards.png', hash: '#recognition', selector: '#awards' },
  { file: 'kaggle.png', hash: '#recognition', selector: '#kaggle' },
  { file: 'contact_page.png', hash: '#contact', selector: '#contact' },
  {
    file: 'vision-programs.png',
    hash: '#vision',
    selector: '#vision-programs',
    revealAll: true,
  },
  {
    file: 'vision-impact.png',
    hash: '#vision',
    selector: '#vision-impact',
    revealAll: true,
  },
];

async function waitForReveal(page, selector, timeout = 15000) {
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      const style = getComputedStyle(el);
      const opacity = parseFloat(style.opacity);
      return el.classList.contains('is-visible') || opacity > 0.5;
    },
    selector,
    { timeout }
  );
}

async function waitForScrollSettle(page) {
  await page.waitForTimeout(SCROLL_SETTLE_MS);
}

async function forceReveals(page, rootSelector) {
  await page.evaluate((sel) => {
    const root = document.querySelector(sel);
    if (!root) return;
    root.querySelectorAll('.reveal').forEach((el) => {
      el.classList.add('is-visible');
    });
  }, rootSelector);
}

async function prepareVisionSection(page) {
  await page.locator('#vision-impact').scrollIntoViewIfNeeded();
  await waitForScrollSettle(page);
  await forceReveals(page, '#vision-programs');
  await forceReveals(page, '#vision-impact');
  await page.waitForTimeout(200);
}

async function loadPage(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForSelector('#hero', { timeout: 15000 });
  await waitForReveal(page, '#hero');
  if (url.includes('#')) {
    await waitForScrollSettle(page);
  }
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  try {
    await loadPage(page, BASE);

    for (const shot of SHOTS) {
      const url = `${BASE.replace(/\/$/, '')}/${shot.hash}`;
      await loadPage(page, url);
      await page.waitForSelector(shot.selector, { timeout: 15000 });
      await page.locator(shot.selector).scrollIntoViewIfNeeded();
      await waitForScrollSettle(page);
      await waitForReveal(page, shot.selector);
      if (shot.revealAll) {
        await prepareVisionSection(page);
      }
      const outPath = resolve(OUT_DIR, shot.file);
      await page.locator(shot.selector).screenshot({ path: outPath });
      console.log(`wrote ${outPath}`);
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
