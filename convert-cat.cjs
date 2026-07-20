const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const svgContent = fs.readFileSync('public/images/sitting-cat.svg', 'utf8');
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin: 0; padding: 0; background: transparent;">
        ${svgContent.replace('viewBox="0 0 120 120"', 'viewBox="0 0 120 120" width="240" height="240"')}
      </body>
    </html>
  `);
  
  const elementHandle = await page.$('svg');
  await elementHandle.screenshot({ path: 'public/images/sitting-cat.png', omitBackground: true });
  await browser.close();
  console.log('PNG created successfully');
})();
