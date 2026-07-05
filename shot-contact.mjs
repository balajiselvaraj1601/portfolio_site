import { chromium } from 'playwright';

const SP =
  '/tmp/claude-1000/-home-engineer-workspace-portfolio-site/af0a8f1f-fbfe-4e69-8b21-edaabf1b8fe4/scratchpad';
const BASE = 'http://127.0.0.1:4321/';

const browser = await chromium.launch();
for (const theme of ['dark', 'light']) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  await page.goto(BASE + '#contact', { waitUntil: 'networkidle' });
  await page.addStyleTag({
    content: '.reveal{opacity:1!important;transform:none!important}',
  });
  await page.evaluate((t) => {
    document.documentElement.setAttribute('data-theme', t);
    document
      .querySelectorAll('.reveal')
      .forEach((el) => el.classList.add('is-visible'));
  }, theme);
  await page.waitForTimeout(600);
  const el = await page.$('#contact');
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await el.screenshot({ path: `${SP}/contact-${theme}.png` });
  console.log('captured', theme);
  await page.close();
}
await browser.close();
