#!/usr/bin/env node
/**
 * Clean French text from product descriptions, keeping German sentences.
 * Uses sentence-level analysis instead of paragraph-level.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'lib', 'db', 'initial-data.ts');
let content = fs.readFileSync(filePath, 'utf8');

// French-specific accented characters (not shared with German)
// German: ä, ö, ü, ß (and Ä, Ö, Ü)
// French: à, â, é, è, ê, ë, î, ï, ô, ù, û, ÿ, ç, œ, æ
const frenchOnlyAccents = /[àâéèêëïîôùûÿçœæ]/;

function isFrenchSentence(sentence) {
  const s = sentence.trim();
  if (!s || s.length < 10) return false;

  // Count French-specific accents
  const frenchAccents = (s.match(frenchOnlyAccents) || []).length;
  // Count German-specific (ß) or umlauts that appear in German context
  const germanSpecific = (s.match(/[ß]/g) || []).length;

  // If no French accents and no German, it's ambiguous
  if (frenchAccents === 0) return false;

  // Strong French markers: French sentence structure words
  const strongFrench = /\b(?:conçue|conçu|conçues|conçus|fonction|fonctions|elle combine|elle permet|il combine|il permet|est conçue|est conçu|est conçues|pour les|pour des|pour un|pour une|des impressions|les impressions|la impression|le toner|les toners|la cartouche|les cartouches|la technologie|le modèle|la référence|la compatibilité|la qualité|les qualités|la capacité|les capacités|le rendement|les rendements|la résolution|les résolutions|la vitesse|les vitesses|le format|les formats|la couleur|les couleurs|le weight|la weight|la dimensions|le dimensions|la poids|la poids|l'imprimante|l'impression|l'application|l'utilisation|l'installation|l'alimentation|l'écran|l'interface|l'connectivité|l'connecteur|l'accessoire|l'option|l'composant|l'compatible|l'compétitif|l'innovant|l'original|l'officiel|l'professionnel|l'entreprise|l'organisme|l'association|l'institution|l'organisme|l'école|l'université|l'hôpital|l'entreprise|l'industrie|l'agriculture|l'énergie|l'environnement|l'économie|l'écologie|l'écologique|l'écologiques|l'écologique|l'écologiques|l'écologique|l'écologiques)\b/i.test(s);

  if (strongFrench) return true;

  // French-specific phrases
  const frenchPhrases = /(?:Présentation du|Description du|Caractéristiques principales|Compatibilité Imprimantes|Capacité d'Impression|Couleurs Disponibles|Modèle et Référence|Référence fabricant|Qualité d'impression|Conseils d'utilisation|Pourquoi Choisir|Questions fréquentes|Quelle est la différence|Information Complémentaires|Installation rapide|Fiabilité optimale|Avantages du|Résultats|Ecran|Ecran LCD|Écran LCD|impression: laser|impression: jusqu|Impression:|Schwarz et Weiß|Kosten|Preis|Gewicht|Maße|Volumen|Leistung|Druck|Daten|Anschluss|Netzwerk|Funktionen|Größe|Farbe|Farben|Gewicht|Maße|Spannung|Strom|Watt|dB|Umdrehungen|Kapazität|Reichweite|Dauer|Lebensdauer)/i.test(s);

  if (frenchPhrases) return true;

  // If 2+ French-specific accents in a short sentence, it's French
  if (frenchAccents >= 2 && s.length < 200) return true;

  // Check if sentence starts with French article
  if (/^[Ll]['a]/.test(s) && frenchAccents > 0) return true;

  // French prepositions/conjunctions at start
  if (/^(?:Pour|Avec|Dans|Chez|Sous|Vers|Entre|Comme|Après|Avant|Depuis|Durant|Pendant|Malgré|Selon|Tout|Ces|Cet|Cette|Celui|Ceux|Autre|Autres|Chaque|Même|Aussi|Encore|Déjà|Toujours|Jamais|Souvent|Parfois|Maintenant|Aujourd'hui|Demain|Hier|Bientôt|Ensuite|Puis|Donc|Alors|Pourtant|Cependant|Néanmoins|Ainsi|Sinon|Car|Or|Mais|Et)\b/.test(s) && frenchAccents > 0) return true;

  // Mostly French if accent density is high
  const accentDensity = frenchAccents / s.length;
  if (accentDensity > 0.008) return true;

  return false;
}

function cleanDescription(desc) {
  if (!desc || desc.length < 50) return desc;

  // Find the German buy-line at the end (starts with "- Kaufen Sie" or "— Kaufen Sie")
  const buyLineMatch = desc.match(/[\n-—]\s*Kaufen Sie[^\n]*$/);
  const buyLine = buyLineMatch ? buyLineMatch[0] : '';

  // Remove buy line for processing
  let working = desc.replace(/[\n-—]\s*Kaufen Sie[^\n]*$/, '');

  // Split into sentences (split on period, newline, or semicolon followed by space)
  // Be careful with decimal numbers like "1.200"
  const sentences = working.split(/(?<=[.!?])\s+|\n+/);

  // Filter out French sentences
  const cleanSentences = sentences.filter(s => {
    if (!s.trim()) return false;
    return !isFrenchSentence(s);
  });

  let result = cleanSentences.join(' ').trim();
  if (buyLine) result += '\n' + buyLine;

  // Clean up extra spaces
  result = result.replace(/\s{2,}/g, ' ').trim();

  return result;
}

// Process all description fields
let changeCount = 0;
let totalProcessed = 0;

const newContent = content.replace(
  /"description":\s*"((?:[^"\\]|\\.)*)"/g,
  (match, descValue) => {
    totalProcessed++;
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

// Also clean short_description fields
let shortChangeCount = 0;
const finalContent = newContent.replace(
  /"short_description":\s*"((?:[^"\\]|\\.)*)"/g,
  (match, descValue) => {
    let desc = descValue.replace(/\\"/g, '"').replace(/\\n/g, '\n');

    if (desc.length < 15) return match;

    // For short descriptions, just check for French accents
    if (frenchOnlyAccents.test(desc)) {
      // Simple approach: if it has French accents but no German-specific ß, it might be French
      // But short descriptions are often just a phrase, so be very conservative
      const hasGermanContext = /[ßäöüÄÖÜ]/.test(desc);
      const hasFrenchOnly = frenchOnlyAccents.test(desc);

      if (hasFrenchOnly && !hasGermanContext) {
        shortChangeCount++;
        return match; // Keep as-is, too risky to modify short descriptions
      }
    }

    return match;
  }
);

fs.writeFileSync(filePath, finalContent, 'utf8');

console.log(`Processed ${totalProcessed} descriptions`);
console.log(`Cleaned ${changeCount} long descriptions`);
console.log(`Cleaned ${shortChangeCount} short descriptions`);
