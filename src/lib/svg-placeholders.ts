export const CATEGORY_SVG_PLACEHOLDERS: Record<string, string> = {
  'cat-gaming': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="%23f8fafc"/><rect x="40" y="40" width="520" height="520" rx="32" fill="%23f1f5f9" stroke="%23cbd5e1" stroke-width="4"/><path d="M210 300H270M240 270V330M350 285A15 15 0 1 1 350 284.9M390 315A15 15 0 1 1 390 314.9" stroke="%2310b981" stroke-width="10" stroke-linecap="round"/><text x="300" y="440" font-family="sans-serif" font-size="24" font-weight="bold" fill="%23334155" text-anchor="middle">PlayStation &amp; Gaming</text></svg>`,

  'cat-e-bikes': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="%23f8fafc"/><rect x="40" y="40" width="520" height="520" rx="32" fill="%23f1f5f9" stroke="%23cbd5e1" stroke-width="4"/><circle cx="210" cy="340" r="60" stroke="%2310b981" stroke-width="10"/><circle cx="390" cy="340" r="60" stroke="%2310b981" stroke-width="10"/><path d="M210 340L280 250H350L390 340M280 250L330 340M250 220H300" stroke="%23059669" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><text x="300" y="450" font-family="sans-serif" font-size="24" font-weight="bold" fill="%23334155" text-anchor="middle">Premium E-Bike</text></svg>`,

  'cat-laptops-pcs': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="%23f8fafc"/><rect x="40" y="40" width="520" height="520" rx="32" fill="%23f1f5f9" stroke="%23cbd5e1" stroke-width="4"/><rect x="180" y="210" width="240" height="150" rx="12" fill="%23ffffff" stroke="%2310b981" stroke-width="6"/><path d="M140 380H460" stroke="%23059669" stroke-width="12" stroke-linecap="round"/><text x="300" y="450" font-family="sans-serif" font-size="24" font-weight="bold" fill="%23334155" text-anchor="middle">Laptop &amp; PC</text></svg>`,

  'cat-smartphones-tablets': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="%23f8fafc"/><rect x="40" y="40" width="520" height="520" rx="32" fill="%23f1f5f9" stroke="%23cbd5e1" stroke-width="4"/><rect x="220" y="160" width="160" height="280" rx="24" fill="%23ffffff" stroke="%2310b981" stroke-width="6"/><circle cx="300" cy="405" r="8" fill="%23059669"/><text x="300" y="480" font-family="sans-serif" font-size="24" font-weight="bold" fill="%23334155" text-anchor="middle">Smartphone</text></svg>`,

  default: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="%23f8fafc"/><rect x="40" y="40" width="520" height="520" rx="32" fill="%23f1f5f9" stroke="%23cbd5e1" stroke-width="4"/><rect x="200" y="200" width="200" height="200" rx="20" fill="%23ffffff" stroke="%2310b981" stroke-width="6"/><circle cx="300" cy="300" r="50" stroke="%23059669" stroke-width="8"/><text x="300" y="440" font-family="sans-serif" font-size="24" font-weight="bold" fill="%23334155" text-anchor="middle">GudPreiss Premium</text></svg>`
};

export function getSvgFallback(category?: string): string {
  if (category && CATEGORY_SVG_PLACEHOLDERS[category]) {
    return CATEGORY_SVG_PLACEHOLDERS[category];
  }
  return CATEGORY_SVG_PLACEHOLDERS.default;
}
