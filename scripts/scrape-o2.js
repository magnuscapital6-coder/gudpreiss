const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// All product pages to scrape from o2online.de sitemap
const PRODUCT_URLS = [
  // Apple iPhones
  'https://www.o2online.de/geraete/apple/iphone-17-pro-ohne-vertrag/',
  'https://www.o2online.de/geraete/apple/iphone-17-ohne-vertrag/',
  'https://www.o2online.de/geraete/apple/iphone-17e-ohne-vertrag/',
  'https://www.o2online.de/geraete/apple/iphone-16e-ohne-vertrag/',
  'https://www.o2online.de/geraete/apple/iphone-15-ohne-vertrag/',
  'https://www.o2online.de/geraete/apple/iphone-16-ohne-vertrag/',
  'https://www.o2online.de/geraete/apple/iphone-14-gebraucht/',
  'https://www.o2online.de/geraete/apple/iphone-15-gebraucht/',
  'https://www.o2online.de/geraete/apple/iphone-16-gebraucht/',
  'https://www.o2online.de/geraete/apple/iphone-16-pro-gebraucht/',
  // Samsung
  'https://www.o2online.de/geraete/samsung/samsung-galaxy-s26-ohne-vertrag/',
  'https://www.o2online.de/geraete/samsung/samsung-galaxy-s26-ultra-ohne-vertrag/',
  'https://www.o2online.de/geraete/samsung/samsung-galaxy-s25-ultra-ohne-vertrag/',
  'https://www.o2online.de/geraete/samsung/samsung-galaxy-s25-ohne-vertrag/',
  // Google
  'https://www.o2online.de/geraete/android/google-pixel/',
  // Wearables / Accessories
  'https://www.o2online.de/geraete/ray-ban-meta/',
  'https://www.o2online.de/geraete/vr-brille/',
  'https://www.o2online.de/geraete/gaming-vr/',
  'https://www.o2online.de/geraete/xplora-x6-play-ohne-vertrag/',
  'https://www.o2online.de/geraete/xplora-x6-kidswatch/',
  'https://www.o2online.de/geraete/tcl-mt48-kids-watch/',
];

async function scrapeProduct(page, url) {
  try {
    console.log(`Scraping: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    const product = await page.evaluate(() => {
      // Product name
      const nameEl = document.querySelector('h1');
      const name = nameEl ? nameEl.textContent.trim() : '';

      // Price - look for monthly price or one-time price
      const priceTexts = [];
      document.querySelectorAll('[class*="price"], [class*="Price"], [data-testid*="price"]').forEach(el => {
        const t = el.textContent.trim();
        if (t) priceTexts.push(t);
      });
      // Also check for euro amounts in the page
      const bodyText = document.body.innerText;
      const priceMatches = bodyText.match(/(\d+[,\.]\d{2})\s*€/g) || [];

      // Images
      const images = [];
      document.querySelectorAll('img').forEach(img => {
        const src = img.src || img.getAttribute('data-src') || '';
        if (src && !src.includes('svg') && !src.includes('icon') && !src.includes('logo') && src.includes('http')) {
          images.push(src);
        }
      });

      // Description from meta
      const metaDesc = document.querySelector('meta[name="description"]');
      const description = metaDesc ? metaDesc.content : '';

      // Title
      const metaTitle = document.querySelector('title');
      const title = metaTitle ? metaTitle.textContent : '';

      // Try to find specs/features
      const specs = {};
      const specHeaders = ['Display', 'Kamera', 'Akku', 'Speicher', 'Prozessor', 'Gewicht', 'Bildschirm',
        'RAM', 'Farbe', 'Betriebssystem', 'Konnektivität', 'Wasserschutz', 'Garantie',
        'display', 'camera', 'battery', 'storage', 'processor', 'weight', 'screen',
        'Akkulaufzeit', 'Auflösung', 'Größe'];

      // Look for table rows or definition lists
      document.querySelectorAll('tr, dl, dt, dd, [class*="spec"], [class*="Spec"], [class*="feature"], [class*="Feature"]').forEach(el => {
        const text = el.textContent.trim();
        specHeaders.forEach(h => {
          if (text.toLowerCase().includes(h.toLowerCase())) {
            specs[h] = text;
          }
        });
      });

      // Extract all text content for later processing
      const fullText = document.body.innerText.substring(0, 10000);

      return {
        name, description, title, images: images.slice(0, 10), priceTexts,
        priceMatches: priceMatches.slice(0, 5), specs, fullText
      };
    });

    return { url, ...product, scrapedAt: new Date().toISOString() };
  } catch (err) {
    console.error(`Error scraping ${url}: ${err.message}`);
    return { url, error: err.message, scrapedAt: new Date().toISOString() };
  }
}

async function scrapeO2Products() {
  console.log('Starting o2online.de product scraping...');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();
  const allProducts = [];

  for (const url of PRODUCT_URLS) {
    const product = await scrapeProduct(page, url);
    allProducts.push(product);
    console.log(`  → ${product.name || 'NO NAME'} (${product.images?.length || 0} images)`);
  }

  // Save raw scraped data
  const outputPath = path.join(__dirname, 'o2-scraped-products.json');
  fs.writeFileSync(outputPath, JSON.stringify(allProducts, null, 2));
  console.log(`\nSaved ${allProducts.length} products to ${outputPath}`);

  await browser.close();
  return allProducts;
}

scrapeO2Products().catch(console.error);
