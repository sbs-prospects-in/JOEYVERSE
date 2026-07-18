const fs = require('fs');
const content = fs.readFileSync('src/features/doctor/pages/DashboardPage.jsx', 'utf8');
let stack = [];
let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  for (let j = 0; j < line.length; j++) {
    if (line[j] === '{') stack.push(i + 1);
    else if (line[j] === '}') stack.pop();
  }
}
console.log('Unclosed { on lines:', stack);
