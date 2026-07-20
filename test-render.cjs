const { chromium } = require('playwright');
(async () => { 
  const browser = await chromium.launch(); 
  const page = await browser.newPage(); 
  
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', err => console.log('ERROR:', err.message));

  await page.goto('http://localhost:5173'); 
  await page.waitForTimeout(2000); 
  
  const rootHtml = await page.$eval('#root', el => el.innerHTML); 
  console.log('ROOT HTML LEN:', rootHtml.length); 
  if (rootHtml.length < 100) {
    console.log('ROOT IS EMPTY:', rootHtml); 
  }
  await browser.close(); 
})();
