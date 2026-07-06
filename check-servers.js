import { chromium } from 'playwright';

const ports = [4321, 4331];

(async () => {
  const browser = await chromium.launch({ headless: true });

  for (const port of ports) {
    const page = await browser.newPage();

    try {
      console.log(`\n=== Checking localhost:${port} ===`);
      await page.goto(`http://localhost:${port}/`, {
        waitUntil: 'networkidle',
      });

      // Get page title and basic info
      const title = await page.title();
      const url = page.url();

      console.log(`✓ Server responding on port ${port}`);
      console.log(`  Title: ${title}`);
      console.log(`  URL: ${url}`);

      // Check for main content
      const h1 = await page
        .$eval('h1', (el) => el.textContent)
        .catch(() => 'N/A');
      console.log(`  H1: ${h1}`);

      // Take screenshot
      await page.screenshot({
        path: `/tmp/claude-1000/-home-engineer-workspace-portfolio-site/fd16de47-545b-48d9-9e14-1086feff8392/scratchpad/screenshot-${port}.png`,
      });
      console.log(`  Screenshot saved: screenshot-${port}.png`);
    } catch (error) {
      console.log(`✗ Failed to connect to localhost:${port}: ${error.message}`);
    }

    await page.close();
  }

  await browser.close();
})();
