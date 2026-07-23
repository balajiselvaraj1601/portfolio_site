#!/usr/bin/env node
/**
 * Capture a clean, chrome-free snapshot of the Vision section (#vision-programs).
 *
 * Unlike baseline-shots.mjs this hides the site's fixed chrome (#site-header,
 * #dot-nav, #save-btn) before the element screenshot, so nothing overlaps the
 * flow + boxes. Output is a single crisp PNG (deviceScaleFactor 2).
 *
 * Prerequisite: a server (preview or dev) serving BASE.
 *   npm run build && npm run preview   # serves http://127.0.0.1:4331
 *
 * Env overrides:
 *   PREVIEW_URL  base URL of the running server (default http://127.0.0.1:<PREVIEW_PORT>)
 *   THEME        'dark' (default) or 'light'
 *   OUT          output PNG path (default /home/engineer/workspace/vision-page.png)
 */
import { chromium } from 'playwright';
import { PREVIEW_PORT } from './ports.mjs';
import {
  waitForReveal,
  waitForScrollSettle,
  scrollUntilStable,
  applyTheme,
  prepareVisionSection,
} from './shot-helpers.mjs';

const BASE = (
  process.env.PREVIEW_URL ?? `http://127.0.0.1:${PREVIEW_PORT}`
).replace(/\/$/, '');
const THEME = process.env.THEME ?? 'dark';
const OUT = process.env.OUT ?? '/home/engineer/workspace/vision-page.png';

/** Fixed site chrome that would otherwise overlap or frame the section. */
const HIDE_CHROME = '#site-header,#dot-nav,#save-btn{display:none!important}';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  try {
    await page.goto(`${BASE}/#vision`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    await page.waitForSelector('#hero', { timeout: 15000 });
    await waitForReveal(page, '#hero');
    await waitForScrollSettle(page);

    await applyTheme(page, THEME);

    await page.waitForSelector('#vision-programs', { timeout: 15000 });
    await scrollUntilStable(page, '#vision-programs');
    await waitForReveal(page, '#vision-programs');
    await prepareVisionSection(page);

    // Hide fixed chrome just before the shot so the flow + boxes are unobstructed.
    await page.addStyleTag({ content: HIDE_CHROME });
    await page.waitForTimeout(150);

    await page.locator('#vision-programs').screenshot({ path: OUT });
    console.log(`wrote ${OUT}`);
  } catch (err) {
    console.error(
      `Failed — is a server running at ${BASE}? (${err})`
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
