import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => {
    console.log('[console]', msg.type(), msg.text());
  });
  page.on('pageerror', err => {
    console.error('[pageerror]', err.message);
  });
  await page.goto('https://cosmicphoenix171.github.io/Darcnia/darcnia-campaign/web/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  const content = await page.content();
  console.log('[content snippet]', content.slice(0, 200));
  await browser.close();
})();
