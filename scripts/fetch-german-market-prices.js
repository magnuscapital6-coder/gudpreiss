/**
 * Look up current German market prices on billiger.de for catalog products.
 *
 * AMSI products were imported with Ivory Coast retail prices (FCFA converted to
 * EUR), often copied onto several unrelated products (e.g. a printer, a phone
 * and a laptop all at 1036.65 € = 680 000 FCFA). This script searches each
 * product on billiger.de and keeps the lowest offer whose title contains the
 * product's model identifiers.
 *
 * Usage: node scripts/fetch-german-market-prices.js <products.json> [--out scripts/market-prices.json]
 *   products.json: [{ sku, name, price }]
 * Output: [{ sku, name, old, neuf, matches, sample, confidence }]
 */

const fs = require('fs');

const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const DELAY_MS = 2500;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Offers for these are accessories/consumables, never the device itself.
// No trailing \b: German compounds ("Schutzfolie", "Tonerkartusche") must match too.
const ACCESSORY_RE =
  /\b(toner|tinte|patrone|druckkopf|hülle|huelle|case\b|cover|schutzfolie|displayschutz|panzerglas|folie|kabel|adapter|ladeger|netzteil|ersatzteil|ersatz|unterteil|tastatur\b|scharnier|halterung|tasche|sleeve|trommel|aufkleber|sticker|skin\b|ohrpolster|armband)/i;

// A listing naming a variant the product doesn't have is another device
// ("Honor 400 Smart 5G" is not the "Honor 400 5G").
const VARIANT_WORDS = ['smart', 'lite', 'ultra', 'plus', 'pro', 'max', 'mini', 'fe', 'neo', 'se', 'air', 'x360', 'flip', 'outdoor'];

// A price counts as the market "from" price only if another shop lists the
// product within this margin: a lone 599 € listing for a phone whose other
// offers sit at 1490 € is not a market price. (A median filter was tried and
// rejected: listings dominated by bundles pushed out the base price.)
const CORROBORATION_MARGIN = 0.15;

function pickMarketPrice(sortedPrices) {
  for (let i = 0; i < sortedPrices.length; i += 1) {
    const p = sortedPrices[i];
    const corroborated = sortedPrices.some((q, j) => j !== i && Math.abs(q - p) <= p * CORROBORATION_MARGIN);
    if (corroborated) return { price: p, corroborated: true };
  }
  return { price: sortedPrices[0] ?? null, corroborated: false };
}

// Accept an offer only within this ratio of the imported price. The imported
// Ivorian price is the right order of magnitude; this rejects accessories
// (a 9 € screen protector for a phone) and unrelated bundles.
const MIN_RATIO = 0.3;
const MAX_RATIO = 2.2;

// French/marketing words from the AMSI names that hurt the search.
const NOISE_RE =
  /\b(pouces?|pouce|gris|noir|blanc|argent|bleu|vert|rose|or|avec|et|de|la|le|les|pour|go|to|:|beamer|\d+th|gen|core|serveur)\b/gi;

function cleanQuery(name) {
  return name
    .replace(/&quot;/g, '"')
    .replace(/["“”|,()]/g, ' ')
    .replace(NOISE_RE, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .slice(0, 7)
    .join(' ');
}

// Tokens that identify the model: anything with a digit (MF664Cdw, 460, G11, 15)
// plus the brand (first word).
function modelTokens(name) {
  const words = cleanQuery(name).toLowerCase().split(' ').filter(Boolean);
  const brand = words[0];
  // Network/marketing suffixes and Core Ultra shorthands ("U7") are often missing
  // from listing titles. Intel "i5"/"i7" stay required: they set the price tier.
  const optional = /^([um]\d|[45]g|wi-fi|wifi|ai|nas)$/;
  const ids = words.slice(1).filter((w) => w.length >= 1 && !optional.test(w));
  return { brand, ids, words };
}

function parseOffers(html) {
  const offers = [];
  const titleRe = /class="line-clamp-2[^"]*font-bold[^"]*">\s*([^<]{3,220}?)\s*<\/span>/g;
  const titles = [...html.matchAll(titleRe)].map((m) => ({ title: m[1].trim(), at: m.index }));
  for (let i = 0; i < titles.length; i += 1) {
    const end = i + 1 < titles.length ? titles[i + 1].at : titles[i].at + 4000;
    const block = html.slice(titles[i].at, end);
    // Aggregated product cards prefix the lowest price with "ab".
    const price = block.match(/data-price>\s*(?:<span[^>]*>\s*ab\s*<\/span>\s*)?([0-9.]+,[0-9]{2})\s*€/);
    if (!price) continue;
    offers.push({ title: titles[i].title, price: parseFloat(price[1].replace(/\./g, '').replace(',', '.')) });
  }
  return offers;
}

function matchOffers(name, offers, importedPrice) {
  const { brand, ids, words } = modelTokens(name);
  return offers.filter((o) => {
    if (o.price < importedPrice * MIN_RATIO || o.price > importedPrice * MAX_RATIO) return false;
    if (ACCESSORY_RE.test(o.title)) return false;
    // Storage bundles ("DS423+ 8 TB (2 x 4 TB)") are not the bare device.
    if (/\b\d+\s?TB\b/i.test(o.title) && !/\b\d+\s?(TB|To)\b/i.test(name)) return false;

    const t = o.title.toLowerCase().replace(/[-_/()]/g, ' ');
    const compact = t.replace(/\s+/g, '');
    const titleWords = new Set(t.split(/\s+/));
    if (brand && !compact.includes(brand.replace(/-/g, ''))) return false;

    // Every identifying word of the product name must appear (spacing-insensitive).
    if (!ids.every((id) => compact.includes(id.replace(/-/g, '')))) return false;

    // Reject listings for a different variant of the same line.
    return !VARIANT_WORDS.some((v) => titleWords.has(v) && !words.includes(v));
  });
}

(async () => {
  const input = process.argv[2];
  const outIdx = process.argv.indexOf('--out');
  const outFile = outIdx > -1 ? process.argv[outIdx + 1] : 'scripts/market-prices.json';
  const products = JSON.parse(fs.readFileSync(input, 'utf8'));

  const results = [];
  for (const product of products) {
    const query = cleanQuery(product.name);
    const url = `https://www.billiger.de/search?searchstring=${encodeURIComponent(query)}`;
    let offers = [];
    try {
      const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'de-DE,de;q=0.9' } });
      if (res.ok) offers = parseOffers(await res.text());
      else console.warn(`HTTP ${res.status} pour ${product.name}`);
    } catch (err) {
      console.warn(`erreur ${product.name}: ${err.message}`);
    }

    const matches = matchOffers(product.name, offers, Number(product.price));
    const prices = matches.map((m) => m.price).sort((a, b) => a - b);
    // Strict matching keeps only the product itself, so the lowest corroborated
    // offer is the market "from" price (higher ones are bundles or pricier configs).
    const { price: neuf, corroborated } = pickMarketPrice(prices);
    const confidence = corroborated ? 'haute' : prices.length > 0 ? 'moyenne' : 'aucune';

    results.push({
      sku: product.sku,
      name: product.name,
      old: product.price,
      neuf,
      matches: prices.length,
      sample: matches.slice(0, 2).map((m) => `${m.price} € ${m.title.slice(0, 60)}`),
      query,
      confidence,
    });
    console.log(
      `${confidence.padEnd(8)} ${String(product.price).padStart(8)} -> ${String(neuf ?? '-').padStart(8)}  (${prices.length})  ${product.name.slice(0, 50)}`
    );
    await sleep(DELAY_MS);
  }

  fs.writeFileSync(outFile, JSON.stringify(results, null, 2));
  const found = results.filter((r) => r.neuf !== null).length;
  console.log(`\n${found}/${results.length} prix trouves -> ${outFile}`);
})();
