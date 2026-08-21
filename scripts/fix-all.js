const fs = require('fs');

// 1. Load AMSI products for images
const amsi = JSON.parse(fs.readFileSync('scripts/amsi-all-products.json', 'utf8'));
const amsiProducts = Array.isArray(amsi) ? amsi : (amsi.products || []);

const imagesById = {};
for (const p of amsiProducts) {
  const imgs = p.images || [];
  const urls = imgs
    .filter(img => typeof img === 'object' && img !== null && img.src)
    .map(img => img.src);
  if (urls.length > 0) {
    imagesById[String(p.id)] = urls;
  }
}

// 2. Read file
let content = fs.readFileSync('src/lib/db/initial-data.ts', 'utf8');

// 3. Fix images
let fixedImages = 0;
const idPattern = /"id": "prod-amsi-(\d+)"/g;
let match;
while ((match = idPattern.exec(content)) !== null) {
  const amsiId = match[1];
  const realImages = imagesById[amsiId];
  if (!realImages || realImages.length === 0) continue;
  
  const searchArea = content.substring(match.index, match.index + 3000);
  const imagesMatch = searchArea.match(/"images": \[([^\]]*)\]/);
  if (!imagesMatch) continue;
  
  const firstRealUrl = realImages[0];
  if (imagesMatch[1].includes(firstRealUrl)) continue;
  
  const absoluteIndex = match.index + imagesMatch.index;
  const newImages = '"images": [' + realImages.map(img => '"' + img + '"').join(', ') + ']';
  content = content.substring(0, absoluteIndex) + newImages + content.substring(absoluteIndex + imagesMatch[0].length);
  fixedImages++;
}

// 4. Remove French sentences from descriptions
// French-only sentence markers (not shared with German)
const frenchSentenceMarkers = [
  /\bil (?:est|a|peut|faut|y a)\b/i,
  /\belle (?:est|a|peut|faut|offre|permet|dispose)\b/i,
  /\bnous (?:avons|sommes|pouvons|devons)\b/i,
  /\bvous (?:avez|êtes|pouvez|devez)\b/i,
  /\bje (?:suis|ai|peux|veux)\b/i,
  /\btu (?:es|as|peux|veux)\b/i,
  /\bils (?:ont|sont|peuvent|doivent)\b/i,
  /\belles (?:ont|sont|peuvent|doivent)\b/i,
  /\bil s'agit/i,
  /\bnotre (?:produit|solution|gamme|marque|entreprise)\b/i,
  /\bvotre (?:entreprise|bureau|maison|cuisine|besoin)\b/i,
  /\bcette (?:cartouche|imprimante|machine|solution|technologie)\b/i,
  /\bce (?:produit|modèle|type|qui)\b/i,
  /\bpour les professionnels\b/i,
  /\bpour les entreprises\b/i,
  /\bpour les utilisateurs\b/i,
  /\bpour les particuliers\b/i,
  /\bpour les bureaux\b/i,
  /\bpour le bureau\b/i,
  /\bpour la maison\b/i,
  /\bpour la cuisine\b/i,
  /\bpour les besoins\b/i,
  /\bpour répondre\b/i,
  /\bpour garantir\b/i,
  /\bpour assurer\b/i,
  /\bpour offrir\b/i,
  /\bpour permettre\b/i,
  /\bpour faciliter\b/i,
  /\bpour améliorer\b/i,
  /\bpour optimiser\b/i,
  /\bpour réduire\b/i,
  /\bpour augmenter\b/i,
  /\bpour créer\b/i,
  /\bpour développer\b/i,
  /\bpour produire\b/i,
  /\bpour fabriquer\b/i,
  /\bpour concevoir\b/i,
  /\bpour réaliser\b/i,
  /\bpour fournir\b/i,
  /\bpour mettre\b/i,
  /\bpour installer\b/i,
  /\bpour utiliser\b/i,
  /\bpour fonctionner\b/i,
  /\bpour travailler\b/i,
  /\bselon la norme\b/i,
  /\belle aussi\b/i,
  /\belle est\b/i,
  /\belle permet\b/i,
  /\belle offre\b/i,
  /\belle dispose\b/i,
  /\bil est\b/i,
  /\bil permet\b/i,
  /\bil offre\b/i,
  /\bil dispose\b/i,
];

function removeFrenchSentences(text) {
  if (!text || text.length < 20) return text;
  
  // Split into sentences
  const sentences = text.split(/(?<=[.!?])\s+/);
  
  // Keep only sentences without strong French markers
  const kept = sentences.filter(s => {
    for (const marker of frenchSentenceMarkers) {
      if (marker.test(s)) return false;
    }
    return true;
  });
  
  if (kept.length === 0) return text;
  return kept.join(' ');
}

let fixedDesc = 0;
let fixedShort = 0;

content = content.replace(/"description": "([^"]+)"/g, (match, desc) => {
  const newDesc = removeFrenchSentences(desc);
  if (newDesc !== desc) {
    fixedDesc++;
    return '"description": "' + newDesc + '"';
  }
  return match;
});

content = content.replace(/"short_description": "([^"]+)"/g, (match, short) => {
  const newShort = removeFrenchSentences(short);
  if (newShort !== short) {
    fixedShort++;
    return '"short_description": "' + newShort + '"';
  }
  return match;
});

// 5. Remove products with corrupted URLs
const badPatterns = [
  'Canon-Selphy-CP1500-Weiß', 'RAM-de-Bureau-XPG-64GB',
  'xiaomi-Staubsauger-vacuum-cleaner-g20', 'HP-17A-Toner-Schwarz',
  'Amazfit_active_Noir', 'amazfit-gtr-3-Schwarz',
  'montre-connectee-huawei-watch-fit-3-Schwarz', 'Redmi-Watch-5-Active-Schwarz',
  'encre-canon-pixma-gi-490-Schwarz', 'epson-101-ecotank-Schwarz',
  'cartouche-d-encre-canon-pg-445-Schwarz', 'cartouche-d-encre-hp-305-Schwarz',
];

const startMarker = 'export const INITIAL_PRODUCTS: Product[] = [';
const startIdx = content.indexOf(startMarker);
const arrayStart = startIdx + startMarker.length;

let depth = 1;
let endIdx = arrayStart;
for (let i = arrayStart; i < content.length; i++) {
  if (content[i] === '[') depth++;
  if (content[i] === ']') depth--;
  if (depth === 0) { endIdx = i; break; }
}

const header = content.substring(0, startIdx);
const closing = content.substring(endIdx);
const arrayContent = content.substring(arrayStart, endIdx);

const products = [];
let braceDepth = 0;
let currentStart = -1;
for (let i = 0; i < arrayContent.length; i++) {
  if (arrayContent[i] === '{' && braceDepth === 0) currentStart = i;
  if (arrayContent[i] === '{') braceDepth++;
  if (arrayContent[i] === '}') braceDepth--;
  if (braceDepth === 0 && currentStart !== -1 && arrayContent[i] === '}') {
    products.push(arrayContent.substring(currentStart, i + 1));
    currentStart = -1;
  }
}

const kept = products.filter(p => {
  for (const pattern of badPatterns) {
    if (p.includes(pattern)) return false;
  }
  return true;
});

content = header + startMarker + kept.join(',') + closing;

// 6. Write
fs.writeFileSync('src/lib/db/initial-data.ts', content);

console.log('Images corrigées:', fixedImages);
console.log('Descriptions longues nettoyées:', fixedDesc);
console.log('Descriptions courtes nettoyées:', fixedShort);
console.log('Produits supprimés:', products.length - kept.length);
console.log('Total produits:', kept.length);

// Verify
const verify = fs.readFileSync('src/lib/db/initial-data.ts', 'utf8');
const corruptedUrls = (verify.match(/Schwarz-et-Weiß|noir-et-blanc/g) || []).length;
const unsplashProducts = (verify.match(/"id": "prod-.*unsplash/g) || []).length;
console.log('URLs corrompues:', corruptedUrls);
console.log('Produits avec unsplash:', unsplashProducts);
