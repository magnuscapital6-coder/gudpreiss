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

  // Replace €{val} with {val} €
  // e.g. €{product.price.toLocaleString()} -> {product.price.toLocaleString()} €
  // €{price.toLocaleString()} -> {price.toLocaleString()} €
  // €{discount.toFixed(2)} -> {discount.toFixed(2)} €
  // €{tax.toFixed(2)} -> {tax.toFixed(2)} €
  // €{shipping} -> {shipping} €
  // €{total.toLocaleString()} -> {total.toLocaleString()} €
  // €{card.price} -> {card.price} €
  // Ab €160 -> Ab 160 €
  // Sonderpreis €950 -> Sonderpreis 950 €

  content = content.replace(/€\$\{([^}]+)\}/g, '${$1} €');
  content = content.replace(/Ab\s*€(\d+)/g, 'Ab $1 €');
  content = content.replace(/Sonderpreis\s*€(\d+)/g, 'Sonderpreis $1 €');
  content = content.replace(/€\s*(\d[\d\.\,]*)/g, '$1 €');
  content = content.replace(/saveAmount'\}\s*€/g, "saveAmount'} "); // handle saveAmount text space
  content = content.replace(/-\s*€\$\{/g, '-${'); // handle negative discount prefix if any

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    console.log(`Placed Euro (€) on right in ${f}`);
    count++;
  }
});

console.log(`✓ Euro (€) formatted to the RIGHT across ${count} files.`);
