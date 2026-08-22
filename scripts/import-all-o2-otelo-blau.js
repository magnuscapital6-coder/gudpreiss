const { createClient } = require('@supabase/supabase-js');
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://xfsaznnrhqmlbllsfxzr.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const POSTGRES_URL = process.env.POSTGRES_URL || "postgresql://postgres:magnuscapital6-coder's+Org@db.xfsaznnrhqmlbllsfxzr.supabase.co:5432/postgres";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─── Load scraped o2 data ───────────────────────────────────────────
const o2Scraped = JSON.parse(fs.readFileSync(path.join(__dirname, 'o2-scraped-products.json'), 'utf8'));

// ─── Comprehensive product catalog from all 3 sources ────────────────
const ALL_PRODUCTS = [
  // ═══ O2 PRODUCTS (scraped + enriched) ═══
  ...o2Scraped.filter(p => p.name && !p.error).map((p, i) => ({
    name: p.name,
    brand: extractBrand(p.name),
    category: categorizeProduct(p.name),
    price: getPrice(p.name),
    compareAt: getComparePrice(p.name),
    images: p.images || [],
    description: p.description || `${p.name} – Jetzt bei GudPreiss kaufen.`,
    shortDesc: (p.description || '').substring(0, 200) || `${p.name} – Premium Smartphone`,
    specs: getSpecs(p.name),
    source: 'o2',
    sku: `O2-${String(i + 1).padStart(4, '0')}`,
  })),

  // ═══ OTELO PRODUCTS ═══
  { name: 'Apple iPhone 13', brand: 'Apple', category: 'Smartphones', price: 549, compareAt: 699, images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-blue-select-2021?wid=800&hei=800&fmt=jpeg&qlt=90'], description: 'Das Apple iPhone 13 vereint elegantes Design mit starker A15 Bionic Performance.', shortDesc: 'Apple iPhone 13 – A15 Bionic, 6.1" Super Retina XDR', specs: {'Display': '6.1" Super Retina XDR OLED, 2532 x 1179', 'Prozessor': 'Apple A15 Bionic', 'Kamera': '12 MP Doppelkamera', 'Speicher': '128 GB / 256 GB / 512 GB', 'Akku': 'Bis zu 19h Videowiedergabe', 'Wasserschutz': 'IP68'}, source: 'otelo', sku: 'OTE-0001' },
  { name: 'Apple iPhone 13 mini', brand: 'Apple', category: 'Smartphones', price: 499, compareAt: 649, images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-mini-blue-select-2021?wid=800&hei=800&fmt=jpeg&qlt=90'], description: 'Das kleinste und leichteste iPhone 13 mit A15 Bionic.', shortDesc: 'Apple iPhone 13 mini – Kompakt & leistungsstark', specs: {'Display': '5.4" Super Retina XDR OLED', 'Prozessor': 'Apple A15 Bionic', 'Kamera': '12 MP Doppelkamera', 'Speicher': '128 GB / 256 GB / 512 GB', 'Akku': 'Bis zu 17h Videowiedergabe'}, source: 'otelo', sku: 'OTE-0002' },
  { name: 'Apple iPhone SE 2022', brand: 'Apple', category: 'Smartphones', price: 399, compareAt: 449, images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-se-starlight-select-2022?wid=800&hei=800&fmt=jpeg&qlt=90'], description: 'Das günstigste iPhone mit A15 Bionic und 5G.', shortDesc: 'Apple iPhone SE 2022 – 5G, A15 Bionic, kompakt', specs: {'Display': '4.7" Retina HD', 'Prozessor': 'Apple A15 Bionic', 'Kamera': '12 MP', 'Speicher': '64 GB / 128 GB / 256 GB'}, source: 'otelo', sku: 'OTE-0003' },
  { name: 'Apple iPhone 14', brand: 'Apple', category: 'Smartphones', price: 699, compareAt: 799, images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-starlight-select-2022?wid=800&hei=800&fmt=jpeg&qlt=90'], description: 'Das iPhone 14 mit Sicherheits-Features und starker Kamera.', shortDesc: 'Apple iPhone 14 – Sicherheit & Kamera-System', specs: {'Display': '6.1" Super Retina XDR OLED', 'Prozessor': 'Apple A15 Bionic', 'Kamera': '12 MP Doppelkamera', 'Speicher': '128 GB / 256 GB / 512 GB', 'Wasserschutz': 'IP68'}, source: 'otelo', sku: 'OTE-0004' },
  { name: 'Samsung Galaxy A32 5G', brand: 'Samsung', category: 'Smartphones', price: 229, compareAt: 299, images: ['https://images.samsung.com/is/image/samsung/p6pim/de/galaxy-a32-5g/galaxy-a32-5g-sm-a326bzadeu/gallery/de-galaxy-a32-5g-sm-a326bzadeu-360393637'], description: '5G-Ready Smartphone mit großem Display und vielseitiger Kamera.', shortDesc: 'Samsung Galaxy A32 5G – 5G, 6.5" Display', specs: {'Display': '6.5" TFT LCD, 720 x 1600', 'Prozessor': 'MediaTek Dimensity 720', 'Kamera': '48 MP Quad-Kamera', 'Akku': '5.000 mAh', 'Speicher': '128 GB', 'RAM': '4 GB / 6 GB / 8 GB'}, source: 'otelo', sku: 'OTE-0005' },
  { name: 'Samsung Galaxy A14 5G', brand: 'Samsung', category: 'Smartphones', price: 179, compareAt: 219, images: ['https://images.samsung.com/is/image/samsung/p6pim/de/galaxy-a14-5g/galaxy-a14-5g-sm-a146bzadeu/gallery/de-galaxy-a14-5g-sm-a146bzadeu-535408704'], description: 'Einstiegs-5G-Smartphone mit großem Display.', shortDesc: 'Samsung Galaxy A14 5G – Einstieg ins 5G', specs: {'Display': '6.6" PLS LCD, 1080 x 2408', 'Prozessor': 'MediaTek Dimensity 700', 'Kamera': '50 MP Dreifach-Kamera', 'Akku': '5.000 mAh', 'Speicher': '64 GB / 128 GB'}, source: 'otelo', sku: 'OTE-0006' },
  { name: 'Samsung Galaxy A54 5G', brand: 'Samsung', category: 'Smartphones', price: 389, compareAt: 449, images: ['https://images.samsung.com/is/image/samsung/p6pim/de/galaxy-a54-5g/galaxy-a54-5g-sm-a546bzadeu/gallery/de-galaxy-a54-5g-sm-a546bzadeu-535408704'], description: 'OLED-Display, Triple-Kamera und 5G-Performance.', shortDesc: 'Samsung Galaxy A54 5G – OLED, Triple-Kamera', specs: {'Display': '6.4" Super AMOLED, 1080 x 2340, 120Hz', 'Prozessor': 'Samsung Exynos 1380', 'Kamera': '50 MP Triple-Kamera', 'Akku': '5.000 mAh', 'Wasserschutz': 'IP67'}, source: 'otelo', sku: 'OTE-0007' },
  { name: 'Samsung Galaxy S23', brand: 'Samsung', category: 'Smartphones', price: 649, compareAt: 799, images: ['https://images.samsung.com/is/image/samsung/p6pim/de/galaxy-s23/gallery/de-galaxy-s23-s911-sm-s911bzadeu-535408704'], description: 'Kompaktes Flaggschiff mit Snapdragon 8 Gen 2.', shortDesc: 'Samsung Galaxy S23 – Flaggschiff-Kompaktformat', specs: {'Display': '6.1" Dynamic AMOLED 2X, 120Hz', 'Prozessor': 'Snapdragon 8 Gen 2', 'Kamera': '50 MP Triple-Kamera', 'Akku': '3.900 mAh', 'Wasserschutz': 'IP68'}, source: 'otelo', sku: 'OTE-0008' },
  { name: 'Google Pixel 6', brand: 'Google', category: 'Smartphones', price: 449, compareAt: 549, images: ['https://lh3.googleusercontent.com/EDKmX1p3Ljh1TEstXmvVpW4rH_KtHIVR8rEtinJWO44R96PNi2rQ-jXm9gAbQ_-93TnT0SwVAjf2pEPLhSC7KIY-lT6U0zgj8ic'], description: 'Google Pixel 6 mit Tensor-Chip und exzellenter Kamera.', shortDesc: 'Google Pixel 6 – Tensor Chip, Android 13', specs: {'Display': '6.4" OLED, 1080 x 2400, 90Hz', 'Prozessor': 'Google Tensor', 'Kamera': '50 MP + 12 MP Ultraweitwinkel', 'Akku': '4.614 mAh', 'Wasserschutz': 'IP68'}, source: 'otelo', sku: 'OTE-0009' },
  { name: 'Google Pixel 7 Pro', brand: 'Google', category: 'Smartphones', price: 649, compareAt: 799, images: ['https://lh3.googleusercontent.com/EDKmX1p3Ljh1TEstXmvVpW4rH_KtHIVR8rEtinJWO44R96PNi2rQ-jXm9gAbQ_-93TnT0SwVAjf2pEPLhSC7KIY-lT6U0zgj8ic'], description: 'Flaggschiff mit Tensor G2 und Teleobjektiv.', shortDesc: 'Google Pixel 7 Pro – Flaggschiff mit Tele', specs: {'Display': '6.7" LTPO OLED, 1440 x 3120, 120Hz', 'Prozessor': 'Google Tensor G2', 'Kamera': '50 MP + 12 MP + 48 MP Tele (5x)', 'Akku': '5.000 mAh', 'Wasserschutz': 'IP68'}, source: 'otelo', sku: 'OTE-0010' },
  { name: 'Xiaomi Redmi Note 10 Pro', brand: 'Xiaomi', category: 'Smartphones', price: 229, compareAt: 279, images: ['https://i01.appmifile.com/v1/MI_18455B3E4DA706226CF7535A58E875F0267/pms_1623012537.05021497!800x800.png'], description: '108 MP Kamera und 120Hz AMOLED-Display.', shortDesc: 'Xiaomi Redmi Note 10 Pro – 108 MP, AMOLED', specs: {'Display': '6.67" AMOLED, 1080 x 2400, 120Hz', 'Prozessor': 'Snapdragon 732G', 'Kamera': '108 MP Quad-Kamera', 'Akku': '5.020 mAh', 'Speicher': '64 GB / 128 GB'}, source: 'otelo', sku: 'OTE-0011' },
  { name: 'Xiaomi 12 Lite 5G', brand: 'Xiaomi', category: 'Smartphones', price: 299, compareAt: 349, images: ['https://i01.appmifile.com/v1/MI_18455B3E4DA706226CF7535A58E875F0267/pms_1658807959.19395498!800x800.png'], description: 'Leichtes 5G-Smartphone mit AMOLED-Display.', shortDesc: 'Xiaomi 12 Lite 5G – Leicht & 5G-ready', specs: {'Display': '6.55" AMOLED, 1080 x 2400, 120Hz', 'Prozessor': 'Snapdragon 778G', 'Kamera': '108 MP Dreifach-Kamera', 'Akku': '4.300 mAh', 'Wasserschutz': 'IP53'}, source: 'otelo', sku: 'OTE-0012' },

  // ═══ BLAU PRODUCTS ═══
  { name: 'Apple iPhone 15', brand: 'Apple', category: 'Smartphones', price: 699, compareAt: 799, images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-black-select-202309?wid=800&hei=800&fmt=jpeg&qlt=90'], description: 'iPhone 15 mit USB-C, Dynamic Island und 48 MP Kamera.', shortDesc: 'Apple iPhone 15 – USB-C, Dynamic Island', specs: {'Display': '6.1" Super Retina XDR OLED, 2556 x 1179', 'Prozessor': 'Apple A16 Bionic', 'Kamera': '48 MP + 12 MP Ultraweitwinkel', 'Speicher': '128 GB / 256 GB / 512 GB', 'Akku': 'Bis zu 20h Videowiedergabe', 'Wasserschutz': 'IP68'}, source: 'blau', sku: 'BLA-0001' },
  { name: 'Apple iPhone 15 Pro', brand: 'Apple', category: 'Smartphones', price: 999, compareAt: 1099, images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=800&hei=800&fmt=jpeg&qlt=90'], description: 'iPhone 15 Pro mit Titan-Design und A17 Pro Chip.', shortDesc: 'Apple iPhone 15 Pro – Titan, A17 Pro', specs: {'Display': '6.1" Super Retina XDR OLED, ProMotion 120Hz', 'Prozessor': 'Apple A17 Pro', 'Kamera': '48 MP Triple-Kamera (3x Tele)', 'Speicher': '128 GB / 256 GB / 512 GB / 1 TB', 'Wasserschutz': 'IP68'}, source: 'blau', sku: 'BLA-0002' },
  { name: 'Apple iPhone 15 Pro Max', brand: 'Apple', category: 'Smartphones', price: 1199, compareAt: 1299, images: ['https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-max-finish-select-202309-6-7inch-naturaltitanium?wid=800&hei=800&fmt=jpeg&qlt=90'], description: 'Das größte iPhone mit 5x Teleobjektiv und Titan-Gehäuse.', shortDesc: 'Apple iPhone 15 Pro Max – 5x Tele, Titan', specs: {'Display': '6.7" Super Retina XDR OLED, ProMotion 120Hz', 'Prozessor': 'Apple A17 Pro', 'Kamera': '48 MP Quad-Kamera (5x Tele)', 'Speicher': '256 GB / 512 GB / 1 TB', 'Wasserschutz': 'IP68'}, source: 'blau', sku: 'BLA-0003' },
  { name: 'Samsung Galaxy S24', brand: 'Samsung', category: 'Smartphones', price: 749, compareAt: 849, images: ['https://images.samsung.com/is/image/samsung/p6pim/de/galaxy-s24/gallery/de-galaxy-s24-s921-sm-s921bzadeu-535408704'], description: 'Samsung Galaxy S24 mit Galaxy AI und Snapdragon 8 Gen 3.', shortDesc: 'Samsung Galaxy S24 – Galaxy AI, Snapdragon 8 Gen 3', specs: {'Display': '6.2" Dynamic AMOLED 2X, 120Hz', 'Prozessor': 'Snapdragon 8 Gen 3', 'Kamera': '50 MP Triple-Kamera', 'Akku': '4.000 mAh', 'Wasserschutz': 'IP68'}, source: 'blau', sku: 'BLA-0004' },
  { name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', category: 'Smartphones', price: 1299, compareAt: 1399, images: ['https://images.samsung.com/is/image/samsung/p6pim/de/galaxy-s24-ultra/gallery/de-galaxy-s24-ultra-s928-sm-s928bzadeu-535408704'], description: 'Samsung Galaxy S24 Ultra mit S Pen und 200 MP Kamera.', shortDesc: 'Samsung Galaxy S24 Ultra – S Pen, 200 MP', specs: {'Display': '6.8" Dynamic AMOLED 2X, 120Hz', 'Prozessor': 'Snapdragon 8 Gen 3', 'Kamera': '200 MP Quad-Kamera', 'Akku': '5.000 mAh', 'Wasserschutz': 'IP68'}, source: 'blau', sku: 'BLA-0005' },
  { name: 'Samsung Galaxy A25 5G', brand: 'Samsung', category: 'Smartphones', price: 219, compareAt: 269, images: ['https://images.samsung.com/is/image/samsung/p6pim/de/galaxy-a25-5g/galaxy-a25-5g-sm-a256bzadeu/gallery/de-galaxy-a25-5g-sm-a256bzadeu-535408704'], description: 'Einstiegs-5G mit AMOLED-Display und Triple-Kamera.', shortDesc: 'Samsung Galaxy A25 5G – Einstieg AMOLED', specs: {'Display': '6.5" Super AMOLED, 1080 x 2340, 120Hz', 'Prozessor': 'Exynos 1280', 'Kamera': '50 MP Triple-Kamera', 'Akku': '5.000 mAh', 'Speicher': '128 GB'}, source: 'blau', sku: 'BLA-0006' },
  { name: 'Xiaomi Redmi 13C', brand: 'Xiaomi', category: 'Smartphones', price: 119, compareAt: 149, images: ['https://i01.appmifile.com/v1/MI_18455B3E4DA706226CF7535A58E875F0267/pms_1700549593.74894563!800x800.png'], description: 'Günstiges Smartphone mit 50 MP Kamera.', shortDesc: 'Xiaomi Redmi 13C – Budget-Kracher', specs: {'Display': '6.74" IPS LCD, 720 x 1600', 'Prozessor': 'MediaTek Helio G85', 'Kamera': '50 MP + Makro + Tiefenschärfe', 'Akku': '5.000 mAh', 'Speicher': '128 GB / 256 GB'}, source: 'blau', sku: 'BLA-0007' },
  { name: 'Xiaomi Redmi Note 13', brand: 'Xiaomi', category: 'Smartphones', price: 199, compareAt: 249, images: ['https://i01.appmifile.com/v1/MI_18455B3E4DA706226CF7535A58E875F0267/pms_1704790686.50984975!800x800.png'], description: 'AMOLED-Display und 108 MP Kamera im Mittelklasse-Segment.', shortDesc: 'Xiaomi Redmi Note 13 – AMOLED, 108 MP', specs: {'Display': '6.67" AMOLED, 1080 x 2400, 120Hz', 'Prozessor': 'Snapdragon 685', 'Kamera': '108 MP Triple-Kamera', 'Akku': '5.000 mAh', 'Speicher': '128 GB / 256 GB'}, source: 'blau', sku: 'BLA-0008' },
  { name: 'Google Pixel 8', brand: 'Google', category: 'Smartphones', price: 599, compareAt: 699, images: ['https://lh3.googleusercontent.com/EDKmX1p3Ljh1TEstXmvVpW4rH_KtHIVR8rEtinJWO44R96PNi2rQ-jXm9gAbQ_-93TnT0SwVAjf2pEPLhSC7KIY-lT6U0zgj8ic'], description: 'Google Pixel 8 mit Tensor G3 und 7 Jahre Updates.', shortDesc: 'Google Pixel 8 – Tensor G3, 7 Jahre Updates', specs: {'Display': '6.2" OLED, 1080 x 2400, 120Hz', 'Prozessor': 'Google Tensor G3', 'Kamera': '50 MP + 12 MP Ultraweitwinkel', 'Akku': '4.575 mAh', 'Wasserschutz': 'IP68'}, source: 'blau', sku: 'BLA-0009' },
  { name: 'Google Pixel 8 Pro', brand: 'Google', category: 'Smartphones', price: 799, compareAt: 899, images: ['https://lh3.googleusercontent.com/EDKmX1p3Ljh1TEstXmvVpW4rH_KtHIVR8rEtinJWO44R96PNi2rQ-jXm9gAbQ_-93TnT0SwVAjf2pEPLhSC7KIY-lT6U0zgj8ic'], description: 'Flaggschiff mit Tensor G3, Teleobjektiv und 7 Jahre Updates.', shortDesc: 'Google Pixel 8 Pro – Flaggschiff mit Tele', specs: {'Display': '6.7" LTPO OLED, 1440 x 2992, 120Hz', 'Prozessor': 'Google Tensor G3', 'Kamera': '50 MP + 48 MP + 48 MP Tele (5x)', 'Akku': '5.050 mAh', 'Wasserschutz': 'IP68'}, source: 'blau', sku: 'BLA-0010' },
];

// ─── Helper Functions ────────────────────────────────────────────────
function extractBrand(name) {
  if (/iphone|ipad|macbook|airpods|apple/i.test(name)) return 'Apple';
  if (/galaxy|samsung/i.test(name)) return 'Samsung';
  if (/pixel|google/i.test(name)) return 'Google';
  if (/xiaomi|redmi|poco/i.test(name)) return 'Xiaomi';
  if (/xplora/i.test(name)) return 'Xplora';
  if (/tcl|movetime/i.test(name)) return 'TCL';
  if (/ray.?ban|meta/i.test(name)) return 'Meta';
  return 'O2';
}

function categorizeProduct(name) {
  if (/iphone|galaxy s\d|pixel/i.test(name)) return { id: 'cat-smartphones', name: 'Smartphones' };
  if (/kids.*watch|xplora|tcl.*kids/i.test(name)) return { id: 'cat-kidswatch', name: 'Kids Watches' };
  if (/ray.?ban|meta.*glass|brille/i.test(name)) return { id: 'cat-smartglasses', name: 'Smart Glasses' };
  if (/vr|gaming|playstation|ps5/i.test(name)) return { id: 'cat-gaming', name: 'Gaming & VR' };
  return { id: 'cat-smartphones', name: 'Smartphones' };
}

function getPrice(name) {
  const n = (name || '').toLowerCase();
  const prices = {
    'iphone 17 pro': 1199, 'iphone 17': 949, 'iphone 17e': 599, 'iphone 16e': 499,
    'iphone 16': 799, 'iphone 15': 699, 'iphone 14': 699, 'iphone 13': 549,
    'iphone 13 mini': 499, 'iphone se 2022': 399,
    'galaxy s26 ultra': 1419, 'galaxy s26': 949, 'galaxy s25 ultra': 1199, 'galaxy s25': 799,
    'galaxy s24 ultra': 1299, 'galaxy s24': 749, 'galaxy s23': 649,
    'galaxy a54': 389, 'galaxy a32': 229, 'galaxy a25': 219, 'galaxy a14': 179,
    'pixel 8 pro': 799, 'pixel 8': 599, 'pixel 7 pro': 649, 'pixel 6': 449,
    'pixel 11': 699, 'pixel 9': 599, 'pixel 9 pro': 799,
    'redmi note 10 pro': 229, 'redmi note 13': 199, 'redmi 13c': 119,
    '12 lite': 299,
    'ray-ban meta': 329, 'ray ban meta': 329,
    'xplora x6play': 169, 'xplora x6': 169,
    'tcl mt48': 129, 'tcl movetime': 129,
  };
  for (const [key, val] of Object.entries(prices)) {
    if (n.includes(key)) return val;
  }
  return 299 + Math.floor(Math.random() * 600);
}

function getComparePrice(name) {
  const p = getPrice(name);
  return Math.round(p * 1.15);
}

function getSpecs(name) {
  const n = (name || '').toLowerCase();
  const templates = {
    'iphone 17 pro': {'Display': '6.9" Super Retina XDR OLED, 2868x1320, ProMotion 120Hz', 'Prozessor': 'Apple A19 Pro', 'RAM': '12 GB', 'Kamera': '48 MP Triple (5x Tele)', 'Wasserschutz': 'IP68', 'Betriebssystem': 'iOS 26'},
    'iphone 17': {'Display': '6.3" Super Retina XDR OLED, 2622x1206, 120Hz', 'Prozessor': 'Apple A19', 'RAM': '8 GB', 'Kamera': '48 MP Dual', 'Wasserschutz': 'IP68', 'Betriebssystem': 'iOS 26'},
    'galaxy s26 ultra': {'Display': '6.9" Dynamic AMOLED 2X, 3120x1440, 120Hz', 'Prozessor': 'Snapdragon 8 Elite', 'RAM': '12 GB', 'Kamera': '200 MP Quad', 'Wasserschutz': 'IP68', 'Betriebssystem': 'Android 15, One UI 7'},
    'galaxy s26': {'Display': '6.2" Dynamic AMOLED 2X, 2340x1080, 120Hz', 'Prozessor': 'Snapdragon 8 Elite', 'RAM': '12 GB', 'Kamera': '50 MP Triple', 'Wasserschutz': 'IP68', 'Betriebssystem': 'Android 15, One UI 7'},
    'pixel 8 pro': {'Display': '6.7" LTPO OLED, 1440x2992, 120Hz', 'Prozessor': 'Google Tensor G3', 'RAM': '12 GB', 'Kamera': '50 MP + 48 MP + 48 MP', 'Wasserschutz': 'IP68', 'Betriebssystem': 'Android 14'},
    'pixel 8': {'Display': '6.2" OLED, 1080x2400, 120Hz', 'Prozessor': 'Google Tensor G3', 'RAM': '8 GB', 'Kamera': '50 MP + 12 MP', 'Wasserschutz': 'IP68', 'Betriebssystem': 'Android 14'},
  };
  for (const [key, val] of Object.entries(templates)) {
    if (n.includes(key)) return val;
  }
  return {'Display': '6.1" OLED, 120Hz', 'Prozessor': 'Quad-Core', 'Kamera': '50 MP', 'Akku': '4.000 mAh', 'Wasserschutz': 'IP68'};
}

function slugify(text) {
  return text.toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue').replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

// ─── STEP 1: Create tables via pg ───────────────────────────────────
async function createTables() {
  console.log('\n═══ Step 1: Creating database tables ═══');
  const client = new Client({ connectionString: POSTGRES_URL, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('  Connected to PostgreSQL');
    const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase-schema.sql'), 'utf8');
    await client.query(sql);
    console.log('  ✓ Tables created successfully');
    await client.end();
    return true;
  } catch (err) {
    console.error('  ✗ Table creation failed:', err.message);
    try { await client.end(); } catch {}
    return false;
  }
}

// ─── STEP 2: Delete old data via Supabase ───────────────────────────
async function deleteOldData() {
  console.log('\n═══ Step 2: Deleting old data ═══');
  const tables = ['products', 'categories', 'brands'];
  for (const t of tables) {
    const { error } = await supabase.from(t).delete().neq('id', '__none__');
    if (error) console.log(`  ⚠ ${t}: ${error.message}`);
    else console.log(`  ✓ ${t} cleared`);
  }
}

// ─── STEP 3: Import new data ────────────────────────────────────────
async function importAllData() {
  console.log('\n═══ Step 3: Importing products ═══');

  // Categories
  const cats = new Map();
  ALL_PRODUCTS.forEach(p => {
    const c = typeof p.category === 'string' ? { id: `cat-${slugify(p.category)}`, name: p.category } : p.category;
    if (!cats.has(c.id)) cats.set(c.id, c);
  });
  console.log(`  Creating ${cats.size} categories...`);
  for (const [id, cat] of cats) {
    await supabase.from('categories').upsert({
      id, name: cat.name, slug: slugify(cat.name),
      description: `${cat.name} bei GudPreiss – Top-Marken zum besten Preis.`,
      image: 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg',
      product_count: 0,
    }, { onConflict: 'id' });
  }

  // Brands
  const brands = new Map();
  ALL_PRODUCTS.forEach(p => {
    const bId = `brand-${slugify(p.brand)}`;
    if (!brands.has(bId)) brands.set(bId, { id: bId, name: p.brand, slug: slugify(p.brand) });
  });
  console.log(`  Creating ${brands.size} brands...`);
  for (const [id, brand] of brands) {
    await supabase.from('brands').upsert({
      id: brand.id, name: brand.name, slug: brand.slug, logo: '', description: `${brand.name} – Premium-Markenprodukte`,
    }, { onConflict: 'id' });
  }

  // Products
  console.log(`  Inserting ${ALL_PRODUCTS.length} products...`);
  let ok = 0, fail = 0;
  for (let i = 0; i < ALL_PRODUCTS.length; i++) {
    const p = ALL_PRODUCTS[i];
    const cat = typeof p.category === 'string' ? { id: `cat-${slugify(p.category)}`, name: p.category } : p.category;
    const product = {
      id: `prod-${slugify(p.source)}-${i}`,
      name: p.name,
      slug: slugify(p.name),
      description: `${p.description} – Kaufen Sie ${p.name} zum besten Preis bei GudPreiss mit 2 Jahren Garantie.`,
      short_description: p.shortDesc || `${p.name} bei GudPreiss`,
      price: p.price,
      compare_at_price: p.compareAt,
      images: p.images || [],
      category_id: cat.id,
      category_name: cat.name,
      brand_id: `brand-${slugify(p.brand)}`,
      brand_name: p.brand,
      sku: p.sku,
      stock: 10 + Math.floor(Math.random() * 40),
      featured: i < 10,
      best_seller: i % 4 === 0,
      new_arrival: i < 15,
      on_sale: p.compareAt > p.price,
      rating: Math.round((4.3 + Math.random() * 0.7) * 10) / 10,
      reviews_count: Math.floor(Math.random() * 120) + 15,
      specifications: p.specs || {},
    };
    const { error } = await supabase.from('products').upsert(product, { onConflict: 'id' });
    if (error) { fail++; console.error(`    ✗ ${p.name}: ${error.message}`); }
    else ok++;
    if ((ok + fail) % 10 === 0) console.log(`    Progress: ${ok + fail}/${ALL_PRODUCTS.length}`);
  }
  console.log(`\n  ✓ ${ok} products inserted, ✗ ${fail} errors`);
}

// ─── Main ────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  GudPreiss – O2 + Otelo + Blau Import       ║');
  console.log(`║  ${ALL_PRODUCTS.length} products from 3 sources              ║`);
  console.log('╚══════════════════════════════════════════════╝');

  const tablesOk = await createTables();
  if (!tablesOk) {
    console.log('\n⚠ Tables may already exist or connection failed. Attempting import anyway...');
  }

  await deleteOldData();
  await importAllData();

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║  Import complete!                            ║');
  console.log('╚══════════════════════════════════════════════╝');
}

main().catch(console.error);
