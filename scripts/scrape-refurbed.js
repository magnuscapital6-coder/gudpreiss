const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const REFURBED_URLS = [
  // iPhones
  'https://www.refurbed.de/c/iphones/',
  'https://www.refurbed.de/c/iphone-16-pro-max/',
  'https://www.refurbed.de/c/iphone-16-pro/',
  'https://www.refurbed.de/c/iphone-16/',
  'https://www.refurbed.de/c/iphone-15-pro-max/',
  'https://www.refurbed.de/c/iphone-15-pro/',
  'https://www.refurbed.de/c/iphone-15/',
  'https://www.refurbed.de/c/iphone-14-pro/',
  'https://www.refurbed.de/c/iphone-14/',
  'https://www.refurbed.de/c/iphone-13/',
  // Samsung
  'https://www.refurbed.de/c/samsung-galaxy-s25-ultra/',
  'https://www.refurbed.de/c/samsung-galaxy-s25/',
  'https://www.refurbed.de/c/samsung-galaxy-s24-ultra/',
  'https://www.refurbed.de/c/samsung-galaxy-s24/',
  'https://www.refurbed.de/c/samsung-galaxy-s23-ultra/',
  'https://www.refurbed.de/c/samsung-galaxy-s23/',
  'https://www.refurbed.de/c/samsung-galaxy-a55/',
  // Google
  'https://www.refurbed.de/c/google-pixel-9-pro/',
  'https://www.refurbed.de/c/google-pixel-9/',
  'https://www.refurbed.de/c/google-pixel-8-pro/',
  // MacBooks
  'https://www.refurbed.de/c/macbooks/',
  'https://www.refurbed.de/c/macbook-pro/',
  'https://www.refurbed.de/c/macbook-air/',
  // iPads
  'https://www.refurbed.de/c/ipads/',
  'https://www.refurbed.de/c/ipad-pro/',
  'https://www.refurbed.de/c/ipad-air/',
  'https://www.refurbed.de/c/ipad-mini/',
  // Smartwatches
  'https://www.refurbed.de/c/smartwatches/',
  'https://www.refurbed.de/c/apple-watch/',
  // Audio
  'https://www.refurbed.de/c/airpods/',
  'https://www.refurbed.de/c/airpods-pro/',
  // Laptops
  'https://www.refurbed.de/c/laptops/',
  'https://www.refurbed.de/c/thinkpad/',
];

async function scrapeRefurbedPage(page, url) {
  try {
    console.log(`  Scraping: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);

    const data = await page.evaluate(() => {
      const name = document.querySelector('h1')?.textContent?.trim() || '';
      const desc = document.querySelector('meta[name="description"]')?.content || '';
      const title = document.querySelector('title')?.textContent || '';

      // Product cards - refurbed uses a grid of product cards
      const products = [];
      document.querySelectorAll('[class*="product"], [class*="Product"], article, [data-testid*="product"]').forEach(card => {
        const cardName = card.querySelector('h2, h3, [class*="title"], [class*="name"]')?.textContent?.trim();
        const cardPrice = card.querySelector('[class*="price"], [class*="Price"]')?.textContent?.trim();
        const cardImg = card.querySelector('img')?.src;
        if (cardName && cardName.length > 3) {
          products.push({ name: cardName, price: cardPrice, image: cardImg });
        }
      });

      // All images
      const images = [];
      document.querySelectorAll('img').forEach(img => {
        const src = img.src || img.getAttribute('data-src') || '';
        if (src && src.includes('http') && !src.includes('svg') && !src.includes('icon') && !src.includes('logo')) {
          images.push(src);
        }
      });

      // Price patterns
      const bodyText = document.body.innerText;
      const prices = bodyText.match(/(\d+[,\.]\d{2})\s*€/g) || [];

      // Specs
      const specs = {};
      document.querySelectorAll('tr, dl, dt, dd, li, [class*="spec"]').forEach(el => {
        const t = el.textContent.trim();
        if (t.length > 5 && t.length < 200) {
          ['Display', 'Kamera', 'Akku', 'Speicher', 'Prozessor', 'RAM', 'Farbe', 'Zustand', 'Garantie', 'Bildschirm'].forEach(k => {
            if (t.toLowerCase().includes(k.toLowerCase())) specs[k] = t;
          });
        }
      });

      const fullText = bodyText.substring(0, 6000);
      return { name, desc, title, products, images: images.slice(0, 8), prices: prices.slice(0, 10), specs, fullText };
    });

    return { url, ...data, source: 'refurbed', scrapedAt: new Date().toISOString() };
  } catch (err) {
    console.error(`  ✗ Error: ${err.message}`);
    return { url, error: err.message, source: 'refurbed', scrapedAt: new Date().toISOString() };
  }
}

async function main() {
  console.log(`=== Scraping refurbed.de (${REFURBED_URLS.length} pages) ===\n`);

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const allData = [];
  for (const url of REFURBED_URLS) {
    const data = await scrapeRefurbedPage(page, url);
    allData.push(data);
    const prodCount = data.products?.length || 0;
    const imgCount = data.images?.length || 0;
    console.log(`    → ${(data.name || 'NO NAME').substring(0, 45)} | ${prodCount} prods | ${imgCount} imgs`);
  }

  await browser.close();

  const out = path.join(__dirname, 'refurbed-scraped.json');
  fs.writeFileSync(out, JSON.stringify(allData, null, 2));
  console.log(`\n=== Done! ${allData.length} pages scraped → ${out} ===`);
}

main().catch(console.error);
