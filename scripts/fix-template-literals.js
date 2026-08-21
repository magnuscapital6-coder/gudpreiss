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
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  if (content.includes('€{')) {
    content = content.replace(/€\{/g, '${');
    fs.writeFileSync(f, content, 'utf8');
    console.log(`Fixed template literals in ${f}`);
  }
});
