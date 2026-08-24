const fs = require('fs');
const content = fs.readFileSync('src/lib/db/initial-data.ts', 'utf8');
const prodStart = content.indexOf('INITIAL_PRODUCTS');
const prodEnd = content.indexOf('INITIAL_REVIEWS');
const products = content.substring(prodStart, prodEnd);

// French words that indicate mixed FR/DE text
const frenchWords = [
  'est une', 'est un', 'est', 'conçue', 'conçu', 'Cette', 'cette',
  'Elle', 'elle', 'Grâce', 'grâce', 'La ', 'Le ', 'Les ',
  'L\'impression', 'L\'utilisation', 'L\'appareil', 'L\'intégration',
  'Une ', 'Un ', 'Système', 'Nombre', 'Résolution', 'Technologie',
  'Caractéristiques', 'Fonction', 'Vitesse', 'Capacité', 'Alimentation',
  'Informations', 'Utilisation', 'Consommation', 'Température', 'Format',
  'Réceptacle', 'Numérisation', 'Spécifications', 'Interface',
  'Ses ', 'Bac ', 'Connexion', 'Impression', 'Toner', 'Tonerpatrone',
  'Solution', 'Conçue', 'Ces ', 'Cet ', 'Prise', 'Le rendement',
  'Ses fonctions', 'Son système', 'sa capacité', 'sa connectivité',
  'son format', 'son Wi-Fi', 'son ADF', 'son impression', 'ses solutions',
  'Elle est', 'Elle dispose', 'Elle propose', 'Elle offre', 'Elle permet',
  'Elle intègre', 'Elle prend', 'Elle convient', 'Elle associe', 'Elle combine',
  'Elle est notamment',
];

const blocks = products.split(/\n\s*\{\n\s*"id":\s*"prod-/);
const affected = [];

for (const block of blocks) {
  const idMatch = block.match(/"id":\s*"([^"]+)"/);
  const nameMatch = block.match(/"name":\s*"([^"]+)"/);
  if (!idMatch || !nameMatch) continue;

  let frenchCount = 0;
  for (const word of frenchWords) {
    if (block.includes(word)) frenchCount++;
  }

  if (frenchCount >= 10) {
    affected.push({ id: idMatch[1], name: nameMatch[1], count: frenchCount });
  }
}

console.log('Products with significant French text: ' + affected.length);
console.log('');
affected.forEach(p => {
  console.log(p.id + ' | ' + p.name + ' | French matches: ' + p.count);
});
