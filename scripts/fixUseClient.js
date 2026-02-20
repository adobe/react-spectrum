const fs = require('fs');
const glob = require('glob');

let iconFiles = glob.sync('packages/@react-spectrum/s2/{icons,illustrations}/**/*.{cjs,mjs}');
for (let f of iconFiles) {
  let contents = fs.readFileSync(f, 'utf8');
  contents = contents.replace(/['"]use client['"];?/g, '');
  fs.writeFileSync(f, contents);
}

for (let f of ['packages/@react-spectrum/s2/dist/module.mjs', 'packages/@react-spectrum/s2/dist/main.cjs']) {
  let contents = fs.readFileSync(f, 'utf8');
  contents = contents.replace(/['"]use client['"];?/g, '');
  fs.writeFileSync(f, contents);
}
