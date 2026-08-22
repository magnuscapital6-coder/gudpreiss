const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://xfsaznnrhqmlbllsfxzr.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const PG_CONN = process.env.POSTGRES_URL || "postgresql://postgres:magnuscapital6-coder's+Org@db.xfsaznnrhqmlbllsfxzr.supabase.co:5432/postgres";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Load scraped data ──────────────────────────────────────────────
const o2Data = JSON.parse(fs.readFileSync(path.join(__dirname, 'o2-scraped-products.json'), 'utf8'));
const refurbedData = JSON.parse(fs.readFileSync(path.join(__dirname, 'refurbed-scraped.json'), 'utf8'));

// ─── Refurbed product enrichment map ────────────────────────────────
const REFURBED_CATALOG = {
  // iPhones
  'iphone 16 pro max': { brand: 'Apple', cat: 'Smartphones', price: 1099, specs: {'Display': '6.9" Super Retina XDR, 120Hz', 'Prozessor': 'Apple A18 Pro', 'Kamera': '48 MP Triple', 'Speicher': '256 GB - 1 TB', 'Zustand': 'Refurbished'} },
  'iphone 16 pro': { brand: 'Apple', cat: 'Smartphones', price: 899, specs: {'Display': '6.3" Super Retina XDR, 120Hz', 'Prozessor': 'Apple A18 Pro', 'Kamera': '48 MP Triple', 'Speicher': '128 GB - 1 TB'} },
  'iphone 16': { brand: 'Apple', cat: 'Smartphones', price: 699, specs: {'Display': '6.1" Super Retina XDR', 'Prozessor': 'Apple A18', 'Kamera': '48 MP Dual', 'Speicher': '128 GB - 512 GB'} },
  'iphone 15 pro max': { brand: 'Apple', cat: 'Smartphones', price: 899, specs: {'Display': '6.7" Super Retina XDR, 120Hz', 'Prozessor': 'Apple A17 Pro', 'Kamera': '48 MP Triple (5x)', 'Speicher': '256 GB - 1 TB'} },
  'iphone 15 pro': { brand: 'Apple', cat: 'Smartphones', price: 749, specs: {'Display': '6.1" Super Retina XDR, 120Hz', 'Prozessor': 'Apple A17 Pro', 'Kamera': '48 MP Triple', 'Speicher': '128 GB - 1 TB'} },
  'iphone 15': { brand: 'Apple', cat: 'Smartphones', price: 549, specs: {'Display': '6.1" Super Retina XDR', 'Prozessor': 'Apple A16 Bionic', 'Kamera': '48 MP Dual', 'Speicher': '128 GB - 512 GB'} },
  'iphone 14 pro': { brand: 'Apple', cat: 'Smartphones', price: 649, specs: {'Display': '6.1" Super Retina XDR, 120Hz', 'Prozessor': 'Apple A16 Bionic', 'Kamera': '48 MP Triple', 'Speicher': '128 GB - 1 TB'} },
  'iphone 14': { brand: 'Apple', cat: 'Smartphones', price: 449, specs: {'Display': '6.1" Super Retina XDR', 'Prozessor': 'Apple A15 Bionic', 'Kamera': '12 MP Dual', 'Speicher': '128 GB - 512 GB'} },
  'iphone 13': { brand: 'Apple', cat: 'Smartphones', price: 379, specs: {'Display': '6.1" Super Retina XDR', 'Prozessor': 'Apple A15 Bionic', 'Kamera': '12 MP Dual', 'Speicher': '128 GB - 512 GB'} },
  // Samsung
  'galaxy s25 ultra': { brand: 'Samsung', cat: 'Smartphones', price: 999, specs: {'Display': '6.9" Dynamic AMOLED 2X, 120Hz', 'Prozessor': 'Snapdragon 8 Elite', 'Kamera': '200 MP Quad', 'RAM': '12 GB', 'Speicher': '256 GB - 1 TB'} },
  'galaxy s25': { brand: 'Samsung', cat: 'Smartphones', price: 649, specs: {'Display': '6.2" Dynamic AMOLED 2X, 120Hz', 'Prozessor': 'Snapdragon 8 Elite', 'Kamera': '50 MP Triple', 'RAM': '12 GB'} },
  'galaxy s24 ultra': { brand: 'Samsung', cat: 'Smartphones', price: 899, specs: {'Display': '6.8" Dynamic AMOLED 2X, 120Hz', 'Prozessor': 'Snapdragon 8 Gen 3', 'Kamera': '200 MP Quad', 'RAM': '12 GB'} },
  'galaxy s24': { brand: 'Samsung', cat: 'Smartphones', price: 549, specs: {'Display': '6.2" Dynamic AMOLED 2X, 120Hz', 'Prozessor': 'Snapdragon 8 Gen 3', 'Kamera': '50 MP Triple'} },
  'galaxy s23 ultra': { brand: 'Samsung', cat: 'Smartphones', price: 749, specs: {'Display': '6.8" Dynamic AMOLED 2X, 120Hz', 'Prozessor': 'Snapdragon 8 Gen 2', 'Kamera': '200 MP Quad', 'RAM': '12 GB'} },
  'galaxy s23': { brand: 'Samsung', cat: 'Smartphones', price: 449, specs: {'Display': '6.1" Dynamic AMOLED 2X, 120Hz', 'Prozessor': 'Snapdragon 8 Gen 2', 'Kamera': '50 MP Triple'} },
  'galaxy a55': { brand: 'Samsung', cat: 'Smartphones', price: 279, specs: {'Display': '6.6" Super AMOLED, 120Hz', 'Prozessor': 'Exynos 1480', 'Kamera': '50 MP Triple', 'RAM': '8 GB'} },
  // Google
  'pixel 9 pro': { brand: 'Google', cat: 'Smartphones', price: 699, specs: {'Display': '6.3" Super Actua LTPO OLED, 120Hz', 'Prozessor': 'Google Tensor G4', 'Kamera': '50 MP Triple', 'RAM': '16 GB'} },
  'pixel 9': { brand: 'Google', cat: 'Smartphones', price: 499, specs: {'Display': '6.3" Actua OLED, 120Hz', 'Prozessor': 'Google Tensor G4', 'Kamera': '50 MP Dual', 'RAM': '12 GB'} },
  'pixel 8 pro': { brand: 'Google', cat: 'Smartphones', price: 549, specs: {'Display': '6.7" LTPO OLED, 120Hz', 'Prozessor': 'Google Tensor G3', 'Kamera': '50 MP Triple', 'RAM': '12 GB'} },
  // MacBooks
  'macbook air 2020': { brand: 'Apple', cat: 'Laptops', price: 549, specs: {'Display': '13.3" Retina', 'Prozessor': 'Apple M1', 'RAM': '8 GB', 'Speicher': '256 GB SSD'} },
  'macbook air 2022': { brand: 'Apple', cat: 'Laptops', price: 749, specs: {'Display': '13.6" Liquid Retina', 'Prozessor': 'Apple M2', 'RAM': '8 GB', 'Speicher': '256 GB SSD'} },
  'macbook air 2024': { brand: 'Apple', cat: 'Laptops', price: 949, specs: {'Display': '15.3" Liquid Retina', 'Prozessor': 'Apple M3', 'RAM': '8 GB', 'Speicher': '256 GB SSD'} },
  'macbook pro 2021': { brand: 'Apple', cat: 'Laptops', price: 1199, specs: {'Display': '14.2" Liquid Retina XDR', 'Prozessor': 'Apple M1 Pro', 'RAM': '16 GB', 'Speicher': '512 GB SSD'} },
  // iPads
  'ipad 11 (2025)': { brand: 'Apple', cat: 'Tablets', price: 349, specs: {'Display': '10.9" Liquid Retina', 'Prozessor': 'Apple A16', 'Speicher': '64 GB / 256 GB'} },
  'ipad pro (2024)': { brand: 'Apple', cat: 'Tablets', price: 899, specs: {'Display': '13" Liquid Retina XDR', 'Prozessor': 'Apple M4', 'Speicher': '256 GB - 2 TB'} },
  'ipad 9 (2021)': { brand: 'Apple', cat: 'Tablets', price: 249, specs: {'Display': '10.2" Retina', 'Prozessor': 'Apple A13 Bionic', 'Speicher': '64 GB / 256 GB'} },
  'ipad air (2024)': { brand: 'Apple', cat: 'Tablets', price: 599, specs: {'Display': '13" Liquid Retina', 'Prozessor': 'Apple M2', 'Speicher': '128 GB - 1 TB'} },
  // Smartwatches
  'apple watch ultra 2': { brand: 'Apple', cat: 'Smartwatches', price: 649, specs: {'Display': '49mm Always-On Retina LTPO', 'Prozessor': 'Apple S9', 'Features': 'GPS, Kompass, Tiefenmesser', 'Wasserschutz': 'WR100'} },
  'apple watch series 10': { brand: 'Apple', cat: 'Smartwatches', price: 349, specs: {'Display': '42mm/46mm Always-On Retina', 'Prozessor': 'Apple S10', 'Features': 'GPS, EKG, Blutsauerstoff'} },
  'apple watch se': { brand: 'Apple', cat: 'Smartwatches', price: 199, specs: {'Display': '40mm Retina LTPO', 'Features': 'GPS, SOS'} },
  // Laptops
  'thinkpad': { brand: 'Lenovo', cat: 'Laptops', price: 349, specs: {'Prozessor': 'Intel Core i5', 'RAM': '8 GB', 'Speicher': '256 GB SSD'} },
  'elitebook': { brand: 'HP', cat: 'Laptops', price: 399, specs: {'Prozessor': 'Intel Core i5-1145G7', 'RAM': '8 GB', 'Speicher': '256 GB SSD'} },
};

// ─── Build complete product list ────────────────────────────────────
function extractBrand(name) {
  if (/iphone|ipad|macbook|airpods|apple/i.test(name)) return 'Apple';
  if (/galaxy|samsung/i.test(name)) return 'Samsung';
  if (/pixel|google/i.test(name)) return 'Google';
  if (/xiaomi|redmi|poco/i.test(name)) return 'Xiaomi';
  if (/xplora/i.test(name)) return 'Xplora';
  if (/tcl|movetime/i.test(name)) return 'TCL';
  if (/ray.?ban|meta/i.test(name)) return 'Meta';
  if (/lenovo|thinkpad/i.test(name)) return 'Lenovo';
  if (/hp|elitebook/i.test(name)) return 'HP';
  if (/dell/i.test(name)) return 'Dell';
  return 'O2';
}

function categorize(name) {
  const n = (name||'').toLowerCase();
  if (/macbook|laptop|thinkpad|elitebook/i.test(n)) return { id: 'cat-laptops', name: 'Laptops' };
  if (/ipad|tablet/i.test(n)) return { id: 'cat-tablets', name: 'Tablets' };
  if (/watch|wearable/i.test(n)) return { id: 'cat-wearables', name: 'Smartwatches' };
  if (/airpods|kopfhörer|buds/i.test(n)) return { id: 'cat-audio', name: 'Kopfhörer & Audio' };
  if (/vr|gaming|playstation/i.test(n)) return { id: 'cat-gaming', name: 'Gaming & VR' };
  if (/ray.?ban|meta.*glass/i.test(n)) return { id: 'cat-smartglasses', name: 'Smart Glasses' };
  if (/kids.*watch|xplora|tcl.*kids/i.test(n)) return { id: 'cat-kidswatch', name: 'Kids Watches' };
  return { id: 'cat-smartphones', name: 'Smartphones' };
}

function slugify(t) {
  return t.toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

// Build ALL products array
const ALL_PRODUCTS = [];

// 1. O2 products (scraped)
o2Data.filter(p => p.name && !p.error).forEach((p, i) => {
  ALL_PRODUCTS.push({
    name: p.name, brand: extractBrand(p.name), cat: categorize(p.name),
    price: getPrice(p.name), compareAt: getCompare(p.name),
    images: p.images || [], desc: p.description || `${p.name} – GudPreiss`,
    shortDesc: (p.description||'').substring(0, 200) || p.name,
    specs: getSpecs(p.name), source: 'o2', sku: `O2-${i+1}`,
  });
});

// 2. Refurbed products (enriched)
const refurbedProducts = new Set();
refurbedData.filter(d => d.products && d.products.length > 0).forEach(catPage => {
  catPage.products.forEach(prod => {
    const name = (prod.name || '').replace(/^Refurbished\s+/i, '').replace(/–.*$/,'').trim();
    if (!name || name.length < 5 || refurbedProducts.has(name)) return;
    refurbedProducts.add(name);
    const lowerName = name.toLowerCase();
    let matched = null;
    for (const [key, val] of Object.entries(REFURBED_CATALOG)) {
      if (lowerName.includes(key)) { matched = val; break; }
    }
    const brand = matched?.brand || extractBrand(name);
    const cat = matched?.cat ? { id: `cat-${slugify(matched.cat)}`, name: matched.cat } : categorize(name);
    ALL_PRODUCTS.push({
      name, brand, cat,
      price: matched?.price || 299 + Math.floor(Math.random() * 600),
      compareAt: matched?.price ? Math.round(matched.price * 1.2) : 399 + Math.floor(Math.random() * 700),
      images: [], desc: `${name} – Refurbished, professionell erneuert mit Garantie.`,
      shortDesc: `${name} – Refurbished, bis zu 40% günstiger`,
      specs: matched?.specs || {'Zustand': 'Refurbished', 'Garantie': 'Min. 12 Monate'},
      source: 'refurbed', sku: `REF-${ALL_PRODUCTS.length}`,
    });
  });
});

// 3. Otelo products
const OTELO_PRODUCTS = [
  { name: 'Apple iPhone 13', price: 549, specs: {'Display': '6.1" Super Retina XDR', 'Prozessor': 'A15 Bionic', 'Kamera': '12 MP Dual'} },
  { name: 'Apple iPhone 13 mini', price: 499, specs: {'Display': '5.4" Super Retina XDR', 'Prozessor': 'A15 Bionic'} },
  { name: 'Apple iPhone SE 2022', price: 399, specs: {'Display': '4.7" Retina HD', 'Prozessor': 'A15 Bionic', '5G': 'Ja'} },
  { name: 'Apple iPhone 14', price: 699, specs: {'Display': '6.1" Super Retina XDR', 'Prozessor': 'A15 Bionic', 'Kamera': '12 MP Dual'} },
  { name: 'Samsung Galaxy A32 5G', price: 229, specs: {'Display': '6.5" TFT LCD', 'Kamera': '48 MP Quad', 'Akku': '5.000 mAh'} },
  { name: 'Samsung Galaxy A14 5G', price: 179, specs: {'Display': '6.6" PLS LCD', 'Kamera': '50 MP Triple', 'Akku': '5.000 mAh'} },
  { name: 'Samsung Galaxy A54 5G', price: 389, specs: {'Display': '6.4" Super AMOLED, 120Hz', 'Kamera': '50 MP Triple', 'Wasserschutz': 'IP67'} },
  { name: 'Samsung Galaxy S23', price: 649, specs: {'Display': '6.1" Dynamic AMOLED 2X, 120Hz', 'Prozessor': 'Snapdragon 8 Gen 2'} },
  { name: 'Google Pixel 6', price: 449, specs: {'Display': '6.4" OLED, 90Hz', 'Prozessor': 'Google Tensor'} },
  { name: 'Google Pixel 7 Pro', price: 649, specs: {'Display': '6.7" LTPO OLED, 120Hz', 'Prozessor': 'Tensor G2', 'Kamera': '50 MP Triple'} },
  { name: 'Xiaomi Redmi Note 10 Pro', price: 229, specs: {'Display': '6.67" AMOLED, 120Hz', 'Kamera': '108 MP Quad'} },
  { name: 'Xiaomi 12 Lite 5G', price: 299, specs: {'Display': '6.55" AMOLED, 120Hz', 'Prozessor': 'Snapdragon 778G'} },
];
OTELO_PRODUCTS.forEach((p, i) => {
  ALL_PRODUCTS.push({
    name: p.name, brand: extractBrand(p.name), cat: categorize(p.name),
    price: p.price, compareAt: Math.round(p.price * 1.15),
    images: [], desc: `${p.name} – Refurbished bei otelo.`,
    shortDesc: `${p.name} – Refurbished mit Vertrag`,
    specs: p.specs, source: 'otelo', sku: `OTE-${i+1}`,
  });
});

// 4. Blau products
const BLAU_PRODUCTS = [
  { name: 'Apple iPhone 15 Pro Max', price: 1199, specs: {'Display': '6.7" Super Retina XDR, 120Hz', 'Prozessor': 'A17 Pro', 'Kamera': '48 MP Triple (5x)'} },
  { name: 'Apple iPhone 15 Pro', price: 999, specs: {'Display': '6.1" Super Retina XDR, 120Hz', 'Prozessor': 'A17 Pro'} },
  { name: 'Apple iPhone 15', price: 699, specs: {'Display': '6.1" Super Retina XDR', 'Prozessor': 'A16 Bionic', 'Kamera': '48 MP Dual'} },
  { name: 'Samsung Galaxy S24 Ultra', price: 1299, specs: {'Display': '6.8" Dynamic AMOLED 2X, 120Hz', 'Prozessor': 'Snapdragon 8 Gen 3', 'Kamera': '200 MP Quad'} },
  { name: 'Samsung Galaxy S24', price: 749, specs: {'Display': '6.2" Dynamic AMOLED 2X, 120Hz', 'Prozessor': 'Snapdragon 8 Gen 3'} },
  { name: 'Samsung Galaxy A25 5G', price: 219, specs: {'Display': '6.5" Super AMOLED, 120Hz', 'Kamera': '50 MP Triple'} },
  { name: 'Xiaomi Redmi 13C', price: 119, specs: {'Display': '6.74" IPS LCD', 'Kamera': '50 MP', 'Akku': '5.000 mAh'} },
  { name: 'Xiaomi Redmi Note 13', price: 199, specs: {'Display': '6.67" AMOLED, 120Hz', 'Kamera': '108 MP Triple'} },
  { name: 'Google Pixel 8 Pro', price: 799, specs: {'Display': '6.7" LTPO OLED, 120Hz', 'Prozessor': 'Tensor G3', 'Kamera': '50 MP Triple'} },
  { name: 'Google Pixel 8', price: 599, specs: {'Display': '6.2" OLED, 120Hz', 'Prozessor': 'Tensor G3'} },
];
BLAU_PRODUCTS.forEach((p, i) => {
  ALL_PRODUCTS.push({
    name: p.name, brand: extractBrand(p.name), cat: categorize(p.name),
    price: p.price, compareAt: Math.round(p.price * 1.15),
    images: [], desc: `${p.name} – Refurbished bei Blau.`,
    shortDesc: `${p.name} – Refurbished mit Tarif`,
    specs: p.specs, source: 'blau', sku: `BLA-${i+1}`,
  });
});

function getPrice(name) {
  const n = (name||'').toLowerCase();
  const map = {
    'iphone 17 pro': 1199, 'iphone 17': 949, 'iphone 17e': 599, 'iphone 16e': 499,
    'iphone 16': 799, 'iphone 15': 699, 'iphone 14 gebraucht': 299, 'iphone 15 gebraucht': 399,
    'iphone 16 gebraucht': 549, 'iphone 16 pro gebraucht': 649,
    'galaxy s26 ultra': 1419, 'galaxy s26': 949, 'galaxy s25 ultra': 1199, 'galaxy s25': 799,
    'ray-ban meta': 329, 'xplora x6play': 169, 'tcl mt48': 129,
  };
  for (const [k, v] of Object.entries(map)) { if (n.includes(k)) return v; }
  return 299 + Math.floor(Math.random() * 600);
}
function getCompare(name) { return Math.round(getPrice(name) * 1.15); }
function getSpecs(name) {
  const n = (name||'').toLowerCase();
  const t = {
    'iphone 17 pro': {'Display': '6.9" Super Retina XDR, 120Hz', 'Prozessor': 'A19 Pro', 'Kamera': '48 MP Triple'},
    'galaxy s26 ultra': {'Display': '6.9" Dynamic AMOLED 2X, 120Hz', 'Prozessor': 'Snapdragon 8 Elite', 'Kamera': '200 MP'},
  };
  for (const [k, v] of Object.entries(t)) { if (n.includes(k)) return v; }
  return {'Display': '6.1" OLED, 120Hz', 'Kamera': '50 MP'};
}

// ─── MAIN ───────────────────────────────────────────────────────────
async function main() {
  console.log('╔═══════════════════════════════════════════════════╗');
  console.log('║  GudPreiss – O2 + Otelo + Blau + Refurbed Import ║');
  console.log(`║  ${ALL_PRODUCTS.length} total products from 4 sources          ║`);
  console.log('╚═══════════════════════════════════════════════════╝\n');

  // Step 1: Create tables
  console.log('═══ Step 1: Creating tables ═══');
  try {
    const client = new Client({ connectionString: PG_CONN, ssl: { rejectUnauthorized: false } });
    await client.connect();
    const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase-schema.sql'), 'utf8');
    await client.query(sql);
    console.log('  ✓ Tables created');
    await client.end();
  } catch (err) {
    console.log('  ⚠ ' + err.message.substring(0, 80));
    console.log('  Attempting import anyway...');
  }

  // Step 2: Delete old data
  console.log('\n═══ Step 2: Deleting old data ═══');
  for (const t of ['products', 'categories', 'brands']) {
    const { error } = await supabase.from(t).delete().neq('id', '__none__');
    console.log(`  ${error ? '⚠' : '✓'} ${t}: ${error ? error.message.substring(0, 60) : 'cleared'}`);
  }

  // Step 3: Insert categories
  console.log('\n═══ Step 3: Inserting categories ═══');
  const cats = new Map();
  ALL_PRODUCTS.forEach(p => { if (!cats.has(p.cat.id)) cats.set(p.cat.id, p.cat); });
  for (const [id, cat] of cats) {
    await supabase.from('categories').upsert({ id, name: cat.name, slug: slugify(cat.name), description: `${cat.name} bei GudPreiss`, image: 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg', product_count: 0 }, { onConflict: 'id' });
  }
  console.log(`  ✓ ${cats.size} categories`);

  // Step 4: Insert brands
  console.log('\n═══ Step 4: Inserting brands ═══');
  const brands = new Map();
  ALL_PRODUCTS.forEach(p => { const b = `brand-${slugify(p.brand)}`; if (!brands.has(b)) brands.set(b, p.brand); });
  for (const [id, name] of brands) {
    await supabase.from('brands').upsert({ id, name, slug: slugify(name), logo: '', description: `${name} – Premium-Marken` }, { onConflict: 'id' });
  }
  console.log(`  ✓ ${brands.size} brands`);

  // Step 5: Insert products
  console.log(`\n═══ Step 5: Inserting ${ALL_PRODUCTS.length} products ═══`);
  let ok = 0, fail = 0;
  for (let i = 0; i < ALL_PRODUCTS.length; i++) {
    const p = ALL_PRODUCTS[i];
    const product = {
      id: `prod-${slugify(p.source)}-${i}`, name: p.name, slug: slugify(p.name),
      description: `${p.desc} Kaufen Sie ${p.name} zum besten Preis bei GudPreiss mit 2 Jahren Garantie.`,
      short_description: p.shortDesc, price: p.price, compare_at_price: p.compareAt,
      images: p.images, category_id: p.cat.id, category_name: p.cat.name,
      brand_id: `brand-${slugify(p.brand)}`, brand_name: p.brand, sku: p.sku,
      stock: 10 + Math.floor(Math.random() * 40), featured: i < 12,
      best_seller: i % 5 === 0, new_arrival: i < 20, on_sale: p.compareAt > p.price,
      rating: Math.round((4.3 + Math.random() * 0.7) * 10) / 10,
      reviews_count: Math.floor(Math.random() * 100) + 10, specifications: p.specs,
    };
    const { error } = await supabase.from('products').upsert(product, { onConflict: 'id' });
    if (error) { fail++; if (fail <= 3) console.error(`  ✗ ${p.name}: ${error.message.substring(0, 60)}`); }
    else ok++;
    if ((ok + fail) % 20 === 0) console.log(`  Progress: ${ok + fail}/${ALL_PRODUCTS.length}`);
  }

  console.log(`\n╔═══════════════════════════════════════════════════╗`);
  console.log(`║  DONE! ${ok} products inserted, ${fail} errors             ║`);
  console.log(`║  Sources: O2(${o2Data.length}) + Otelo(12) + Blau(10) + Refurbed(${refurbedProducts.size}) ║`);
  console.log(`╚═══════════════════════════════════════════════════╝`);
}

main().catch(console.error);
