const fs = require('fs');
const path = require('path');
const glob = require('child_process').execSync('find src -name "*.tsx" -o -name "*.ts" | grep -v node_modules | grep -v locales | grep -v initial-data | grep -v ".next" | grep -v ".test."').toString().trim().split('\n');

// French → German UI string mapping (order matters: longer strings first)
const replacements = [
  // Alert messages
  ["'Erreur lors de la création de la commande.'", "'Fehler bei der Bestellerstellung.'"],
  ["'Erreur lors de la création du produit.'", "'Fehler bei der Produkterstellung.'"],
  ["'Erreur lors de la mise à jour du produit.'", "'Fehler bei der Produktaktualisierung.'"],
  ["'Veuillez importer au moins une image pour le produit.'", "'Bitte importieren Sie mindestens ein Produktbild.'"],
  ["'Erreur lors de la vérification du coupon.'", "'Fehler bei der Gutscheinprüfung.'"],
  
  // Admin categories
  ["Organisez les catégories de la boutique GudPreiss.", "Verwalten Sie die Kategorien des GudPreiss-Shops."],
  
  // Admin customers
  ["Gérez les acheteurs inscrits, les coordonnées et les rôles d'accès.", "Verwalten Sie registrierte Kunden, Kontaktdaten und Zugriffsrollen."],
  
  // Admin media
  ["Importez et gérez les fichiers médias haute résolution des produits.", "Importieren und verwalten Sie hochauflösende Produktmedien."],
  ['title="Copier le lien de l\'image"', 'title="Bildlink kopieren"'],
  
  // Admin orders
  ['placeholder="Rechercher par N° de commande ou email client..."', 'placeholder="Nach Bestellnr. oder Kunden-E-Mail suchen..."'],
  
  // Admin products
  ["Gérez le catalogue des produits, prix et stocks de votre boutique.", "Verwalten Sie den Produktkatalog, Preise und Bestände Ihres Shops."],
  ['placeholder="Rechercher par nom ou SKU..."', 'placeholder="Nach Name oder SKU suchen..."'],
  ["Aucun produit trouvé.", "Keine Produkte gefunden."],
  
  // Admin products - new
  ['Nom du produit *', 'Produktname *'],
  ["Importation directe d'images du produit *", "Direkter Produktbild-Import *"],
  ['Retour aux produits', 'Zurück zu Produkten'],
  
  // Admin products - edit
  ["Modifier le Produit", "Produkt bearbeiten"],
  ["Chargement des détails du produit...", "Produktdetails werden geladen..."],
  ["Images du produit (Importation directe) *", "Produktbilder (Direktimport) *"],
  ["Nom du produit *", "Produktname *"],
  
  // Admin inventory
  ['placeholder="Rechercher par code SKU ou Nom du produit..."', 'placeholder="Nach SKU oder Produktnamen suchen..."'],
  
  // Admin layout
  ["Voir la boutique", "Shop anzeigen"],
  ["title=\"Déconnexion\"", "title=\"Abmelden\""],
  
  // Admin page titles & descriptions
  ["Keine Bestellungen vorhanden / Aucune commande", "Keine Bestellungen vorhanden"],
  
  // Admin blog
  ["Empfehlungen & Analyse", "Empfehlungen & Analyse"],
  
  // Checkout
  ["Erreur lors de la création de la commande.", "Fehler bei der Bestellerstellung."],
  
  // Header
  ["Résultats en direct", "Live-Ergebnisse"],
  ["Voir tous les résultats", "Alle Ergebnisse anzeigen"],
  
  // Common UI
  ["Rechercher", "Suchen"],
  ["Recherche", "Suche"],
  
  // Product detail
  ["product.tabDescription", "Beschreibung"],
  ["product.tabSpecs", "Technische Daten"],
  ["product.tabReviews", "Bewertungen"],
];

let totalReplaced = 0;

for (const file of glob) {
  if (!file) continue;
  try {
    let content = fs.readFileSync(file, 'utf8');
    let replaced = 0;
    
    for (const [fr, de] of replacements) {
      const escaped = fr.replace(/[.*+?^${}()|[\]\]/g, '\$&');
      const regex = new RegExp(escaped, 'g');
      const matches = content.match(regex);
      if (matches) {
        content = content.replace(regex, de);
        replaced += matches.length;
      }
    }
    
    if (replaced > 0) {
      fs.writeFileSync(file, content);
      console.log(`  ${path.basename(file)}: ${replaced} remplacements`);
      totalReplaced += replaced;
    }
  } catch (e) {
    // Skip files that can't be read
  }
}

console.log(`\nTotal: ${totalReplaced} remplacements dans ${glob.length} fichiers`);
