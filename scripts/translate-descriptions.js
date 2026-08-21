const fs = require('fs');

// French → German dictionary for product descriptions
const dict = {
  'conçue': 'entwickelt', 'conçu': 'entwickelt', 'réalisé': 'hergestellt',
  'fonctionne': 'funktioniert', 'fonctionnel': 'funktional',
  'fonction': 'Funktion', 'fonctions': 'Funktionen', 'fonctionnalité': 'Funktion', 'fonctionnalités': 'Funktionen',
  'permet': 'ermöglicht', 'permettent': 'ermöglichen',
  'possède': 'verfügt', 'possèdent': 'verfügen',
  'également': 'ebenfalls', 'caractéristique': 'Merkmal', 'caractéristiques': 'Merkmale',
  'avantage': 'Vorteil', 'avantages': 'Vorteile',
  'qualité': 'Qualität', 'professionnel': 'professionell', 'professionnelle': 'professionell',
  'professionnels': 'professionell', 'professionnelles': 'professionell',
  'entreprise': 'Unternehmen', 'entreprises': 'Unternehmen',
  'bureau': 'Büro', 'bureaux': 'Büros',
  'utilisateur': 'Benutzer', 'utilisateurs': 'Benutzer',
  'utilisation': 'Verwendung', 'utiliser': 'verwenden',
  'idéal': 'ideal', 'idéale': 'ideal',
  'très': 'sehr', 'tout': 'alles', 'tous': 'alle', 'toute': 'alle', 'toutes': 'alle',
  'avec': 'mit', 'sans': 'ohne', 'pour': 'für', 'dans': 'in', 'sur': 'auf',
  'ce': 'dies', 'cette': 'diese', 'ces': 'diese',
  'son': 'sein', 'sa': 'ihre', 'ses': 'ihre',
  'est': 'ist', 'sont': 'sind',
  'peut': 'kann', 'peuvent': 'können',
  'offre': 'bietet', 'offrent': 'bieten',
  'grâce': 'dank', 'notamment': 'insbesondere',
  'notre': 'unser', 'vos': 'Ihre',
  'leur': 'ihre', 'leurs': 'ihre',
  'mais': 'aber', 'ou': 'oder', 'et': 'und',
  'si': 'wenn', 'alors': 'dann', 'donc': 'daher', 'car': 'denn',
  'encore': 'noch', 'déjà': 'bereits', 'toujours': 'immer',
  'nouveau': 'neu', 'nouvelle': 'neue', 'nouveaux': 'neue',
  'premier': 'erste', 'première': 'erste',
  'grand': 'groß', 'grande': 'große', 'petit': 'klein', 'petite': 'kleine',
  'long': 'lang', 'longue': 'lange', 'large': 'breit',
  'haut': 'hoch', 'haute': 'hohe',
  'rapide': 'schnell', 'rapides': 'schnell',
  'facile': 'einfach', 'simple': 'einfach',
  'puissant': 'leistungsstark', 'puissante': 'leistungsstark', 'puissance': 'Leistung',
  'efficace': 'wirksam', 'fiable': 'zuverlässig',
  'robuste': 'robust', 'solide': 'robust',
  'léger': 'leicht', 'légère': 'leichte',
  'compact': 'kompakt', 'compacte': 'kompakt',
  'moderne': 'modern', 'élégant': 'elegant', 'élégante': 'elegante',
  'ergonomique': 'ergonomisch', 'pratique': 'praktisch',
  'confortable': 'bequem', 'silencieux': 'leise', 'silencieuse': 'leise',
  'économe': 'sparsam', 'économique': 'sparsam',
  'intérieur': 'Innenraum', 'extérieur': 'Außenbereich',
  'maison': 'Zuhause', 'domotique': 'Smart Home',
  'connecté': 'verbunden', 'connectée': 'verbunden',
  'intelligent': 'intelligent', 'intelligente': 'intelligente',
  'automatique': 'automatisch', 'manuel': 'manuell', 'manuelle': 'manuell',
  'écran': 'Bildschirm', 'écran tactile': 'Touchscreen',
  'affichage': 'Anzeige', 'mémoire': 'Speicher', 'stockage': 'Speicher',
  'vitesse': 'Geschwindigkeit', 'performance': 'Leistung',
  'batterie': 'Akku', 'autonomie': 'Akkulaufzeit',
  'connexion': 'Verbindung', 'connectivité': 'Konnektivité',
  'wifi': 'WLAN', 'Wi-Fi': 'WLAN',
  'sans fil': 'kabellos', 'filaire': 'verkabelt',
  'application': 'App', 'logiciel': 'Software', 'matériel': 'Hardware',
  'compatibilité': 'Kompatibilität', 'compatible': 'kompatibel',
  'garantie': 'Garantie', 'service après-vente': 'Kundendienst',
  'livraison': 'Lieferung', 'expédition': 'Versand',
  'gratuit': 'kostenlos', 'gratuite': 'kostenlos',
  'inclus': 'inklusive', 'supplémentaire': 'zusätzlich',
  'standard': 'Standard', 'original': 'Original', 'authentique': 'authentisch',
  'marque': 'Marke', 'modèle': 'Modell', 'gamme': 'Reihe', 'série': 'Serie',
  'dimension': 'Abmessung', 'dimensions': 'Abmessungen',
  'poids': 'Gewicht', 'couleur': 'Farbe',
  'noir': 'Schwarz', 'blanc': 'Weiß', 'gris': 'Grau',
  'format': 'Format', 'taille': 'Größe', 'capacité': 'Kapazität',
  'rendement': 'Ertrag', 'pages': 'Seiten',
  'impression': 'Drucken', 'imprimante': 'Drucker',
  'scanner': 'Scanner', 'numérisation': 'Scannen',
  'copie': 'Kopie', 'télécopie': 'Fax',
  'toner': 'Toner', 'cartouche': 'Patrone', 'encre': 'Tinte',
  'papier': 'Papier', 'résolution': 'Auflösung',
  'recto verso': 'doppelseitig', 'recto-verso': 'doppelseitig',
  'réseau': 'Netzwerk', 'écran': 'Bildschirm',
  'tactile': 'berührungsempfindlich',
  'aspirateur': 'Staubsauger', 'aspirateurs': 'Staubsauger',
  'aspiration': 'Saugkraft', 'nettoyage': 'Reinigung',
  'robot': 'Roboter', 'autonome': 'autonom',
  'navigation': 'Navigation', 'cartographie': 'Kartierung',
  'barbecue': 'Grill', 'gaz': 'Gas', 'charbon': 'Kohle',
  'électrique': 'elektrisch', 'cuisson': 'Garen',
  'congélateur': 'Gefrierschrank', 'réfrigérateur': 'Kühlschrank',
  'cave à vin': 'Weinkühlschrank', 'froid': 'Kälte',
  'cuisinière': 'Herd', 'four': 'Ofen', 'micro-ondes': 'Mikrowelle',
  'hotte': 'Dunstabzugshaube', 'plaque': 'Kochfeld',
  'induction': 'Induktion', 'céramique': 'Keramik',
  'fritteuse': 'Friteuse', 'air fryer': 'Heißluftfritteuse',
  'huile': 'Öl', 'aliments': 'Lebensmittel', 'croustillant': 'knusprig',
  'waschmaschine': 'Waschmaschine', 'lave-linge': 'Waschmaschine',
  'séchage': 'Trocknen', 'sèche-linge': 'Wäschetrockner',
  'éco': 'Öko', 'énergie': 'Energie',
  'montre connectée': 'Smartwatch', 'montre': 'Uhr',
  'sport': 'Sport', 'fitness': 'Fitness',
  'pas': 'Schritte', 'calories': 'Kalorien',
  'fréquence cardiaque': 'Herzfrequenz', 'pouls': 'Puls',
  'waterproof': 'wasserdicht', 'étanche': 'wasserdicht',
  'amoled': 'AMOLED', 'home trainer': 'Heimtrainer',
  'vélo d\'appartement': 'Heimtrainer',
  'tapis de course': 'Laufband', 'elliptique': 'Crosstrainer',
  'musculation': 'Krafttraining', 'haltères': 'Hanteln',
  'rowing': 'Rudern', 'cardio': 'Cardio',
  'fréquence': 'Frequenz', 'pente': 'Neigung',
  'inclinable': 'verstellbar', 'surface de course': 'Lauffläche',
  'moteur': 'Motor', 'pliable': 'faltbar',
  'roues de transport': 'Transportrollen', 'amortissement': 'Dämpfung',
  'entraînement': 'Training', 'conception': 'Konstruktion',
  'fabrication': 'Herstellung', 'technologie': 'Technologie',
  'innovation': 'Innovation', 'développement': 'Entwicklung',
  'expertise': 'Expertise', 'premium': 'Premium', 'luxe': 'Luxus',
  'haut de gamme': 'High-End', 'exclusif': 'exklusiv',
  'certification': 'Zertifizierung', 'sécurité': 'Sicherheit',
  'protection': 'Schutz', 'consommateur': 'Verbraucher',
  'client': 'Kunde', 'clients': 'Kunden',
  'satisfaction': 'Zufriedenheit', 'support': 'Support',
  'manuel': 'Handbuch', 'guide': 'Leitfaden',
  'retour': 'Rückgabe', 'remboursement': 'Erstattung',
  'échange': 'Umtausch', 'colis': 'Paket', 'emballage': 'Verpackung',
  'coût': 'Kosten', 'prix': 'Preis', 'tarif': 'Tarif',
  'promotion': 'Aktion', 'remise': 'Rabatt', 'réduction': 'Rabatt',
  'offre': 'Angebot', 'valeur': 'Wert',
  'durée de vie': 'Lebensdauer', 'robustesse': 'Robustheit',
  'résistance': 'Widerstand', 'fiabilité': 'Zuverlässigkeit',
  'entretien': 'Pflege', 'maintenance': 'Wartung',
  'réparation': 'Reparatur', 'pièce': 'Teil', 'pièces': 'Teile',
  'rechange': 'Ersatz', 'accessoire': 'Zubehör', 'accessoires': 'Zubehör',
  'option': 'Option', 'réglage': 'Einstellung', 'réglages': 'Einstellungen',
  'paramètre': 'Parameter', 'paramètres': 'Parameter',
  'niveau': 'Stufe', 'niveaux': 'Stufen', 'intensité': 'Intensität',
  'longueur': 'Länge', 'largeur': 'Breite', 'hauteur': 'Höhe',
  'profondeur': 'Tiefe', 'diamètre': 'Durchmesser',
  'température': 'Temperatur', 'thermomètre': 'Thermometer',
  'programme': 'Programm', 'programmes': 'Programme',
  'volume': 'Volumen', 'contenance': 'Fassungsvermögen',
  'watt': 'Watt', 'volt': 'Volt',
};

function translateText(text) {
  if (!text) return text;
  const sortedKeys = Object.keys(dict).sort((a, b) => b.length - a.length);
  let result = text;
  for (const key of sortedKeys) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('\\b' + escaped + '\\b', 'gi');
    result = result.replace(regex, (match) => {
      const replacement = dict[key];
      if (match[0] === match[0].toUpperCase()) {
        return replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
      return replacement;
    });
  }
  return result;
}

let content = fs.readFileSync('src/lib/db/initial-data.ts', 'utf8');

let translatedDesc = 0;
let translatedShort = 0;

// Translate long descriptions containing French
content = content.replace(/"description": "([^"]+)"/g, (match, desc) => {
  const hasFrench = /[àâäéèêëïîôùûüÿçœæ]/.test(desc) || 
    /conçue|réalisé|fonctionne|permet|possède|également|caractéristique|avantage|fonctionnalité|qualité|professionnel|entreprises|bureau|notre|votre|aussi|ainsi|donc|car|mais|très|tout|tous|toute|avec|pour|dans|sur|entre|chez|vers|depuis|pendant|avant|après|selon|contre|par|sans/.test(desc);
  
  if (hasFrench) {
    translatedDesc++;
    return '"description": "' + translateText(desc) + '"';
  }
  return match;
});

// Translate short descriptions containing French
content = content.replace(/"short_description": "([^"]+)"/g, (match, short) => {
  const hasFrench = /[àâäéèêëïîôùûüÿçœæ]/.test(short) || 
    /conçue|réalisé|fonctionne|permet|possède|également|caractéristique|avantage|qualité|professionnel|entreprises|bureau|notre|votre|aussi|ainsi|donc|car|mais|très|tout|tous|toute|avec|pour|dans|sur|entre|chez|vers|depuis|pendant|avant|après|selon|contre|par|sans/.test(short);
  
  if (hasFrench) {
    translatedShort++;
    return '"short_description": "' + translateText(short) + '"';
  }
  return match;
});

fs.writeFileSync('src/lib/db/initial-data.ts', content);
console.log('Descriptions longues traduites:', translatedDesc);
console.log('Descriptions courtes traduites:', translatedShort);

// Verify no French remains in descriptions
const verify = fs.readFileSync('src/lib/db/initial-data.ts', 'utf8');
const remaining = verify.match(/"description": "[^"]*[àâäéèêëïîôùûüÿçœæ][^"]*"/g);
console.log('Descriptions avec caractères français restants:', remaining ? remaining.length : 0);
