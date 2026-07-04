#!/usr/bin/env node
/**
 * Localhost smoke checks for portfolio_site.
 * Prerequisite: npm run dev (http://127.0.0.1:4321/)
 */
import { chromium } from 'playwright';

const BASE = process.env.SMOKE_BASE_URL ?? 'http://127.0.0.1:4321/';
const results = [];

function pass(name, detail = '') {
  results.push({ name, ok: true, detail });
  console.log(`PASS  ${name}${detail ? ` — ${detail}` : ''}`);
}

function fail(name, detail = '') {
  results.push({ name, ok: false, detail });
  console.error(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
}

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

async function main() {
  const pageErrors = [];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });

  page.on('pageerror', (err) => {
    pageErrors.push(String(err));
  });

  try {
    await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForSelector('#hero', { timeout: 15000 });
  } catch (err) {
    fail(
      'dev server reachable',
      `Could not load ${BASE} — run npm run dev first (${err})`
    );
    await browser.close();
    process.exit(1);
  }

  const importErrors = pageErrors.filter((e) =>
    e.includes('Cannot use import statement outside a module')
  );
  if (importErrors.length === 0) {
    pass('no module import page error');
  } else {
    fail('no module import page error', importErrors[0]);
  }

  try {
    await waitForReveal(page, '#hero');
    const heroOpacity = await page.$eval('#hero', (el) =>
      parseFloat(getComputedStyle(el).opacity)
    );
    if (heroOpacity > 0.5) {
      pass('hero visible', `opacity=${heroOpacity}`);
    } else {
      fail('hero visible', `opacity=${heroOpacity}`);
    }
  } catch (err) {
    fail('hero visible', String(err));
  }

  const statCount = await page.locator('#hero .hero-stat__label').count();
  if (statCount >= 4) {
    pass('hero stat labels', `count=${statCount}`);
  } else {
    fail('hero stat labels', `expected >= 4, got ${statCount}`);
  }

  try {
    const clip = await page.evaluate(() => {
      const landing = document.querySelector('.about-landing');
      const kural = document.querySelector('#thirukural');
      if (!landing || !kural) return { ok: false, reason: 'missing element' };
      const lr = landing.getBoundingClientRect();
      const kr = kural.getBoundingClientRect();
      const ok = kr.bottom <= lr.bottom + 2 && kr.top >= lr.top - 2;
      return {
        ok,
        reason: ok
          ? 'inside landing bounds'
          : `kural bottom ${kr.bottom.toFixed(0)} vs landing bottom ${lr.bottom.toFixed(0)}`,
      };
    });
    if (clip.ok) pass('thirukural not clipped', clip.reason);
    else fail('thirukural not clipped', clip.reason);
  } catch (err) {
    fail('thirukural not clipped', String(err));
  }

  try {
    const awardsChip = page.locator('#awards .recog-chip[data-filter]').first();
    if ((await awardsChip.count()) === 0) {
      fail('awards/kaggle filter isolation', 'no awards filter chip found');
    } else {
      const kaggleAllBefore = await page
        .locator('#kaggle .recog-chip[data-filter="all"]')
        .getAttribute('class');
      await awardsChip.click();
      await page.waitForTimeout(200);
      const kaggleAllAfter = await page
        .locator('#kaggle .recog-chip[data-filter="all"]')
        .getAttribute('class');
      const awardsActive = await page
        .locator('#awards .recog-chip.is-active')
        .count();
      const kaggleAllStillActive = (kaggleAllAfter ?? '').includes('is-active');
      if (awardsActive >= 1 && kaggleAllStillActive) {
        pass('awards/kaggle filter isolation');
      } else {
        fail(
          'awards/kaggle filter isolation',
          `awards active=${awardsActive}, kaggle all active=${kaggleAllStillActive}`
        );
      }
      void kaggleAllBefore;
    }
  } catch (err) {
    fail('awards/kaggle filter isolation', String(err));
  }

  try {
    await page.goto(`${BASE.replace(/\/$/, '')}/#experience`, {
      waitUntil: 'domcontentloaded',
    });
    await page.waitForSelector('#hero', { timeout: 15000 });
    await page.waitForFunction(
      () => {
        const el = document.getElementById('experience');
        if (!el) return false;
        const header =
          parseFloat(
            getComputedStyle(document.documentElement).getPropertyValue(
              '--header-h'
            )
          ) || 64;
        const top = el.getBoundingClientRect().top;
        return top >= header - 8 && top < window.innerHeight * 0.6;
      },
      undefined,
      { timeout: 5000 }
    );
    pass('hash nav /#experience');
  } catch (err) {
    fail('hash nav /#experience', String(err));
  }

  await browser.close();

  const failed = results.filter((r) => !r.ok);
  console.log('');
  console.log(
    `${results.length - failed.length}/${results.length} checks passed`
  );
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
