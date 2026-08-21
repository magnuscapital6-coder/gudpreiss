const fs = require('fs');

const abtProds = JSON.parse(fs.readFileSync('scripts/abt-all-products.json', 'utf8'));
const abtCats = JSON.parse(fs.readFileSync('scripts/abt-categories.json', 'utf8'));

const amsiProds = JSON.parse(fs.readFileSync('scripts/amsi-all-products.json', 'utf8'));
const amsiCats = JSON.parse(fs.readFileSync('scripts/amsi-categories.json', 'utf8'));

console.log(`ABT Distribution: ${abtProds.length} products, ${abtCats.length} categories.`);
console.log(`AMSI Côte d'Ivoire: ${amsiProds.length} products, ${amsiCats.length} categories.`);
console.log(`TOTAL COMBINED CATALOG: ${abtProds.length + amsiProds.length} products!`);

console.log('\nSample AMSI Category:');
amsiCats.forEach(c => console.log(`ID: ${c.id}, Name: ${c.name}, Slug: ${c.slug}`));

console.log('\nSample AMSI Product 1:');
const p1 = amsiProds[0];
console.log({
  id: p1.id,
  name: p1.name,
  slug: p1.slug,
  prices: p1.prices,
  categories: p1.categories,
  images: p1.images ? p1.images.map(i => i.src) : []
});
