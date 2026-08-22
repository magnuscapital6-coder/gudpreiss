#!/usr/bin/env node
/**
 * Restore multi-line descriptions from AMSI JSON.
 * Handles descriptions that span multiple lines in the TS file.
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

// French → German replacement dictionary
const frToDe = [
  // Product terms
  ['Vidéoprojecteur', 'Beamer'], ['vidéoprojecteur', 'Beamer'],
  ['Vidéoprojecteurs', 'Beamer'], ['vidéoprojecteurs', 'Beamer'],
  ['Écran incurvé', 'Gebogener Monitor'], ['écran incurvé', 'gebogener Monitor'],
  ['Barrette Mémoire', 'Arbeitsspeicher'], ['barrette mémoire', 'Arbeitsspeicher'],
  ['Barrettes Mémoire', 'Arbeitsspeicher'],
  ['Machine à Compter', 'Zählschmaschine'],
  ['Caméra Cage', 'Kamera-Cage'], ['Caméra', 'Kamera'], ['caméra', 'Kamera'],
  ['Clé WiFi', 'WLAN-Adapter'], ['Stabilisateur', 'Stabilisator'],
  ['Système de Webcam', 'Webcam-System'], ['Système de', 'System'], ['système de', 'System'],
  ['Moniteur Écran', 'Monitor'],
  ['imprimante multifonction', 'Multifunktionsdrucker'], ['Imprimante multifonction', 'Multifunktionsdrucker'],
  ['imprimante', 'Drucker'], ['Imprimante', 'Drucker'], ['Imprimantes', 'Drucker'],
  ['multifonction', 'Multifunktionsdrucker'], ['Multifonction', 'Multifunktionsdrucker'],
  ['monochrome', 'Monochrom'], ['Monochrome', 'Monochrom'],
  ['numérisation', 'Scannen'], ['Numérisation', 'Scannen'],
  ['télécopie', 'Fax'], ['Télécopie', 'Fax'],
  ['Cartouche d\'Encre', 'Tintenpatrone'], ['Cartouche D\'encre', 'Tintenpatrone'],
  ['Bouteille d\'encre', 'Tintenflasche'],
  ['Encre', 'Tinte'], ['encre', 'Tinte'],
  ['Vélos d\'appartement', 'Heimtrainer'], ['Vélos', 'Heimtrainer'],
  ['Adaptateur USB-C', 'USB-C-Adapter'], ['Adaptateur USB', 'USB-Adapter'],
  ['Adaptateur', 'Adapter'], ['adaptateur', 'Adapter'], ['ADAPTATEUR', 'ADAPTER'],
  ['Clavier', 'Tastatur'], ['clavier', 'Tastatur'],
  ['Câble', 'Kabel'], ['câble', 'Kabel'],
  ['Papier Photo', 'Fotopapier'], ['papier photo', 'Fotopapier'],
  ['consommable', 'Verbrauchsmaterial'],
  ['bavures', 'Ausfransungen'],
  ['protéger', 'schützen'], ['Protéger', 'Schützen'],
  ['torche', 'Taschenlampe'], ['Torche', 'Taschenlampe'],
  ['tickets', 'Quittungen'],
  ['DieserJet', 'LaserJet'], ['Authentique', 'Original'], ['authentique', 'original'],
  
  // French phrases → German
  ['caractéristiques', 'Eigenschaften'], ['Caractéristiques', 'Eigenschaften'],
  ['présentation', 'Vorstellung'], ['Présentation', 'Vorstellung'],
  ['qualité d\'impression', 'Druckqualität'], ['Qualité d\'impression', 'Druckqualität'],
  ['qualité', 'Qualität'], ['Qualité', 'Qualität'],
  ['principales', 'wichtigsten'], ['Principales', 'Wichtigsten'],
  ['Technologie d\'impression', 'Drucktechnologie'],
  ['Vitesse d\'impression', 'Druckgeschwindigkeit'], ['Vitesse', 'Geschwindigkeit'],
  ['Résolution d\'impression', 'Druckauflösung'], ['Résolution', 'Auflösung'],
  ['Capacité d\'impression', 'Druckleistung'], ['Capacité', 'Kapazität'],
  ['Format papier', 'Papierformat'],
  ['Écran', 'Bildschirm'], ['écran', 'Bildschirm'],
  ['Connexion', 'Verbindung'], ['connexion', 'Verbindung'],
  ['compatible avec', 'kompatibel mit'], ['Compatible avec', 'Kompatibel mit'],
  ['conçue pour', 'entwickelt für'], ['Conçue pour', 'Entwickelt für'],
  ['utilisé pour', 'verwendet für'], ['Utilisé pour', 'Verwendet für'],
  ['idéal pour', 'geeignet für'], ['Idéal pour', 'Geeignet für'],
  ['permet de', 'ermöglicht es'], ['Permet de', 'Ermöglicht es'],
  ['permet', 'ermöglicht'], ['Permet', 'Ermöglicht'],
  ['offre des', 'bietet'], ['est une', 'ist ein'], ['est un', 'ist ein'],
  ['est conçue', 'ist entwickelt'], ['est conçu', 'ist entwickelt'],
  ['pour les', 'für die'], ['Pour les', 'Für die'],
  ['pour des', 'für'], ['Pour des', 'Für'],
  ['pour un', 'für einen'], ['Pour un', 'Für einen'],
  ['pour une', 'für eine'], ['Pour une', 'Für eine'],
  ['les produits', 'die Produkte'], ['la qualité', 'die Qualität'],
  ['la technologie', 'die Technologie'],
  ['des impressions', 'Drucke'], ['des composants', 'der Komponenten'],
  ['de l\'imprimante', 'des Druckers'], ['de l\u2019imprimante', 'des Druckers'],
  ['une impression', 'einen Druck'],
  ['les risques', 'die Risiken'], ['les solutions', 'die Lösungen'],
  ['les documents', 'die Dokumente'], ['les plus', 'die'],
  ['et la', 'und die'], ['et le', 'und der'], ['et les', 'und die'],
  ['du produit', 'des Produkts'],
  ['un excellent', 'ein ausgezeichnetes'],
  ['excellente', 'ausgezeichnete'], ['Excellente', 'Ausgezeichnete'],
  ['Marque', 'Marke'], ['Modèle', 'Modell'], ['Référence', 'Referenz'],
  ['Poids', 'Gewicht'], ['Dimensions', 'Abmessungen'], ['Couleur', 'Farbe'],
  ['Bac ', 'Schacht '], ['Seuil ', 'Schwellenwert '], ['Alerte ', 'Warnung '],
  ['Polycopie', 'Kopie'], ['Reprographie', 'Kopie'],
  ['sans fil', 'kabellos'], ['Sans fil', 'Kabellos'],
  ['rapide et', 'schnell und'], ['nette et', 'sauber und'],
  ['thermique', 'Thermal'], ['largeur de', 'Breite von'],
  ['fond d\'écran', 'Hintergrundbild'],
  ['éclairage', 'Beleuchtung'], ['limitent les', 'begrenzen die'],
  ['fluide', 'fließend'], ['environnements', 'Umgebungen'],
  ['fonctionne', 'funktioniert'], ['Fonctionne', 'Funktioniert'],
  ['Polyvalente', 'Vielseitig'], ['polyvalente', 'vielseitig'],
  ['Présentation du', 'Vorstellung des'], ['Description du', 'Beschreibung des'],
  ['Pourquoi Choisir', 'Warum wählen'], ['Questions fréquentes', 'Häufige Fragen'],
  ['Quelle est', 'Was ist'], ['Informations Complémentaires', 'Weitere Informationen'],
  ['Installation rapide', 'Schnelle Installation'], ['Fiabilité', 'Zuverlässigkeit'],
  ['Avantages', 'Vorteile'], ['Résultats', 'Ergebnisse'],
  ['Respect de', 'Einhaltung von'], ['Stockage', 'Lagerung'],
  ['Entretien', 'Wartung'], ['Poids moyen', 'Durchschnittsgewicht'],
  ['Remplacement', 'Austausch'], ['Réseau', 'Netzwerk'],
  ['Sécurité', 'Sicherheit'], ['Environnement', 'Umwelt'],
  ['Recyclage', 'Recycling'], ['Consommation', 'Verbrauch'],
  ['Professionnel', 'Professionell'], ['professionnel', 'professionell'],
  ['Professionnels', 'Professionelle'], ['professionnels', 'professionelle'],
  ['particuliers', 'Privatpersonen'], ['entreprise', 'Unternehmen'],
  ['besoins des', 'Bedürfnisse der'], ['solution', 'Lösung'],
  ['performances', 'Leistung'], ['performance', 'Leistung'],
  ['composants', 'Komponenten'], ['durée de vie', 'Lebensdauer'],
  ['protection', 'Schutz'], ['impression', 'Druck'], ['Impression', 'Druck'],
  ['environnement', 'Umwelt'], ['recyclables', 'recycelbar'],
  ['recyclage', 'Recycling'],
  ['l\'impact', 'die Auswirkung'], ['l\u2019impact', 'die Auswirkung'],
  ['contribuant à', 'beitragen zu'], ['réduire', 'reduzieren'],
  ['investissement', 'Investition'], ['réimpressions', 'Nachdrucke'],
  ['pannes', 'Störungen'], ['initial', 'anfänglich'],
  ['couleurs', 'Farben'], ['couleur', 'Farbe'], ['Couleur', 'Farbe'],
  ['textes', 'Texte'], ['documents', 'Dokumente'],
  ['pages', 'Seiten'], ['page', 'Seite'],
  ['feuilles', 'Blätter'], ['feuille', 'Blatt'],
  ['modèle', 'Modell'], ['modèles', 'Modelle'],
  ['version', 'Version'], ['standard', 'Standard'],
  ['plus élevé', 'höher'], ['rendement', 'Ertrag'],
  ['produit', 'Produkt'], ['produits', 'Produkte'],
  ['besoins', 'Bedürfnisse'], ['besoin', 'Bedürfnis'],
  ['fonction', 'Funktion'], ['fonctions', 'Funktionen'],
  ['durée', 'Dauer'], ['cartouches', 'Patronen'],
  ['imprimantes', 'Drucker'], ['lumière', 'Licht'],
  ['humidité', 'Feuchtigkeit'], ['chaleur', 'Wärme'],
  ['entretien', 'Wartung'], ['maintenance', 'Wartung'],
  ['consommables', 'Verbrauchsmaterialien'], ['emballage', 'Verpackung'],
  ['optimisée', 'optimiert'], ['constante', 'konstant'],
  ['contrefaites', 'gefälschten'], ['manipulation', 'Handhabung'],
  ['arrêt', 'Stillstand'], ['fuites', 'Undichtigkeiten'],
  ['dysfonctionnements', 'Funktionsstörungen'],
  ['fidèle', 'treu'], ['reproduction', 'Reproduktion'],
  ['soutenir', 'unterstützen'], ['supports', 'Medien'],
  ['initiale', 'anfängliche'], ['pertes', 'Verluste'],
  ['cette', 'diese'], ['celui', 'dieser'], ['ceux', 'diese'],
  ['chaque', 'jede'], ['autre', 'andere'],
  ['leur', 'ihre'], ['leurs', 'ihre'],
  ['nous', 'wir'], ['vous', 'Sie'],
  ['ces', 'diese'], ['aux', 'den'], ['des', 'der'],
  ['est', 'ist'], ['sont', 'sind'], ['peut', 'kann'], ['peuvent', 'können'],
  ['assure', 'gewährleistet'], ['constitue', 'bildet'],
  ['garantit', 'garantiert'], ['présente', 'bietet'],
  ['existe', 'existiert'], ['limiter', 'begrenzen'],
  ['répond', 'entspricht'], ['votre', 'Ihr'], ['notre', 'unser'],
  ['mon', 'mein'], ['ma', 'meine'], ['mes', 'meine'],
  ['ton', 'dein'], ['ta', 'deine'], ['tes', 'deine'],
  ['son', 'sein'], ['sa', 'seine'], ['ses', 'seine'],
  ['l\'utilisation', 'die Verwendung'], ['L\'utilisation', 'Die Verwendung'],
  ['exigeant', 'anspruchsvoll'], ['de hoher', 'von hoher'],
  ['fontionner', 'funktionieren'],
  ['Fonctions', 'Funktionen'], ['fonctions', 'Funktionen'],
  ['Fonction', 'Funktion'], ['fonction', 'Funktion'],
  ['Type ', 'Typ '], ['type ', 'typ '],
  ['Format ', 'Format '],
  ['Adresse ', 'Adresse '],
  ['Nom du produit', 'Produktname'],
  ['Référence fabricant', 'Herstellerreferenz'],
  ['Couleurs Disponibles', 'Verfügbare Farben'],
  ['Capacité d\'Impression', 'Druckleistung'],
  ['jusqu\'à', 'bis zu'],
  ['basé sur', 'basierend auf'],
  ['couverture', 'Abdeckung'],
  ['par page', 'pro Seite'],
  ['selon', 'gemäß'],
  ['conditions', 'Bedingungen'],
  ['d\'impression', 'des Drucks'],
  ['par minute', 'pro Minute'],
  ['par seconde', 'pro Sekunde'],
  ['environ', 'ungefähr'],
  ['secondes', 'Sekunden'],
  ['première', 'erste'],
  ['premier', 'erster'],
  ['depuis', 'seit'],
  ['depuis la', 'seit der'],
  ['depuis le', 'seit dem'],
  ['tactile', 'berührungsempfindlich'],
  ['Ligne', 'Zeile'], ['lignes', 'Zeilen'],
  ['Mono', 'Mono'],
  ['Wi-Fi', 'WLAN'],
  ['Bluetooth', 'Bluetooth'],
  ['Ethernet', 'Ethernet'],
  ['USB', 'USB'],
  ['HDMI', 'HDMI'],
  ['VGA', 'VGA'],
  ['LCD', 'LCD'],
  ['LED', 'LED'],
  ['WiFi', 'WLAN'],
  ['A4', 'A4'], ['A3', 'A3'],
  ['MFP', 'MFP'],
  ['ppm', 'ppm'],
  ['dpi', 'dpi'],
  ['GB', 'GB'], ['MB', 'MB'],
  [' Watt', ' Watt'],
  [' dB', ' dB'],
  [' kg', ' kg'],
  [' mm', ' mm'],
  [' cm', ' cm'],
  [' m', ' m'],
  ['Hz', 'Hz'],
  ['Canon', 'Canon'], ['HP', 'HP'], ['Epson', 'Epson'],
  ['Samsung', 'Samsung'], ['Brother', 'Brother'],
  ['Xerox', 'Xerox'], ['Lexmark', 'Lexmark'],
  ['Kyocera', 'Kyocera'], ['Ricoh', 'Ricoh'],
  ['Sharp', 'Sharp'], ['OKI', 'OKI'],
  ['Konica', 'Konica'], ['Minolta', 'Minolta'],
  ['Pantum', 'Pantum'], ['Lenovo', 'Lenovo'],
  ['Dell', 'Dell'], ['Xiaomi', 'Xiaomi'],
  ['Apple', 'Apple'], ['Sony', 'Sony'],
  ['LG', 'LG'], ['Panasonic', 'Panasonic'],
  ['Philips', 'Philips'], ['Bosch', 'Bosch'],
  ['Siemens', 'Siemens'], ['Miele', 'Miele'],
  ['DeLonghi', 'DeLonghi'], ['Dyson', 'Dyson'],
  ['Logitech', 'Logitech'], ['Razer', 'Razer'],
  ['SteelSeries', 'SteelSeries'], ['Corsair', 'Corsair'],
  ['Kingston', 'Kingston'], ['SanDisk', 'SanDisk'],
  ['Crucial', 'Crucial'], ['Seagate', 'Seagate'],
  ['Western', 'Western'], ['WD', 'WD'],
  ['TP-Link', 'TP-Link'], ['Netgear', 'Netgear'],
  ['ASUS', 'ASUS'], ['MSI', 'MSI'],
  ['Acer', 'Acer'], ['Huawei', 'Huawei'],
  ['OnePlus', 'OnePlus'], ['OPPO', 'OPPO'],
  ['Realme', 'Realme'], ['Vivo', 'Vivo'],
  ['Honor', 'Honor'], ['Nokia', 'Nokia'],
  ['Motorola', 'Motorola'], ['TCL', 'TCL'],
  ['Hisense', 'Hisense'], ['Toshiba', 'Toshiba'],
  ['JBL', 'JBL'], ['Sennheiser', 'Sennheiser'],
  ['Bose', 'Bose'], ['Audio-Technica', 'Audio-Technica'],
  ['Beats', 'Beats'], ['Anker', 'Anker'],
  ['ESET', 'ESET'], ['Norton', 'Norton'],
  ['Bitdefender', 'Bitdefender'], ['Kaspersky', 'Kaspersky'],
  ['Avast', 'Avast'], ['McAfee', 'McAfee'],
  ['NordVPN', 'NordVPN'], ['ExpressVPN', 'ExpressVPN'],
  ['Ubiquiti', 'Ubiquiti'], ['MikroTik', 'MikroTik'],
  ['Synology', 'Synology'], ['QNAP', 'QNAP'],
  ['APC', 'APC'], ['CyberPower', 'CyberPower'],
  ['Varta', 'Varta'], ['Duracell', 'Duracell'],
  ['Energizer', 'Energizer'],
];

function translateText(text) {
  if (!text) return text;
  let result = text;
  for (const [fr, de] of frToDe) {
    result = result.split(fr).join(de);
  }
  return result;
}

// Process the file line by line, tracking multi-line description fields
let descUpdated = 0;
let shortUpdated = 0;

const lines = content.split('\n');
let currentId = null;
let inProduct = false;
let braceDepth = 0;
let inDescription = false;
let descStartLine = -1;
let descContent = '';
let inShortDesc = false;
let shortStartLine = -1;
let shortContent = '';

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Detect product ID
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
      inDescription = false;
      inShortDesc = false;
      continue;
    }

    if (currentId && idToData[currentId]) {
      // Handle multi-line description
      if (!inDescription && !inShortDesc) {
        const descStart = line.match(/^(\s*"description":\s*")(.*)$/);
        if (descStart) {
          if (descStart[2].endsWith('"') && !descStart[2].endsWith('\\"')) {
            // Single-line description
            const val = descStart[2].slice(0, -1);
            const translated = translateText(idToData[currentId].desc || val);
            const escaped = translated.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
            lines[i] = `${descStart[1]}${escaped}"`;
            descUpdated++;
          } else {
            // Multi-line description starts
            inDescription = true;
            descStartLine = i;
            descContent = descStart[2];
          }
        }

        const shortStart = line.match(/^(\s*"short_description":\s*")(.*)$/);
        if (shortStart && !inDescription) {
          if (shortStart[2].endsWith('"') && !shortStart[2].endsWith('\\"')) {
            // Single-line short description
            const val = shortStart[2].slice(0, -1);
            const translated = translateText(idToData[currentId].short || val);
            const escaped = translated.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
            lines[i] = `${shortStart[1]}${escaped}"`;
            shortUpdated++;
          } else {
            // Multi-line short description starts
            inShortDesc = true;
            shortStartLine = i;
            shortContent = shortStart[2];
          }
        }
      } else if (inDescription) {
        descContent += '\n' + line;
        if (line.includes('"') && !line.endsWith('\\"')) {
          // End of multi-line description
          inDescription = false;
          const fullContent = descContent;
          // Find the closing quote
          const lastQuote = fullContent.lastIndexOf('"');
          const beforeQuote = fullContent.substring(0, lastQuote);
          const translated = translateText(idToData[currentId].desc || beforeQuote);
          const escaped = translated.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
          
          // Reconstruct the lines
          const origLines = lines.slice(descStartLine, i + 1);
          const firstLine = origLines[0].replace(/"description":\s*"(.*)$/, '"description": "' + escaped + '"');
          lines.splice(descStartLine, i - descStartLine + 1, firstLine);
          descUpdated++;
          i = descStartLine; // Adjust index
        }
      } else if (inShortDesc) {
        shortContent += '\n' + line;
        if (line.includes('"') && !line.endsWith('\\"')) {
          // End of multi-line short description
          inShortDesc = false;
          const fullContent = shortContent;
          const lastQuote = fullContent.lastIndexOf('"');
          const beforeQuote = fullContent.substring(0, lastQuote);
          const translated = translateText(idToData[currentId].short || beforeQuote);
          const escaped = translated.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
          
          const origLines = lines.slice(shortStartLine, i + 1);
          const firstLine = origLines[0].replace(/"short_description":\s*"(.*)$/, '"short_description": "' + escaped + '"');
          lines.splice(shortStartLine, i - shortStartLine + 1, firstLine);
          shortUpdated++;
          i = shortStartLine;
        }
      }
    }
  }
}

fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
console.log(`Updated ${descUpdated} descriptions, ${shortUpdated} short descriptions`);

// Verify
const v = fs.readFileSync(filePath, 'utf8');
const descs = v.match(/"description":\s*"(?:[^"\\]|\\.)*"/g) || [];
const sizes = descs.map(m => {
  const val = m.match(/"description":\s*"((?:[^"\\]|\\.)*)"/);
  return val ? val[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').length : 0;
}).sort((a,b)=>b-a);
const frenchAccents = /[àâéèêëïîôùûÿçœæ]/;
let french = 0;
descs.forEach(m => { const val = m.match(/"description":\s*"((?:[^"\\]|\\.)*)"/); if (val && frenchAccents.test(val[1])) french++; });
console.log(`\nDescriptions: ${descs.length}`);
console.log(`  Max: ${sizes[0]}, Avg: ${Math.round(sizes.reduce((a,b)=>a+b,0)/sizes.length)}`);
console.log(`  >500: ${sizes.filter(s=>s>500).length}, 100-500: ${sizes.filter(s=>s>=100&&s<=500).length}`);
console.log(`  With French accents: ${french}`);
