#!/usr/bin/env node
/**
 * Restore long descriptions from AMSI JSON, replacing French terms with German.
 * Keep the full description content but translate French words in-place.
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'lib', 'db', 'initial-data.ts');
const jsonPath = path.join(__dirname, 'amsi-all-products.json');

const amsiData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
let content = fs.readFileSync(filePath, 'utf8');

// Map numeric ID to original data
const idToData = {};
amsiData.forEach(p => {
  if (p.id) idToData[String(p.id)] = {
    name: p.name || '',
    desc: p.description || '',
    short: p.short_description || ''
  };
});

// French → German replacement dictionary (order matters: longer phrases first)
const frToDe = [
  // Product terms
  ['Vidéoprojecteur', 'Beamer'], ['vidéoprojecteur', 'Beamer'],
  ['Vidéoprojecteurs', 'Beamer'], ['vidéoprojecteurs', 'Beamer'],
  ['Écran incurvé', 'Gebogener Monitor'], ['écran incurvé', 'gebogener Monitor'],
  ['Barrette Mémoire', 'Arbeitsspeicher'], ['barrette mémoire', 'Arbeitsspeicher'],
  ['Barrettes Mémoire', 'Arbeitsspeicher'],
  ['Machine à Compter', 'Zählschmaschine'],
  ['Caméra Cage', 'Kamera-Cage'], ['Caméra', 'Kamera'], ['caméra', 'Kamera'],
  ['Clé WiFi', 'WLAN-Adapter'], ['Clé', 'Schlüssel'],
  ['Stabilisateur', 'Stabilisator'],
  ['Système de Webcam', 'Webcam-System'], ['Système de', 'System'], ['système de', 'System'],
  ['Moniteur Écran', 'Monitor'], ['Moniteur', 'Monitor'],
  ['imprimante multifonction', 'Multifunktionsdrucker'], ['Imprimante multifonction', 'Multifunktionsdrucker'],
  ['imprimante', 'Drucker'], ['Imprimante', 'Drucker'], ['Imprimantes', 'Drucker'],
  ['multifonction', 'Multifunktionsdrucker'], ['Multifonction', 'Multifunktionsdrucker'],
  ['monochrome', 'Monochrom'], ['Monochrome', 'Monochrom'],
  ['numérisation', 'Scannen'], ['Numérisation', 'Scannen'],
  ['télécopie', 'Fax'], ['Télécopie', 'Fax'],
  ['Cartouche d\'Encre', 'Tintenpatrone'], ['Cartouche D\'encre', 'Tintenpatrone'],
  ['Cartouche', 'Tintenpatrone'], ['cartouche', 'Tintenpatrone'],
  ['Bouteille d\'encre', 'Tintenflasche'], ['bouteille d\'encre', 'Tintenflasche'],
  ['Encre', 'Tinte'], ['encre', 'Tinte'],
  ['Vélos d\'appartement', 'Heimtrainer'], ['Vélos', 'Heimtrainer'],
  ['Adaptateur USB-C', 'USB-C-Adapter'], ['Adaptateur USB', 'USB-Adapter'],
  ['Adaptateur', 'Adapter'], ['adaptateur', 'Adapter'],
  ['ADAPTATEUR', 'ADAPTER'],
  ['Clavier', 'Tastatur'], ['clavier', 'Tastatur'],
  ['Câble', 'Kabel'], ['câble', 'Kabel'],
  ['Papier Photo', 'Fotopapier'], ['papier photo', 'Fotopapier'],
  ['consommable', 'Verbrauchsmaterial'],
  ['bavures', 'Ausfransungen'],
  ['protéger', 'schützen'], ['Protéger', 'Schützen'],
  ['torche', 'Taschenlampe'], ['Torche', 'Taschenlampe'],
  ['tickets', 'Quittungen'],
  ['DieserJet', 'LaserJet'], ['Authentique', 'Original'],
  ['authentique', 'original'],
  
  // Common French phrases → German
  ['caractéristiques', 'Eigenschaften'], ['Caractéristiques', 'Eigenschaften'],
  ['présentation', 'Vorstellung'], ['Présentation', 'Vorstellung'],
  ['qualité d\'impression', 'Druckqualität'], ['Qualité d\'impression', 'Druckqualität'],
  ['qualité', 'Qualität'], ['Qualité', 'Qualität'],
  ['principales', 'wichtigsten'], ['Principales', 'Wichtigsten'],
  ['Technologie d\'impression', 'Drucktechnologie'],
  ['Technologie', 'Technologie'],
  ['Vitesse d\'impression', 'Druckgeschwindigkeit'],
  ['Vitesse', 'Geschwindigkeit'],
  ['Résolution d\'impression', 'Druckauflösung'],
  ['Résolution', 'Auflösung'],
  ['Capacité d\'impression', 'Druckleistung'],
  ['Capacité', 'Kapazität'],
  ['Format papier', 'Papierformat'],
  ['Écran', 'Bildschirm'], ['écran', 'Bildschirm'],
  ['Résolution', 'Auflösung'],
  ['Connexion', 'Verbindung'], ['connexion', 'Verbindung'],
  ['compatible avec', 'kompatibel mit'], ['Compatible avec', 'Kompatibel mit'],
  ['conçue pour', 'entwickelt für'], ['Conçue pour', 'Entwickelt für'],
  ['utilisé pour', 'verwendet für'], ['Utilisé pour', 'Verwendet für'],
  ['idéal pour', 'geeignet für'], ['Idéal pour', 'Geeignet für'],
  ['permet de', 'ermöglicht es'], ['Permet de', 'Ermöglicht es'],
  ['permet', 'ermöglicht'], ['Permet', 'Ermöglicht'],
  ['offre des', 'bietet'], ['Offre des', 'Bietet'],
  ['est une', 'ist ein'], ['Est une', 'Ist ein'],
  ['est un', 'ist ein'], ['Est un', 'Ist ein'],
  ['est conçue', 'ist entwickelt'], ['est conçu', 'ist entwickelt'],
  ['pour les', 'für die'], ['Pour les', 'Für die'],
  ['pour des', 'für'], ['Pour des', 'Für'],
  ['pour un', 'für einen'], ['Pour un', 'Für einen'],
  ['pour une', 'für eine'], ['Pour une', 'Für eine'],
  ['les produits', 'die Produkte'], ['Les produits', 'Die Produkte'],
  ['la qualité', 'die Qualität'], ['La qualité', 'Die Qualität'],
  ['la technologie', 'die Technologie'], ['La technologie', 'Die Technologie'],
  ['des impressions', 'Drucke'], ['des composants', 'der Komponenten'],
  ['de l\'imprimante', 'des Druckers'], ['de l\u2019imprimante', 'des Druckers'],
  ['une impression', 'einen Druck'],
  ['les risques', 'die Risiken'],
  ['les solutions', 'die Lösungen'],
  ['les documents', 'die Dokumente'],
  ['les plus', 'die'], ['les meilleurs', 'die besten'],
  ['et la', 'und die'], ['et le', 'und der'], ['et les', 'und die'],
  ['du produit', 'des Produkts'],
  ['un excellent', 'ein ausgezeichnetes'],
  ['excellente', 'ausgezeichnete'], ['Excellente', 'Ausgezeichnete'],
  ['Marque', 'Marke'], ['Modèle', 'Modell'], ['Référence', 'Referenz'],
  ['Poids', 'Gewicht'], ['Dimensions', 'Abmessungen'], ['Couleur', 'Farbe'],
  ['Bac ', 'Schacht '], ['Seuil ', 'Schwellenwert '], ['Alerte ', 'Warnung '],
  ['Polycopie', 'Kopie'], ['Reprographie', 'Kopie'],
  ['sans fil', 'kabellos'], ['Sans fil', 'Kabellos'],
  ['Coupe nette', 'Saubere Schnitte'],
  ['rapide et', 'schnell und'], ['nette et', 'sauber und'],
  ['thermique', 'Thermal'], ['largeur de', 'Breite von'],
  ['fond d\'écran', 'Hintergrundbild'], ['fond d\u2019écran', 'Hintergrundbild'],
  ['éclairage', 'Beleuchtung'],
  ['limitent les', 'begrenzen die'],
  ['fluide', 'fließend'],
  ['environnements', 'Umgebungen'],
  ['activati', 'Aktivierung'],
  ['fonctionne', 'funktioniert'], ['Fonctionne', 'Funktioniert'],
  ['Polyvalente', 'Vielseitig'], ['polyvalente', 'vielseitig'],
  ['Présentation du', 'Vorstellung des'], ['présentation du', 'Vorstellung des'],
  ['Description du', 'Beschreibung des'],
  ['Pourquoi Choisir', 'Warum wählen'],
  ['Questions fréquentes', 'Häufige Fragen'],
  ['Quelle est', 'Was ist'],
  ['Informations Complémentaires', 'Weitere Informationen'],
  ['Installation rapide', 'Schnelle Installation'],
  ['Fiabilité', 'Zuverlässigkeit'],
  ['Avantages', 'Vorteile'],
  ['Résultats', 'Ergebnisse'],
  ['Garantie', 'Garantie'],
  ['Respect de', 'Einhaltung von'],
  ['Stockage', 'Lagerung'],
  ['Entretien', 'Wartung'],
  ['Poids moyen', 'Durchschnittsgewicht'],
  ['Remplacement', 'Austausch'],
  ['Réseau', 'Netzwerk'],
  ['Sécurité', 'Sicherheit'],
  ['Environnement', 'Umwelt'],
  ['Recyclage', 'Recycling'],
  ['Cartouche', 'Patrone'],
  ['Consommation', 'Verbrauch'],
  ['Professionnel', 'Professionell'], ['professionnel', 'professionell'],
  ['Professionnels', 'Professionelle'], ['professionnels', 'professionelle'],
  ['particuliers', 'Privatpersonen'],
  ['entreprise', 'Unternehmen'],
  ['besoins des', 'Bedürfnisse der'],
  ['besoin des', 'Bedürfnis der'],
  ['solution', 'Lösung'],
  ['performances', 'Leistung'], ['performance', 'Leistung'],
  ['composants', 'Komponenten'],
  ['durée de vie', 'Lebensdauer'],
  ['protection', 'Schutz'],
  ['impression', 'Druck'], ['Impression', 'Druck'],
  ['environnement', 'Umwelt'],
  ['recyclables', 'recycelbar'],
  ['recyclage', 'Recycling'],
  ['l\'impact', 'die Auswirkung'], ['l\u2019impact', 'die Auswirkation'],
  ['contribuant à', 'beitragen zu'],
  ['réduire', 'reduzieren'],
  ['investissement', 'Investition'],
  ['réimpressions', 'Nachdrucke'],
  ['pannes', 'Störungen'],
  ['rentabilité', 'Rentabilität'],
  ['initial', 'anfänglich'],
  ['Drucker', 'Drucker'],
  ['couleurs', 'Farben'], ['couleur', 'Farbe'], ['Couleur', 'Farbe'],
  ['textes', 'Texte'], ['texte', 'Text'],
  ['documents', 'Dokumente'], ['document', 'Dokument'],
  ['pages', 'Seiten'], ['page', 'Seite'],
  ['feuilles', 'Blätter'], ['feuille', 'Blatt'],
  ['modèle', 'Modell'], ['modèles', 'Modelle'],
  ['version', 'Version'],
  ['standard', 'Standard'],
  ['plus élevé', 'höher'],
  ['rendement', 'Ertrag'], ['rendement de', 'Ertrag von'],
  ['professeurs', 'Lehrer'],
  ['proffesionnel', 'professionell'],
  ['produit', 'Produkt'], ['produits', 'Produkte'],
  ['besoins', 'Bedürfnisse'], ['besoin', 'Bedürfnis'],
  ['fonction', 'Funktion'], ['fonctions', 'Funktionen'],
  ['composants', 'Komponenten'],
  ['durée', 'Dauer'],
  ['protection', 'Schutz'],
  ['recyclables', 'recycelbar'],
  ['recyclage', 'Recycling'],
  ['cartouches', 'Patronen'],
  ['imprimantes', 'Drucker'],
  ['lumière', 'Licht'],
  ['directe', 'direkt'],
  ['humidité', 'Feuchtigkeit'],
  ['chaleur', 'Wärme'],
  ['entretien', 'Wartung'],
  ['maintenance', 'Wartung'],
  ['consommables', 'Verbrauchsmaterialien'],
  ['emballage', 'Verpackung'],
  ['optimisée', 'optimiert'],
  ['constante', 'konstant'],
  ['contrefaites', 'gefälschten'],
  ['manipulation', 'Handhabung'],
  ['arrêt', 'Stillstand'],
  ['fuites', 'Undichtigkeiten'],
  ['dysfonctionnements', 'Funktionsstörungen'],
  ['fidèle', 'treu'],
  ['reproduction', 'Reproduktion'],
  ['soutenir', 'unterstützen'],
  ['supports', 'Medien'],
  ['initiale', 'anfängliche'],
  ['pertes', 'Verluste'],
  ['soit', 'ist'],
  ['cette', 'diese'], ['celui', 'dieser'], ['ceux', 'diese'],
  ['chaque', 'jede'], ['autre', 'andere'],
  ['leur', 'ihre'], ['leurs', 'ihre'],
  ['nous', 'wir'], ['vous', 'Sie'],
  ['ces', 'diese'],
  ['aux', 'den'], ['des', 'der'],
  ['est', 'ist'], ['sont', 'sind'],
  ['peut', 'kann'], ['peuvent', 'können'],
  ['assure', 'gewährleistet'],
  ['constitue', 'bildet'],
  ['garantit', 'garantiert'],
  ['présente', 'bietet'],
  ['existe', 'existiert'],
  ['limiter', 'begrenzen'],
  ['répond', 'entspricht'],
  ['votre', 'Ihr'], ['notre', 'unser'],
  ['mon', 'mein'], ['ma', 'meine'], ['mes', 'meine'],
  ['ton', 'dein'], ['ta', 'deine'], ['tes', 'deine'],
  ['son', 'sein'], ['sa', 'seine'], ['ses', 'seine'],
  ['l\'utilisation', 'die Verwendung'], ['L\'utilisation', 'Die Verwendung'],
  ['approprié', 'geeignet'],
  ['exigeant', 'anspruchsvoll'],
  ['de hoher', 'von hoher'],
  ['fontionner', 'funktionieren'],
];

function translateText(text) {
  if (!text) return text;
  let result = text;
  for (const [fr, de] of frToDe) {
    result = result.split(fr).join(de);
  }
  return result;
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

      // Restore & translate description
      const descMatch = line.match(/^(\s*"description":\s*")((?:[^"\\]|\\.)*?)(",?\s*)$/);
      if (descMatch && data.desc) {
        const translated = translateText(data.desc);
        if (translated !== descMatch[2]) {
          const escaped = translated.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
          lines[i] = `${descMatch[1]}${escaped}${descMatch[3]}`;
          descUpdated++;
        }
      }

      // Restore & translate short_description
      const shortMatch = line.match(/^(\s*"short_description":\s*")((?:[^"\\]|\\.)*?)(",?\s*)$/);
      if (shortMatch && data.short) {
        const translated = translateText(data.short);
        if (translated !== shortMatch[2]) {
          const escaped = translated.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
          lines[i] = `${shortMatch[1]}${escaped}${shortMatch[3]}`;
          shortUpdated++;
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
const sizes = descs.map(m => { const val = m.match(/"description":\s*"(.+)"/); return val ? val[1].length : 0; }).sort((a,b)=>b-a);
const frenchAccents = /[àâéèêëïîôùûÿçœæ]/;
let french = 0;
descs.forEach(m => { const val = m.match(/"description":\s*"(.+)"/); if (val && frenchAccents.test(val[1])) french++; });
console.log(`\nDescriptions: ${descs.length}`);
console.log(`  Max: ${sizes[0]}, Avg: ${Math.round(sizes.reduce((a,b)=>a+b,0)/sizes.length)}`);
console.log(`  >500: ${sizes.filter(s=>s>500).length}, 100-500: ${sizes.filter(s=>s>=100&&s<=500).length}`);
console.log(`  With French accents: ${french}`);
