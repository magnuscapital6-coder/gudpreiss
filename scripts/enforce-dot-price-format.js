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
let totalFilesUpdated = 0;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // 1. Replace raw price interpolation like `${product.price} €` or `{product.price} €`
  // with `${Math.round(product.price).toLocaleString('de-DE')} €`
  content = content.replace(/\{(\w+\.price)\}\s*€/g, "{$1.toLocaleString('de-DE')} €");
  content = content.replace(/\$\{(\w+\.price)\}\s*€/g, "${$1.toLocaleString('de-DE')} €");

  content = content.replace(/\{(\w+\.compare_at_price)\}\s*€/g, "{$1.toLocaleString('de-DE')} €");
  content = content.replace(/\$\{(\w+\.compare_at_price)\}\s*€/g, "${$1.toLocaleString('de-DE')} €");

  // 2. Ensure all toLocaleString() use 'de-DE'
  content = content.replace(/\.toLocaleString\(\)/g, ".toLocaleString('de-DE')");
  content = content.replace(/\.toLocaleString\('en-US'\)/g, ".toLocaleString('de-DE')");
  content = content.replace(/\.toLocaleString\("en-US"\)/g, '.toLocaleString("de-DE")');

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    console.log(`Enforced de-DE dot price format (1.829 €) in: ${f}`);
    totalFilesUpdated++;
  }
});

console.log(`✓ Updated price format to 1.829 € across ${totalFilesUpdated} files!`);
