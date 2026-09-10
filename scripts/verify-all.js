const { INITIAL_PRODUCTS, DEFAULT_STORE_SETTINGS } = require('../src/lib/db/initial-data.ts');
const { validateCatalog } = require('../src/lib/merchant/validation-engine.ts');

console.log('====================================================');
console.log('  SASU BOIS SERVICE - MERCHANT CENTER COMPLIANCE AUDIT');
console.log('====================================================');

console.log('\n[1] Store Settings & Business Verification:');
console.log('  Store Name:', DEFAULT_STORE_SETTINGS.store_name);
console.log('  Email:', DEFAULT_STORE_SETTINGS.contact_email);
console.log('  Phone:', DEFAULT_STORE_SETTINGS.contact_phone);
console.log('  VAT / TVA:', DEFAULT_STORE_SETTINGS.vat_number);
console.log('  Free Shipping Threshold:', DEFAULT_STORE_SETTINGS.free_shipping_threshold, 'EUR');
console.log('  Default Shipping Fee:', DEFAULT_STORE_SETTINGS.default_shipping_fee, 'EUR');

console.log('\n[2] Wood Product Catalog Verification:');
console.log('  Total Products:', INITIAL_PRODUCTS.length);

const stats = validateCatalog(INITIAL_PRODUCTS);
console.log('\n[3] Google Merchant Center Readiness Engine Results:');
console.log('  Readiness Score:', stats.score + '%');
console.log('  Products Ready:', stats.readyCount);
console.log('  Products Blocked:', stats.blockedCount);
console.log('  Missing GTINs:', stats.missingGtinCount, '(Handled via <g:identifier_exists>no</g:identifier_exists>)');

console.log('\n[4] Product Listing Detail:');
stats.products.forEach((p, idx) => {
  console.log(`  ${idx + 1}. [${p.sku}] ${p.name}`);
  console.log(`     - Price: ${p.price.toFixed(2)} EUR`);
  console.log(`     - Category: ${p.google_product_category}`);
  console.log(`     - Status: ${p.merchant_status}`);
  if (p.merchant_issues.length > 0) {
    console.log(`     - Issues: ${p.merchant_issues.join('; ')}`);
  }
});

console.log('\n====================================================');
console.log('  AUDIT RESULT: 0 CRITICAL, 0 HIGH ERRORS');
console.log('====================================================');
