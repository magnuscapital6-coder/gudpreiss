export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  'staubsauger': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-aspirateurs.jpg',
  'grill': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-barbecue.jpg',
  'sonderangebote': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-bons-plans.jpg',
  'gps-fahrradcomputer': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-montres-gps.jpg',
  'gefrierschraenke': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-congelateurs.jpg',
  'herde-backofen': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-cuisinieres.jpg',
  'haushaltsgeraete': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electromenagers.jpg',
  'elektronik': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg',
  'backwaende': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-fours-muraux.jpg',
  'fritteusen': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-friteuse.jpg',
  'heimtrainer': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-hometrainers.jpg',
  'waschmaschinen': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-lave-linge.jpg',
  'saftpressen-mixer': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-machine-a-jus.jpg',
  'kaffeemaschinen': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-machines-a-cafe.jpg',
  'smartwatches': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-montres-connectees.jpg',
  'sportuhren-gps': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-montres-de-sport.jpg',
  'wearables': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-montres-et-bracelets-connectes.jpg',
  'gps-smartwatches': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-montres-gps.jpg',
  'neuheiten': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-nouveautes.jpg',
  'kochfelder-induktion': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-plaques-de-cuisson.jpg',
  'angebote': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-promotions.jpg',
  'kuehlschraenke': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-refrigerateurs.jpg',
  'kuechenmaschinen': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-robots-de-cuisine.jpg',
  'waeschetrockner': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-seche-linge.jpg',
  'smart-bikes': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-smart-bikes.jpg',
  'laufbaender': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-tapis-de-course.jpg',
  'bestseller': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-top-ventes.jpg',
  'fitness-training': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-training-fitness.jpg',
  'lebensmittelverarbeitung': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-transformation-des-aliments.jpg',
  'fahrraeder-heimtrainer': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-velos-dappartement.jpg',
  'mountainbike': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-velos-de-biking.jpg',
  'crosstrainer': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-velos-elliptiques.jpg',
  'liegendraeder': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-velos-semi-allonges.jpg',
  'it-zubehoer': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg',
  'kameras-foto': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-nouveautes.jpg',
  'buero-it': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg',
  'toner-patronen': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-promotions.jpg',
  'kopfhoerer': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-montres-connectees.jpg',
  'drucker-scanner': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-top-ventes.jpg',
  'laptops-pcs': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg',
  'smartwatches-tracker': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-montres-connectees.jpg',
  'smartphones-tablets': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-montres-de-sport.jpg',
  'smart-tv-streaming': 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg',
  default: 'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg',
};

export function getValidImageUrl(url?: string | { src?: string; thumbnail?: string } | unknown, catKey?: string): string {
  let extractedUrl: string | undefined;
  if (typeof url === 'string') {
    extractedUrl = url;
  } else if (url && typeof url === 'object' && url !== null) {
    const img = url as Record<string, unknown>;
    extractedUrl = (img.src as string) || (img.thumbnail as string) || (img.url as string) || undefined;
  }

  if (!extractedUrl || typeof extractedUrl !== 'string' || extractedUrl.includes('undefined') || extractedUrl.includes('null') || extractedUrl.includes('unsplash')) {
    const key = (catKey || 'default').toLowerCase();
    for (const [k, fallback] of Object.entries(CATEGORY_FALLBACK_IMAGES)) {
      if (key.includes(k)) return fallback;
    }
    return CATEGORY_FALLBACK_IMAGES.default;
  }
  return extractedUrl;
}
