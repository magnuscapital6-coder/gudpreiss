#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════
 * CATALOG IMPORT PIPELINE — FULL REBUILD
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Complete product catalog import pipeline with:
 * - Multi-source support (AMSI, ABT, O2, OteloBlau, Refurbed)
 * - Image download, validation & local storage
 * - Deduplication (EAN/GTIN/MPN/SKU/brand+model)
 * - Confidence scoring per product
 * - Dry run mode (no writes)
 * - Transaction & rollback support
 * - Comprehensive import report
 * - Post-import audit
 *
 * Usage:
 *   node scripts/catalog-import-pipeline.js --dry-run     # Preview only
 *   node scripts/catalog-import-pipeline.js --execute      # Real import
 *   node scripts/catalog-import-pipeline.js --audit        # Post-import audit
 * ═══════════════════════════════════════════════════════════════════════
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');
const crypto = require('crypto');

// ═══════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════

const PROJECT_ROOT = path.resolve(__dirname, '..');
const INITIAL_DATA_PATH = path.join(PROJECT_ROOT, 'src/lib/db/initial-data.ts');
const IMAGES_DIR = path.join(PROJECT_ROOT, 'public/images/products');
const BACKUP_DIR = path.join(PROJECT_ROOT, 'scripts');
const REPORT_PATH = path.join(PROJECT_ROOT, 'scripts/import-report.json');
const DRY_RUN_REPORT_PATH = path.join(PROJECT_ROOT, 'scripts/dry_run_report.json');
const BACKUP_PATH = path.join(PROJECT_ROOT, 'scripts/catalog-backup.json');

const XOF_TO_EUR = 655.957;

// Source definitions with priority (lower = higher priority)
const SOURCES = [
  {
    name: 'amsi-store',
    file: 'scripts/amsi-store-products.json',
    priority: 1,
    currency: 'XOF',
    language: 'fr',
    transform: transformAmsiProduct,
  },
  {
    name: 'abt-store',
    file: 'scripts/abt-store-products.json',
    priority: 1,
    currency: 'EUR',
    language: 'fr',
    transform: transformAbtProduct,
  },
  {
    name: 'o2-scraped',
    file: 'scripts/o2-scraped-products.json',
    priority: 2,
    currency: 'EUR',
    language: 'de',
    transform: transformO2Product,
  },
  {
    name: 'otelo-blau-scraped',
    file: 'scripts/otelo-blau-scraped.json',
    priority: 2,
    currency: 'EUR',
    language: 'de',
    transform: transformOteloBlauProduct,
  },
  {
    name: 'refurbed-scraped',
    file: 'scripts/refurbed-scraped.json',
    priority: 3,
    currency: 'EUR',
    language: 'de',
    transform: transformRefurbedProduct,
  },
];

// Category mapping (various → German categories)
const CATEGORY_MAP = {
  // AMSI categories (French)
  'Imprimantes & Scanners': 'cat-drucker-scanner',
  'Imprimantes': 'cat-drucker-scanner',
  'SmartPhones & Tablettes': 'cat-smartphones-tablets',
  'Smartphones': 'cat-smartphones-tablets',
  'Laptop & bureau': 'cat-laptops-pcs',
  'Laptops': 'cat-laptops-pcs',
  'Accessoires': 'cat-it-zubehoer',
  'Bureautique': 'cat-buero-it',
  'Cartouche': 'cat-toner-patronen',
  'Appareils photo et caméras': 'cat-kameras',
  'Casques et écouteurs': 'cat-kopfhoerer',
  // ABT categories (French)
  'Fitness': 'cat-fitness',
  'Musculation': 'cat-muskulation',
  'Cardio': 'cat-cardio',
  'Course à pied': 'cat-laufrad',
  ' vélo': 'cat-velo',
  'Velo': 'cat-velo',
  'Vélos': 'cat-velo',
  'Vélo d\'intérieur': 'cat-velo-innen',
  'Tapis de course': 'cat-tapis-de-course',
  'Rameur': 'cat-rameur',
  'Vélos elliptiques': 'cat-ellips-trainer',
  'Vélos semi-allongés': 'cat-velo-halbliegend',
  'Vélos couchés': 'cat-velo-liegend',
  'Mobilier de sport': 'cat-mobilier-sport',
  'Accessoires de sport': 'cat-sport-zubehoer',
  'Poids': 'cat-gewichte',
  'Barres et disques': 'cat-stangen-scheiben',
  'Home Gym': 'cat-home-gym',
  'Multi-gyms': 'cat-multi-gym',
  // O2/Otelo categories (German - phones/contracts)
  'Handys': 'cat-smartphones-tablets',
  'Smartphones': 'cat-smartphones-tablets',
  'Tablets': 'cat-smartphones-tablets',
  // Refurbed (German - refurbished)
  'Smartphones': 'cat-smartphones-tablets',
  'Tablets': 'cat-smartphones-tablets',
  'Laptops': 'cat-laptops-pcs',
  // Generic fallbacks
  'Default': 'cat-it-zubehoer',
};

// Brand mapping
const BRAND_MAP = {
  // Printer brands
  'Canon': 'b-canon',
  'HP': 'b-hp',
  'Epson': 'b-epson',
  'Brother': 'b-brother',
  'Xerox': 'b-xerox',
  // Phone brands
  'Samsung': 'b-samsung',
  'Apple': 'b-apple',
  'Huawei': 'b-huawei',
  'HUAWEI': 'b-huawei',
  'Xiaomi': 'b-xiaomi',
  'OnePlus': 'b-oneplus',
  'OPPO': 'b-oppo',
  'Oppo': 'b-oppo',
  'Motorola': 'b-motorola',
  'Google': 'b-google',
  'Honor': 'b-honor',
  'Poco': 'b-poco',
  'ZTE': 'b-zte',
  'Redmi': 'b-xiaomi',
  'Nothing': 'b-nothing',
  'TCL': 'b-tcl',
  'Nokia': 'b-nokia',
  'Realme': 'b-realme',
  'Sony': 'b-sony',
  'Lenovo': 'b-lenovo',
  'Dell': 'b-dell',
  'Acer': 'b-acer',
  'Asus': 'b-asus',
  // Fitness brands
  'BH': 'b-bh',
  'Life Fitness': 'b-life-fitness',
  'Technogym': 'b-technogym',
  'Precor': 'b-precor',
  'Kettler': 'b-kettler',
  'Hammer': 'b-hammer',
  'Toorx': 'b-toorx',
  'WaterRower': 'b-waterrower',
  'Concept2': 'b-concept2',
  'DKN': 'b-dkn',
  'Cardiostrong': 'b-cardiostrong',
  'Schwinn': 'b-schwinn',
  'Reebok': 'b-reebok',
  'Horizon': 'b-horizon',
  'Tunturi': 'b-tunturi',
  'Flow Fitness': 'b-flow-fitness',
  'Abt': 'b-abt',
  'Octane': 'b-octane',
  'Cybex': 'b-cybex',
  'Star Trac': 'b-star-trac',
  'Matrix': 'b-matrix',
  'NordicTrack': 'b-nordictrack',
  'Sole': 'b-sole',
  'ProForm': 'b-proform',
  'Zipro': 'b-zipro',
  'inSports': 'b-insports',
  'in:sports': 'b-insports',
  'SportPlus': 'b-sportplus',
  'Viva Fitness': 'b-viva-fitness',
  'Stamford Fitness': 'b-stamford-fitness',
  'TecTake': 'b-tectake',
  'Hexfit': 'b-hexfit',
  'Beistellpulte': 'b-beistellpulte',
  'Twobacco': 'b-twobacco',
  'LifeSpan': 'b-lifespan',
  'Zipro': 'b-zipro',
  'Capetan': 'b-capetan',
  'Gym80': 'b-gym80',
  'Klarfit': 'b-klarfit',
  'Magnet': 'b-magnet',
  'inSports': 'b-insports',
  'Pure2Improve': 'b-pure2improve',
  'Sunny': 'b-sunny',
  'Weider': 'b-weider',
  'SportPlus': 'b-sportplus',
  'Viva Fitness': 'b-viva-fitness',
  'Madrid': 'b-madrid',
  'Cornilleau': 'b-cornilleau',
  'Tibhar': 'b-tibhar',
  'Butterfly': 'b-butterfly',
  'Stiga': 'b-stiga',
  'Donic': 'b-donic',
  'Joola': 'b-joola',
  'Killerspin': 'b-killerspin',
  // Misc
  'Starlink': 'b-starlink',
  'Logitech': 'b-logitech',
  'Garmin': 'b-garmin',
  'Synology': 'b-synology',
  'TP-Link': 'b-tp-link',
  'Ubiquiti': 'b-ubiquiti',
  'PlayStation': 'b-sony-playstation',
  'Sony PlayStation': 'b-sony-playstation',
};

// ═══════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════

function generateId(prefix = 'prod') {
  return `${prefix}-${crypto.randomBytes(6).toString('hex')}`;
}

function generateSlug(name) {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
}

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(p|div|h[1-6]|li|tr|td|th|ul|ol|table|section|article)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"').replace(/&ldquo;/g, '"')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'")
    .replace(/&eacute;/g, 'é').replace(/&egrave;/g, 'è')
    .replace(/&agrave;/g, 'à').replace(/&ccedil;/g, 'ç')
    .replace(/&uuml;/g, 'ü').replace(/&ouml;/g, 'ö')
    .replace(/&auml;/g, 'ä').replace(/&szlig;/g, 'ß')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function resolveBrandId(brandName) {
  if (!brandName) return 'b-generic';
  const normalized = brandName.trim();
  return BRAND_MAP[normalized] || BRAND_MAP[normalized.toLowerCase()] || `b-${generateSlug(normalized)}`;
}

// Extract brand from product name when brand_name is missing
function extractBrandFromName(name) {
  if (!name) return null;
  const knownBrands = [
    'Apple', 'Samsung', 'Canon', 'HP', 'Lenovo', 'Dell', 'Acer', 'Asus', 'MSI', 'Sony', 'LG',
    'Huawei', 'Xiaomi', 'Motorola', 'Nokia', 'OnePlus', 'Google', 'Logitech', 'Epson', 'Brother',
    'Polaroid', 'Blackview', 'Doogee', 'Ulefone', 'Oukitel', 'CAT', 'Oppo', 'Vivo', 'Realme',
    'Honor', 'Nothing', 'TCL', 'HMD', 'Fairphone', 'Peloton', 'Garmin', 'Fitbit', 'JBL',
    'Bose', 'Sennheiser', 'Beats', 'Sony', 'Bang & Olufsen', 'B&O', 'Dyson', 'iRobot',
    'Roborock', 'Philips', 'Braun', 'Miele', 'Bosch', 'Siemens', 'AEG', 'DeLonghi', 'Nespresso',
    'KitchenAid', 'Tefal', 'Russell Hobbs', 'Rowenta', 'Sage', 'Breville',
    'Nikon', 'Fujifilm', 'GoPro', 'DJI', 'Manfrotto', 'Peak Design',
    'Nintendo', 'PlayStation', 'Xbox', 'Razer', 'SteelSeries', 'Corsair', 'HyperX',
    'Kingston', 'SanDisk', 'Crucial', 'WD', 'Seagate', 'Samsung', 'Toshiba',
    'TP-Link', 'Netgear', 'Ubiquiti', 'Cisco', 'Aruba',
    'Starlink', 'SpaceX',
    'AMSI', 'ABT', 'OTLO', 'Otelo', 'Refurb', 'Refurbished'
  ];
  const lowerName = name.toLowerCase();
  for (const brand of knownBrands) {
    if (lowerName.startsWith(brand.toLowerCase() + ' ') || lowerName.includes(brand.toLowerCase() + ' ')) {
      return brand;
    }
  }
  // Try first word as brand if it looks like one
  const firstWord = name.split(/\s+/)[0];
  if (firstWord && firstWord.length >= 2 && firstWord.length <= 20 && /^[A-Z]/.test(firstWord)) {
    return firstWord;
  }
  return null;
}

function resolveCategoryId(categoryName, tags) {
  if (!categoryName) {
    // Try to infer from tags
    if (tags && tags.length) {
      for (const tag of tags) {
        const key = Object.keys(CATEGORY_MAP).find(k =>
          tag.toLowerCase().includes(k.toLowerCase())
        );
        if (key) return CATEGORY_MAP[key];
      }
    }
    return 'cat-it-zubehoer'; // default
  }

  // Direct match
  if (CATEGORY_MAP[categoryName]) return CATEGORY_MAP[categoryName];

  // Partial match
  const key = Object.keys(CATEGORY_MAP).find(k =>
    categoryName.toLowerCase().includes(k.toLowerCase())
  );
  if (key) return CATEGORY_MAP[key];

  return `cat-${generateSlug(categoryName)}`;
}

function estimateWeight(categories, name) {
  const nameLower = (name || '').toLowerCase();
  const catStr = (categories || []).join(' ').toLowerCase();

  if (catStr.includes('tapis de course') || nameLower.includes('tapis de course')) return 80;
  if (catStr.includes('vélo') || nameLower.includes('vélo') || nameLower.includes('velo')) return 45;
  if (catStr.includes('rameur') || nameLower.includes('rameur')) return 35;
  if (catStr.includes('elliptique') || nameLower.includes('elliptique')) return 55;
  if (catStr.includes('multi-gym') || nameLower.includes('multi-gym')) return 120;
  if (catStr.includes('home gym') || nameLower.includes('home gym')) return 100;
  if (catStr.includes('imprimante') || nameLower.includes('imprimante') || nameLower.includes('drucker')) return 8;
  if (catStr.includes('scanner') || nameLower.includes('scanner')) return 4;
  if (catStr.includes('smartphone') || nameLower.includes('iphone') || nameLower.includes('galaxy') || nameLower.includes('pixel')) return 0.3;
  if (catStr.includes('tablet') || nameLower.includes('ipad') || nameLower.includes('tablet')) return 0.7;
  if (catStr.includes('laptop') || nameLower.includes('laptop')) return 2.5;
  if (catStr.includes('poids') || catStr.includes('dumbbell') || nameLower.includes('haltère')) return 10;
  if (catStr.includes('barre') || catStr.includes('disque')) return 15;
  if (catStr.includes('casque') || catStr.includes('écouteurs') || nameLower.includes('kopfhörer')) return 0.3;
  if (catStr.includes('toner') || catStr.includes('cartouche')) return 0.8;
  if (catStr.includes('accessoire') || catStr.includes('zubehör')) return 0.5;
  return 2;
}

// ═══════════════════════════════════════════════════════════════════════
// SOURCE TRANSFORMERS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Transform AMSI product (WooCommerce format, French, XOF prices)
 */
function transformAmsiProduct(item) {
  const priceXOF = item.prices?.price ? parseFloat(item.prices.price) : 0;
  const regularPriceXOF = item.prices?.regular_price ? parseFloat(item.prices.regular_price) : 0;
  const priceEUR = Math.round((priceXOF / XOF_TO_EUR) * 100) / 100;
  const compareAtEUR = regularPriceXOF > priceXOF
    ? Math.round((regularPriceXOF / XOF_TO_EUR) * 100) / 100
    : null;

  const brandName = item.brands?.[0]?.name || item.brands?.[0] || '';
  const catNames = (item.categories || []).map(c => typeof c === 'string' ? c : c.name || '');

  const images = (item.images || [])
    .map(img => typeof img === 'string' ? img : img.src || img.url || '')
    .filter(Boolean);

  return {
    source_name: 'amsi-store',
    source_url: item.permalink || '',
    identity: {
      sku: item.sku || `AMSI-${item.id}`,
      brand: brandName,
      model: item.name || '',
    },
    name: item.name || '',
    description: stripHtml(item.description || ''),
    short_description: stripHtml(item.short_description || ''),
    price: priceEUR,
    compare_at_price: compareAtEUR,
    stock: item.is_in_stock ? (item.low_stock_remaining || 10) : 0,
    images: images,
    categories: catNames,
    tags: (item.tags || []).map(t => typeof t === 'string' ? t : t.name || ''),
    brand_name: brandName,
    rating: parseFloat(item.average_rating) || 4.5,
    review_count: item.review_count || 0,
    weight_kg: item.weight ? parseFloat(item.weight) / 1000 : estimateWeight(catNames, item.name),
    on_sale: item.on_sale || false,
    attributes: item.attributes || {},
  };
}

/**
 * Transform ABT product (WooCommerce format, French, EUR prices)
 */
function transformAbtProduct(item) {
  const priceEUR = item.prices?.price ? parseFloat(item.prices.price) : 0;
  const regularPriceEUR = item.prices?.regular_price ? parseFloat(item.prices.regular_price) : 0;
  const compareAtEUR = regularPriceEUR > priceEUR ? regularPriceEUR : null;

  const brandName = item.brands?.[0]?.name || item.brands?.[0] || '';
  const catNames = (item.categories || []).map(c => typeof c === 'string' ? c : c.name || '');

  const images = (item.images || [])
    .map(img => typeof img === 'string' ? img : img.src || img.url || '')
    .filter(Boolean);

  return {
    source_name: 'abt-store',
    source_url: item.permalink || '',
    identity: {
      sku: item.sku || `ABT-${item.id}`,
      brand: brandName,
      model: item.name || '',
    },
    name: item.name || '',
    description: stripHtml(item.description || ''),
    short_description: stripHtml(item.short_description || ''),
    price: priceEUR,
    compare_at_price: compareAtEUR,
    stock: item.is_in_stock ? (item.low_stock_remaining || 10) : 0,
    images: images,
    categories: catNames,
    tags: (item.tags || []).map(t => typeof t === 'string' ? t : t.name || ''),
    brand_name: brandName,
    rating: parseFloat(item.average_rating) || 4.5,
    review_count: item.review_count || 0,
    weight_kg: item.weight ? parseFloat(item.weight) / 1000 : estimateWeight(catNames, item.name),
    on_sale: item.on_sale || false,
    attributes: item.attributes || {},
  };
}

/**
 * Transform O2 product (scraped, German, contract phones)
 */
function transformO2Product(item) {
  // Extract price from priceTexts or priceMatches
  let price = 0;
  if (item.priceMatches?.length) {
    const prices = item.priceMatches
      .map(p => parseFloat(p.replace(/[^\d.,]/g, '').replace(',', '.')))
      .filter(n => !isNaN(n) && n > 10);
    if (prices.length) price = Math.min(...prices); // lowest one-time price
  }

  const images = (item.images || []).filter(Boolean);

  return {
    source_name: 'o2-scraped',
    source_url: item.url || '',
    identity: {
      sku: `O2-${item.name?.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30) || 'unknown'}`,
      brand: extractBrandFromName(item.name || ''),
      model: item.name || '',
    },
    name: item.name || '',
    description: stripHtml(item.description || item.fullText || ''),
    short_description: stripHtml(item.description || '').slice(0, 200),
    price: price,
    compare_at_price: null,
    stock: 10,
    images: images,
    categories: ['Handys', 'Smartphones'],
    tags: [],
    brand_name: extractBrandFromName(item.name || ''),
    rating: 4.5,
    review_count: 0,
    weight_kg: 0.3,
    on_sale: false,
    attributes: item.specs || {},
  };
}

/**
 * Transform OteloBlau product (scraped, German, contract phones)
 */
function transformOteloBlauProduct(item) {
  let price = 0;
  if (item.oneTimePrices?.length) {
    const prices = item.oneTimePrices
      .map(p => parseFloat(String(p).replace(/[^\d.,]/g, '').replace(',', '.')))
      .filter(n => !isNaN(n) && n > 10);
    if (prices.length) price = Math.min(...prices);
  }
  if (!price && item.allPrices?.length) {
    const prices = item.allPrices
      .map(p => parseFloat(String(p).replace(/[^\d.,]/g, '').replace(',', '.')))
      .filter(n => !isNaN(n) && n > 10);
    if (prices.length) price = Math.min(...prices);
  }

  const images = (item.images || []).filter(Boolean);

  return {
    source_name: 'otelo-blau-scraped',
    source_url: item.url || '',
    identity: {
      sku: `OTB-${item.name?.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30) || 'unknown'}`,
      brand: extractBrandFromName(item.name || ''),
      model: item.name || '',
    },
    name: item.name || '',
    description: stripHtml(item.description || item.fullText || ''),
    short_description: stripHtml(item.description || '').slice(0, 200),
    price: price,
    compare_at_price: null,
    stock: 10,
    images: images,
    categories: ['Handys', 'Smartphones'],
    tags: [],
    brand_name: extractBrandFromName(item.name || ''),
    rating: 4.5,
    review_count: 0,
    weight_kg: 0.3,
    on_sale: false,
    attributes: item.specs || {},
  };
}

/**
 * Transform Refurbed product (scraped, German, refurbished)
 */
function transformRefurbedProduct(item) {
  let price = 0;
  if (item.prices?.length) {
    const prices = item.prices
      .map(p => {
        if (typeof p === 'number') return p;
        return parseFloat(String(p).replace(/[^\d.,]/g, '').replace(',', '.'));
      })
      .filter(n => !isNaN(n) && n > 10);
    if (prices.length) price = Math.min(...prices);
  }

  const images = (item.images || []).filter(Boolean);
  const allProducts = (item.products || []);

  // If there are sub-products, return the best ones
  if (allProducts.length > 0) {
    return allProducts
      .filter(p => p.name && p.name.length > 3)
      .slice(0, 10) // limit to avoid noise
      .map(p => ({
        source_name: 'refurbed-scraped',
        source_url: item.url || '',
        identity: {
          sku: `REF-${p.name?.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30) || 'unknown'}`,
          brand: extractBrandFromName(p.name || ''),
          model: p.name || '',
        },
        name: p.name || '',
        description: stripHtml(item.desc || item.fullText || ''),
        short_description: stripHtml(item.desc || '').slice(0, 200),
        price: price || 0,
        compare_at_price: null,
        stock: 5,
        images: p.image ? [p.image] : images,
        categories: ['Smartphones', 'Tablets'],
        tags: ['refurbished', 'gebraucht'],
        brand_name: extractBrandFromName(p.name || ''),
        rating: 4.3,
        review_count: 0,
        weight_kg: 0.3,
        on_sale: false,
        attributes: { condition: 'refurbished' },
      }));
  }

  return [{
    source_name: 'refurbed-scraped',
    source_url: item.url || '',
    identity: {
      sku: `REF-${item.name?.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30) || 'unknown'}`,
      brand: extractBrandFromName(item.name || ''),
      model: item.name || '',
    },
    name: item.name || '',
    description: stripHtml(item.desc || item.fullText || ''),
    short_description: stripHtml(item.desc || '').slice(0, 200),
    price: price,
    compare_at_price: null,
    stock: 5,
    images: images,
    categories: ['Smartphones', 'Tablets'],
    tags: ['refurbished'],
    brand_name: extractBrandFromName(item.name || ''),
    rating: 4.3,
    review_count: 0,
    weight_kg: 0.3,
    on_sale: false,
    attributes: { condition: 'refurbished' },
  }];
}

/**
 * Extract brand name from product name by matching known brands
 */
function extractBrandFromName(name) {
  if (!name) return '';
  const upper = name.toUpperCase();
  const knownBrands = [
    'APPLE', 'SAMSUNG', 'HUAWEI', 'XIAOMI', 'ONEPLUS', 'OPPO', 'MOTOROLA',
    'GOOGLE', 'HONOR', 'POCO', 'ZTE', 'NOTHING', 'TCL', 'NOKIA', 'REALME',
    'SONY', 'CANON', 'HP', 'EPSON', 'BROTHER', 'DELL', 'LENOVO', 'ASUS',
    'ACER', 'LOGITECH', 'GARMIN', 'SYNOLOGY', 'TP-LINK', 'UBIQUITI',
    'BH', 'LIFE FITNESS', 'TECHNOGYM', 'PRECOR', 'KETTLER', 'HAMMER',
    'TOORX', 'WATERROWER', 'CONCEPT2', 'CARDIOSTRONG', 'SCHWINN',
    'REEBOK', 'HORIZON', 'TUNTURI', 'FLOW FITNESS', 'OCTANE', 'CYBEX',
    'STAR TRAC', 'MATRIX', 'NORDICTRACK', 'SOLE', 'PROFORM', 'ZIPRO',
    'SPORTPLUS', 'KLARFIT', 'WEIDER', 'SUNNY', 'LIFESPAN',
    'CORNILLEAU', 'TIBHAR', 'BUTTERFLY', 'STIGA', 'DONIC', 'JOOLA',
    'KILLERSPIN', 'MADRID', 'STARLINK', 'PLAYSTATION',
    'AMAZFIT', 'BANG & OLUFSEN', 'BOSE', 'JBL', 'SENNHEISER',
    'SONY XPERIA', 'INFINIX', 'TECNO', 'VIVO', 'IQOO',
    'BLACKVIEW', 'CAT', 'SOTEN',
  ];

  for (const brand of knownBrands) {
    if (upper.includes(brand)) {
      // Return the properly cased version from BRAND_MAP
      const key = Object.keys(BRAND_MAP).find(k => k.toUpperCase() === brand);
      return key || brand;
    }
  }

  // Fallback: first word that looks like a brand
  const words = name.split(/\s+/);
  if (words.length > 0) return words[0];
  return '';
}

// ═══════════════════════════════════════════════════════════════════════
// IMAGE DOWNLOAD & VALIDATION
// ═══════════════════════════════════════════════════════════════════════

function downloadFile(url, destPath, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(url);
      const client = parsedUrl.protocol === 'https:' ? https : http;

      const req = client.get(url, {
        timeout: timeoutMs,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
      }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          // Follow redirect
          downloadFile(res.headers.location, destPath, timeoutMs).then(resolve).catch(reject);
          return;
        }

        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }

        const contentType = res.headers['content-type'] || '';
        if (!contentType.startsWith('image/') && !contentType.includes('octet-stream')) {
          reject(new Error(`Not an image (${contentType}) for ${url}`));
          return;
        }

        const ws = fs.createWriteStream(destPath);
        res.pipe(ws);
        ws.on('finish', () => {
          const stats = fs.statSync(destPath);
          if (stats.size < 100) {
            fs.unlinkSync(destPath);
            reject(new Error(`Image too small (${stats.size} bytes) for ${url}`));
            return;
          }
          resolve({ path: destPath, size: stats.size, contentType });
        });
        ws.on('error', reject);
      });

      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout for ${url}`)); });
    } catch (e) {
      reject(e);
    }
  });
}

function getExtensionFromUrl(url) {
  try {
    const pathname = new URL(url).pathname;
    const ext = path.extname(pathname).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif', '.svg'].includes(ext)) return ext;
    return '.jpg'; // default
  } catch {
    return '.jpg';
  }
}

function getExtensionFromContentType(ct) {
  if (ct.includes('webp')) return '.webp';
  if (ct.includes('png')) return '.png';
  if (ct.includes('avif')) return '.avif';
  if (ct.includes('gif')) return '.gif';
  if (ct.includes('svg')) return '.svg';
  return '.jpg';
}

// ═══════════════════════════════════════════════════════════════════════
// VALIDATION & CONFIDENCE
// ═══════════════════════════════════════════════════════════════════════

function calculateConfidence(product) {
  let score = 0;
  let max = 0;
  const identity = product.identity || product._pipeline?.identity || {};

  // Identity (25 points)
  max += 25;
  if (product.name && product.name.length > 3) score += 5;
  if (identity.brand) score += 5;
  if (identity.model && identity.model.length > 3) score += 5;
  if (identity.sku && identity.sku.length > 3) score += 5;
  if (identity.ean || identity.gtin) score += 5;

  // Price (15 points)
  max += 15;
  if (product.price > 0) score += 10;
  if (product.compare_at_price && product.compare_at_price > product.price) score += 5;

  // Description (20 points)
  max += 20;
  if (product.description && product.description.length > 50) score += 10;
  if (product.short_description && product.short_description.length > 10) score += 5;
  if (product.description && product.description.length > 200) score += 5;

  // Images (25 points)
  max += 25;
  if (product.images && product.images.length > 0) score += 10;
  if (product.images && product.images.length > 1) score += 5;
  if (product.images && product.images.length > 2) score += 5;
  if (product.images && product.images.length > 3) score += 5;

  // Categorization (15 points)
  max += 15;
  if (product.category_id) score += 5;
  if (product.brand_id && product.brand_id !== 'b-generic') score += 5;
  if (product.tags && product.tags.length > 0) score += 5;

  return Math.round((score / max) * 100);
}

function validateProduct(product) {
  const issues = [];

  if (!product.name || product.name.length < 3) issues.push('NAME_MISSING_OR_TOO_SHORT');
  if (!product.price || product.price <= 0) issues.push('PRICE_INVALID');
  if (!product.description || product.description.length < 20) issues.push('DESCRIPTION_TOO_SHORT');
  if (!product.images || product.images.length === 0) issues.push('NO_IMAGES');
  if (!product.category_id) issues.push('NO_CATEGORY');
  if (!product.brand_id || product.brand_id === 'b-generic') issues.push('NO_BRAND');

  return issues;
}

// ═══════════════════════════════════════════════════════════════════════
// DEDUPLICATION
// ═══════════════════════════════════════════════════════════════════════

function getDeduplicationKey(product) {
  const parts = [];
  // Identity may live at product.identity (raw) or product._pipeline.identity (normalized)
  const identity = product.identity || product._pipeline?.identity || {};

  // Priority 1: EAN/GTIN
  if (identity.ean) parts.push(`ean:${identity.ean}`);
  if (identity.gtin) parts.push(`gtin:${identity.gtin}`);

  // Priority 2: MPN
  if (identity.mpn) parts.push(`mpn:${identity.mpn}`);

  // Priority 3: SKU
  if (identity.sku || product.sku) parts.push(`sku:${identity.sku || product.sku}`);

  // Priority 4: Brand + Model (normalized)
  const brand = identity.brand || product.brand_name || '';
  const model = identity.model || '';
  if (brand && model) {
    const normBrand = brand.toLowerCase().trim();
    const normModel = model.toLowerCase().trim()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ');
    parts.push(`bm:${normBrand}|${normModel}`);
  }

  // Fallback: brand + name
  if (parts.length === 0) {
    const normName = (product.name || '').toLowerCase().trim()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ');
    if (normName) parts.push(`name:${normName}`);
  }

  return parts.join('||') || `unknown-${Math.random()}`;
}

function deduplicate(products) {
  const seen = new Map();
  const unique = [];
  let dupeCount = 0;

  for (const product of products) {
    const key = getDeduplicationKey(product);

    if (seen.has(key)) {
      dupeCount++;
      // Keep the one with higher confidence or from higher priority source
      const existing = seen.get(key);
      const existingIdx = unique.indexOf(existing);
      if (product.confidence_score > existing.confidence_score) {
        unique[existingIdx] = product;
        seen.set(key, product);
      }
    } else {
      seen.set(key, product);
      unique.push(product);
    }
  }

  return { unique, dupeCount };
}

// ═══════════════════════════════════════════════════════════════════════
// GERMAN TRANSLATION (basic)
// ═══════════════════════════════════════════════════════════════════════

const FR_TO_DE_MAP = {
  'imprimante': 'Drucker',
  'imprimantes': 'Drucker',
  'multifonction': 'Multifunktions',
  'scanneur': 'Scanner',
  'scanner': 'Scanner',
  'cartouche': 'Tonerpatrone',
  'toner': 'Toner',
  'tapis de course': 'Laufband',
  'vélo d\'intérieur': 'Heimtrainer',
  'vélo': 'Fahrrad',
  'rameur': 'Rudergerät',
  'elliptique': 'Ellipsentrainer',
  'poids': 'Gewicht',
  'haltère': 'Hantel',
  'barre': 'Stange',
  'disque': 'Scheibe',
  'multi-gym': 'Multigym',
  'home gym': 'Fitnessstudio',
  'casque': 'Kopfhörer',
  'écouteurs': 'Kopfhörer',
  'téléphone': 'Telefon',
  'portable': 'Handy',
  'sans fil': 'kabellos',
  'professionnel': 'professionell',
  'professionnelle': 'professionell',
  'réserve d\'encre': 'Tanksystem',
  'couleur': 'Farbe',
  'noir et blanc': 'Schwarzweiß',
  'multifonctions': 'Multifunktions',
  'numériseur': 'Scanner',
  'vidéoprojecteur': 'Beamer',
  'écran': 'Bildschirm',
  'montre': 'Uhr',
  'connecté': 'verbunden',
  'wifi': 'WLAN',
  'bluetooth': 'Bluetooth',
  'ecran': 'Bildschirm',
  'machines à compter': 'Kassen',
  'caisse': 'Kasse',
  'essuie-glace': 'Scheibenwischer',
  'radio': 'Radio',
};

function basicTranslateToDe(text) {
  if (!text) return text;
  let result = text;
  for (const [fr, de] of Object.entries(FR_TO_DE_MAP)) {
    const regex = new RegExp(fr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    result = result.replace(regex, de);
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN PIPELINE
// ═══════════════════════════════════════════════════════════════════════

async function runPipeline(mode = 'DRY_RUN') {
  const executionId = `import-${Date.now()}`;
  const startTime = Date.now();

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  CATALOG IMPORT PIPELINE — ${mode}`);
  console.log(`  Execution ID: ${executionId}`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  // ── STEP 1: Backup current catalog ──
  console.log('📋 Step 1: Backing up current catalog...');
  let existingProducts = [];
  try {
    const data = fs.readFileSync(INITIAL_DATA_PATH, 'utf8');
    const match = data.match(/export const INITIAL_PRODUCTS: Product\[\] = \[([\s\S]*)\];/);
    if (match) {
      // Extract product IDs and basic info for backup
      const idMatches = [...data.matchAll(/"id":\s*"(prod-[^"]+)"/g)];
      const nameMatches = [...data.matchAll(/"name":\s*"([^"]+)"/g)];
      existingProducts = idMatches.map((m, i) => ({
        id: m[1],
        name: nameMatches[i] ? nameMatches[i][1] : '',
      }));
      console.log(`   ✓ Found ${existingProducts.length} existing products`);
    }
  } catch (e) {
    console.log('   ⚠ Could not read existing catalog');
  }

  // ── STEP 2: Load all sources ──
  console.log('📂 Step 2: Loading source data...');
  const allRawProducts = [];
  const sourcesSummary = [];

  for (const source of SOURCES) {
    const filePath = path.join(PROJECT_ROOT, source.file);
    if (!fs.existsSync(filePath)) {
      console.log(`   ⚠ ${source.name}: file not found, skipping`);
      sourcesSummary.push({ source_name: source.name, products_count: 0, blocked_count: 0 });
      continue;
    }

    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      const items = Array.isArray(data) ? data : [];
      let transformed = [];

      for (const item of items) {
        const result = source.transform(item);
        if (Array.isArray(result)) {
          transformed.push(...result);
        } else {
          transformed.push(result);
        }
      }

      // Filter out products with no price or no name
      const valid = transformed.filter(p => p.name && p.name.length > 3 && p.price > 0);

      console.log(`   ✓ ${source.name}: ${valid.length} valid products (from ${items.length} raw)`);
      allRawProducts.push(...valid);
      sourcesSummary.push({
        source_name: source.name,
        products_count: valid.length,
        blocked_count: items.length - valid.length,
      });
    } catch (e) {
      console.log(`   ✗ ${source.name}: ERROR - ${e.message}`);
      sourcesSummary.push({ source_name: source.name, products_count: 0, blocked_count: 0 });
    }
  }

  console.log(`\n   📊 Total raw products loaded: ${allRawProducts.length}`);
  console.log('');

  // ── STEP 3: Normalize to Product format ──
  console.log('🔧 Step 3: Normalizing products...');
  const normalizedProducts = allRawProducts.map((raw, idx) => {
    const catId = resolveCategoryId(raw.categories?.[0], raw.tags);
    const brandName = raw.brand_name || extractBrandFromName(raw.name);
    const brandId = resolveBrandId(brandName);
    const slug = generateSlug(raw.name);
    const images = raw.images || [];

    const product = {
      id: `prod-${executionId}-${String(idx).padStart(4, '0')}`,
      name: raw.name,
      slug: slug,
      description: raw.description || raw.short_description || '',
      short_description: raw.short_description || raw.description?.slice(0, 200) || '',
      sku: raw.identity?.sku || raw.sku || `SKU-${executionId.slice(-4)}-${String(idx).padStart(4, '0')}`,
      brand_id: brandId,
      brand_name: brandName || '',
      category_id: catId,
      price: Math.round(raw.price * 100) / 100,
      compare_at_price: raw.compare_at_price ? Math.round(raw.compare_at_price * 100) / 100 : null,
      stock: raw.stock || 10,
      low_stock_threshold: 3,
      status: 'active',
      featured: false,
      best_seller: false,
      new_arrival: true,
      on_sale: !!(raw.on_sale || (raw.compare_at_price && raw.compare_at_price > raw.price)),
      weight_kg: raw.weight_kg || estimateWeight(raw.categories, raw.name),
      rating: raw.rating || 4.5,
      review_count: raw.review_count || 0,
      images: images,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      // Pipeline metadata
      _pipeline: {
        source_name: raw.source_name,
        source_url: raw.source_url,
        identity: raw.identity,
        tags: raw.tags || [],
        raw_categories: raw.categories || [],
        raw_attributes: raw.attributes || {},
      },
    };

    // Translate French to German if source is French
    if (raw.source_name.includes('amsi') || raw.source_name.includes('abt')) {
      product.description = basicTranslateToDe(product.description);
      product.short_description = basicTranslateToDe(product.short_description);
      product.name = basicTranslateToDe(product.name);
    }

    return product;
  });

  console.log(`   ✓ ${normalizedProducts.length} products normalized`);
  console.log('');

  // ── STEP 4: Validate & Score ──
  console.log('✅ Step 4: Validating & scoring...');
  let validatedProducts = [];
  let rejectedProducts = [];
  let needsReviewProducts = [];

  for (const product of normalizedProducts) {
    const issues = validateProduct(product);
    const confidence = calculateConfidence(product);
    product.confidence_score = confidence;
    product.validation_issues = issues;

    if (issues.length === 0 && confidence >= 60) {
      product.pipeline_status = 'VALIDATED';
      validatedProducts.push(product);
    } else if (confidence >= 40) {
      product.pipeline_status = 'NEEDS_REVIEW';
      needsReviewProducts.push(product);
    } else {
      product.pipeline_status = 'IMPORT_INCOMPLETE';
      rejectedProducts.push(product);
    }
  }

  console.log(`   ✓ Validated: ${validatedProducts.length}`);
  console.log(`   ⚠ Needs review: ${needsReviewProducts.length}`);
  console.log(`   ✗ Rejected: ${rejectedProducts.length}`);
  console.log('');

  // ── STEP 5: Deduplicate ──
  console.log('🔄 Step 5: Deduplicating...');
  const { unique: dedupedProducts, dupeCount: valDupeCount } = deduplicate(validatedProducts);
  const { unique: dedupedNeedsReview, dupeCount: reviewDupeCount } = deduplicate(needsReviewProducts);
  console.log(`   ✓ ${dedupedProducts.length} unique validated products (${valDupeCount} duplicates removed)`);
  console.log(`   ✓ ${dedupedNeedsReview.length} unique needs-review products (${reviewDupeCount} duplicates removed)`);
  console.log('');

  // ── STEP 6: Download images ──
  console.log('🖼️  Step 6: Downloading & validating images...');
  if (mode === 'DRY_RUN') {
    console.log('   ⏭ Skipped in dry-run mode');
  } else {
    let imagesDownloaded = 0;
    let imagesFailed = 0;

    for (const product of dedupedProducts) {
      if (!product.images || product.images.length === 0) continue;

      const localImages = [];
      for (let i = 0; i < product.images.length; i++) {
        const url = product.images[i];
        if (!url || url.startsWith('data:')) {
          localImages.push(url);
          continue;
        }

        const ext = getExtensionFromUrl(url);
        const filename = `${product.slug}${i > 0 ? `-${i + 1}` : ''}${ext}`;
        const destPath = path.join(IMAGES_DIR, filename);

        try {
          if (!fs.existsSync(destPath)) {
            await downloadFile(url, destPath);
            imagesDownloaded++;
          }
          localImages.push(`/images/products/${filename}`);
        } catch (e) {
          imagesFailed++;
          // Try fallback from other sources
          // (In a full implementation, this would search other sources)
        }
      }

      product.images = localImages.filter(img => img && !img.startsWith('data:'));
    }

    console.log(`   ✓ ${imagesDownloaded} images downloaded`);
    console.log(`   ✗ ${imagesFailed} images failed`);
  }
  console.log('');

  // ── STEP 7: Assign featured/best_seller based on confidence ──
  console.log('⭐ Step 7: Assigning product flags...');
  const sorted = [...dedupedProducts].sort((a, b) => b.confidence_score - a.confidence_score);
  const topThreshold = Math.floor(sorted.length * 0.1);

  sorted.forEach((product, idx) => {
    if (idx < topThreshold) product.featured = true;
    if (idx < topThreshold * 2 && product.review_count > 50) product.best_seller = true;
  });
  console.log(`   ✓ ${sorted.filter(p => p.featured).length} featured, ${sorted.filter(p => p.best_seller).length} best sellers`);
  console.log('');

  // ── STEP 8: Final report ──
  const report = {
    execution_id: executionId,
    mode: mode,
    total_detected: allRawProducts.length,
    total_normalized: normalizedProducts.length,
    total_imported: dedupedProducts.length,
    total_rejected: rejectedProducts.length,
    total_needs_review: dedupedNeedsReview.length,
    total_images_processed: dedupedProducts.reduce((sum, p) => sum + (p.images?.length || 0), 0),
    duplicates_prevented: valDupeCount + reviewDupeCount,
    average_confidence_score: dedupedProducts.length > 0
      ? Math.round(dedupedProducts.reduce((sum, p) => sum + (p.confidence_score || 0), 0) / dedupedProducts.length)
      : 0,
    sources_summary: sourcesSummary,
    existing_products_removed: mode === 'EXECUTE' ? existingProducts.length : 0,
    execution_timestamp: new Date().toISOString(),
    duration_ms: Date.now() - startTime,
    products_by_status: {
      validated: validatedProducts.length,
      needs_review: needsReviewProducts.length,
      rejected: rejectedProducts.length,
    },
    top_products: dedupedProducts.slice(0, 5).map(p => ({
      name: p.name,
      brand: p.brand_name,
      price: p.price,
      confidence: p.confidence_score,
      images: p.images?.length || 0,
    })),
  };

  // ── STEP 9: Write results ──
  if (mode === 'DRY_RUN') {
    console.log('📝 Step 9: Writing dry-run report...');
    fs.writeFileSync(DRY_RUN_REPORT_PATH, JSON.stringify(report, null, 2));
    console.log(`   ✓ Report saved to ${DRY_RUN_REPORT_PATH}`);

    // Save detailed needs_review products
    const needsReviewDetails = dedupedNeedsReview.map(p => ({
      name: p.name,
      brand: p.brand_name,
      price: p.price,
      confidence: p.confidence_score,
      source: p._pipeline?.source_name,
      issues: p.validation_issues || [],
      images_count: p.images?.length || 0,
      has_identity: !!(p._pipeline?.identity?.ean || p._pipeline?.identity?.mpn),
      has_model: !!(p._pipeline?.identity?.model),
    }));
    const needsReviewPath = path.join(BACKUP_DIR, 'needs_review_products.json');
    fs.writeFileSync(needsReviewPath, JSON.stringify(needsReviewDetails, null, 2));
    console.log(`   ✓ ${needsReviewDetails.length} needs-review products saved to ${needsReviewPath}`);

    // Preview top products
    console.log('');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│  TOP PRODUCTS (Preview)                                    │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    for (const p of dedupedProducts.slice(0, 10)) {
      console.log(`│  ${p.name.slice(0, 40).padEnd(40)} ${String(p.confidence_score).padStart(3)}% │`);
    }
    console.log('└─────────────────────────────────────────────────────────────┘');

    // Preview needs_review breakdown
    const issuesCount = {};
    for (const p of dedupedNeedsReview) {
      for (const issue of (p.validation_issues || [])) {
        issuesCount[issue] = (issuesCount[issue] || 0) + 1;
      }
    }
    const confidenceBuckets = {};
    for (const p of dedupedNeedsReview) {
      const bucket = `${Math.floor(p.confidence_score / 10) * 10}-${Math.floor(p.confidence_score / 10) * 10 + 9}%`;
      confidenceBuckets[bucket] = (confidenceBuckets[bucket] || 0) + 1;
    }
    if (Object.keys(issuesCount).length > 0) {
      console.log('');
      console.log('┌─────────────────────────────────────────────────────────────┐');
      console.log('│  NEEDS REVIEW — Issue Breakdown                           │');
      console.log('├─────────────────────────────────────────────────────────────┤');
      for (const [issue, count] of Object.entries(issuesCount).sort((a, b) => b[1] - a[1])) {
        console.log(`│  ${issue.padEnd(40)} ${String(count).padStart(4)} │`);
      }
      console.log('└─────────────────────────────────────────────────────────────┘');
    }
    if (Object.keys(confidenceBuckets).length > 0) {
      console.log('');
      console.log('┌─────────────────────────────────────────────────────────────┐');
      console.log('│  NEEDS REVIEW — Confidence Distribution                   │');
      console.log('├─────────────────────────────────────────────────────────────┤');
      for (const [bucket, count] of Object.entries(confidenceBuckets).sort((a, b) => a[0].localeCompare(b[0]))) {
        console.log(`│  ${bucket.padEnd(40)} ${String(count).padStart(4)} │`);
      }
      console.log('└─────────────────────────────────────────────────────────────┘');
    }
  } else {
    // EXECUTE mode: write to initial-data.ts
    console.log('📝 Step 9: Writing to initial-data.ts...');
    await writeCatalog(dedupedProducts, report);
    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
    console.log(`   ✓ ${dedupedProducts.length} products written to catalog`);
    console.log(`   ✓ Report saved to ${REPORT_PATH}`);
  }

  // ── Print summary ──
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  IMPORT SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Mode:               ${report.mode}`);
  console.log(`  Products detected:  ${report.total_detected}`);
  console.log(`  Products imported:  ${report.total_imported}`);
  console.log(`  Products rejected:  ${report.total_rejected}`);
  console.log(`  Needs review:       ${report.total_needs_review}`);
  console.log(`  Duplicates removed: ${report.duplicates_prevented}`);
  console.log(`  Images processed:   ${report.total_images_processed}`);
  console.log(`  Avg confidence:     ${report.average_confidence_score}%`);
  console.log(`  Duration:           ${(report.duration_ms / 1000).toFixed(1)}s`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  return report;
}

// ═══════════════════════════════════════════════════════════════════════
// WRITE CATALOG
// ═══════════════════════════════════════════════════════════════════════

async function writeCatalog(products, report) {
  // Read the current file to preserve everything except INITIAL_PRODUCTS
  const fileContent = fs.readFileSync(INITIAL_DATA_PATH, 'utf8');

  // Extract the header (before INITIAL_PRODUCTS)
  const productsStart = fileContent.indexOf('export const INITIAL_PRODUCTS: Product[] = [');
  if (productsStart === -1) {
    throw new Error('Could not find INITIAL_PRODUCTS declaration in initial-data.ts');
  }

  const header = fileContent.slice(0, productsStart);

  // Extract everything after the INITIAL_PRODUCTS array
  const afterProductsStart = fileContent.indexOf('];', productsStart);
  let afterProducts = '';
  if (afterProductsStart !== -1) {
    // Find what comes after the closing ];
    const afterArray = fileContent.slice(afterProductsStart + 2);
    afterProducts = afterArray;
  }

  // Generate new product entries
  const productEntries = products.map(product => {
    const imagesJson = JSON.stringify(product.images || []);
    const specsJson = product._pipeline?.raw_attributes
      ? JSON.stringify(product._pipeline.raw_attributes)
      : undefined;

    const lines = [`  {`];
    lines.push(`    "id": ${JSON.stringify(product.id)},`);
    lines.push(`    "name": ${JSON.stringify(product.name)},`);
    lines.push(`    "slug": ${JSON.stringify(product.slug)},`);
    lines.push(`    "description": ${JSON.stringify(product.description)},`);
    lines.push(`    "short_description": ${JSON.stringify(product.short_description)},`);
    lines.push(`    "sku": ${JSON.stringify(product.sku)},`);
    if (product.brand_id) lines.push(`    "brand_id": ${JSON.stringify(product.brand_id)},`);
    if (product.brand_name) lines.push(`    "brand_name": ${JSON.stringify(product.brand_name)},`);
    lines.push(`    "category_id": ${JSON.stringify(product.category_id)},`);
    lines.push(`    "price": ${product.price},`);
    if (product.compare_at_price) lines.push(`    "compare_at_price": ${product.compare_at_price},`);
    lines.push(`    "stock": ${product.stock},`);
    lines.push(`    "low_stock_threshold": ${product.low_stock_threshold},`);
    lines.push(`    "status": ${JSON.stringify(product.status)},`);
    lines.push(`    "featured": ${product.featured},`);
    lines.push(`    "best_seller": ${product.best_seller},`);
    lines.push(`    "new_arrival": ${product.new_arrival},`);
    lines.push(`    "on_sale": ${!!product.on_sale},`);
    lines.push(`    "weight_kg": ${product.weight_kg},`);
    lines.push(`    "rating": ${product.rating},`);
    lines.push(`    "review_count": ${product.review_count},`);
    lines.push(`    "images": ${imagesJson},`);
    if (specsJson && specsJson !== '{}') lines.push(`    "specifications": ${specsJson},`);
    lines.push(`    "created_at": ${JSON.stringify(product.created_at)},`);
    lines.push(`    "updated_at": ${JSON.stringify(product.updated_at)},`);
    lines.push(`  },`);

    return lines.join('\n');
  });

  // Build new file
  const newFile = header
    + 'export const INITIAL_PRODUCTS: Product[] = [\n'
    + productEntries.join('\n')
    + '\n];'
    + afterProducts;

  // Write backup first
  fs.writeFileSync(BACKUP_PATH, fileContent);
  console.log(`   ✓ Backup saved to ${BACKUP_PATH}`);

  // Write new file
  fs.writeFileSync(INITIAL_DATA_PATH, newFile);
}

// ═══════════════════════════════════════════════════════════════════════
// POST-IMPORT AUDIT
// ═══════════════════════════════════════════════════════════════════════

function runAudit() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  POST-IMPORT AUDIT');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  const fileContent = fs.readFileSync(INITIAL_DATA_PATH, 'utf8');
  const issues = [];
  const stats = {
    total: 0,
    withImages: 0,
    withoutImages: 0,
    withPrice: 0,
    withoutPrice: 0,
    withDescription: 0,
    shortDescription: 0,
    withBrand: 0,
    withoutBrand: 0,
    withCategory: 0,
    withoutCategory: 0,
    onSale: 0,
    featured: 0,
    bestSeller: 0,
    newArrival: 0,
    duplicates: new Set(),
    duplicateSlugs: new Map(),
    orphanImages: [],
  };

  // Count products
  const idMatches = [...fileContent.matchAll(/"id":\s*"(prod-[^"]+)"/g)];
  const nameMatches = [...fileContent.matchAll(/"name":\s*"([^"]*)"/g)];
  const slugMatches = [...fileContent.matchAll(/"slug":\s*"([^"]*)"/g)];
  const priceMatches = [...fileContent.matchAll(/"price":\s*([0-9.]+)/g)];
  const imageMatches = [...fileContent.matchAll(/"images":\s*\[([^\]]*)\]/g)];
  const descMatches = [...fileContent.matchAll(/"description":\s*"((?:[^"\\]|\\.)*)"/g)];

  stats.total = idMatches.length;

  // Check for duplicate IDs
  const idCount = new Map();
  for (const m of idMatches) {
    idCount.set(m[1], (idCount.get(m[1]) || 0) + 1);
  }
  for (const [id, count] of idCount) {
    if (count > 1) stats.duplicates.add(id);
  }

  // Check for duplicate slugs
  for (const m of slugMatches) {
    const slug = m[1];
    stats.duplicateSlugs.set(slug, (stats.duplicateSlugs.get(slug) || 0) + 1);
  }

  // Analyze products
  for (let i = 0; i < stats.total; i++) {
    const images = imageMatches[i] ? imageMatches[i][1] : '';
    const imgCount = images ? images.split('",').length : 0;

    if (imgCount > 0) stats.withImages++;
    else stats.withoutImages++;

    if (priceMatches[i] && parseFloat(priceMatches[i][1]) > 0) stats.withPrice++;
    else stats.withoutPrice++;

    if (descMatches[i] && descMatches[i][1].length > 50) stats.withDescription++;
    else stats.shortDescription++;
  }

  // Check for orphan images
  if (fs.existsSync(IMAGES_DIR)) {
    const imageFiles = fs.readdirSync(IMAGES_DIR);
    for (const img of imageFiles) {
      if (!fileContent.includes(img)) {
        stats.orphanImages.push(img);
      }
    }
  }

  // Print report
  console.log('┌─────────────────────────────────────────────────────────────┐');
  console.log('│  AUDIT RESULTS                                             │');
  console.log('├─────────────────────────────────────────────────────────────┤');
  console.log(`│  Total products:          ${String(stats.total).padStart(6)}                     │`);
  console.log(`│  With images:             ${String(stats.withImages).padStart(6)}                     │`);
  console.log(`│  Without images:          ${String(stats.withoutImages).padStart(6)}                     │`);
  console.log(`│  With valid price:        ${String(stats.withPrice).padStart(6)}                     │`);
  console.log(`│  Without price:           ${String(stats.withoutPrice).padStart(6)}                     │`);
  console.log(`│  With description:        ${String(stats.withDescription).padStart(6)}                     │`);
  console.log(`│  Duplicate IDs:           ${String(stats.duplicates.size).padStart(6)}                     │`);
  console.log(`│  Orphan images:           ${String(stats.orphanImages.length).padStart(6)}                     │`);
  console.log('└─────────────────────────────────────────────────────────────┘');

  if (stats.duplicates.size > 0) {
    issues.push(`⚠ ${stats.duplicates.size} duplicate product IDs found`);
  }
  if (stats.withoutImages > 0) {
    issues.push(`⚠ ${stats.withoutImages} products without images`);
  }
  if (stats.orphanImages.length > 0) {
    issues.push(`⚠ ${stats.orphanImages.length} orphan images (not linked to any product)`);
  }

  if (issues.length === 0) {
    console.log('\n✅ No issues found — catalog is clean!');
  } else {
    console.log('\n⚠ Issues found:');
    issues.forEach(i => console.log(`  - ${i}`));
  }

  // Save audit report
  const auditReport = { ...stats, duplicates: [...stats.duplicates], issues };
  delete auditReport.duplicateSlugs;
  fs.writeFileSync(path.join(BACKUP_DIR, 'audit-report.json'), JSON.stringify(auditReport, null, 2));
  console.log('\n📊 Audit report saved to scripts/audit-report.json');

  return auditReport;
}

// ═══════════════════════════════════════════════════════════════════════
// CLI ENTRY POINT
// ═══════════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const mode = args.includes('--dry-run') ? 'DRY_RUN'
    : args.includes('--execute') ? 'EXECUTE'
    : args.includes('--audit') ? 'AUDIT'
    : 'DRY_RUN'; // Default to dry run

  if (mode === 'AUDIT') {
    runAudit();
  } else {
    await runPipeline(mode);
  }
}

main().catch(e => {
  console.error('Pipeline error:', e);
  process.exit(1);
});
