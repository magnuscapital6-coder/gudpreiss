#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'lib', 'db', 'initial-data.ts');
let content = fs.readFileSync(filePath, 'utf8');

const frenchAccents = /[àâéèêëïîôùûÿçœæ]/;

const germanWords = [
  'Drucker', 'Toner', 'Patrone', 'Laserdrucker', 'Multifunktionsgerät',
  'Druckgeschwindigkeit', 'Druckauflösung', 'Seitenleistung', 'Papierkassette',
  'Duplex', 'Duplexdruck', 'WLAN', 'Bluetooth', 'USB', 'Ethernet', 'Netzwerk',
  'Scanner', 'Fax', 'Kopie', 'Kopierer', 'Farbdruck', 'Schwarzweiß', 'Monochrom',
  'Seiten pro Minute', 'dpi', 'ppm', 'Arbeitsspeicher', 'Hauptspeicher',
  'Prozessor', 'Gehäuse', 'Anschlüsse', 'Gebrauchsanleitung', 'Bedienungsanleitung',
  'Technische Daten', 'Lieferumfang', 'Kompatibilität', 'Nennleistung',
  'Energieverbrauch', 'Geräuschpegel', 'Betriebsmodus', 'Netzteil', 'Kabellos',
  'Smartphone', 'Tablet', 'Laptop', 'Notebook', 'Ultrabook', 'Monitor',
  'Bildschirm', 'Fernseher', 'Receiver', 'Soundbar', 'Lautsprecher',
  'Kopfhörer', 'Headset', 'Mikrofon', 'Kamera', 'Antenne', 'Sensor',
  'Akku', 'Batterie', 'Solar', 'Leuchte', 'LED', 'Lampe', 'Watt',
  'Gramm', 'Kilogramm', 'Zentimeter', 'Millimeter', 'Zoll',
  'Hochwertige', 'Erstklassige', 'Exklusive', 'Präzise', 'Gefrierschränke',
  'Barbecues', 'Gasgrills', 'Saugroboter', 'Reinigungsgeräte',
  'Navigationsgeräte', 'Fahrradcomputer', 'Outdoor-Sportler',
  'Gebrauchtwaren', 'Qualitätskontrolle', 'Garantie',
];

function isGermanSentence(s) {
  if (!s || s.length < 8) return false;
  if (/ß/.test(s)) return true;
  if (!frenchAccents.test(s)) {
    const caps = (s.match(/\b[A-ZÄÖÜ][a-zäöüß]+\b/g) || []).length;
    if (caps >= 2) return true;
  }
  for (const w of germanWords) {
    if (s.includes(w)) return true;
  }
  return false;
}

function cleanDescription(desc) {
  if (!desc || desc.length < 30) return desc;

  const buyLineMatch = desc.match(/[\n\-—]\s*Kaufen Sie[^\n]*$/);
  const buyLine = buyLineMatch ? buyLineMatch[0] : '';
  let working = desc.replace(/[\n\-—]\s*Kaufen Sie[^\n]*$/, '');

  const sentences = working.split(/(?<=[.!?])\s+|\n+/);
  const germanSentences = sentences.filter(s => s.trim().length >= 5 && isGermanSentence(s));

  let result = germanSentences.join(' ').trim();
  if (buyLine) result += '\n' + buyLine;
  result = result.replace(/\s{2,}/g, ' ').trim();

  // If too much was removed (>85%), keep original
  if (result.length < desc.length * 0.15 && desc.length > 200) {
    return desc;
  }
  return result;
}

let changeCount = 0;
const newContent = content.replace(
  /"description":\s*"((?:[^"\\]|\\.)*)"/g,
  (match, descValue) => {
    let desc = descValue.replace(/\\"/g, '"').replace(/\\n/g, '\n');
    if (desc.length < 50) return match;
    const cleaned = cleanDescription(desc);
    if (cleaned !== desc && cleaned.length > 20) {
      changeCount++;
      const escaped = cleaned.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
      return `"description": "${escaped}"`;
    }
    return match;
  }
);

fs.writeFileSync(filePath, newContent, 'utf8');
console.log(`Cleaned ${changeCount} descriptions`);

// Verify
const v = fs.readFileSync(filePath, 'utf8');
const descs = v.match(/"description":\s*"(.+?)"/g) || [];
let frenchRemaining = 0;
const sizes = [];
descs.forEach(m => {
  const val = m.match(/"description":\s*"(.+)"/);
  if (!val) return;
  const acc = (val[1].match(frenchAccents) || []).length;
  if (acc > 3) frenchRemaining++;
  sizes.push(val[1].length);
});
sizes.sort((a, b) => b - a);
console.log(`Remaining with French (>3 accents): ${frenchRemaining}/${descs.length}`);
console.log(`Max len: ${sizes[0]}, Avg: ${Math.round(sizes.reduce((a,b)=>a+b,0)/sizes.length)}`);
console.log(`>500: ${sizes.filter(s=>s>500).length}, 200-500: ${sizes.filter(s=>s>=200&&s<=500).length}, <200: ${sizes.filter(s=>s<200).length}`);
