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
    } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.json')) {
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
    // Check if line contains dollar sign used as currency
    if (line.includes('$') && !line.includes('//') && !line.includes('process.env')) {
      // Ignore template literals like ${var} unless it has a dollar before it
      const stripped = line.replace(/\$\{[^}]+\}/g, '');
      if (stripped.includes('$') || line.match(/\$\s*\d/)) {
        issues.push({ file: f, line: idx + 1, content: line.trim() });
      }
    }
  });
});

console.log(`Found ${issues.length} potential currency issues:`);
issues.forEach(i => console.log(`${i.file}:${i.line} -> ${i.content}`));
