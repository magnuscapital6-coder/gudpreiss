export const CATEGORY_SVG_PLACEHOLDERS: Record<string, string> = {
  'cat-gaming': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="%230f172a"/><circle cx="300" cy="300" r="180" fill="%231e293b" stroke="%2310b981" stroke-width="4"/><path d="M210 300H270M240 270V330M350 285A15 15 0 1 1 350 284.9M390 315A15 15 0 1 1 390 314.9" stroke="%2334d399" stroke-width="8" stroke-linecap="round"/><text x="300" y="440" font-family="sans-serif" font-size="22" font-weight="bold" fill="%2394a3b8" text-anchor="middle">GudPreiss Gaming</text></svg>`,

  'cat-e-bikes': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="%23020617"/><circle cx="210" cy="340" r="60" stroke="%2310b981" stroke-width="8"/><circle cx="390" cy="340" r="60" stroke="%2310b981" stroke-width="8"/><path d="M210 340L280 250H350L390 340M280 250L330 340M250 220H300" stroke="%2334d399" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><text x="300" y="450" font-family="sans-serif" font-size="22" font-weight="bold" fill="%2394a3b8" text-anchor="middle">GudPreiss E-Bike</text></svg>`,

  'cat-laptops-pcs': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="%230f172a"/><rect x="180" y="210" width="240" height="150" rx="12" fill="%231e293b" stroke="%2310b981" stroke-width="4"/><path d="M140 380H460" stroke="%2334d399" stroke-width="10" stroke-linecap="round"/><text x="300" y="450" font-family="sans-serif" font-size="22" font-weight="bold" fill="%2394a3b8" text-anchor="middle">GudPreiss Laptop</text></svg>`,

  'cat-smartphones-tablets': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="%23020617"/><rect x="220" y="160" width="160" height="280" rx="24" fill="%231e293b" stroke="%2310b981" stroke-width="4"/><circle cx="300" cy="405" r="8" fill="%2334d399"/><text x="300" y="480" font-family="sans-serif" font-size="22" font-weight="bold" fill="%2394a3b8" text-anchor="middle">GudPreiss Smartphone</text></svg>`,

  'cat-kopfhoerer': `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="%230f172a"/><path d="M200 320V270A100 100 0 0 1 400 270V320" stroke="%2310b981" stroke-width="10" stroke-linecap="round"/><rect x="180" y="300" width="40" height="70" rx="16" fill="%2334d399"/><rect x="380" y="300" width="40" height="70" rx="16" fill="%2334d399"/><text x="300" y="440" font-family="sans-serif" font-size="22" font-weight="bold" fill="%2394a3b8" text-anchor="middle">GudPreiss Audio</text></svg>`,

  default: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600" fill="none"><rect width="600" height="600" fill="%23020617"/><rect x="200" y="200" width="200" height="200" rx="20" fill="%231e293b" stroke="%2310b981" stroke-width="4"/><circle cx="300" cy="300" r="50" stroke="%2334d399" stroke-width="6"/><text x="300" y="440" font-family="sans-serif" font-size="22" font-weight="bold" fill="%2394a3b8" text-anchor="middle">GudPreiss Premium</text></svg>`
};

export function getSvgFallback(category?: string): string {
  if (category && CATEGORY_SVG_PLACEHOLDERS[category]) {
    return CATEGORY_SVG_PLACEHOLDERS[category];
  }
  return CATEGORY_SVG_PLACEHOLDERS.default;
}
