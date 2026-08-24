const fs = require('fs');
const path = require('path');

const filePath = 'src/lib/db/initial-data.ts';
let content = fs.readFileSync(filePath, 'utf8');

console.log('=== FIX ALL PRODUCTS DATA (v2) ===\n');

// ── STEP 1: Remove duplicate products ──────────────────────────────
console.log('Step 1: Removing duplicate products...');

// Find all product blocks by finding each "{\n    "id": "prod-" pattern
const productStartPattern = /\s+\{\s*\r?\n\s+"id": "prod-/g;
const starts = [];
let match;
while ((match = productStartPattern.exec(content)) !== null) {
  starts.push(match.index);
}

console.log(`  Found ${starts.length} product block starts`);

// Extract each product block (from one start to the next)
const seenIds = new Set();
let removedCount = 0;
const keepRanges = [];

for (let i = 0; i < starts.length; i++) {
  const start = starts[i];
  const end = i + 1 < starts.length ? starts[i + 1] : content.indexOf('];\n\nexport const INITIAL_BRANDS');
  
  const block = content.substring(start, end);
  const idMatch = block.match(/"id": "(prod-[^"]+)"/);
  
  if (idMatch) {
    if (seenIds.has(idMatch[1])) {
      removedCount++;
      continue;
    }
    seenIds.add(idMatch[1]);
    keepRanges.push({ start, end });
  }
}

console.log(`  Will remove ${removedCount} duplicate products`);

// Build new content by keeping only non-duplicate ranges
let newContent = content.substring(0, keepRanges[0].start);
for (let i = 0; i < keepRanges.length; i++) {
  const { start, end } = keepRanges[i];
  newContent += content.substring(start, end);
}
newContent += content.substring(keepRanges[keepRanges.length - 1].end);

content = newContent;

// ── STEP 2: Fix PlayStation prices (post-April 2026 price hike) ────
console.log('\nStep 2: Fixing PlayStation prices...');

const priceUpdates = [
  // Amazon duplicates
  { id: 'prod-amz-001', oldPrice: '799.99', newPrice: '949.99', oldCompare: '849.99', newCompare: '999.99' },
  { id: 'prod-amz-002', oldPrice: '549.99', newPrice: '599.99', oldCompare: '599.99', newCompare: '649.99' },
  { id: 'prod-amz-044', oldPrice: '599.99', newPrice: '649.99', oldCompare: '649.99', newCompare: '699.99' },
  { id: 'prod-amz-045', oldPrice: '229.99', newPrice: '239.99', oldCompare: '249.99', newCompare: '259.99' },
  // PlayStation products
  { id: 'prod-ps5-pro-2tb', oldPrice: '799.99', newPrice: '949.99', oldCompare: '849.99', newCompare: '999.99' },
  { id: 'prod-ps5-slim-disc-1tb', oldPrice: '549.99', newPrice: '599.99', oldCompare: '599.99', newCompare: '649.99' },
  { id: 'prod-ps5-slim-digital-1tb', oldPrice: '449.99', newPrice: '509.99', oldCompare: '499.99', newCompare: '549.99' },
  { id: 'prod-ps5-bundle-astro-bot', oldPrice: '579.99', newPrice: '629.99', oldCompare: '629.99', newCompare: '679.99' },
  { id: 'prod-ps-vr2-headset', oldPrice: '599.99', newPrice: '649.99', oldCompare: '649.99', newCompare: '699.99' },
];

for (const update of priceUpdates) {
  // Fix price - search in the product block
  const priceRe = new RegExp(`("id": "${update.id}"[\\s\\S]*?"price": )${update.oldPrice}`);
  if (content.match(priceRe)) {
    content = content.replace(priceRe, `$1${update.newPrice}`);
    console.log(`  ✅ ${update.id} price: €${update.oldPrice} → €${update.newPrice}`);
  }
  
  // Fix compare_at_price
  const compareRe = new RegExp(`("id": "${update.id}"[\\s\\S]*?"compare_at_price": )${update.oldCompare}`);
  if (content.match(compareRe)) {
    content = content.replace(compareRe, `$1${update.newCompare}`);
  }
}

// ── STEP 3: Add short_description to Amazon products ────────────────
console.log('\nStep 3: Adding short_description to Amazon products...');

const shortDescMap = {
  'prod-amz-001': 'Sony PS5 Pro Konsole mit 2TB SSD, PSSR KI-Upscaling, Raytracing & Wi-Fi 7 | 4K/120FPS Gaming.',
  'prod-amz-002': 'Sony PS5 Slim Disc Edition mit Ultra HD Blu-ray Laufwerk und 1TB NVMe SSD Speicher.',
  'prod-amz-003': 'Original Sony DualSense Controller für PS5 in Midnight Black mit haptischem Feedback.',
  'prod-amz-004': 'CUBE Reaction Hybrid Pro 750 Allroad E-Bike mit Bosch CX 85Nm Motor & 750Wh Akku (2026).',
  'prod-amz-005': 'CUBE Stereo Hybrid 140 HPC Race Carbon E-MTB mit Bosch CX & RockShox 140mm Fahrwerk.',
  'prod-amz-006': 'Apple MacBook Air 15" M3 Chip mit 16GB RAM & 512GB SSD – ultradünn, bis zu 18h Akku.',
  'prod-amz-007': 'Sony WH-1000XM5 Wireless Noise Cancelling Kopfhörer – branchenführendes ANC & Hi-Res Sound.',
  'prod-amz-008': 'Bose QuietComfort Ultra Over-Ear Kopfhörer mit Spatial Audio & 24h Akkulaufzeit.',
  'prod-amz-009': 'Apple AirPods Pro 2. Generation mit USB-C Ladecase, adaptiver Audio & Noise Cancelling.',
  'prod-amz-010': 'Samsung Galaxy S24 Ultra 5G mit 512GB Speicher, Titanium Gray, S Pen & 200MP Kamera.',
  'prod-amz-011': 'Apple iPhone 15 Pro Max 256GB in Titan Natur mit A17 Pro Chip & 48MP Triple-Kamera.',
  'prod-amz-012': 'Apple Watch Ultra 2 GPS + Cellular 49mm Titan – robusteste Apple Watch für Abenteuer.',
  'prod-amz-013': 'Garmin Fenix 7X Pro Sapphire Solar – Premium GPS-Multisportuhr mit Solarladung.',
  'prod-amz-014': 'Garmin Edge 1040 Solar – Fahrradcomputer mit Solarladung, Navigation & Performance-Metriken.',
  'prod-amz-015': 'Haibike AllMtn 3 Fully E-Mountainbike mit Bosch CX 750Wh – All-Mountain Fully für Gelände.',
  'prod-amz-016': 'SCOTT Lumen eRIDE 910 Carbon Lightweight E-MTB – ultraleichtes Fully mit TQ Motor.',
  'prod-amz-017': 'Conway XYRON S 2.7 Fully E-Mountainbike mit Bosch Performance CX & 750Wh Akku.',
  'prod-amz-018': 'ASUS ROG Zephyrus G16 Gaming Laptop mit RTX 4080, OLED 240Hz Display & Intel Core i9.',
  'prod-amz-019': 'Lenovo Legion Pro 7i Gaming Laptop mit RTX 4090, 32GB RAM & 16" WQXGA Display.',
  'prod-amz-020': 'Nintendo Switch OLED Modell White Edition – handheld & TV-Modus mit 7" OLED Display.',
  'prod-amz-021': 'Steam Deck OLED 1TB NVMe SSD Handheld – Valve Gaming-Handheld mit OLED Display.',
  'prod-amz-022': 'ASUS ROG Ally X Gaming Handheld mit 1TB SSD, 24GB RAM & AMD Z1 Extreme.',
  'prod-amz-023': 'LG OLED evo C3 65" 4K Smart TV mit 120Hz, Dolby Vision IQ & HDMI 2.1.',
  'prod-amz-024': 'Sonos Era 300 Smart Speaker mit Spatial Audio, Dolby Atmos & Trueplay Tuning.',
  'prod-amz-025': 'Sonos Beam Gen 2 Kompakte Smart Soundbar mit Dolby Atmos & HDMI eARC.',
  'prod-amz-026': 'Dyson V15 Detect Extra Kabelloser Akkusauger mit 240 AW & Laser-Stauberkennung.',
  'prod-amz-027': 'iRobot Roomba Combo j7+ Saug- und Wischroboter mit Absaugstation & Hinderniserkennung.',
  'prod-amz-028': 'DeLonghi Magnifica S EAM 2200 Kaffeevollautomat – frischer Kaffee auf Knopfdruck.',
  'prod-amz-029': 'Ninja Foodi MAX DualZone Heißluftfritteuse 9,5L (AF400EU) – 2 unabhängige Körbe.',
  'prod-amz-030': 'DJI Mini 4 Pro Fly More Combo mit DJI RC 2 – ultraleichte 4K Drohne unter 249g.',
  'prod-amz-031': 'GoPro HERO12 Black Action-Kamera mit 5.3K60 Video & HyperSmooth 6.0 Stabilisierung.',
  'prod-amz-032': 'Insta360 X4 8K 360-Grad Actioncam mit AI Bearbeitung & 5.7K120 Slow-Mo.',
  'prod-amz-033': 'Wahoo KICKR v6 Smart Trainer Hometrainer Direct Drive – präzises Indoor-Training.',
  'prod-amz-034': 'Anker 737 Powerbank 24.000mAh mit 140W USB-C Output – schnelles Aufladen für Laptops.',
  'prod-amz-035': 'Samsung T7 Shield 2TB Portable SSD – extern, 1050 MB/s, IP65 wasser- und staubdicht.',
  'prod-amz-036': 'Logitech MX Master 3S Wireless Maus Graphit – 8K DPI, Quiet Clicks & USB-C.',
  'prod-amz-037': 'SteelSeries Arctis Nova Pro Wireless Gaming Headset – Multi-System für PS5 & PC.',
  'prod-amz-038': 'Apple AirPods Max Space Gray Wireless Over-Ear Kopfhörer mit ANC & Spatial Audio.',
  'prod-amz-039': 'Sennheiser Momentum 4 Wireless Kopfhörer Schwarz – 60h Akku & Hi-Res Sound.',
  'prod-amz-040': 'Samsung Galaxy Watch6 Classic 47mm LTE Schwarz – Smartwatch mit drehscharfem Rahmen.',
  'prod-amz-041': 'Google Pixel 8 Pro 256GB Bay Blue mit Gemini AI & 50MP Triple-Kamera.',
  'prod-amz-042': 'Apple MacBook Pro 16" M3 Max mit 36GB RAM & 1TB SSD Space Schwarz – Profi-Laptop.',
  'prod-amz-043': 'Dell XPS 16 Laptop mit Intel Core Ultra 9, 32GB RAM & RTX 4070.',
  'prod-amz-044': 'PlayStation VR2 Horizon Call of the Mountain VR Bundle – Next-Gen VR für PS5.',
  'prod-amz-045': 'Sony DualSense Edge Wireless Controller PS5 Pro Ready – Pro-Controller mit austauschbaren Sticks.',
  'prod-amz-046': 'Samsung Neo QLED 65" QN90C 4K TV mit 120Hz, Quantum Mini LED & Dolby Atmos.',
  'prod-amz-047': 'Vorwerk Thermomix TM6 Küchenmaschine Komplett-Set – 20+ Funktionen in einem Gerät.',
  'prod-amz-048': 'Tacx NEO 2T Smart Trainer Garmin Direct Drive – leiser Indoor-Trainer mit realistischer Straße.',
  'prod-amz-049': 'Philips Baristina Kaffeemaschine – Espresso auf Knopfdruck mit frisch gemahlenen Bohnen.',
  'prod-amz-050': 'Logitech G PRO X 2 LIGHTSPEED Wireless Gaming Headset mit Graphene-Treibern.',
};

let shortDescCount = 0;
for (const [id, desc] of Object.entries(shortDescMap)) {
  // Check if this product already has short_description in its block
  const idIdx = content.indexOf(`"id": "${id}"`);
  if (idIdx === -1) continue;
  
  // Find the next product or end of array to define block boundary
  const nextProdIdx = content.indexOf('"id": "prod-', idIdx + 10);
  const blockEnd = nextProdIdx !== -1 ? nextProdIdx : content.indexOf('];\n\nexport const INITIAL_BRANDS');
  const block = content.substring(idIdx, blockEnd);
  
  if (block.includes('"short_description"')) {
    continue; // Already has it
  }
  
  // Insert short_description after "price": ...,
  const pricePattern = new RegExp(`("id": "${id}"[\\s\\S]*?"price": [\\d.]+,)`);
  if (content.match(pricePattern)) {
    content = content.replace(pricePattern, `$1\n    "short_description": "${desc}",`);
    shortDescCount++;
  }
}
console.log(`  Added short_description to ${shortDescCount} Amazon products`);

// ── STEP 4: Write the fixed file ────────────────────────────────────
console.log('\nStep 4: Writing fixed file...');
fs.writeFileSync(filePath, content, 'utf8');

// Verify
const verifyContent = fs.readFileSync(filePath, 'utf8');
const finalIds = [...verifyContent.matchAll(/"id": "(prod-[^"]+)"/g)].map(m => m[1]);
const finalUnique = [...new Set(finalIds)];

const shortDescFinal = (verifyContent.match(/"short_description":/g) || []).length;
const localImgCount = (verifyContent.match(/\/images\/products\//g) || []).length;

console.log(`\n✅ DONE!`);
console.log(`  Products: ${finalIds.length} entries, ${finalUnique.length} unique`);
console.log(`  Products with short_description: ${shortDescFinal}`);
console.log(`  Local image refs: ${localImgCount}`);
