#!/usr/bin/env node
/**
 * V4: Fixed French cleaning.
 * A sentence is German only if it has low French accent density
 * AND contains German markers. Not just one German word.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'lib', 'db', 'initial-data.ts');
let content = fs.readFileSync(filePath, 'utf8');

const frenchAccents = /[àâéèêëïîôùûÿçœæ]/;

function isGermanSentence(s) {
  if (!s || s.length < 8) return false;

  // Count French accents
  const acc = (s.match(frenchAccents) || []).length;
  const density = acc / s.length;

  // If high French accent density, it's French
  if (density > 0.003) return false;
  if (acc > 2) return false;

  // Has ß — strong German marker (and no French accents)
  if (/ß/.test(s) && acc === 0) return true;

  // No French accents at all — check for German structure
  if (acc === 0) {
    const caps = (s.match(/\b[A-ZÄÖÜ][a-zäöüß]+\b/g) || []).length;
    if (caps >= 3) return true;
    // Very short neutral text (like "A4", "USB", "Wi-Fi") — keep
    if (s.length < 30 && /^[A-ZÄÖÜ0-9]/.test(s)) return true;
  }

  // Low accent density (1-2 accents in long sentence) AND has ß or umlauts
  if (density <= 0.002 && /(?:ß|[äöü])/.test(s)) return true;

  return false;
}

function cleanDescription(desc) {
  if (!desc || desc.length < 30) return desc;

  const buyLineMatch = desc.match(/[\n\-—]\s*Kaufen Sie[^\n]*$/);
  const buyLine = buyLineMatch ? buyLineMatch[0] : '';
  let working = desc.replace(/[\n\-—]\s*Kaufen Sie[^\n]*$/, '');

  // Split into sentences
  const sentences = working.split(/(?<=[.!?])\s+|\n+/);
  const germanSentences = sentences.filter(s => s.trim().length >= 5 && isGermanSentence(s));

  let result = germanSentences.join(' ').trim();
  if (buyLine) result += '\n' + buyLine;
  result = result.replace(/\s{2,}/g, ' ').trim();

  // If too much was removed (>80%), keep original
  if (result.length < desc.length * 0.2 && desc.length > 200) {
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
let french = 0;
const sizes = [];
descs.forEach(m => {
  const val = m.match(/"description":\s*"(.+)"/);
  if (!val) return;
  const acc = (val[1].match(frenchAccents) || []).length;
  if (acc > 0) french++;
  sizes.push(val[1].length);
});
sizes.sort((a, b) => b - a);
console.log(`Remaining with any French accents: ${french}/${descs.length}`);
console.log(`Max len: ${sizes[0]}, Avg: ${Math.round(sizes.reduce((a,b)=>a+b,0)/sizes.length)}`);
console.log(`>500: ${sizes.filter(s=>s>500).length}, 200-500: ${sizes.filter(s=>s>=200&&s<=500).length}, <200: ${sizes.filter(s=>s<200).length}`);

// Show sample
const sample = descs.find(m => {
  const val = m.match(/"description":\s*"(.+)"/);
  return val && val[1].length > 500 && (val[1].match(frenchAccents) || []).length === 0;
});
if (sample) {
  const val = sample.match(/"description":\s*"(.{300})/);
  console.log('\nClean sample:', val ? val[1] + '...' : 'N/A');
}
