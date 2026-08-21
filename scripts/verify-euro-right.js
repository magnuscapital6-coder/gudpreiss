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
let issues = [];

files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Check if € appears before ${ or a digit
    if (line.match(/€\s*\$\{/) || line.match(/€\s*\d/)) {
      issues.push({ file: f, line: idx + 1, content: line.trim() });
    }
  });
});

console.log(`Found ${issues.length} Euro-on-left instances:`);
issues.forEach(i => console.log(`${i.file}:${i.line} -> ${i.content}`));
