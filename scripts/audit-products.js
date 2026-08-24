const fs = require('fs');
const path = require('path');

const content = fs.readFileSync('src/lib/db/initial-data.ts', 'utf8');

// Products come AFTER brands. Find the products section
const prodStart = content.indexOf('export const INITIAL_PRODUCTS: Product[] = [');
// Find the closing of the products array - look for the next export or end of file
const afterProd = content.indexOf('\n];\n', prodStart);
const prodSection = content.substring(prodStart, afterProd + 4);

console.log('Products section length:', prodSection.length);
console.log('Section preview:', prodSection.substring(0, 200));

// Count occurrences
const idCount = (prodSection.match(/"id": "prod-/g) || []).length;
console.log('Product IDs found:', idCount);

// Split using a different approach - find each "id" occurrence
const idPositions = [];
let searchIdx = 0;
while (true) {
  const pos = prodSection.indexOf('"id": "prod-', searchIdx);
  if (pos === -1) break;
  idPositions.push(pos);
  searchIdx = pos + 1;
}
console.log('ID positions found:', idPositions.length);

// Extract each product block
const products = [];
for (let i = 0; i < idPositions.length; i++) {
  const start = idPositions[i];
  const end = i + 1 < idPositions.length ? idPositions[i + 1] : prodSection.length;
  const block = prodSection.substring(start, end);
  
  const idMatch = block.match(/"id": "(prod-[^"]+)"/);
  const id = idMatch ? idMatch[1] : '';
  
  const nameMatch = block.match(/"name": "((?:[^"\\]|\\.)*)"/);
  const name = nameMatch ? nameMatch[1] : '';
  
  const slugMatch = block.match(/"slug": "([^"]+)"/);
  const slug = slugMatch ? slugMatch[1] : '';
  
  const priceMatch = block.match(/"price": ([\d.]+)/);
  const price = priceMatch ? parseFloat(priceMatch[1]) : 0;
  
  const comparePriceMatch = block.match(/"compare_at_price": ([\d.]+)/);
  const comparePrice = comparePriceMatch ? parseFloat(comparePriceMatch[1]) : 0;
  
  const skuMatch = block.match(/"sku": "([^"]+)"/);
  const sku = skuMatch ? skuMatch[1] : '';
  
  const brandIdMatch = block.match(/"brand_id": "([^"]+)"/);
  const brandId = brandIdMatch ? brandIdMatch[1] : '';
  
  const categoryIdMatch = block.match(/"category_id": "([^"]+)"/);
  const categoryId = categoryIdMatch ? categoryIdMatch[1] : '';
  
  const ratingMatch = block.match(/"rating": ([\d.]+)/);
  const rating = ratingMatch ? parseFloat(ratingMatch[1]) : 0;
  
  const reviewCountMatch = block.match(/"review_count": (\d+)/);
  const reviewCount = reviewCountMatch ? parseInt(reviewCountMatch[1]) : 0;
  
  const shortDescMatch = block.match(/"short_description": "((?:[^"\\]|\\.)*)"/);
  const shortDesc = shortDescMatch ? shortDescMatch[1] : '';
  
  const weightMatch = block.match(/"weight_kg": ([\d.]+)/);
  const weight = weightMatch ? parseFloat(weightMatch[1]) : 0;
  
  const featuredMatch = block.match(/"featured": (true|false)/);
  const featured = featuredMatch ? featuredMatch[1] === 'true' : false;
  
  const bestSellerMatch = block.match(/"best_seller": (true|false)/);
  const bestSeller = bestSellerMatch ? bestSellerMatch[1] === 'true' : false;
  
  const newArrivalMatch = block.match(/"new_arrival": (true|false)/);
  const newArrival = newArrivalMatch ? newArrivalMatch[1] === 'true' : false;
  
  const onSaleMatch = block.match(/"on_sale": (true|false)/);
  const onSale = onSaleMatch ? onSaleMatch[1] === 'true' : false;
  
  const stockMatch = block.match(/"stock": (\d+)/);
  const stock = stockMatch ? parseInt(stockMatch[1]) : 0;
  
  // Extract images
  const imagesMatch = block.match(/"images": \[([\s\S]*?)\]/);
  let images = [];
  if (imagesMatch) {
    images = [...imagesMatch[1].matchAll(/"([^"]+)"/g)].map(m => m[1]);
  }
  
  // Check if image file exists
  let localImageExists = false;
  if (images.length > 0 && images[0].startsWith('/images/products/')) {
    localImageExists = fs.existsSync(path.join('public', images[0]));
  }

  products.push({
    id, name, slug, price, comparePrice, sku, brandId, categoryId,
    rating, reviewCount, shortDesc, weight,
    featured, bestSeller, newArrival, onSale, stock,
    images, localImageExists
  });
}

console.log(`\nTotal products parsed: ${products.length}`);

// Categorize
const amz = products.filter(p => p.id.startsWith('prod-amz'));
const ps5 = products.filter(p => p.id.startsWith('prod-ps5') || p.id.startsWith('prod-dualsense') || p.id.startsWith('prod-playstation') || p.id.startsWith('prod-ps-vr') || p.id.startsWith('prod-pulse') || p.id.startsWith('prod-wd-') || p.id.startsWith('prod-logitech'));
const ebike = products.filter(p => p.id.startsWith('prod-ebike'));

console.log(`Amazon: ${amz.length} | PlayStation: ${ps5.length} | E-Bikes: ${ebike.length}`);

// Issues
const missingImages = products.filter(p => !p.localImageExists && p.images.length > 0);
const noImages = products.filter(p => p.images.length === 0);
const noShortDesc = products.filter(p => !p.shortDesc);
const sameWeight = products.filter(p => p.weight === 1.5);

console.log('\n=== ISSUES ===');
console.log(`Missing image files: ${missingImages.length}`);
console.log(`No images: ${noImages.length}`);
console.log(`No short_description: ${noShortDesc.length}`);
console.log(`Weight=1.5kg (default): ${sameWeight.length}`);

if (missingImages.length > 0) {
  console.log('\nMissing images:');
  missingImages.forEach(p => console.log(`  ${p.id}: ${p.images[0]}`));
}

if (noImages.length > 0) {
  console.log('\nNo images:');
  noImages.forEach(p => console.log(`  ${p.id}: ${p.name}`));
}

if (noShortDesc.length > 0) {
  console.log('\nNo short description:');
  noShortDesc.forEach(p => console.log(`  ${p.id}: ${p.name}`));
}

console.log('\n=== ALL PRODUCTS ===');
products.forEach(p => {
  const img = p.images[0] ? (p.localImageExists ? '✅' : '❌') : '⬜';
  const sd = p.shortDesc ? '✅' : '❌';
  console.log(`  ${img} ${p.id}: ${p.name.substring(0, 60)} | €${p.price} | sd:${sd} | w:${p.weight}kg`);
});

fs.writeFileSync('scripts/audit-report.json', JSON.stringify(products, null, 2));
console.log('\nReport saved to scripts/audit-report.json');
