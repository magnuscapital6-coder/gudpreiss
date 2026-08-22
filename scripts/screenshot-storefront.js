const { chromium } = require('playwright');
const path = require('path');

async function screenshotStorefront() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const pages = [
    { url: 'http://localhost:3008', name: 'homepage', desc: 'Page d\'accueil' },
    { url: 'http://localhost:3008/shop', name: 'shop', desc: 'Boutique / Catalogue' },
    { url: 'http://localhost:3008/admin', name: 'admin', desc: 'Admin Dashboard' },
  ];

  for (const p of pages) {
    try {
      console.log(`📸 ${p.desc}: ${p.url}`);
      await page.goto(p.url, { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(2000);
      const screenshotPath = path.join(__dirname, `../screenshots/${p.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`  ✓ Saved: ${p.name}.png`);

      // Get page title and some content info
      const title = await page.title();
      const h1 = await page.$eval('h1', el => el.textContent).catch(() => 'no h1');
      const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
      console.log(`  Title: ${title}`);
      console.log(`  H1: ${h1}`);
      console.log(`  Body preview: ${bodyText.substring(0, 200)}...`);
      console.log('');
    } catch (err) {
      console.error(`  ✗ Error on ${p.name}: ${err.message}`);
    }
  }

  await browser.close();
  console.log('Done! Screenshots saved in /screenshots/');
}

// Create screenshots dir
const fs = require('fs');
const dir = path.join(__dirname, '../screenshots');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

screenshotStorefront().catch(console.error);
