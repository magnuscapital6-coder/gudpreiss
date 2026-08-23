export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  'staubsauger': 'https://m.media-amazon.com/images/I/51r4x9U2KOL._SL1500_.jpg',
  'smartphones-tablets': 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=1280&hei=1280&fmt=jpeg&qlt=95&.v=1692845702708',
  'laptops-pcs': 'https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/macbook-air-15-midnight-select-202403?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1707436033486',
  'kopfhoerer': 'https://www.sony.de/image/6145c1d32e6ac8e63a46c912dc33c5bb?fmt=png-alpha&wid=1200',
  'gaming': 'https://gmedia.playstation.com/is/image/SIEPDC/ps5-pro-console-product-thumbnail-01-en-11sep24?$facebook$',
  'e-bikes': 'https://m.media-amazon.com/images/I/71YvE-9P5SL._SL1500_.jpg',
  default: 'https://gmedia.playstation.com/is/image/SIEPDC/ps5-pro-console-product-thumbnail-01-en-11sep24?$facebook$',
};

export function getValidImageUrl(url?: string, categorySlug?: string): string {
  if (!url || typeof url !== 'string' || url.trim() === '' || url.includes('unsplash.com')) {
    return (categorySlug && CATEGORY_FALLBACK_IMAGES[categorySlug]) || CATEGORY_FALLBACK_IMAGES.default;
  }
  return url;
}
