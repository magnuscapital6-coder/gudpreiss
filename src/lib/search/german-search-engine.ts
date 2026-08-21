import { Product } from '@/types';

const GERMAN_SYNONYMS: Record<string, string[]> = {
  bohrmaschine: ['bohrer', 'bohrmaschiene', 'akkuschrauber', 'bohrschrauber'],
  smartphone: ['handy', 'telefon', 'mobile', '5g'],
  kopfhörer: ['headset', 'earbuds', 'in-ear', 'over-ear', 'headphone', 'audio'],
  laptop: ['notebook', 'ultrabook', 'computer', 'pc'],
  gaming: ['controller', 'gamepad', 'zocken', 'konsole'],
  roboter: ['sauger', 'saugroboter', 'staubsauger', 'smart home'],
};

export function searchGermanProducts(products: Product[], rawQuery: string): Product[] {
  if (!rawQuery || !rawQuery.trim()) return products;

  const query = rawQuery.trim().toLowerCase();
  const tokens = query.split(/\s+/);

  // Expand query with German synonyms
  const searchTerms = new Set<string>([...tokens]);
  tokens.forEach((token) => {
    Object.entries(GERMAN_SYNONYMS).forEach(([canonical, list]) => {
      if (canonical.includes(token) || list.some((syn) => syn.includes(token))) {
        searchTerms.add(canonical);
        list.forEach((s) => searchTerms.add(s));
      }
    });
  });

  return products.filter((p) => {
    const textToSearch = `${p.name} ${p.description || ''} ${p.short_description || ''} ${p.category_name || ''} ${p.brand_name || ''} ${p.sku || ''}`.toLowerCase();
    
    return Array.from(searchTerms).some((term) => textToSearch.includes(term));
  });
}
