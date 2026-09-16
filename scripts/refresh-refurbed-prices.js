/**
 * Fetch current per-model prices from the Refurbed category listings.
 *
 * The original import (scrape-refurbed.js) read a single "ab X €" price from
 * each category page and applied it to every product of that category, so all
 * iPhones ended up at 117 €, all MacBooks at 129 €, and so on. This script
 * rebuilds a name -> price map from the listing cards themselves.
 *
 * Usage: node scripts/refresh-refurbed-prices.js [--out scripts/refurbed-prices.json]
 * Output: { fetchedAt, prices: [{ name, price, url }] }
 */

const fs = require('fs');
const path = require('path');

const CATEGORIES = [
  'iphones',
  'ipads',
  'macbooks',
  'laptops',
  'smartwatches',
];

const MAX_PAGES = 2;
const DELAY_MS = 1500;
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function unescapeHtml(raw) {
  return raw
    .replace(/\u003c/g, '<')
    .replace(/\u003e/g, '>')
    .replace(/\u0026/g, '&')
    .replace(/\\"/g, '"')
    .replace(/\n/g, '\n');
}

function parseCards(html) {
  const text = unescapeHtml(html);

  // Two card layouts exist: one carries the model in an `alt` attribute before
  // the marker (the alt value may itself contain a quote, e.g. `11"`), the
  // other puts it in the link text after it.
  const names = [];
  const marker = 'data-test="productcard-name"';
  let from = 0;
  for (;;) {
    const at = text.indexOf(marker, from);
    if (at === -1) break;
    from = at + marker.length;

    const before = text.slice(Math.max(0, at - 160), at);
    const alt = before.match(/alt="([\s\S]{3,90}?)"\s*$/);
    if (alt) {
      names.push(alt[1].trim());
      continue;
    }
    const link = text.slice(at, at + 600).match(/<a[^>]*>([\s\S]*?)<\/a>/);
    names.push(link ? link[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '');
  }

  const prices = [...text.matchAll(/data-test="product-price"[^>]*>\s*([0-9.]+,[0-9]{2})\s*€/g)].map((m) =>
    parseFloat(m[1].replace(/\./g, '').replace(',', '.'))
  );

  const cards = [];
  for (let i = 0; i < names.length; i += 1) {
    if (!names[i] || !Number.isFinite(prices[i])) continue;
    cards.push({ name: names[i], price: prices[i] });
  }
  return cards;
}

async function fetchPage(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'de-DE,de;q=0.9' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

(async () => {
  const outArg = process.argv.indexOf('--out');
  const outFile = outArg > -1 ? process.argv[outArg + 1] : 'scripts/refurbed-prices.json';

  const seen = new Map();

  for (const category of CATEGORIES) {
    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const url = `https://www.refurbed.de/c/${category}/${page > 1 ? `?page=${page}` : ''}`;
      let cards = [];
      try {
        cards = parseCards(await fetchPage(url));
      } catch (err) {
        console.warn(`[${category}] page ${page}: ${err.message}`);
        break;
      }

      const fresh = cards.filter((c) => !seen.has(c.name));
      for (const card of cards) if (!seen.has(card.name)) seen.set(card.name, card);
      console.log(`[${category}] page ${page}: ${cards.length} cartes, ${fresh.length} nouvelles`);

      if (!cards.length || !fresh.length) break;
      await sleep(DELAY_MS);
    }
  }

  const prices = [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify({ fetchedAt: new Date().toISOString(), prices }, null, 2));
  console.log(`\n${prices.length} modeles ecrits dans ${outFile}`);
})();
