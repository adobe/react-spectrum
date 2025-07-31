const fs = require('fs');

for (let f of ['packages/@react-spectrum/s2/dist/module.mjs', 'packages/@react-spectrum/s2/dist/main.cjs']) {
  let contents = fs.readFileSync(f, 'utf8');
  contents = contents.replace(/['"]use client['"];?/g, '');
  fs.writeFileSync(f, contents);
}
