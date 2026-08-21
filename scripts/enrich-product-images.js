const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/lib/db/initial-data.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Ensure all products have at least 2-3 images
const extraImagesMap = {
  'p-1': [
    'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&auto=format&fit=crop&q=80'
  ],
  'p-2': [
    'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80'
  ],
  'p-3': [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80'
  ],
  'p-4': [
    'https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=800&auto=format&fit=crop&q=80'
  ],
  'p-5': [
    'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&auto=format&fit=crop&q=80'
  ],
  'p-6': [
    'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80'
  ],
  'p-7': [
    'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80'
  ],
  'p-8': [
    'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80'
  ],
  'p-9': [
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'
  ],
  'p-10': [
    'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'
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
