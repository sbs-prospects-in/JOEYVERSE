const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', error => console.error('BROWSER ERROR:', error.message));
  try {
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(3000);
  } catch (err) {
    console.error('FAILED TO LOAD:', err.message);
  }
  await browser.close();
})();
