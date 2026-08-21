const fs = require('fs');

const products = JSON.parse(fs.readFileSync('scripts/abt-all-products.json', 'utf8'));
const categories = JSON.parse(fs.readFileSync('scripts/abt-categories.json', 'utf8'));

console.log('Total Products:', products.length);
console.log('Total Categories:', categories.length);

console.log('\nSample Categories:');
categories.slice(0, 5).forEach(c => console.log(`ID: ${c.id}, Name: ${c.name}, Slug: ${c.slug}`));

console.log('\nSample Product 1:');
const p1 = products[0];
console.log({
  id: p1.id,
  name: p1.name,
  slug: p1.slug,
  prices: p1.prices,
  categories: p1.categories,
  images: p1.images ? p1.images.map(i => i.src) : [],
  short_description: p1.short_description ? p1.short_description.substring(0, 100) : '',
});
