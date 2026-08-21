const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/components/store/layout/Header.tsx',
  'src/components/store/product/ProductCard.tsx',
  'src/components/store/product/QuickViewModal.tsx',
  'src/components/store/home/HeroSlider.tsx',
  'src/components/store/home/FeaturedProductsSection.tsx',
  'src/components/store/home/JustArrivedSection.tsx',
  'src/components/store/home/CategoryPromoCards.tsx',
  'src/components/store/home/SecondFeaturedSection.tsx',
  'src/components/cart/CartDrawer.tsx',
  'src/app/(store)/shop/page.tsx',
  'src/app/(store)/shop/[slug]/page.tsx',
  'src/app/(store)/checkout/page.tsx',
  'src/app/(store)/cart/page.tsx',
  'src/app/admin/page.tsx',
  'src/app/admin/products/page.tsx',
  'src/app/admin/orders/page.tsx',
  'src/app/admin/customers/page.tsx',
  'src/app/admin/inventory/page.tsx',
  'src/app/admin/products/new/page.tsx',
  'src/app/admin/products/[id]/edit/page.tsx',
  'src/lib/db/initial-data.ts',
];

filesToUpdate.forEach((relPath) => {
  const filePath = path.join(__dirname, '..', relPath);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Replace currency patterns like '${' with '€{' when displaying price
  content = content.replace(/\$\{/g, '€{');

  // Replace '$' prefixed prices in text strings like '$950', '$160', '$650', '$150'
  content = content.replace(/\$(\d+)/g, '€$1');

  // Replace 'USD' with 'EUR'
  content = content.replace(/USD/g, 'EUR');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated currency to Euro in ${relPath}`);
});

console.log('✓ All platform currencies successfully set to Euro (€)');
