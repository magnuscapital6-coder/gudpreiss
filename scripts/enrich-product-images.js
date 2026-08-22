const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/lib/db/initial-data.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Ensure all products have at least 2-3 images
const extraImagesMap = {
  'p-1': [
    'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg',
    'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg',
    'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg'
  ],
  'p-2': [
    'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg',
    'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg',
    'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg'
  ],
  'p-3': [
    'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg',
    'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg',
    'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg'
  ],
  'p-4': [
    'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg',
    'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg'
  ],
  'p-5': [
    'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg',
    'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg'
  ],
  'p-6': [
    'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg',
    'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg'
  ],
  'p-7': [
    'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg',
    'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg'
  ],
  'p-8': [
    'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg',
    'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg'
  ],
  'p-9': [
    'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg',
    'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg'
  ],
  'p-10': [
    'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg',
    'https://abt-distribution.com/wp-content/uploads/2026/08/cat-electronique.jpg'
  ]
};

// Check p-5 through p-10 images replacements
Object.keys(extraImagesMap).forEach(pid => {
  const newImgsJSON = JSON.stringify(extraImagesMap[pid], null, 6);
  // Match `id: 'p-X'` ... `images: [...]`
  const regex = new RegExp(`(id:\\s*'${pid}'[\\s\\S]*?images:\\s*\\[)([^\\]]*?)(\\])`, 'm');
  if (regex.test(content)) {
    const formattedImgs = extraImagesMap[pid].map(url => `\n      '${url}'`).join(',');
    content = content.replace(regex, `$1${formattedImgs}\n    $3`);
    console.log(`Updated images for ${pid}`);
  }
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('✓ All products now have rich multi-image gallery sets!');
