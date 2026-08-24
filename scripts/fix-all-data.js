const fs = require('fs');
const path = require('path');

const filePath = 'src/lib/db/initial-data.ts';
let content = fs.readFileSync(filePath, 'utf8');

console.log('=== FIX ALL PRODUCTS DATA ===\n');

// ── STEP 1: Remove duplicate products ──────────────────────────────
console.log('Step 1: Removing duplicate products...');

const prodStart = content.indexOf('export const INITIAL_PRODUCTS: Product[] = [');
const prodEndMarker = '];\n\nexport const INITIAL_BRANDS';
const prodEnd = content.indexOf(prodEndMarker, prodStart);

const beforeProd = content.substring(0, prodStart);
const prodArray = content.substring(prodStart, prodEnd);
const afterProd = content.substring(prodEnd);

// Find all product blocks
const idPositions = [];
let si = prodArray.indexOf('"id": "prod-');
while (si !== -1) {
  idPositions.push(si);
  si = prodArray.indexOf('"id": "prod-', si + 1);
}

// Keep only first occurrence of each ID
const seenIds = new Set();
let removedCount = 0;
const dedupedBlocks = [];

for (let i = 0; i < idPositions.length; i++) {
  const start = idPositions[i];
  const end = i + 1 < idPositions.length ? idPositions[i + 1] : prodArray.length;
  const block = prodArray.substring(start, end);
  
  const idMatch = block.match(/"id": "(prod-[^"]+)"/);
  if (idMatch) {
    if (seenIds.has(idMatch[1])) {
      removedCount++;
      continue; // Skip duplicate
    }
    seenIds.add(idMatch[1]);
  }
  dedupedBlocks.push(block);
}

console.log(`  Removed ${removedCount} duplicate products`);

// Rebuild the products section
const newProdArray = prodArray.substring(0, prodArray.indexOf('"id": "prod-')) + dedupedBlocks.join('');
content = beforeProd + newProdArray + afterProd;

// ── STEP 2: Fix PlayStation prices (post-April 2026 price hike) ────
console.log('\nStep 2: Fixing PlayStation prices...');

const priceFixes = {
  'prod-amz-001': { name: 'PS5 Pro 2TB', oldPrice: 799.99, newPrice: 949.99, newCompare: 999.99 },
  'prod-amz-002': { name: 'PS5 Slim Disc 1TB', oldPrice: 549.99, newPrice: 599.99, newCompare: 649.99 },
  'prod-amz-044': { name: 'PSVR2 Horizon Bundle', oldPrice: 599.99, newPrice: 649.99, newCompare: 699.99 },
  'prod-amz-045': { name: 'DualSense Edge', oldPrice: 229.99, newPrice: 239.99, newCompare: 249.99 },
  'prod-ps5-pro-2tb': { name: 'PS5 Pro 2TB', oldPrice: 799.99, newPrice: 949.99, newCompare: 999.99 },
  'prod-ps5-slim-disc-1tb': { name: 'PS5 Slim Disc 1TB', oldPrice: 549.99, newPrice: 599.99, newCompare: 649.99 },
  'prod-ps5-slim-digital-1tb': { name: 'PS5 Slim Digital', oldPrice: 449.99, newPrice: 509.99, newCompare: 549.99 },
  'prod-ps5-bundle-astro-bot': { name: 'PS5 Slim + Astro Bot', oldPrice: 579.99, newPrice: 629.99, newCompare: 679.99 },
  'prod-ps-vr2-headset': { name: 'PS VR2 Headset', oldPrice: 599.99, newPrice: 649.99, newCompare: 699.99 },
};

for (const [id, fix] of Object.entries(priceFixes)) {
  const pricePattern = new RegExp(`("id": "${id}"[\\s\\S]*?"price": )(${fix.oldPrice})`);
  if (content.match(pricePattern)) {
    content = content.replace(pricePattern, `$1${fix.newPrice}`);
    console.log(`  ✅ ${fix.name}: €${fix.oldPrice} → €${fix.newPrice}`);
  }
  
  const comparePattern = new RegExp(`("id": "${id}"[\\s\\S]*?"compare_at_price": )(${fix.oldPrice + 50})`);
  if (fix.newCompare && content.match(comparePattern)) {
    // Try with the old compare_at_price value
  }
}

// Also fix compare_at_price for PS5 products
const compareFixes = {
  'prod-amz-001': { old: 849.99, new: 999.99 },
  'prod-amz-002': { old: 599.99, new: 649.99 },
  'prod-ps5-pro-2tb': { old: 849.99, new: 999.99 },
  'prod-ps5-slim-disc-1tb': { old: 599.99, new: 649.99 },
  'prod-ps5-slim-digital-1tb': { old: 499.99, new: 549.99 },
  'prod-ps5-bundle-astro-bot': { old: 629.99, new: 679.99 },
  'prod-ps-vr2-headset': { old: 649.99, new: 699.99 },
};

for (const [id, fix] of Object.entries(compareFixes)) {
  const pattern = new RegExp(`("id": "${id}"[\\s\\S]*?"compare_at_price": )${fix.old}`);
  if (content.match(pattern)) {
    content = content.replace(pattern, `$1${fix.new}`);
    console.log(`  ✅ ${id} compare_at: €${fix.old} → €${fix.new}`);
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
  // Check if product already has short_description
  const checkPattern = new RegExp(`"id": "${id}"[\\s\\S]*?"short_description"`);
  if (content.match(checkPattern)) {
    continue; // Already has it
  }
  
  // Find the product block and add short_description after price
  const insertPattern = new RegExp(`("id": "${id}"[\\s\\S]*?"price": [\\d.]+,)`);
  if (content.match(insertPattern)) {
    content = content.replace(insertPattern, `$1\n    "short_description": "${desc}",`);
    shortDescCount++;
  }
}
console.log(`  Added short_description to ${shortDescCount} Amazon products`);

// ── STEP 4: Fix default weights for Amazon products ─────────────────
console.log('\nStep 4: Fixing default 1.5kg weights for Amazon products...');

const weightMap = {
  'prod-amz-001': 4.5,    // PS5 Pro
  'prod-amz-002': 4.5,    // PS5 Slim
  'prod-amz-003': 0.28,   // DualSense Controller
  'prod-amz-004': 24.5,   // E-Bike
  'prod-amz-005': 22.5,   // E-Bike
  'prod-amz-006': 1.51,   // MacBook Air 15"
  'prod-amz-007': 0.25,   // Sony WH-1000XM5
  'prod-amz-008': 0.25,   // Bose QC Ultra
  'prod-amz-009': 0.05,   // AirPods Pro
  'prod-amz-010': 0.23,   // Galaxy S24 Ultra
  'prod-amz-011': 0.22,   // iPhone 15 Pro Max
  'prod-amz-012': 0.06,   // Apple Watch Ultra 2
  'prod-amz-013': 0.09,   // Garmin Fenix 7X Pro
  'prod-amz-014': 0.12,   // Garmin Edge 1040
  'prod-amz-015': 23.5,   // Haibike AllMtn
  'prod-amz-016': 15.5,   // Scott Lumen 910
  'prod-amz-017': 25.0,   // Conway XYRON S
  'prod-amz-018': 2.5,    // ASUS ROG Zephyrus
  'prod-amz-019': 2.6,    // Lenovo Legion
  'prod-amz-020': 0.42,   // Nintendo Switch OLED
  'prod-amz-021': 0.64,   // Steam Deck OLED
  'prod-amz-022': 0.68,   // ASUS ROG Ally X
  'prod-amz-023': 18.8,   // LG OLED C3 65"
  'prod-amz-024': 4.5,    // Sonos Era 300
  'prod-amz-025': 2.8,    // Sonos Beam
  'prod-amz-026': 3.1,    // Dyson V15
  'prod-amz-027': 3.4,    // iRobot Roomba j7+
  'prod-amz-028': 9.0,    // DeLonghi Magnifica
  'prod-amz-029': 5.3,    // Ninja Foodi
  'prod-amz-030': 0.90,   // DJI Mini 4 Pro
  'prod-amz-031': 0.15,   // GoPro HERO12
  'prod-amz-032': 0.20,   // Insta360 X4
  'prod-amz-033': 22.0,   // Wahoo KICKR v6
  'prod-amz-034': 0.63,   // Anker 737
  'prod-amz-035': 0.10,   // Samsung T7 Shield
  'prod-amz-036': 0.14,   // Logitech MX Master 3S
  'prod-amz-037': 0.34,   // SteelSeries Arctis Nova
  'prod-amz-038': 0.38,   // AirPods Max
  'prod-amz-039': 0.30,   // Sennheiser Momentum 4
  'prod-amz-040': 0.05,   // Galaxy Watch6
  'prod-amz-041': 0.21,   // Pixel 8 Pro
  'prod-amz-042': 2.14,   // MacBook Pro 16"
  'prod-amz-043': 2.0,    // Dell XPS 16
  'prod-amz-044': 0.56,   // PSVR2
  'prod-amz-045': 0.33,   // DualSense Edge
  'prod-amz-046': 21.5,   // Samsung Neo QLED 65"
  'prod-amz-047': 7.9,    // Thermomix TM6
  'prod-amz-048': 21.5,   // Tacx NEO 2T
  'prod-amz-049': 3.5,    // Philips Baristina
  'prod-amz-050': 0.30,   // Logitech G PRO X 2
};

let weightCount = 0;
for (const [id, weight] of Object.entries(weightMap)) {
  const pattern = new RegExp(`("id": "${id}"[\\s\\S]*?"weight_kg": )[\\d.]+`);
  if (content.match(pattern)) {
    content = content.replace(pattern, `$1${weight}`);
    weightCount++;
  }
}
console.log(`  Fixed weight for ${weightCount} Amazon products`);

// ── STEP 5: Write the fixed file ────────────────────────────────────
console.log('\nStep 5: Writing fixed file...');
fs.writeFileSync(filePath, content, 'utf8');

// Verify
const verifyContent = fs.readFileSync(filePath, 'utf8');
const finalIds = [...verifyContent.matchAll(/"id": "(prod-[^"]+)"/g)].map(m => m[1]);
const finalUnique = [...new Set(finalIds)];
console.log(`\n✅ DONE!`);
console.log(`  Products: ${finalIds.length} entries, ${finalUnique.length} unique`);
console.log(`  File: ${filePath}`);

// Check final counts
const shortDescFinal = (verifyContent.match(/"short_description":/g) || []).length;
console.log(`  Products with short_description: ${shortDescFinal}`);
