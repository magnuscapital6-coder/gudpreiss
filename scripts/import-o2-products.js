const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://xfsaznnrhqmlbllsfxzr.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Load scraped data
const scraped = JSON.parse(fs.readFileSync(path.join(__dirname, 'o2-scraped-products.json'), 'utf8'));

// Realistic retail prices for o2 devices (EUR, standalone UVP / street prices)
const PRICE_MAP = {
  'iphone 17 pro': { price: 1199, compare: 1199 },
  'iphone 17': { price: 949, compare: 949 },
  'iphone 17e': { price: 599, compare: 599 },
  'iphone 16e': { price: 499, compare: 499 },
  'iphone 15': { price: 699, compare: 699 },
  'iphone 16': { price: 799, compare: 799 },
  'iphone 14 gebraucht': { price: 299, compare: 399 },
  'iphone 15 gebraucht': { price: 399, compare: 549 },
  'iphone 16 gebraucht': { price: 549, compare: 699 },
  'iphone 16 pro gebraucht': { price: 649, compare: 849 },
  'galaxy s26 ultra': { price: 1419, compare: 1419 },
  'galaxy s26': { price: 949, compare: 949 },
  'galaxy s25 ultra': { price: 1199, compare: 1299 },
  'galaxy s25': { price: 799, compare: 849 },
  'pixel': { price: 799, compare: 799 },
  'ray-ban meta': { price: 329, compare: 369 },
  'ray ban meta': { price: 329, compare: 369 },
  'vr brille': { price: 499, compare: 549 },
  'gaming': { price: 449, compare: 499 },
  'xplora x6play': { price: 169, compare: 199 },
  'xplora x6': { price: 169, compare: 199 },
  'tcl mt48': { price: 129, compare: 149 },
  'tcl movetime': { price: 129, compare: 149 },
};

// Specs templates per product type
const SPECS_TEMPLATES = {
  'iphone 17 pro': {
    'Display': '6.9" Super Retina XDR OLED, 2868 x 1320 Pixel, ProMotion 120Hz',
    'Prozessor': 'Apple A19 Pro',
    'RAM': '12 GB',
    'Speicher': '256 GB / 512 GB / 1 TB / 2 TB',
    'Kamera': '48 MP Hauptkamera + 12 MP Ultraweitwinkel + 12 MP Telefoto (5x optisch)',
    'Frontkamera': '18 MP, f/1.9',
    'Akku': 'Bis zu 37 Stunden Videowiedergabe',
    'Gewicht': '233 g',
    'Abmessungen': '163.4 x 78 x 8.8 mm',
    'Wasserschutz': 'IP68',
    'Betriebssystem': 'iOS 26',
  },
  'iphone 17': {
    'Display': '6.3" Super Retina XDR OLED, 2622 x 1206 Pixel, 120Hz',
    'Prozessor': 'Apple A19',
    'RAM': '8 GB',
    'Speicher': '256 GB / 512 GB / 1 TB',
    'Kamera': '48 MP Hauptkamera + 12 MP Ultraweitwinkel',
    'Frontkamera': '18 MP, f/1.9',
    'Akku': 'Bis zu 31 Stunden Videowiedergabe',
    'Gewicht': '177 g',
    'Abmessungen': '149.6 x 71.5 x 8 mm',
    'Wasserschutz': 'IP68',
    'Betriebssystem': 'iOS 26',
  },
  'iphone 17e': {
    'Display': '6.1" OLED, 2532 x 1170 Pixel',
    'Prozessor': 'Apple A19',
    'RAM': '8 GB',
    'Speicher': '128 GB / 256 GB / 512 GB',
    'Kamera': '48 MP Hauptkamera',
    'Frontkamera': '12 MP',
    'Akku': 'Bis zu 26 Stunden Videowiedergabe',
    'Gewicht': '170 g',
    'Wasserschutz': 'IP68',
    'Betriebssystem': 'iOS 26',
  },
  'iphone 16e': {
    'Display': '6.1" OLED, 2532 x 1170 Pixel',
    'Prozessor': 'Apple A18',
    'RAM': '8 GB',
    'Speicher': '128 GB / 256 GB / 512 GB',
    'Kamera': '48 MP Hauptkamera',
    'Frontkamera': '12 MP',
    'Akku': 'Bis zu 22 Stunden Videowiedergabe',
    'Gewicht': '167 g',
    'Wasserschutz': 'IP68',
    'Betriebssystem': 'iOS 18',
  },
  'iphone 15': {
    'Display': '6.1" Super Retina XDR OLED, 2556 x 1179 Pixel',
    'Prozessor': 'Apple A16 Bionic',
    'RAM': '6 GB',
    'Speicher': '128 GB / 256 GB / 512 GB',
    'Kamera': '48 MP Hauptkamera + 12 MP Ultraweitwinkel',
    'Frontkamera': '12 MP TrueDepth',
    'Akku': 'Bis zu 20 Stunden Videowiedergabe',
    'Gewicht': '171 g',
    'Wasserschutz': 'IP68',
    'Betriebssystem': 'iOS 17',
  },
  'iphone 16': {
    'Display': '6.1" Super Retina XDR OLED, 2556 x 1179 Pixel, 120Hz',
    'Prozessor': 'Apple A18',
    'RAM': '8 GB',
    'Speicher': '128 GB / 256 GB / 512 GB',
    'Kamera': '48 MP Hauptkamera + 12 MP Ultraweitwinkel',
    'Frontkamera': '12 MP TrueDepth',
    'Akku': 'Bis zu 22 Stunden Videowiedergabe',
    'Gewicht': '170 g',
    'Wasserschutz': 'IP68',
    'Betriebssystem': 'iOS 18',
  },
  'galaxy s26 ultra': {
    'Display': '6.9" Dynamic AMOLED 2X, 3120 x 1440 Pixel, 120Hz',
    'Prozessor': 'Samsung Snapdragon 8 Elite for Galaxy',
    'RAM': '12 GB',
    'Speicher': '256 GB / 512 GB / 1 TB',
    'Kamera': '200 MP Hauptkamera + 50 MP Ultraweitwinkel + 50 MP Telefoto (5x) + 10 MP Telefoto (3x)',
    'Frontkamera': '12 MP, f/2.2',
    'Akku': '5.000 mAh',
    'Gewicht': '218 g',
    'Abmessungen': '162.8 x 77.6 x 8.2 mm',
    'Wasserschutz': 'IP68',
    'Betriebssystem': 'Android 15, One UI 7',
  },
  'galaxy s26': {
    'Display': '6.2" Dynamic AMOLED 2X, 2340 x 1080 Pixel, 120Hz',
    'Prozessor': 'Samsung Snapdragon 8 Elite for Galaxy',
    'RAM': '12 GB',
    'Speicher': '128 GB / 256 GB / 512 GB',
    'Kamera': '50 MP Hauptkamera + 12 MP Ultraweitwinkel + 10 MP Telefoto (3x)',
    'Frontkamera': '12 MP, f/2.2',
    'Akku': '4.000 mAh',
    'Gewicht': '162 g',
    'Wasserschutz': 'IP68',
    'Betriebssystem': 'Android 15, One UI 7',
  },
  'galaxy s25 ultra': {
    'Display': '6.9" Dynamic AMOLED 2X, 3120 x 1440 Pixel, 120Hz',
    'Prozessor': 'Snapdragon 8 Elite',
    'RAM': '12 GB',
    'Speicher': '256 GB / 512 GB / 1 TB',
    'Kamera': '200 MP Hauptkamera + 50 MP Ultraweitwinkel + 50 MP Telefoto (5x) + 10 MP Telefoto (3x)',
    'Frontkamera': '12 MP',
    'Akku': '5.000 mAh',
    'Gewicht': '218 g',
    'Wasserschutz': 'IP68',
    'Betriebssystem': 'Android 15, One UI 7',
  },
  'galaxy s25': {
    'Display': '6.2" Dynamic AMOLED 2X, 2340 x 1080 Pixel, 120Hz',
    'Prozessor': 'Snapdragon 8 Elite',
    'RAM': '12 GB',
    'Speicher': '128 GB / 256 GB / 512 GB',
    'Kamera': '50 MP Hauptkamera + 12 MP Ultraweitwinkel + 10 MP Telefoto (3x)',
    'Frontkamera': '12 MP',
    'Akku': '4.000 mAh',
    'Gewicht': '162 g',
    'Wasserschutz': 'IP68',
    'Betriebssystem': 'Android 15, One UI 7',
  },
  'xplora x6play': {
    'Display': '1.4" TFT Touchdisplay',
    'GPS': 'Dual-Band GPS + Wi-Fi + Bluetooth',
    'Akku': '900 mAh, bis zu 2 Tage',
    'Konnektivität': '4G LTE, Wi-Fi, Bluetooth 5.0',
    'Wasserschutz': 'IP67',
    'Features': 'SOS-Button, GPS-Ortung, Schulmodus, Anrufe',
    'Betriebssystem': 'Proprietär (Xplora OS)',
  },
  'tcl mt48': {
    'Display': '1.52" IPS Touchdisplay',
    'GPS': 'Dual-Band GPS',
    'Akku': '900 mAh',
    'Konnektivität': '4G LTE, Wi-Fi, Bluetooth',
    'Wasserschutz': 'IP67',
    'Features': '4G Videoanrufe, GPS-Ortung, Schulmodus, SOS-Taste',
    'Betriebssystem': 'Proprietär',
  },
};

function matchPriceKey(name) {
  const lower = (name || '').toLowerCase();
  for (const key of Object.keys(PRICE_MAP)) {
    if (lower.includes(key)) return key;
  }
  return null;
}

function matchSpecsKey(name) {
  const lower = (name || '').toLowerCase();
  for (const key of Object.keys(SPECS_TEMPLATES)) {
    if (lower.includes(key)) return key;
  }
  return null;
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function extractBrand(name) {
  if (/iphone|ipad|macbook|airpods|apple/i.test(name)) return 'Apple';
  if (/galaxy|samsung/i.test(name)) return 'Samsung';
  if (/pixel|google/i.test(name)) return 'Google';
  if (/xplora/i.test(name)) return 'Xplora';
  if (/tcl|movetime/i.test(name)) return 'TCL';
  if (/ray.?ban|meta/i.test(name)) return 'Meta';
  if (/playstation|ps5/i.test(name)) return 'Sony';
  return 'O2';
}

function categorizeProduct(name) {
  const lower = (name || '').toLowerCase();
  if (/iphone|galaxy s\d|pixel/i.test(name)) return { id: 'cat-smartphones', name: 'Smartphones' };
  if (/watch|wearable/i.test(lower)) return { id: 'cat-wearables', name: 'Smartwatches & Wearables' };
  if (/airpods|kopfhörer|buds|headphone/i.test(lower)) return { id: 'cat-audio', name: 'Kopfhörer & Audio' };
  if (/ipad|tablet/i.test(lower)) return { id: 'cat-tablets', name: 'Tablets' };
  if (/macbook|laptop/i.test(lower)) return { id: 'cat-laptops', name: 'Laptops' };
  if (/vr|gaming|playstation|ps5/i.test(lower)) return { id: 'cat-gaming', name: 'Gaming & VR' };
  if (/ray.?ban|meta.*glass|brille/i.test(lower)) return { id: 'cat-smartglasses', name: 'Smart Glasses' };
  if (/kids.*watch|xplora|tcl.*kids/i.test(lower)) return { id: 'cat-kidswatch', name: "Kids Watches" };
  return { id: 'cat-devices', name: 'Geräte & Zubehör' };
}

function generateSku(name, idx) {
  const prefix = extractBrand(name).substring(0, 3).toUpperCase();
  return `O2-${prefix}-${String(idx + 1).padStart(4, '0')}`;
}

async function importProducts() {
  console.log(`\n=== Importing ${scraped.length} o2 products into GudPreiss ===\n`);

  // Step 1: Delete all existing products
  console.log('Step 1: Deleting existing products...');
  const { error: delErr } = await supabase.from('products').delete().neq('id', '__none__');
  if (delErr) {
    console.error('Delete error:', delErr);
    return;
  }
  console.log('  ✓ All existing products deleted\n');

  // Step 2: Delete existing categories and brands (will recreate)
  console.log('Step 2: Cleaning categories and brands...');
  await supabase.from('reviews').delete().neq('id', '__none__');
  await supabase.from('categories').delete().neq('id', '__none__');
  await supabase.from('brands').delete().neq('id', '__none__');
  console.log('  ✓ Cleaned\n');

  // Step 3: Create categories
  const categories = new Map();
  scraped.forEach((p, idx) => {
    const cat = categorizeProduct(p.name || p.description || '');
    if (!categories.has(cat.id)) {
      categories.set(cat.id, { ...cat, sort_order: categories.size + 1 });
    }
  });
  console.log(`Step 3: Inserting ${categories.size} categories...`);
  for (const [id, cat] of categories) {
    const { error } = await supabase.from('categories').upsert({
      id, name: cat.name, slug: slugify(cat.name),
      description: `${cat.name} bei GudPreiss – Top-Marken zum besten Preis.`,
      image: 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg',
      product_count: 0,
    }, { onConflict: 'id' });
    if (error) console.error(`  Category ${id} error:`, error.message);
  }
  console.log('  ✓ Categories inserted\n');

  // Step 4: Create brands
  const brands = new Map();
  scraped.forEach(p => {
    const brandName = extractBrand(p.name || '');
    const brandId = `brand-${slugify(brandName)}`;
    if (!brands.has(brandId)) {
      brands.set(brandId, { id: brandId, name: brandName, slug: slugify(brandName) });
    }
  });
  console.log(`Step 4: Inserting ${brands.size} brands...`);
  for (const [id, brand] of brands) {
    const { error } = await supabase.from('brands').upsert({
      id: brand.id, name: brand.name, slug: brand.slug, logo: '', description: `${brand.name} – Premium-Markenprodukte`,
    }, { onConflict: 'id' });
    if (error) console.error(`  Brand ${brand.id} error:`, error.message);
  }
  console.log('  ✓ Brands inserted\n');

  // Step 5: Insert products
  console.log(`Step 5: Inserting ${scraped.length} products...`);
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < scraped.length; i++) {
    const p = scraped[i];
    const name = p.name || `Produkt ${i + 1}`;
    const priceKey = matchPriceKey(name);
    const specsKey = matchSpecsKey(name);
    const priceInfo = priceKey ? PRICE_MAP[priceKey] : { price: 299 + Math.floor(Math.random() * 600), compare: 399 + Math.floor(Math.random() * 700) };
    const specs = specsKey ? SPECS_TEMPLATES[specsKey] : {};
    const brand = extractBrand(name);
    const brandId = `brand-${slugify(brand)}`;
    const cat = categorizeProduct(name);

    const product = {
      id: `o2-${slugify(name)}`,
      name: name,
      slug: slugify(name),
      description: p.description || `${name} – Jetzt bei GudPreiss zum besten Preis kaufen. Kostenlose Beratung und schneller Versand.`,
      short_description: p.description ? p.description.substring(0, 200) : `${name} – Premium Smartphone`,
      price: priceInfo.price,
      compare_at_price: priceInfo.compare,
      images: p.images || [],
      category_id: cat.id,
      category_name: cat.name,
      brand_id: brandId,
      brand_name: brand,
      sku: generateSku(name, i),
      stock: 10 + Math.floor(Math.random() * 40),
      featured: i < 6,
      best_seller: i % 3 === 0,
      new_arrival: i < 8,
      on_sale: priceInfo.compare > priceInfo.price,
      rating: Math.round((4.3 + Math.random() * 0.7) * 10) / 10,
      reviews_count: Math.floor(Math.random() * 120) + 15,
      specifications: specs,
    };

    const { error } = await supabase.from('products').upsert(product, { onConflict: 'id' });
    if (error) {
      console.error(`  ✗ ${name}: ${error.message}`);
      errors++;
    } else {
      inserted++;
      if (inserted % 5 === 0) console.log(`  ✓ ${inserted}/${scraped.length} products inserted...`);
    }
  }

  console.log(`\n=== Import complete ===`);
  console.log(`  ✓ ${inserted} products inserted`);
  console.log(`  ✗ ${errors} errors`);
  console.log(`  ✓ ${categories.size} categories`);
  console.log(`  ✓ ${brands.size} brands`);
}

importProducts().catch(console.error);
