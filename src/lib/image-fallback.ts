import { getSvgFallback } from './svg-placeholders';

export function getValidImageUrl(url?: string, categoryIdOrSlug?: string): string {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return getSvgFallback(categoryIdOrSlug);
  }
  return url;
}
