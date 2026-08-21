const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, '../src'));
let count = 0;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // Replace >$ or ">$" or "> $" with ">€"
  content = content.replace(/>\s*\$/g, '>€');

  // Replace text-primary">$ with text-primary">€ etc.
  content = content.replace(/line-through">\$/g, 'line-through">€');

  // Replace `${product.price` or `${price` or `${subtotal` with `€{...`
  content = content.replace(/\$\{product\.price/g, '€{product.price');
  content = content.replace(/\$\{product\.compare_at_price/g, '€{product.compare_at_price');
  content = content.replace(/\$\{price/g, '€{price');
  content = content.replace(/\$\{subtotal/g, '€{subtotal');
  content = content.replace(/\$\{total/g, '€{total');
  content = content.replace(/\$\{tax/g, '€{tax');
  content = content.replace(/\$\{discount/g, '€{discount');
  content = content.replace(/\$\{shipping/g, '€{shipping');
  content = content.replace(/\$\{card\.price/g, '€{card.price');

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    console.log(`Enforced Euro (€) in ${f}`);
    count++;
  }
});

console.log(`✓ Euro (€) enforced across ${count} files.`);
