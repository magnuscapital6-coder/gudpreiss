#!/usr/bin/env node
/**
 * Clean French text from product descriptions in initial-data.ts
 * Strategy: For each long description, remove sentences/paragraphs that are predominantly French.
 * Keep German sentences and the last German line (usually the AMSI buy-line).
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'lib', 'db', 'initial-data.ts');
let content = fs.readFileSync(filePath, 'utf8');

// French sentence markers (words that indicate a French sentence)
const frenchWords = [
  'Caractéristiques', 'Présentation', 'Compatibilité', 'Qualité', 'Conseils',
  'Pourquoi', 'Questions', 'Quelle', 'Capacité', 'Référence', 'Couleurs',
  'Disponibles', 'Résultats', 'Avantages', 'Installation', 'Fiabilité',
  'Garantie', 'Respect', 'Stocker', 'Information', 'Type de produit',
  'Technologie', 'Poids', 'Dimensions', 'Économies', 'Description du',
  'conçue pour', 'pour offrir', 'pour garantir', 'pour obtenir', 'pour fonctionner',
  'les professionnels', 'des impressions', 'la différence', 'tandis que',
  'Idéal pour', 'excellente fiabilité', 'couleurs éclatantes', 'cartouches HP',
  'imprimantes HP', 'rendement de', 'votre Drucker', 'ces cartouches',
  'la durée de vie', 'des composants', 'protection des', 'recyclables via',
  'le programme', 'contribuant à', 'réduire l', 'l\'impact',
  'programme de recyclage', 'cartouches usagées', 'retourner gratuitement',
  'constitue une', 'pour les', 'exigeant', 'de hoher', 'est conçue',
  'couleurs précises', 'homogènes', 'textes nets', 'couleurs vives',
  'excellent rapport', 'excellente durée', 'excellente qualité',
  'fonctionner parfaitement', 'fontionner', 'réimpressions', 'pannes',
  'investissement initial', 'Des économies', 'perte de', 'réduire les',
  'un rendement', 'des documents', 'la technologie', 'son système',
  'peut atteindre', 'peut fonctionner', 'conçues pour', 'offre des',
  'la performance', 'la protection', 'la maintenance', 'la compatibilité',
  'le toner', 'les cartouches', 'des imprimantes', 'plusieurs imprimantes',
  'des modèles', 'version standard', 'plus élevé', 'rendement de pages',
  'impression laser', 'Présentation du', 'est la version',
  'Qualité d\'impression', 'Conçu pour', 'Adapté pour', 'Parfait pour',
  'besoins des', 'professionnels', 'particuliers', 'qualité professionnelle',
  'durée de vie optimisée', 'protection optimale', 'technologie avancée',
  'technologie HP', 'technologie JetIntelligence', 'Information Complémentaire',
  'Compatibilité Imprimantes', 'Technologie d\'impression', 'Poids moyen',
  'Dimensions (L', 'Dass cartouches', 'Dass toner', 'Des économies',
  'D\'une qualité', 'D\'une excellente', 'D\'une protection', 'D\'une durée',
  'Pourquoi choisir', 'L\'utilisation d\'un', 'est-ce adapté',
  'Peut-on recycler', 'retourner gratuitement', 'Conclusion', 'constitue une solution',
  'Das toner', 'Das HP', 'Das cartouche', 'Das remplacement', 'Das système',
  'caractéristiques Principales', 'Nom du produit', 'Couleurs Disponibles',
  'Capacité d\'Impression', 'jusqu\'à', 'Couvert', 'Qualité d\'Impression',
  'Installation rapide', 'Fiabilité des cartouches', 'Moins de maintenance',
  'Meilleure compatibilité', 'Garantie fabricant', 'Respect des normes',
  'Stocker dans un endroit', 'Bien secouer', 'Type de produit',
  'Technologie d\'impression', 'Poids moyen', 'Environ',
  'besoin des professionnels', 'adapté pour les', 'conçu pour les',
  'offre un excellent', 'présente des', 'peuvent présenter',
  'réduire les performances', 'investissement', 'garantir des impressions',
  'couleurs fidèles', 'performance durable', 'protégeant votre',
  'programme Planet Partners', 'réduire l\'impact',
  'Besoin d\'impression', 'Présentation', 'Adapté pour les',
  'Conçu pour les', 'offre des impressions',
  'Das toner HP', 'Das HP 212', 'Dass cartouches HP',
  'adaptée pour les', 'conçue pour les', 'utilisation pour les',
  'D\'un excellent', 'D\'une meilleure', 'rendement plus',
];

// French sentence starters that indicate a whole French paragraph
const frenchSentenceStarters = [
  /^Caractéristiques\s/m,
  /^Présentation\s/m,
  /^Description du\s/m,
  /^Compatibilité\s/m,
  /^Qualité d['']impression/m,
  /^Conseils d['']utilisation/m,
  /^Pourquoi Choisir/m,
  /^Questions fréquentes/m,
  /^Quelle est la différence/m,
  /^Capacité d['']Impression/m,
  /^Modèle et Référence/m,
  /^Couleurs Disponibles/m,
  /^Informations Complémentaires/m,
  /^Installation rapide/m,
  /^Fiabilité optimale/m,
  /^Avantages du\s/m,
  /^Des couleurs éclatantes/m,
  /^Des économies sur/m,
  /^Respect de l['']environnement/m,
  /^Pourquoi choisir un toner/m,
  /^L['']utilisation d['']un toner/m,
  /^Questions fréquentes/m,
  /^Conclusion\s/m,
  /^Stockage\s/m,
  /^Entretien\s/m,
  /^est-il adapté/m,
  /^Peut-on recycler/m,
];

function isFrenchSentence(sentence) {
  const trimmed = sentence.trim();
  if (!trimmed || trimmed.length < 3) return false;

  // Very short German sentence
  if (trimmed.length < 15 && !/[àâéèêëïîôùûüÿçœæ]/i.test(trimmed)) return false;

  // Count French marker words
  let frenchCount = 0;
  for (const word of frenchWords) {
    if (trimmed.includes(word)) frenchCount++;
  }

  // Check for French accents that are NOT German (ü, ä, ö are both)
  // French-specific: à, â, é, è, ê, ë, î, ï, ô, ù, û, ü, ÿ, ç, œ, æ
  const frenchAccents = (trimmed.match(/[àâéèêëïîôùûÿçœæ]/gi) || []).length;
  const germanOnly = (trimmed.match(/[äöüß]/gi) || []).length;

  // If it has French accents that aren't German
  if (frenchAccents - germanOnly > 0) return true;

  // Multiple French markers
  if (frenchCount >= 2) return true;

  // French-specific words
  const frenchOnlyWords = ['caractéristiques', 'présentation', 'compatibilité', 'qualité',
    'conseils', 'pourquoi', 'questions', 'quelle', 'capacité', 'référence',
    'disponibles', 'résultats', 'avantages', 'installation', 'fiabilité',
    'garantie', 'respect', 'stocker', 'information', 'poids', 'dimensions',
    'économies', 'tandis que', 'idéal pour', 'conçue pour', 'pour offrir',
    'les professionnels', 'des impressions', 'la différence',
    'cartouches', 'imprimantes', 'rendement', 'toner', 'impression',
    'votre drucker', 'ces cartouches', 'recyclables', 'recyclage',
    'conçues pour', 'plusieurs imprimantes', 'des modèles',
    'conçu pour', 'parfait pour', 'adapté pour', 'besoins des',
    'qualité professionnelle', 'technologie hp', 'technologie jetintelligence',
    'l\'utilisation', 'l\'impact', 'contribuant à', 'réduire l',
    'peut fonctionner', 'peut atteindre', 'offre un',
    'constitue une', 'garantit des', 'présente des', 'peuvent présenter',
    'réduire les performances', 'garantir des impressions',
    'couleurs fidèles', 'performance durable', 'protégeant votre',
    'planet partners', 'réduire l\'impact',
    ' présentation', ' caractéristiques', ' compatibilité',
    'Das toner', 'Das HP', 'Dass cartouches', 'Dass toner',
  ];

  for (const fw of frenchOnlyWords) {
    if (trimmed.toLowerCase().includes(fw.toLowerCase())) return true;
  }

  return false;
}

function cleanDescription(desc) {
  if (!desc || desc.length < 100) return desc;

  // Find the German buy-line at the end (usually starts with - Kaufen Sie)
  const buyLineMatch = desc.match(/\n- Kaufen Sie[^\n]*$/);
  const buyLine = buyLineMatch ? buyLineMatch[0] : '';

  // Split into paragraphs (double newline or single newline)
  let paragraphs = desc.replace(/\n- Kaufen Sie[^\n]*$/, '').split(/\n+/);

  // Filter out French paragraphs
  const cleanParagraphs = paragraphs.filter(p => {
    if (!p.trim()) return false;
    return !isFrenchSentence(p);
  });

  // Rejoin
  let result = cleanParagraphs.join('\n\n').trim();
  if (buyLine) result += '\n' + buyLine;

  return result;
}

// Find all description fields
let changeCount = 0;
const newContent = content.replace(
  /"description":\s*"(?:[^"\\]|\\.)*?"/g,
  (match) => {
    // Extract the description value
    const descMatch = match.match(/"description":\s*"((?:[^"\\]|\\.)*)"/);
    if (!descMatch) return match;

    let desc = descMatch[1];
    // Unescape
    desc = desc.replace(/\\"/g, '"').replace(/\\n/g, '\n');

    if (desc.length < 100) return match;

    const cleaned = cleanDescription(desc);

    if (cleaned !== desc) {
      changeCount++;
      // Re-escape
      const escaped = cleaned.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
      return `"description": "${escaped}"`;
    }

    return match;
  }
);

// Also clean short_description fields
let shortChangeCount = 0;
const finalContent = newContent.replace(
  /"short_description":\s*"(?:[^"\\]|\\.)*?"/g,
  (match) => {
    const descMatch = match.match(/"short_description":\s*"((?:[^"\\]|\\.)*)"/);
    if (!descMatch) return match;

    let desc = descMatch[1];
    desc = desc.replace(/\\"/g, '"').replace(/\\n/g, '\n');

    if (desc.length < 20) return match;

    const cleaned = cleanDescription(desc);

    if (cleaned !== desc) {
      shortChangeCount++;
      const escaped = cleaned.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n');
      return `"short_description": "${escaped}"`;
    }

    return match;
  }
);

fs.writeFileSync(filePath, finalContent, 'utf8');

console.log(`Cleaned ${changeCount} long descriptions`);
console.log(`Cleaned ${shortChangeCount} short descriptions`);
