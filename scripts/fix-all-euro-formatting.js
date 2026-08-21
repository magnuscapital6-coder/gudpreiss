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
let fixedCount = 0;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // Replace €{val} with {val} €
  content = content.replace(/€\$\{([^}]+)\}/g, '${$1} €');

  // Replace €123 or € 123 with 123 €
  content = content.replace(/€\s*(\d[\d\.\,]*)/g, '$1 €');

  // Replace € prefix in strings
  content = content.replace(/€\s*(\d+)/g, '$1 €');

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    console.log(`Fixed Euro right alignment in ${f}`);
    fixedCount++;
  }
});

console.log(`✓ Euro alignment fixed to the RIGHT in ${fixedCount} files!`);
