const fs = require('fs');
const content = fs.readFileSync('src/lib/db/initial-data.ts', 'utf8');

// Find all description fields and check for French
const descRegex = /"description":\s*"([\s\S]*?)",\s*\n\s*"short_description"/g;
let match;
const affected = [];

while ((match = descRegex.exec(content)) !== null) {
  const desc = match[1];
  const pos = match.index;
  
  // Find the product ID before this description
  const beforeDesc = content.substring(Math.max(0, pos - 500), pos);
  const idMatch = beforeDesc.match(/"id":\s*"(prod-[^"]+)"/);
  const nameMatch = beforeDesc.match(/"name":\s*"([^"]+)"/);
  
  if (!idMatch) continue;
  
  // Check for French patterns
  const frenchPatterns = [
    'est une ', 'est un ', 'conçue pour', 'conçu pour',
    'Cette solution', 'Cette technologie', 'Cette conception',
    'Elle associe', 'Elle combine', 'Elle convient', 'Elle permet',
    'Grâce à son', 'Grâce à ses', 'Grâce à l',
    'La fonction', 'Le Scanner', 'Une solution', 'Une impression',
    'Un système', 'Système d\'encre', 'Réservoirs d\'encre',
    'Fonction photocopie', 'Fonction copie',
    'Vitesse d\'impression', 'Capacité de la cassette',
    'Alimentation papier', 'Informations générales',
    'Consommation maximale', 'Consommation moyenne',
    'Température de fonctionnement', 'Réceptacle de sortie',
    'Numérisation de documents', 'Numérisation rapide',
    'La vitesse de copie', 'L\'appareil permet',
    'Les rendements', 'Le rendement réel',
    'Spécifications principales', 'La fonction Multifunktions',
    'Son système de numérisation', 'Interface et utilisation',
    'Cette interface', 'Cette connectivité', 'Cette fonctionnalité',
    'Bac papier de', 'Alimentation manuelle',
    'Impression sécurisée', 'Toner haute capacité',
    'Une solution complète', 'Une solution adaptée',
    'Une solution pour', 'Une solution idéale',
    'Conçue pour les', 'L\'intégration au réseau',
    'Ces fonctions', 'Cet Bildschirm', 'La prise en charge',
    'Les documents', 'Les contrats', 'Les rapports',
    'les contrats', 'les rapports', 'les factures',
    'les dossiers', 'les documents', 'une solution',
    'son impression', 'sa connectivité', 'sa capacité',
    'ses solutions', 'son format', 'son Wi-Fi', 'son ADF',
    'ses fonctions', 'son système',
    'Elle est', 'Elle dispose', 'Elle propose', 'Elle offre',
    'Elle permet d\'imprimer', 'Elle est conçue',
    'Elle convient à', 'Elle convient notamment',
    'Elle intègre', 'Elle prend', 'Elle est notamment',
  ];
  
  let frenchCount = 0;
  const foundWords = [];
  for (const pattern of frenchPatterns) {
    if (desc.includes(pattern)) {
      frenchCount++;
      foundWords.push(pattern);
    }
  }
  
  if (frenchCount >= 10) {
    affected.push({
      id: idMatch[1],
      name: nameMatch ? nameMatch[1] : 'Unknown',
      count: frenchCount,
      words: foundWords.slice(0, 8).join(', '),
      descLength: desc.length
    });
  }
}

console.log('Products with significant French text: ' + affected.length);
console.log('');
affected.forEach(p => {
  console.log(`${p.id} | ${p.name} | French: ${p.count} | Desc length: ${p.descLength}`);
  console.log(`  Words: ${p.words}`);
  console.log('');
});
