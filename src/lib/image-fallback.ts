export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  'staubsauger': 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80',
  'smartphones-tablets': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
  'laptops-pcs': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
  'kopfhoerer': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  'gaming': 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80',
  'e-bikes': 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?auto=format&fit=crop&w=800&q=80',
  default: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
};

export function getValidImageUrl(url?: string, categorySlug?: string): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return (categorySlug && CATEGORY_FALLBACK_IMAGES[categorySlug]) || CATEGORY_FALLBACK_IMAGES.default;
  }
  return url;
}
