import { Product } from '@/types';
import { getGoogleCategoryForProduct } from './taxonomy';

export interface ValidationResult {
  ready: boolean;
  issues: string[];
  status: 'READY_FOR_MERCHANT' | 'BLOCKED_MERCHANT';
}

export function validateProduct(product: Product): ValidationResult {
  const issues: string[] = [];

  // 1. ID check
  if (!product.id || product.id.trim() === '') {
    issues.push('Missing unique product ID');
  }

  // 2. SKU check
  if (!product.sku || product.sku.trim() === '' || product.sku === 'Holz' || product.sku === 'AMSI-10332') {
    issues.push('Invalid or generic SKU code');
  }

  // 3. Title check
  if (!product.name || product.name.trim().length < 5) {
    issues.push('Title too short or missing');
  } else if (product.name.length > 150) {
    issues.push('Title exceeds 150 characters');
  }

  // 4. Description check
  if (!product.description || product.description.trim().length < 20) {
    issues.push('Description missing or too short (< 20 chars)');
  }

  // 5. Dimension & Title Consistency Check
  const title25 = product.name.includes('25 cm');
  const title30 = product.name.includes('30 cm');
  const title33 = product.name.includes('33 cm');
  const title50 = product.name.includes('50 cm');

  if (title25 && product.description.includes('30 cm') && !product.description.includes('25 cm')) {
    issues.push('Dimension mismatch: Title specifies 25 cm but description indicates 30 cm');
  }
  if (title30 && product.description.includes('25 cm') && !product.description.includes('30 cm')) {
    issues.push('Dimension mismatch: Title specifies 30 cm but description indicates 25 cm');
  }

  // 6. Price check
  if (typeof product.price !== 'number' || isNaN(product.price) || product.price <= 0) {
    issues.push('Invalid price (must be greater than 0 EUR)');
  }

  // 7. Image check
  if (!product.images || product.images.length === 0 || !product.images[0]) {
    issues.push('Missing primary product image');
  } else {
    const primaryImg = product.images[0];
    if (primaryImg.includes('placeholder') || primaryImg.includes('svg+xml')) {
      issues.push('Primary image is a placeholder SVG or generic image');
    }
  }

  // 8. Brand check
  if (!product.brand_name || product.brand_name.trim() === '') {
    issues.push('Missing brand name');
  }

  // 9. GTIN check (If provided, verify format. If not provided, don't invent fake EAN!)
  if (product.gtin) {
    const cleanGtin = product.gtin.replace(/\D/g, '');
    if (![8, 12, 13, 14].includes(cleanGtin.length)) {
      issues.push(`GTIN '${product.gtin}' has invalid length (must be 8, 12, 13, or 14 digits)`);
    }
  }

  // 10. Google Product Category check
  const category = product.google_product_category || getGoogleCategoryForProduct(product.category_name, product.name);
  if (!category || category.trim() === '') {
    issues.push('Missing Google Product Category taxonomy mapping');
  }

  // 11. Stock & Availability check
  if (product.stock === undefined || product.stock === null || product.stock < 0) {
    issues.push('Invalid stock quantity');
  }

  // 12. Status check
  if (product.status === 'draft' || product.status === 'archived') {
    issues.push('Product status is inactive (draft/archived)');
  }

  const ready = issues.length === 0;
  return {
    ready,
    issues,
    status: ready ? 'READY_FOR_MERCHANT' : 'BLOCKED_MERCHANT',
  };
}

export function validateCatalog(products: Product[]) {
  let readyCount = 0;
  let blockedCount = 0;
  let missingGtinCount = 0;
  let missingMpnCount = 0;
  let missingImageCount = 0;

  const validatedProducts = products.map((p) => {
    const res = validateProduct(p);
    if (res.ready) {
      readyCount++;
    } else {
      blockedCount++;
    }

    if (!p.gtin) missingGtinCount++;
    if (!p.mpn) missingMpnCount++;
    if (!p.images || p.images.length === 0) missingImageCount++;

    return {
      ...p,
      google_product_category: p.google_product_category || getGoogleCategoryForProduct(p.category_name, p.name),
      merchant_status: res.status,
      merchant_issues: res.issues,
    };
  });

  const total = products.length;
  const score = total > 0 ? Math.round((readyCount / total) * 100) : 100;

  return {
    total,
    readyCount,
    blockedCount,
    missingGtinCount,
    missingMpnCount,
    missingImageCount,
    score,
    products: validatedProducts,
  };
}
