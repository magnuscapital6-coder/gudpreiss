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
let totalReplacements = 0;

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // Replace €{expression} with {expression} €
  content = content.replace(/€(\{([^}]+)\})/g, '$1 €');
  // Replace €123 or € 123 with 123 €
  content = content.replace(/€\s*(\d+)/g, '$1 €');

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    console.log(`Updated Euro placement in: ${f}`);
    totalReplacements++;
  }
});

console.log(`✓ Euro (€) placed on RIGHT across ${totalReplacements} files!`);
