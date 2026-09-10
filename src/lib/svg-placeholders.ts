// Neutral non-photographic SVG placeholder for products that have no image.
// Strictly conforms to: NO stock photos, NO Unsplash, NO category drawings, NO product substitution.
export const NEUTRAL_PRODUCT_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="%23f8fafc"/><rect x="40" y="40" width="520" height="520" rx="24" fill="%23f1f5f9" stroke="%23e2e8f0" stroke-width="2"/><rect x="220" y="220" width="160" height="130" rx="12" stroke="%2394a3b8" stroke-width="6" fill="%23ffffff"/><circle cx="265" cy="260" r="14" fill="%2394a3b8"/><path d="M226 330L275 285L325 325L350 305L374 330" stroke="%2394a3b8" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/><text x="300" y="415" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="%2364748b" text-anchor="middle">Kein Bild verf%C3%BCgbar</text><text x="300" y="440" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="500" fill="%2394a3b8" text-anchor="middle">GudPreiss</text></svg>`;

export function getSvgFallback(_category?: string): string {
  return NEUTRAL_PRODUCT_SVG;
}
