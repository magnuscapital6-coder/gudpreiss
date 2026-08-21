const fs = require('fs');
const path = require('path');

const files = [
  'src/app/admin/categories/page.tsx',
  'src/app/admin/customers/page.tsx',
  'src/app/admin/media/page.tsx',
  'src/app/admin/orders/page.tsx',
  'src/app/admin/products/new/page.tsx',
  'src/app/admin/products/page.tsx',
  'src/app/admin/products/[id]/edit/page.tsx',
  'src/app/admin/inventory/page.tsx',
  'src/app/admin/layout.tsx',
  'src/app/admin/reviews/page.tsx',
  'src/app/admin/seo/page.tsx',
  'src/app/admin/settings/page.tsx',
  'src/app/admin/settings/branding/page.tsx',
  'src/app/admin/settings/legal/page.tsx',
  'src/app/admin/marketing/page.tsx',
  'src/app/admin/blog/new/page.tsx',
  'src/app/admin/blog/page.tsx',
  'src/app/(store)/checkout/page.tsx',
  'src/app/(store)/cart/page.tsx',
  'src/app/account/orders/page.tsx',
  'src/app/account/page.tsx',
  'src/components/store/layout/Header.tsx',
  'src/components/store/layout/TopBar.tsx',
  'src/components/store/product/ProductCard.tsx',
  'src/components/store/product/QuickViewModal.tsx',
  'src/components/cart/CartDrawer.tsx',
  'src/components/admin/ImageUploader.tsx',
  'src/components/admin/AdminKpiCards.tsx',
  'src/components/admin/ProductSeoOptimizer.tsx',
  'src/context/auth-context.tsx',
  'src/app/actions/store-actions.ts',
];

const fr2de = {
  // Alert messages
  "'Erreur lors de la création de la commande.'": "'Fehler bei der Bestellerstellung.'",
  "'Erreur lors de la création du produit.'": "'Fehler bei der Produkterstellung.'",
  "'Erreur lors de la mise à jour du produit.'": "'Fehler bei der Produktaktualisierung.'",
  "'Veuillez importer au moins une image pour le produit.'": "'Bitte importieren Sie mindestens ein Produktbild.'",
  "'Erreur lors de la vérification du coupon.'": "'Fehler bei der Gutscheinprüfung.'",

  // Admin categories
  "Organisez les catégories de la boutique TechNova.": "Verwalten Sie die Kategorien des TechNova-Shops.",
  "Organisez les catégories de la boutique TechNova": "Verwalten Sie die Kategorien des TechNova-Shops",
  'placeholder="Rechercher une catégorie..."': 'placeholder="Kategorie suchen..."',
  'Nom de la catégorie': 'Kategorienname',
  'Créer la catégorie': 'Kategorie erstellen',

  // Admin customers
  "Gérez les acheteurs inscrits, les coordonnées et les rôles d'accès.": "Verwalten Sie registrierte Kunden, Kontaktdaten und Zugriffsrollen.",
  "Gérez les acheteurs inscrits, les coordonnées et les rôles d'accès": "Verwalten Sie registrierte Kunden, Kontaktdaten und Zugriffsrollen",
  'Nouveau client': 'Neuer Kunde',
  'Nom de famille': 'Nachname',
  'Prénom': 'Vorname',
  'Total dépensé': 'Gesamtausgaben',
  'Dernière commande': 'Letzte Bestellung',
  'Aucune commande': 'Keine Bestellung',
  'Adresse email': 'E-Mail-Adresse',
  'Notes internes': 'Interne Notizen',

  // Admin media
  "Importez et gérez les fichiers médias haute résolution des produits.": "Importieren und verwalten Sie hochauflösende Produktmedien.",
  "Importez et gérez les fichiers médias haute résolution des produits": "Importieren und verwalten Sie hochauflösende Produktmedien",
  'Copier le lien': 'Link kopieren',
  "Copier le lien de l'image": "Bildlink kopieren",

  // Admin orders
  'placeholder="Rechercher par N° de commande ou email client..."': 'placeholder="Nach Bestellnr. oder Kunden-E-Mail suchen..."',
  'Numéro de commande': 'Bestellnummer',
  'Statut de la commande': 'Bestellstatus',
  'Adresse de livraison': 'Lieferadresse',
  'Adresse de facturation': 'Rechnungsadresse',
  'Frais de livraison': 'Versandkosten',
  'Mode de paiement': 'Zahlungsmethode',
  'Statut du paiement': 'Zahlungsstatus',
  'Sous-total': 'Zwischensumme',
  'Total': 'Gesamt',
  'Remise': 'Rabatt',
  'TVA': 'MwSt.',
  'Gratuit': 'Kostenlos',

  // Admin products
  "Gérez le catalogue des produits, prix et stocks de votre boutique.": "Verwalten Sie den Produktkatalog, Preise und Bestände Ihres Shops.",
  "Gérez le catalogue des produits, prix et stocks de votre boutique": "Verwalten Sie den Produktkatalog, Preise und Bestände Ihres Shops",
  'placeholder="Rechercher par nom ou SKU..."': 'placeholder="Nach Name oder SKU suchen..."',
  "Aucun produit trouvé.": "Keine Produkte gefunden.",
  'Nom du produit *': 'Produktname *',
  "Importation directe d'images du produit *": "Direkter Produktbild-Import *",
  'Retour aux produits': 'Zurück zu Produkten',
  "Modifier le Produit": "Produkt bearbeiten",
  "Chargement des détails du produit...": "Produktdetails werden geladen...",
  "Images du produit (Importation directe) *": "Produktbilder (Direktimport) *",

  // Admin inventory
  'placeholder="Rechercher par code SKU ou Nom du produit..."': 'placeholder="Nach SKU oder Produktnamen suchen..."',

  // Admin layout
  "Voir la boutique": "Shop anzeigen",
  "title=\"Déconnexion\"": "title=\"Abmelden\"",
  "Déconnexion": "Abmelden",

  // Admin reviews
  "Avis": "Bewertungen",

  // Admin SEO
  "Référencement": "SEO",
  "Référencement naturel": "SEO",

  // Admin settings
  "Réglages": "Einstellungen",
  "Mise à jour": "Aktualisierung",
  "Enregistrer": "Speichern",
  "Fermer": "Schließen",
  "Annuler": "Abbrechen",
  "Confirmer": "Bestätigen",
  "Valider": "Bestätigen",

  // Admin blog
  "Nom du Blog": "Blogname",
  "Nouveau blog": "Neuer Blog",
  "Rédiger le blog": "Blog schreiben",

  // Checkout
  "Erreur lors de la création de la commande.": "Fehler bei der Bestellerstellung.",

  // Header
  "Résultats en direct": "Live-Ergebnisse",
  "Voir tous les résultats": "Alle Ergebnisse anzeigen",

  // Common UI
  "Rechercher": "Suchen",
  "Recherche": "Suche",

  // Cart
  "Mon panier": "Mein Warenkorb",
  "Panier": "Warenkorb",

  // Account
  "Mes commandes": "Meine Bestellungen",
  "Mon compte": "Mein Konto",
  "Paramètres": "Einstellungen",
  "Facturation": "Rechnung",

  // Auth
  "Se connecter": "Anmelden",
  "Se déconnecter": "Abmelden",
  "Créer un compte": "Konto erstellen",
  "Mot de passe oublié": "Passwort vergessen",
  "Pas encore de compte": "Noch kein Konto",
  "Déjà un compte": "Bereits ein Konto",

  // Product
  "Aucun produit trouvé": "Keine Produkte gefunden",
  "Ajouter au panier": "In den Warenkorb",
  "Voir le panier": "Warenkorb anzeigen",
  "Retour": "Zurück",
  "Chargement": "Wird geladen",
  "Erreur": "Fehler",
  "Succès": "Erfolg",

  // Order statuses
  "En cours de traitement": "In Bearbeitung",
  "En attente": "Ausstehend",
  "Expédié": "Versandt",
  "Livré": "Zugestellt",
  "Remboursé": "Erstattet",
  "Annulé": "Storniert",
  "Validé": "Bestätigt",

  // Admin page descriptions (English)
  "Organize the categories": "Verwalten Sie die Kategorien",
  "Manage": "Verwalten",
  "products": "Produkte",
  "orders": "Bestellungen",
  "customers": "Kunden",
  "reviews": "Bewertungen",
  "blog": "Blog",
  "settings": "Einstellungen",
  "marketing": "Marketing",
  "media": "Medien",
  "inventory": "Lagerbestand",
  "categories": "Kategorien",
};

let totalReplaced = 0;

for (const file of files) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    let replaced = 0;

    for (const [fr, de] of Object.entries(fr2de)) {
      if (content.includes(fr)) {
        const count = content.split(fr).length - 1;
        content = content.split(fr).join(de);
        replaced += count;
      }
    }

    if (replaced > 0) {
      fs.writeFileSync(file, content);
      console.log(`  ${path.basename(file)}: ${replaced}`);
      totalReplaced += replaced;
    }
  } catch (e) {
    console.log(`  SKIP: ${file} (${e.message.substring(0, 40)})`);
  }
}

console.log(`\nTotal: ${totalReplaced} remplacements`);
