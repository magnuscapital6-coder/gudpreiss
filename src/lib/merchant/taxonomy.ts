export interface GoogleCategoryMapping {
  id: string;
  name: string;
  google_category: string;
  google_category_id: number;
}

export interface GoogleCategoryMapping {
  id: string;
  name: string;
  google_category: string;
  google_category_id: number;
}

export const GUDPREISS_GOOGLE_TAXONOMY: Record<string, { google_category: string; google_category_id: number }> = {
  'e-bikes': {
    google_category: 'Sporting Goods > Outdoor Recreation > Cycling > Bicycles > Electric Bicycles',
    google_category_id: 5994,
  },
  'playstation-konsolen': {
    google_category: 'Electronics > Video Game Consoles',
    google_category_id: 2167,
  },
  'playstation-controller-zubehoer': {
    google_category: 'Electronics > Electronics Accessories > Video Game Accessories',
    google_category_id: 499971,
  },
  'playstation-audio-vr': {
    google_category: 'Electronics > Audio > Audio Components > Headphones & Headsets',
    google_category_id: 505771,
  },
  'playstation-ssd-speicher': {
    google_category: 'Electronics > Computers > Computer Components > Storage Devices > Hard Drives',
    google_category_id: 8086,
  },
  'elektronik-technik': {
    google_category: 'Electronics',
    google_category_id: 222,
  },
};

export function getGoogleCategoryForProduct(categorySlugOrName?: string, productName?: string): string {
  const normalized = (categorySlugOrName || '').toLowerCase();
  const title = (productName || '').toLowerCase();

  if (normalized.includes('bike') || title.includes('bike') || title.includes('fahrrad') || title.includes('cube') || title.includes('haibike')) {
    return GUDPREISS_GOOGLE_TAXONOMY['e-bikes'].google_category;
  }
  if (normalized.includes('controller') || title.includes('dualsense') || title.includes('controller') || title.includes('ladestation')) {
    return GUDPREISS_GOOGLE_TAXONOMY['playstation-controller-zubehoer'].google_category;
  }
  if (normalized.includes('audio') || normalized.includes('vr') || title.includes('headset') || title.includes('earbuds') || title.includes('pulse') || title.includes('ps vr2')) {
    return GUDPREISS_GOOGLE_TAXONOMY['playstation-audio-vr'].google_category;
  }
  if (normalized.includes('ssd') || normalized.includes('speicher') || title.includes('ssd') || title.includes('nvme') || title.includes('firecuda') || title.includes('sn850p')) {
    return GUDPREISS_GOOGLE_TAXONOMY['playstation-ssd-speicher'].google_category;
  }
  if (normalized.includes('konsole') || title.includes('playstation') || title.includes('ps5') || title.includes('pro')) {
    return GUDPREISS_GOOGLE_TAXONOMY['playstation-konsolen'].google_category;
  }
  return GUDPREISS_GOOGLE_TAXONOMY['elektronik-technik'].google_category;
}

