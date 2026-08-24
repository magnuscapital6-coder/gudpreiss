const fs = require('fs');
const filePath = 'src/lib/db/initial-data.ts';
let content = fs.readFileSync(filePath, 'utf8');

console.log('=== COMPREHENSIVE PRODUCT DATA FIX ===\n');

// ── STEP 1: Remove duplicate products ──────────────────────────────
console.log('Step 1: Removing duplicate products...');

const prodStart = content.indexOf('export const INITIAL_PRODUCTS: Product[] = [');
// Products end with ];\r\n\r\n (before Reviews or Brands)
const prodEndCandidates = ['\r\n\r\nexport const', '\r\nexport const'];
let prodEnd = -1;
for (const candidate of prodEndCandidates) {
  const idx = content.indexOf(candidate, prodStart + 100);
  if (idx !== -1 && (prodEnd === -1 || idx < prodEnd)) {
    prodEnd = idx;
  }
}

if (prodEnd === -1) {
  console.log('ERROR: Could not find end of products array');
  process.exit(1);
}

const beforeProducts = content.substring(0, prodStart);
const productsSection = content.substring(prodStart, prodEnd);
const afterProducts = content.substring(prodEnd);

console.log(`  Products section: ${productsSection.length} chars`);

// Find all product starts
const prodStarts = [];
let searchFrom = 0;
while (true) {
  const idx = productsSection.indexOf('\r\n  {\r\n    "id": "prod-', searchFrom);
  if (idx === -1) break;
  prodStarts.push(idx + 2); // +2 for \r\n
  searchFrom = idx + 10;
}

console.log(`  Found ${prodStarts.length} products`);

const seenIds = new Set();
const uniqueProducts = [];
let removedCount = 0;

for (let i = 0; i < prodStarts.length; i++) {
  const start = prodStarts[i];
  const end = i + 1 < prodStarts.length ? prodStarts[i + 1] : productsSection.length;
  const block = productsSection.substring(start, end);
  
  const idMatch = block.match(/"id": "(prod-[^"]+)"/);
  if (idMatch && seenIds.has(idMatch[1])) {
    removedCount++;
    continue;
  }
  if (idMatch) seenIds.add(idMatch[1]);
  uniqueProducts.push(block);
}

console.log(`  Removed ${removedCount} duplicates, keeping ${uniqueProducts.length}`);

// Rebuild
const newProductsSection = 'export const INITIAL_PRODUCTS: Product[] = [\r\n' + uniqueProducts.join('') + '];';
content = beforeProducts + newProductsSection + afterProducts;

// ── STEP 2: Fix PlayStation prices ──────────────────────────────────
console.log('\nStep 2: Fixing PlayStation prices...');

const priceUpdates = {
  'prod-amz-001': { price: 949.99, compare: 999.99 },
  'prod-amz-002': { price: 599.99, compare: 649.99 },
  'prod-amz-044': { price: 649.99, compare: 699.99 },
  'prod-amz-045': { price: 239.99, compare: 259.99 },
  'prod-ps5-pro-2tb': { price: 949.99, compare: 999.99 },
  'prod-ps5-slim-disc-1tb': { price: 599.99, compare: 699.99 },
  'prod-ps5-slim-digital-1tb': { price: 509.99, compare: 549.99 },
  'prod-ps5-bundle-astro-bot': { price: 629.99, compare: 679.99 },
  'prod-ps-vr2-headset': { price: 649.99, compare: 699.99 },
};

for (const [id, updates] of Object.entries(priceUpdates)) {
  const priceRe = new RegExp(`("id": "${id}"[\\s\\S]*?"price": )[\\d.]+`);
  if (content.match(priceRe)) {
    content = content.replace(priceRe, `$1${updates.price}`);
    console.log(`  ✅ ${id}: price → €${updates.price}`);
  }
  const compareRe = new RegExp(`("id": "${id}"[\\s\\S]*?"compare_at_price": )[\\d.]+`);
  if (content.match(compareRe)) {
    content = content.replace(compareRe, `$1${updates.compare}`);
  }
}

// ── STEP 3: Add short_description ──────────────────────────────────
console.log('\nStep 3: Adding short_description to Amazon products...');

const shortDescMap = {
  'prod-amz-001': 'Sony PS5 Pro Konsole mit 2TB SSD, PSSR KI-Upscaling, Raytracing und Wi-Fi 7.',
  'prod-amz-002': 'Sony PS5 Slim Disc Edition mit Ultra HD Blu-ray Laufwerk und 1TB NVMe SSD.',
  'prod-amz-003': 'Original Sony DualSense Controller fuer PS5 in Midnight Black mit haptischem Feedback.',
  'prod-amz-004': 'CUBE Reaction Hybrid Pro 750 Allroad E-Bike mit Bosch CX 85Nm und 750Wh Akku.',
  'prod-amz-005': 'CUBE Stereo Hybrid 140 HPC Race Carbon E-MTB mit Bosch CX und RockShox 140mm.',
  'prod-amz-006': 'Apple MacBook Air 15 Zoll M3 Chip mit 16GB RAM und 512GB SSD, ultraduenn und leicht.',
  'prod-amz-007': 'Sony WH-1000XM5 Wireless Noise Cancelling Kopfhoerer mit branchenfuehrendem ANC.',
  'prod-amz-008': 'Bose QuietComfort Ultra Over-Ear Kopfhoerer mit Spatial Audio und 24h Akkulaufzeit.',
  'prod-amz-009': 'Apple AirPods Pro 2. Generation mit USB-C Ladecase, adaptiver Audio und ANC.',
  'prod-amz-010': 'Samsung Galaxy S24 Ultra 5G mit 512GB Speicher, Titanium Gray, S Pen und 200MP.',
  'prod-amz-011': 'Apple iPhone 15 Pro Max 256GB Titan Natur mit A17 Pro Chip und 48MP Triple-Kamera.',
  'prod-amz-012': 'Apple Watch Ultra 2 GPS + Cellular 49mm Titan, robusteste Apple Watch.',
  'prod-amz-013': 'Garmin Fenix 7X Pro Sapphire Solar, Premium GPS-Multisportuhr mit Solarladung.',
  'prod-amz-014': 'Garmin Edge 1040 Solar, Fahrradcomputer mit Solarladung und Navigation.',
  'prod-amz-015': 'Haibike AllMtn 3 Fully E-MTB mit Bosch CX 750Wh fuer All-Mountain.',
  'prod-amz-016': 'SCOTT Lumen eRIDE 910 Carbon Lightweight E-MTB mit TQ Motor.',
  'prod-amz-017': 'Conway XYRON S 2.7 Fully E-MTB mit Bosch Performance CX und 750Wh Akku.',
  'prod-amz-018': 'ASUS ROG Zephyrus G16 Gaming Laptop mit RTX 4080, OLED 240Hz und Intel Core i9.',
  'prod-amz-019': 'Lenovo Legion Pro 7i Gaming Laptop mit RTX 4090, 32GB RAM und 16 Zoll Display.',
  'prod-amz-020': 'Nintendo Switch OLED Modell White Edition mit 7 Zoll OLED Display.',
  'prod-amz-021': 'Steam Deck OLED 1TB NVMe SSD Handheld mit OLED Display.',
  'prod-amz-022': 'ASUS ROG Ally X Gaming Handheld mit 1TB SSD, 24GB RAM und AMD Z1 Extreme.',
  'prod-amz-023': 'LG OLED evo C3 65 Zoll 4K Smart TV mit 120Hz und HDMI 2.1.',
  'prod-amz-024': 'Sonos Era 300 Smart Speaker mit Spatial Audio und Dolby Atmos.',
  'prod-amz-025': 'Sonos Beam Gen 2 Smart Soundbar mit Dolby Atmos und HDMI eARC.',
  'prod-amz-026': 'Dyson V15 Detect Extra Kabelloser Akkusauger mit 240 AW und Laser-Erkennung.',
  'prod-amz-027': 'iRobot Roomba Combo j7+ Saug- und Wischroboter mit Absaugstation.',
  'prod-amz-028': 'DeLonghi Magnifica S EAM 2200 Kaffeevollautomat auf Knopfdruck.',
  'prod-amz-029': 'Ninja Foodi MAX DualZone Heissluftfritteuse 9,5L mit 2 unabhaengigen Koerben.',
  'prod-amz-030': 'DJI Mini 4 Pro Fly More Combo mit DJI RC 2, ultraleichte 4K Drohne.',
  'prod-amz-031': 'GoPro HERO12 Black Action-Kamera mit 5.3K60 Video und HyperSmooth 6.0.',
  'prod-amz-032': 'Insta360 X4 8K 360-Grad Actioncam mit AI Bearbeitung und 5.7K120 Slow-Mo.',
  'prod-amz-033': 'Wahoo KICKR v6 Smart Trainer Direct Drive fuer Indoor-Training.',
  'prod-amz-034': 'Anker 737 Powerbank 24.000mAh mit 140W USB-C Output.',
  'prod-amz-035': 'Samsung T7 Shield 2TB Portable SSD, 1050 MB/s, IP65 wasser- und staubdicht.',
  'prod-amz-036': 'Logitech MX Master 3S Wireless Maus Graphit, 8K DPI und Quiet Clicks.',
  'prod-amz-037': 'SteelSeries Arctis Nova Pro Wireless Gaming Headset fuer PS5 und PC.',
  'prod-amz-038': 'Apple AirPods Max Space Gray Wireless Over-Ear Kopfhoerer mit ANC.',
  'prod-amz-039': 'Sennheiser Momentum 4 Wireless Kopfhoerer Schwarz mit 60h Akku.',
  'prod-amz-040': 'Samsung Galaxy Watch6 Classic 47mm LTE Schwarz mit drehscharfem Rahmen.',
  'prod-amz-041': 'Google Pixel 8 Pro 256GB Bay Blue mit Gemini AI und 50MP Kamera.',
  'prod-amz-042': 'Apple MacBook Pro 16 Zoll M3 Max mit 36GB RAM und 1TB SSD.',
  'prod-amz-043': 'Dell XPS 16 Laptop mit Intel Core Ultra 9, 32GB RAM und RTX 4070.',
  'prod-amz-044': 'PlayStation VR2 Horizon Call of the Mountain VR Bundle fuer PS5.',
  'prod-amz-045': 'Sony DualSense Edge Wireless Controller mit austauschbaren Sticks.',
  'prod-amz-046': 'Samsung Neo QLED 65 Zoll QN90C 4K TV mit Quantum Mini LED.',
  'prod-amz-047': 'Vorwerk Thermomix TM6 Kuechenmaschine Komplett-Set mit 20+ Funktionen.',
  'prod-amz-048': 'Tacx NEO 2T Smart Trainer Garmin Direct Drive, leiser Indoor-Trainer.',
  'prod-amz-049': 'Philips Baristina Kaffeemaschine, Espresso auf Knopfdruck.',
  'prod-amz-050': 'Logitech G PRO X 2 LIGHTSPEED Wireless Gaming Headset mit Graphene-Treibern.',
};

let sdAdded = 0;
for (const [id, desc] of Object.entries(shortDescMap)) {
  const idIdx = content.indexOf(`"id": "${id}"`);
  if (idIdx === -1) continue;
  
  // Check if short_description already exists
  const nextIdIdx = content.indexOf('"id": "prod-', idIdx + 10);
  const blockEnd = nextIdIdx !== -1 ? nextIdIdx : content.length;
  const block = content.substring(idIdx, blockEnd);
  if (block.includes('"short_description"')) continue;
  
  // Insert after "price": ...,
  const pricePattern = new RegExp(`("id": "${id}"[\\s\\S]*?"price": [\\d.]+,)`);
  if (content.match(pricePattern)) {
    content = content.replace(pricePattern, `$1\n    "short_description": "${desc}",`);
    sdAdded++;
  }
}
console.log(`  Added short_description to ${sdAdded} Amazon products`);

// ── STEP 4: Fix default weights ─────────────────────────────────────
console.log('\nStep 4: Fixing default 1.5kg weights...');

const weightMap = {
  'prod-amz-001': 4.5, 'prod-amz-002': 4.5, 'prod-amz-003': 0.28,
  'prod-amz-004': 24.5, 'prod-amz-005': 22.5, 'prod-amz-006': 1.51,
  'prod-amz-007': 0.25, 'prod-amz-008': 0.25, 'prod-amz-009': 0.05,
  'prod-amz-010': 0.23, 'prod-amz-011': 0.22, 'prod-amz-012': 0.06,
  'prod-amz-013': 0.09, 'prod-amz-014': 0.12, 'prod-amz-015': 23.5,
  'prod-amz-016': 15.5, 'prod-amz-017': 25.0, 'prod-amz-018': 2.5,
  'prod-amz-019': 2.6, 'prod-amz-020': 0.42, 'prod-amz-021': 0.64,
  'prod-amz-022': 0.68, 'prod-amz-023': 18.8, 'prod-amz-024': 4.5,
  'prod-amz-025': 2.8, 'prod-amz-026': 3.1, 'prod-amz-027': 3.4,
  'prod-amz-028': 9.0, 'prod-amz-029': 5.3, 'prod-amz-030': 0.90,
  'prod-amz-031': 0.15, 'prod-amz-032': 0.20, 'prod-amz-033': 22.0,
  'prod-amz-034': 0.63, 'prod-amz-035': 0.10, 'prod-amz-036': 0.14,
  'prod-amz-037': 0.34, 'prod-amz-038': 0.38, 'prod-amz-039': 0.30,
  'prod-amz-040': 0.05, 'prod-amz-041': 0.21, 'prod-amz-042': 2.14,
  'prod-amz-043': 2.0, 'prod-amz-044': 0.56, 'prod-amz-045': 0.33,
  'prod-amz-046': 21.5, 'prod-amz-047': 7.9, 'prod-amz-048': 21.5,
  'prod-amz-049': 3.5, 'prod-amz-050': 0.30,
};

let weightFixed = 0;
for (const [id, weight] of Object.entries(weightMap)) {
  const pattern = new RegExp(`("id": "${id}"[\\s\\S]*?"weight_kg": )[\\d.]+`);
  if (content.match(pattern)) {
    content = content.replace(pattern, `$1${weight}`);
    weightFixed++;
  }
}
console.log(`  Fixed weight for ${weightFixed} Amazon products`);

// ── STEP 5: Write and verify ────────────────────────────────────────
console.log('\nStep 5: Writing fixed file...');
fs.writeFileSync(filePath, content, 'utf8');

// Verify
const verify = fs.readFileSync(filePath, 'utf8');
const allIds = [...verify.matchAll(/"id": "(prod-[^"]+)"/g)].map(m => m[1]);
const uniqueIds = [...new Set(allIds)];
const sdCount = (verify.match(/"short_description":/g) || []).length;
const catDecl = (verify.match(/export const INITIAL_CATEGORIES/g) || []).length;
const brandDecl = (verify.match(/export const INITIAL_BRANDS/g) || []).length;
const prodDecl = (verify.match(/export const INITIAL_PRODUCTS/g) || []).length;

console.log(`\n✅ DONE!`);
console.log(`  Products: ${allIds.length} entries, ${uniqueIds.length} unique`);
console.log(`  Short descriptions: ${sdCount}`);
console.log(`  Structure: ${catDecl} CAT, ${brandDecl} BRAND, ${prodDecl} PROD`);

if (catDecl !== 1 || brandDecl !== 1 || prodDecl !== 1) {
  console.log('⚠️  WARNING: File structure may be broken!');
}
