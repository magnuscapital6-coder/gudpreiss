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
console.log(`Auditing price formats in ${files.length} files...`);

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // Replace price.toLocaleString() without locale with price.toLocaleString('de-DE')
  content = content.replace(/(\bprice\b|\bcompare_at_price\b|\btotal\b|\bsubtotal\b|\bamount\b|\bcost_price\b)\.toLocaleString\(\)/g, "$1.toLocaleString('de-DE')");

  // Replace (expression).toLocaleString() with (expression).toLocaleString('de-DE')
  content = content.replace(/(\([^)]+\))\.toLocaleString\(\)/g, "$1.toLocaleString('de-DE')");

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
    console.log(`Updated price formatting to de-DE (1.829 €) in: ${f}`);
  }
});

console.log('✓ Price audit complete!');
