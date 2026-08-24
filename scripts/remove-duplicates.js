const fs = require('fs');
const filePath = 'src/lib/db/initial-data.ts';

let content = fs.readFileSync(filePath, 'utf8');

console.log('=== REMOVE DUPLICATE PRODUCTS ===\n');

// Brands comes BEFORE Products in this file
const brandsStart = content.indexOf('export const INITIAL_BRANDS: Brand[] = [');
const prodStart = content.indexOf('export const INITIAL_PRODUCTS: Product[] = [');
const fileEnd = content.length;

console.log('Brands at:', brandsStart);
console.log('Products at:', prodStart);

const beforeProd = content.substring(0, prodStart);
const prodSection = content.substring(prodStart);

console.log('Products section length:', prodSection.length);

// Find all product object starts
const objectStarts = [];
let searchIdx = 0;
const searchPattern = /\n  \{\n    "id": "prod-/g;
let match;
while ((match = searchPattern.exec(prodSection)) !== null) {
  objectStarts.push(match.index + 1); // +1 for the leading \n
}

console.log(`Found ${objectStarts.length} product objects`);

// Extract each product and deduplicate
const seenIds = new Set();
const uniqueProducts = [];
let removedCount = 0;

for (let i = 0; i < objectStarts.length; i++) {
  const start = objectStarts[i];
  const end = i + 1 < objectStarts.length ? objectStarts[i + 1] : prodSection.length;
  
  const productObj = prodSection.substring(start, end);
  
  const idMatch = productObj.match(/"id": "(prod-[^"]+)"/);
  if (!idMatch) continue;
  
  const id = idMatch[1];
  
  if (seenIds.has(id)) {
    removedCount++;
    continue;
  }
  
  seenIds.add(id);
  uniqueProducts.push(productObj);
}

console.log(`Unique products: ${uniqueProducts.length}`);
console.log(`Removed: ${removedCount} duplicates`);

// Find the end of the products array - look for "];" after the last product
const lastProductEnd = prodSection.lastIndexOf('];');
const afterProdArray = prodSection.substring(lastProductEnd);

// Rebuild: before products + header + unique products + closing + rest of file
const header = 'export const INITIAL_PRODUCTS: Product[] = [';

// Find what comes after the products array (after the ];)
const restOfFile = content.substring(prodStart + lastProductEnd + 2); // +2 for ];

const newContent = beforeProd + header + uniqueProducts.join('') + '];' + restOfFile;

fs.writeFileSync(filePath, newContent, 'utf8');

// Verify
const verifyContent = fs.readFileSync(filePath, 'utf8');
const finalIds = [...verifyContent.matchAll(/"id": "(prod-[^"]+)"/g)].map(m => m[1]);
const finalUnique = [...new Set(finalIds)];

console.log(`\n✅ DONE!`);
console.log(`  Before: ${objectStarts.length} entries`);
console.log(`  After: ${finalIds.length} entries, ${finalUnique.length} unique`);
