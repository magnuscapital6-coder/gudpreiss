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
      res.on('end', () => resolve({ data, statusCode: res.statusCode }));
    });
    req.on('error', reject);
  });
}

async function checkAmsi() {
  console.log('Testing amsi.ci WooCommerce Store API...');
  try {
    const res = await fetchUrl('https://amsi.ci/wp-json/wc/store/v1/products?per_page=100');
    console.log(`Store API Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
      const prods = JSON.parse(res.data);
      console.log(`Fetched ${prods.length} products from amsi.ci Store API!`);
      fs.writeFileSync('scripts/amsi-store-products.json', JSON.stringify(prods, null, 2));
      return;
    }
  } catch (e) {
    console.log('Store API error:', e.message);
  }

  console.log('Testing amsi.ci WP-JSON V2...');
  try {
    const res = await fetchUrl('https://amsi.ci/wp-json/wp/v2/product?per_page=100');
    console.log(`WP V2 Status: ${res.statusCode}`);
    if (res.statusCode === 200) {
      const prods = JSON.parse(res.data);
      console.log(`Fetched ${prods.length} products from WP V2!`);
      fs.writeFileSync('scripts/amsi-v2-products.json', JSON.stringify(prods, null, 2));
      return;
    }
  } catch (e) {
    console.log('WP V2 error:', e.message);
  }

  console.log('Testing Sitemap index...');
  try {
    const res = await fetchUrl('https://amsi.ci/sitemap_index.xml');
    console.log('Sitemap status:', res.statusCode, res.data.substring(0, 300));
  } catch (e) {
    console.log('Sitemap error:', e.message);
  }
}

checkAmsi();
