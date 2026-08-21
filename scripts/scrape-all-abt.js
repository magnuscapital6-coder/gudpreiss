const https = require('https');
const fs = require('fs');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ data, headers: res.headers, statusCode: res.statusCode }));
    });
    req.on('error', reject);
  });
}

async function scrapeAll() {
  let allProducts = [];
  let page = 1;
  let hasMore = true;

  console.log('Starting full scraper for abt-distribution.com...');

  while (hasMore) {
    console.log(`Fetching page ${page}...`);
    try {
      const url = `https://abt-distribution.com/wp-json/wc/store/v1/products?per_page=100&page=${page}`;
      const res = await fetchUrl(url);
      if (res.statusCode !== 200) {
        console.log(`Finished at page ${page} (Status: ${res.statusCode})`);
        hasMore = false;
        break;
      }
      const prods = JSON.parse(res.data);
      if (!Array.isArray(prods) || prods.length === 0) {
        hasMore = false;
        break;
      }
      allProducts = allProducts.concat(prods);
      console.log(`Page ${page}: Got ${prods.length} products. Total so far: ${allProducts.length}`);
      page++;
    } catch (e) {
      console.log(`Error on page ${page}:`, e.message);
      hasMore = false;
    }
  }

  console.log(`Scraped TOTAL of ${allProducts.length} products from abt-distribution.com!`);
  fs.writeFileSync('scripts/abt-all-products.json', JSON.stringify(allProducts, null, 2));

  // Also extract categories
  try {
    const catRes = await fetchUrl('https://abt-distribution.com/wp-json/wc/store/v1/products/categories?per_page=100');
    const cats = JSON.parse(catRes.data);
    fs.writeFileSync('scripts/abt-categories.json', JSON.stringify(cats, null, 2));
    console.log(`Scraped ${cats.length} categories!`);
  } catch(e) {
    console.log('Categories error:', e.message);
  }
}

scrapeAll();
