
import fs from 'node:fs';

try {
  let content = fs.readFileSync('./package.json', 'utf8');
  let pkg = JSON.parse(content);
  delete pkg.alias;
  fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
} catch (e) {
  console.error('Error:', e);
}
