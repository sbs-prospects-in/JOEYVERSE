const fs = require('fs');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}
const files = walk('src');
files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  if (content.includes('/consult')) {
    const newContent = content.replaceAll('to="/consult"', 'to="/doctors"');
    if (newContent !== content) {
      fs.writeFileSync(file, newContent);
      console.log('Updated ' + file);
    }
  }
});
