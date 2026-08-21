#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'lib', 'db', 'initial-data.ts');
const jsonPath = path.join(__dirname, 'amsi-all-products.json');

const amsiData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
let content = fs.readFileSync(filePath, 'utf8');

const idToData = {};
amsiData.forEach(p => {
  if (p.id) idToData[String(p.id)] = {
    name: p.name || '',
    desc: p.description || '',
    short: p.short_description || ''
  };
});

const frenchAccents = /[àâéèêëïîôùûÿçœæ]/;

function extractGermanSentences(text) {
  if (!text) return '';
  let clean = text.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

  // Get buy-line
  const buyMatch = clean.match(/[\-—]\s*Kaufen Sie[^\n.]*[.!]/);
  const buyLine = buyMatch ? buyMatch[0].trim() : '';

  const sentences = clean.split(/(?<=[.!?])\s+/);

  const frenchStarters = /^(?:La |Le |Les |L'|Un |Une |Des |Du |De |D'|Elle |Il |Ce |Ces |Cet |Cette |Pour |Avec |Dans |Comme |Est |Sont |Peut |Peuvent |Permet |Offre |Assure |Conçue |Conçu |Caractéristiques|Présentation|Description|Compatibilité|Qualité|Conseils|Pourquoi|Questions|Quelle|Capacité|Modèle|Référence|Couleurs|Résultats|Avantages|Installation|Fiabilité|Garantie|Respect|Stockage|Entretien|Information|Poids|Dimensions|Connexion|Numérisation|Impression|Télécopie|Numérique|Professionnel|Fonctions|Type |Format |Résolution|Écran|Vitesse|Environ|Remplacement|Réseau|Système|Appareil|Données|Sécurité|Environnement|Recyclage|Cartouche|Consommation|Compatible|Acrobat|Tampon|Google|Apple|Windows|Mac |Linux|Android|iOS|PDF|JPEG|PNG|USB|HDMI|VGA|WiFi|Bluetooth|NFC|LTE|5G|4G|3G|GPS|Doté|Dote|Offrant|Permettant|Grâce|grâce|Fourni|Fournit|Proposant|Intégrant|Offre des|Ce |Cet |Cette |est |sont |peut |peuvent |conçue|conçu|conçus|fonction|impression|cartouche|toner|imprimante|Drucker|Toner|Patrone)/i;

  const german = sentences.filter(s => {
    const t = s.trim();
    if (t.length < 5) return false;
    if (frenchAccents.test(t)) return false;
    if (frenchStarters.test(t)) return false;
    if (t.split(/\s+/).length < 2) return false;
    return true;
  });

  let result = german.join('. ').replace(/\.\./g, '.').trim();
  if (buyLine && !result.includes('Kaufen Sie')) {
    result += (result ? '\n' : '') + buyLine;
  }
  return result;
}

function hasFrench(text) {
  if (!text) return false;
  const clean = text.replace(/<[^>]+>/g, ' ');
  return frenchAccents.test(clean);
}

let descUpdated = 0;
let shortUpdated = 0;

const lines = content.split('\n');
let currentId = null;
let inProduct = false;
let braceDepth = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  const idMatch = line.match(/"id":\s*"(prod-amsi-(\d+))"/);
  if (idMatch) {
    currentId = idMatch[2];
    inProduct = true;
    braceDepth = 0;
  }

  if (inProduct) {
    for (const ch of line) {
      if (ch === '{') braceDepth++;
      if (ch === '}') braceDepth--;
    }
    if (braceDepth < 0) {
      inProduct = false;
      currentId = null;
      continue;
    }

    if (currentId && idToData[currentId]) {
      const data = idToData[currentId];

      // Update description
      const descMatch = line.match(/^(\s*"description":\s*")((?:[^"\\]|\\.)*?)(",?\s*)$/);
      if (descMatch) {
        const germanDesc = extractGermanSentences(data.desc);
        // Fallback: use product name if no German text found
        const finalDesc = germanDesc || data.name || 'GudPreiss Produkt';
        const escaped = finalDesc.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        if (descMatch[2] !== escaped) {
          lines[i] = `${descMatch[1]}${escaped}${descMatch[3]}`;
          descUpdated++;
        }
      }

      // Update short_description
      const shortMatch = line.match(/^(\s*"short_description":\s*")((?:[^"\\]|\\.)*?)(",?\s*)$/);
      if (shortMatch) {
        const germanShort = extractGermanSentences(data.short);
        const finalShort = germanShort || data.name || '';
        if (finalShort && finalShort.length > 3) {
          const escaped = finalShort.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
          if (shortMatch[2] !== escaped) {
            lines[i] = `${shortMatch[1]}${escaped}${shortMatch[3]}`;
            shortUpdated++;
          }
        }
      }
    }
  }
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log(`Updated ${descUpdated} descriptions, ${shortUpdated} short descriptions`);

// Verify
const v = fs.readFileSync(filePath, 'utf8');
const descs = v.match(/"description":\s*"(.+?)"/g) || [];
let french = 0;
const sizes = [];
descs.forEach(m => {
  const val = m.match(/"description":\s*"(.+)"/);
  if (!val) return;
  if (frenchAccents.test(val[1])) french++;
  sizes.push(val[1].length);
});
sizes.sort((a, b) => b - a);
console.log(`\nVerification: ${french}/${descs.length} with French accents`);
console.log(`Lengths: max=${sizes[0]}, avg=${Math.round(sizes.reduce((a,b)=>a+b,0)/sizes.length)}`);
