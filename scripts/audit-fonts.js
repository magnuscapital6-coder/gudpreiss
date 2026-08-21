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
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.css') || file.endsWith('.html')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, '../src'));
console.log(`Auditing ${files.length} source files for font references...`);

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  if (content.includes('font-family') || content.includes('fontFamily') || content.includes('googleapis') || content.includes('@font-face')) {
    console.log(`Found font reference in: ${f}`);
  }
});

console.log('✓ Font audit complete!');
