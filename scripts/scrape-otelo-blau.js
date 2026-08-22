const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// otelo.de product pages
const OTELO_URLS = [
  // Apple
  'https://www.otelo.de/handy-mit-vertrag/apple/iphone-13-mit-vertrag',
  'https://www.otelo.de/handy-mit-vertrag/apple/iphone-13-mini-mit-vertrag',
  'https://www.otelo.de/handy-mit-vertrag/apple/iphone-se-2022-mit-vertrag',
  'https://www.otelo.de/handy-mit-vertrag/apple/iphone-14-mit-vertrag',
  // Samsung
  'https://www.otelo.de/handy-mit-vertrag/samsung/galaxy-a32-5g-mit-vertrag',
  'https://www.otelo.de/handy-mit-vertrag/samsung/galaxy-a14-5g-mit-vertrag',
  'https://www.otelo.de/handy-mit-vertrag/samsung/galaxy-a54-5g-mit-vertrag',
  'https://www.otelo.de/handy-mit-vertrag/samsung/galaxy-s23-mit-vertrag',
  // Google
  'https://www.otelo.de/handy-mit-vertrag/google/pixel-6-mit-vertrag',
  'https://www.otelo.de/handy-mit-vertrag/google/pixel-7-pro-mit-vertrag',
  // Xiaomi
  'https://www.otelo.de/handy-mit-vertrag/xiaomi/redmi-note-10-pro-mit-vertrag',
  'https://www.otelo.de/handy-mit-vertrag/xiaomi/12-lite-5g-mit-vertrag',
  // Topseller & Deals
  'https://www.otelo.de/handy-mit-vertrag/topseller',
  'https://www.otelo.de/handy-mit-vertrag/1euro-deals',
  // Category pages for more products
  'https://www.otelo.de/handy-mit-vertrag/samsung',
  'https://www.otelo.de/handy-mit-vertrag/apple',
  'https://www.otelo.de/handy-mit-vertrag/google',
  'https://www.otelo.de/handy-mit-vertrag/xiaomi',
  'https://www.otelo.de/guenstige-smartphones',
  'https://www.otelo.de/smartphone-neuheiten',
  'https://www.otelo.de/handy-angebote',
  'https://www.otelo.de/handy-bundles',
];

// blau.de product pages
const BLAU_URLS = [
  // Main pages
  'https://www.blau.de/handys',
  'https://www.blau.de/handys/smartphones',
  'https://www.blau.de/handys/apple',
  'https://www.blau.de/handys/samsung',
  'https://www.blau.de/handys/xiaomi',
  'https://www.blau.de/handys/google',
  'https://www.blau.de/handys/zubehoer',
  'https://www.blau.de/tarife',
  'https://www.blau.de/tarife/allnet-flat',
  'https://www.blau.de/aktionen',
];

async function scrapeProductPage(page, url, source) {
  try {
    console.log(`  Scraping: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);

    const product = await page.evaluate((src) => {
      // Product name from h1
      const h1 = document.querySelector('h1');
      const name = h1 ? h1.textContent.trim() : '';

      // Description
      const metaDesc = document.querySelector('meta[name="description"]');
      const description = metaDesc ? metaDesc.content : '';

      // Title
      const titleEl = document.querySelector('title');
      const title = titleEl ? titleEl.textContent : '';

      // Images
      const images = [];
      document.querySelectorAll('img').forEach(img => {
        const src = img.src || img.getAttribute('data-src') || '';
        if (src && !src.includes('svg') && !src.includes('icon') && !src.includes('logo')
            && src.includes('http') && (src.includes('.png') || src.includes('.jpg') || src.includes('.jpeg') || src.includes('.webp'))) {
          images.push(src);
        }
      });

      // Price extraction - look for monthly prices and one-time prices
      const bodyText = document.body.innerText;
      const monthlyPrices = bodyText.match(/(\d+[,\.]\d{2})\s*€\s*(pro\s*Monat|mtl\.|monatlich)/gi) || [];
      const oneTimePrices = bodyText.match(/(\d+[,\.]\d{2})\s*€\s*(einmalig|Anschlusspreis)/gi) || [];
      const allPrices = bodyText.match(/(\d+[,\.]\d{2})\s*€/g) || [];

      // Specs extraction
      const specs = {};
      const specKeywords = ['Display', 'Kamera', 'Akku', 'Speicher', 'Prozessor', 'Gewicht', 'Bildschirm',
        'RAM', 'Farbe', 'Betriebssystem', 'Konnektivität', 'Wasserschutz', 'Garantie',
        'display', 'camera', 'battery', 'storage', 'processor', 'weight', 'screen',
        'Akkulaufzeit', 'Auflösung', 'Größe', 'Chip', 'GB', 'MP'];

      // Look for spec tables, lists, or dt/dd pairs
      document.querySelectorAll('tr, dl, dt, dd, li, [class*="spec"], [class*="Spec"], [class*="feature"], [class*="Feature"], [class*="detail"], [class*="Detail"]').forEach(el => {
        const text = el.textContent.trim();
        if (text.length > 5 && text.length < 300) {
          specKeywords.forEach(h => {
            if (text.toLowerCase().includes(h.toLowerCase())) {
              specs[h] = text;
            }
          });
        }
      });

      // Full text for processing
      const fullText = bodyText.substring(0, 8000);

      return {
        name, description, title, images: images.slice(0, 10),
        monthlyPrices, oneTimePrices, allPrices: allPrices.slice(0, 10),
        specs, fullText, source: src
      };
    }, source);

    return { url, ...product, scrapedAt: new Date().toISOString() };
  } catch (err) {
    console.error(`  ✗ Error: ${err.message}`);
    return { url, error: err.message, source, scrapedAt: new Date().toISOString() };
  }
}

async function scrapeAll() {
  console.log('=== Scraping otelo.de + blau.de ===\n');

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const allProducts = [];

  // Scrape otelo.de
  console.log(`--- otelo.de (${OTELO_URLS.length} pages) ---`);
  for (const url of OTELO_URLS) {
    const product = await scrapeProductPage(page, url, 'otelo');
    allProducts.push(product);
    console.log(`    → ${(product.name || 'NO NAME').substring(0, 50)} (${product.images?.length || 0} imgs)`);
  }

  // Scrape blau.de
  console.log(`\n--- blau.de (${BLAU_URLS.length} pages) ---`);
  for (const url of BLAU_URLS) {
    const product = await scrapeProductPage(page, url, 'blau');
    allProducts.push(product);
    console.log(`    → ${(product.name || 'NO NAME').substring(0, 50)} (${product.images?.length || 0} imgs)`);
  }

  await browser.close();

  // Save results
  const outputPath = path.join(__dirname, 'otelo-blau-scraped.json');
  fs.writeFileSync(outputPath, JSON.stringify(allProducts, null, 2));
  console.log(`\n=== Done! ${allProducts.length} pages scraped → ${outputPath} ===`);
  return allProducts;
}

scrapeAll().catch(console.error);
