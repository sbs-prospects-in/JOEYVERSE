import fs from 'fs';
import path from 'path';

function printTree(dir, prefix = '') {
  let files;
  try {
    files = fs.readdirSync(dir);
  } catch(e) { return; }
  
  // Filter out noisy directories
  files = files.filter(f => !['node_modules', '.git', 'dist', '.cache', 'public', '.system_generated'].includes(f));
  
  files.forEach((file, index) => {
    const filePath = path.join(dir, file);
    const isLast = index === files.length - 1;
    const marker = isLast ? '└── ' : '├── ';
    console.log(prefix + marker + file);
    
    try {
      if (fs.statSync(filePath).isDirectory()) {
        printTree(filePath, prefix + (isLast ? '    ' : '│   '));
      }
    } catch(e) {}
  });
}

console.log('being-kind/');
printTree('.');
