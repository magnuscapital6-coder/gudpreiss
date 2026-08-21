const https = require('https');
const http = require('http');
const fs = require('fs');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
  });
}

async function run() {
  console.log('Testing WooCommerce Store API...');
  try {
    const storeApiData = await fetchUrl('https://abt-distribution.com/wp-json/wc/store/v1/products?per_page=100');
    const products = JSON.parse(storeApiData);
    console.log(`Fetched ${products.length} products from Store API!`);
    fs.writeFileSync('scripts/abt-store-products.json', JSON.stringify(products, null, 2));
    return;
  } catch (e) {
    console.log('Store API error:', e.message);
  }

  console.log('Testing Sitemaps...');
  try {
    const sitemapData = await fetchUrl('https://abt-distribution.com/sitemap_index.xml');
    console.log('Sitemap Index:', sitemapData.substring(0, 500));
  } catch (e) {
    console.log('Sitemap error:', e.message);
  }
}

run();
