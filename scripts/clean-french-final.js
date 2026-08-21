#!/usr/bin/env node
/**
 * Replace French product terms with German equivalents in names and descriptions.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'lib', 'db', 'initial-data.ts');
const jsonPath = path.join(__dirname, 'amsi-all-products.json');

const amsiData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
let content = fs.readFileSync(filePath, 'utf8');

const idToData = {};
amsiData.forEach(p => {
  if (p.id) idToData[String(p.id)] = { name: p.name || '', desc: p.description || '', short: p.short_description || '' };
});

// French → German product term dictionary
const frToDe = {
  'Vidéoprojecteur': 'Beamer',
  'Vidéoprojecteurs': 'Beamer',
  'Écran incurvé': 'Gebogener Monitor',
  'Écrans incurvés': 'Gebogene Monitore',
  'Barrette Mémoire': 'Arbeitsspeicher',
  'Barrettes Mémoire': 'Arbeitsspeicher',
  'Machine à Compter': 'Zählschmaschine',
  'Caméra Cage': 'Kamera-Cage',
  'Caméra': 'Kamera',
  'Clé WiFi': 'WLAN-Adapter',
  'Câble': 'Kabel',
  'Stabilisateur': 'Stabilisator',
  'Moniteur Écran': 'Monitor',
  'Moniteur': 'Monitor',
  'Système de Webcam': 'Webcam-System',
  'Webcam': 'Webcam',
  'imprimante': 'Drucker',
  'Imprimante': 'Drucker',
  'Imprimantes': 'Drucker',
  'multifonction': 'Multifunktionsdrucker',
  'Multifonction': 'Multifunktionsdrucker',
  'monochrome': 'Monochrom',
  'Monochrome': 'Monochrom',
  'numérisation': 'Scannen',
  'télécopie': 'Fax',
  'sans fil': 'kabellos',
  'Sans fil': 'Kabellos',
  'écran': 'Bildschirm',
  'Écran': 'Bildschirm',
  'barrette': 'Riegel',
  'consommable': 'Verbrauchsmaterial',
  'Chargeur': 'Ladegerät',
  'chargeur': 'Ladegerät',
  'Machine à': 'Maschine für',
  'clavier': 'Tastatur',
  'souris': 'Maus',
  'casque': 'Kopfhörer',
  'enceinte': 'Lautsprecher',
  'câble': 'Kabel',
  'adaptateur': 'Adapter',
  'Connexion': 'Verbindung',
  'connexion': 'Verbindung',
  'Fonctionne': 'Funktioniert',
  'fonctionne': 'funktioniert',
  'Polyvalente': 'Vielseitig',
  'polyvalente': 'vielseitig',
  'Pour les': 'Für die',
  'pour les': 'für die',
  'Pour des': 'Für',
  'pour des': 'für',
  'Les produits': 'Die Produkte',
  'les produits': 'die Produkte',
  'La qualité': 'Die Qualität',
  'la qualité': 'die Qualität',
  'est une': 'ist ein',
  'Est une': 'Ist ein',
  'est un': 'ist ein',
  'Est un': 'Ist ein',
  'offre des': 'bietet',
  'Offre des': 'Bietet',
  'permet de': 'ermöglicht es',
  'Permet de': 'Ermöglicht es',
  'compatible avec': 'kompatibel mit',
  'Compatible avec': 'Kompatibel mit',
  'conçue pour': 'entwickelt für',
  'Conçue pour': 'Entwickelt für',
  'utilisé pour': 'verwendet für',
  'Utilisé pour': 'Verwendet für',
  'idéal pour': 'geeignet für',
  'Idéal pour': 'Geeignet für',
  'qualité d': 'Qualität',
  'des impressions': 'Drucke',
  'des composants': 'der Komponenten',
  'de l\'imprimante': 'des Druckers',
  'de l\u2019imprimante': 'des Druckers',
  'une impression': 'einen Druck',
  'les risques': 'die Risiken',
  'les solutions': 'die Lösungen',
  'les documents': 'die Dokumente',
  'les plus': 'die',
  'et la ': 'und die ',
  'et le ': 'und der ',
  'et les': 'und die',
  'du produit': 'des Produkts',
  'un excellent': 'ein ausgezeichnetes',
  'excellente': 'ausgezeichnete',
  'caractéristiques': 'Eigenschaften',
  'présentation': 'Vorstellung',
  'Marque': 'Marke',
  'Modèle': 'Modell',
  'Référence': 'Referenz',
  'Poids': 'Gewicht',
  'Dimensions': 'Abmessungen',
  'Couleur': 'Farbe',
  'Vitesse d': 'Geschwindigkeit',
  'Système de': 'System',
  'système de': 'System',
  'Polycopie': 'Kopie',
  'Reprographie': 'Kopie',
  'Bac ': 'Schacht ',
  'Seuil ': 'Schwellenwert ',
  'Alerte ': 'Warnung ',
  'Résolution': 'Auflösung',
  'Largeur de': 'Breite von',
  'Papier': 'Papier',
  'Configuration': 'Konfiguration',
  'Coupe nette': 'Saubere Schnitte',
  'rapide et': 'schnell und',
  'nette et': 'sauber und',
  'thermique': 'Thermal',
  'largeur de': 'Breite von',
  'solutions compatibles': 'kompatible Lösungen',
  'fond d\'écran': 'Hintergrundbild',
  'fond d\u2019écran': 'Hintergrundbild',
  'éclairage': 'Beleuchtung',
  'protéger': 'schützen',
  'protection des': 'Schutz der',
  'limitent les': 'begrenzen die',
  'bavures': 'Ausfransungen',
  'fluide': 'fließend',
  'environnements': 'Umgebungen',
  'activati': 'Aktivierung',
  'torche': 'Taschenlampe',
  'torches': 'Taschenlampen',
  'tickets': 'Quittungen',
  'Polycopie': 'Kopie',
  'Technologie d': 'Technologie',
};

const frenchAccents = /[àâéèêëïîôùûÿçœæ]/;

function replaceFrench(text) {
  if (!text) return text;
  let clean = text;
  // Apply dictionary replacements (order matters: longer phrases first)
  const sorted = Object.entries(frToDe).sort((a, b) => b[0].length - a[0].length);
  for (const [fr, de] of sorted) {
    const regex = new RegExp(fr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    clean = clean.replace(regex, de);
  }
  return clean;
}

let descFixed = 0;
let shortFixed = 0;
let nameFixed = 0;

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

    if (currentId) {
      // Fix name
      const nameMatch = line.match(/^(\s*"name":\s*")((?:[^"\\]|\\.)*?)(",?\s*)$/);
      if (nameMatch && idToData[currentId]) {
        const replaced = replaceFrench(nameMatch[2]);
        if (replaced !== nameMatch[2]) {
          const escaped = replaced.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
          lines[i] = `${nameMatch[1]}${escaped}${nameMatch[3]}`;
          nameFixed++;
        }
      }

      // Fix description
      const descMatch = line.match(/^(\s*"description":\s*")((?:[^"\\]|\\.)*?)(",?\s*)$/);
      if (descMatch) {
        const replaced = replaceFrench(descMatch[2]);
        if (replaced !== descMatch[2]) {
          const escaped = replaced.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
          lines[i] = `${descMatch[1]}${escaped}${descMatch[3]}`;
          descFixed++;
        }
      }

      // Fix short_description
      const shortMatch = line.match(/^(\s*"short_description":\s*")((?:[^"\\]|\\.)*?)(",?\s*)$/);
      if (shortMatch) {
        const replaced = replaceFrench(shortMatch[2]);
        if (replaced !== shortMatch[2]) {
          const escaped = replaced.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
          lines[i] = `${shortMatch[1]}${escaped}${shortMatch[3]}`;
          shortFixed++;
        }
      }
    }
  }
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log(`Fixed ${nameFixed} names, ${descFixed} descriptions, ${shortFixed} short descriptions`);

// Final verify
const v = fs.readFileSync(filePath, 'utf8');
const frenchAccents2 = /[àâéèêëïîôùûÿçœæ]/;
const exclusiveFrench2 = /\b(?:imprimante|vidéoprojecteur|écran|barrette|numérisation|télécopie|multifonction|monochrome|Machine à|sans fil|permet d|compatible avec|conçue pour|utilisé pour|idéal pour|qualité d|consommable|bavures|protéger|protection des|limitent les|fluide|rapide et|nette et|thermique|largeur de|solutions compatibles|fond d|éclairage|Connexion|Polycopie|Reprographie|Bac |Seuil |Alerte |Résolution |Vitesse d|Chargeur |Polyvalente|environnements|fonctionne|activati|torches?|tickets?|coupe nette|système de|caméra|stabilisateur|clavier|souris|casque|enceinte|câble|adaptateur|chargeur|écran |les plus|les solutions|les risques|les documents|des composants|de l.imprimante|une impression|pour les|pour des|les produits|la qualité|est une|est un|offre des|permet de|et la |et le |et les|du produit|un excellent|excellente|caractéristiques|présentation|Marque|Modèle|Référence|Poids|Dimensions|Couleur|Ecran|Vidéoprojecteur|Écran|Moniteur Écran|Barrette Mémoire|Machine à Compter|Clé WiFi|Câble|Caméra|Système de)\b/i;

const descs = v.match(/"description":\s*"(.+?)"/g) || [];
let french = 0;
descs.forEach(m => {
  const val = m.match(/"description":\s*"(.+)"/);
  if (!val) return;
  if (frenchAccents2.test(val[1]) || exclusiveFrench2.test(val[1])) french++;
});
console.log(`\nDescriptions remaining with French: ${french}/${descs.length}`);

const shorts = v.match(/"short_description":\s*"(.+?)"/g) || [];
let shortFrench = 0;
shorts.forEach(m => {
  const val = m.match(/"short_description":\s*"(.+)"/);
  if (!val) return;
  if (frenchAccents2.test(val[1]) || exclusiveFrench2.test(val[1])) shortFrench++;
});
console.log(`Short descriptions remaining with French: ${shortFrench}/${shorts.length}`);
