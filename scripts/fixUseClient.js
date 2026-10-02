const fs = require('fs');

let iconFiles = fs.globSync('packages/@react-spectrum/s2/{icons,illustrations}/**/*.{cjs,mjs}');
for (let f of iconFiles) {
  let contents = fs.readFileSync(f, 'utf8');
  contents = contents.replace(/['"]use client['"];?/g, '');
  fs.writeFileSync(f, contents);
}

for (let f of fs.globSync([
  'packages/@react-spectrum/s2/dist/**/*.mjs',
  'packages/@react-spectrum/s2/dist/**/*.cjs'
])) {
  let contents = fs.readFileSync(f, 'utf8');
  contents = contents.replace(/['"]use client['"];?/g, '');
  fs.writeFileSync(f, contents);
}
