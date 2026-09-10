import { NEUTRAL_PRODUCT_SVG } from './svg-placeholders';

export function isRealProductImage(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  // Ban Unsplash, stock image banks, generic fake placeholders
  const lower = trimmed.toLowerCase();
  if (lower.includes('unsplash.com')) return false;
  if (lower.includes('placeholder.com')) return false;
  if (lower.includes('via.placeholder')) return false;
  if (lower.includes('picsum.photos')) return false;
  if (lower.includes('freepik.com')) return false;
  if (lower.includes('shutterstock.com')) return false;
  if (lower.includes('stock.adobe.com')) return false;
  return true;
}

export function getValidImageUrl(url?: string | null, _unusedCategory?: string): string {
  if (!isRealProductImage(url)) {
    return NEUTRAL_PRODUCT_SVG;
  }
  return url!.trim();
}
