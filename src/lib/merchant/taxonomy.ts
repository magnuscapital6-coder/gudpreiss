export interface GoogleCategoryMapping {
  id: string;
  name: string;
  google_category: string;
  google_category_id: number;
}

export const WOOD_GOOGLE_TAXONOMY: Record<string, { google_category: string; google_category_id: number }> = {
  'brennholz': {
    google_category: 'Home & Garden > Yard, Garden & Outdoor Living > Outdoor Heating > Firewood & Kindling',
    google_category_id: 5393,
  },
  'holzpellets': {
    google_category: 'Home & Garden > Heating, Ventilation & Air Conditioning > Heating Stoves',
    google_category_id: 3881,
  },
  'ster-holz': {
    google_category: 'Home & Garden > Yard, Garden & Outdoor Living > Outdoor Heating > Firewood & Kindling',
    google_category_id: 5393,
  },
  'holzbriketts': {
    google_category: 'Home & Garden > Heating, Ventilation & Air Conditioning > Heating Stoves',
    google_category_id: 3881,
  },
  'anzundholz': {
    google_category: 'Home & Garden > Yard, Garden & Outdoor Living > Outdoor Heating > Firewood & Kindling',
    google_category_id: 5393,
  },
};

export function getGoogleCategoryForProduct(categorySlugOrName?: string, productName?: string): string {
  const normalized = (categorySlugOrName || '').toLowerCase();
  const title = (productName || '').toLowerCase();

  if (normalized.includes('pellet') || title.includes('pellet')) {
    return WOOD_GOOGLE_TAXONOMY['holzpellets'].google_category;
  }
  if (normalized.includes('brikett') || title.includes('brikett')) {
    return WOOD_GOOGLE_TAXONOMY['holzbriketts'].google_category;
  }
  if (normalized.includes('ster') || title.includes('ster')) {
    return WOOD_GOOGLE_TAXONOMY['ster-holz'].google_category;
  }
  if (normalized.includes('anzünd') || title.includes('anzünd') || title.includes('kindling')) {
    return WOOD_GOOGLE_TAXONOMY['anzundholz'].google_category;
  }
  return WOOD_GOOGLE_TAXONOMY['brennholz'].google_category;
}
