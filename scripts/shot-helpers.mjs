/**
 * Shared Playwright capture helpers for the design-reference screenshot scripts
 * (baseline-shots.mjs, vision-snapshot.mjs). Extracted so the two scripts share
 * one definition of the reveal / scroll-settle / theme logic (SSOT).
 */

/** Match section-views.ts PROGRAMMATIC_SCROLL_SETTLE_MS + smooth scroll buffer. */
export const SCROLL_SETTLE_MS = 1400;

export async function waitForReveal(page, selector, timeout = 15000) {
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

export async function waitForScrollSettle(page) {
  await page.waitForTimeout(SCROLL_SETTLE_MS);
}

/**
 * `content-visibility: auto` on section roots makes a single scrollIntoView
 * overshoot as offscreen sections gain real height. Re-scroll until the
 * target's top is stable between settle intervals.
 */
export async function scrollUntilStable(page, selector, maxPasses = 5) {
  let prevTop = Number.NaN;
  for (let pass = 0; pass < maxPasses; pass++) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await waitForScrollSettle(page);
    const top = await page.$eval(
      selector,
      (el) => el.getBoundingClientRect().top
    );
    if (Math.abs(top - prevTop) < 2) return;
    prevTop = top;
  }
}

export async function applyTheme(page, theme) {
  await page.evaluate((t) => {
    document.documentElement.setAttribute('data-theme', t);
  }, theme);
  await page.waitForTimeout(250);
}

export async function forceReveals(page, rootSelector) {
  await page.evaluate((sel) => {
    const root = document.querySelector(sel);
    if (!root) return;
    root.querySelectorAll('.reveal').forEach((el) => {
      el.classList.add('is-visible');
    });
  }, rootSelector);
}

export async function prepareVisionSection(page) {
  // The section is tall (flow + impact grid); scroll to its end so
  // content-visibility resolves before revealing everything at once.
  await page.locator('#vision-programs').scrollIntoViewIfNeeded();
  await waitForScrollSettle(page);
  await forceReveals(page, '#vision-programs');
  await page.waitForTimeout(200);
}
