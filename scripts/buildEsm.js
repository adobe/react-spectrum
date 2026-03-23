const fs = require('fs');
const glob = require('glob');

let regex = /\.mjs(['"])/g;

// Add .mjs equivalents for individual packages for Node.js.
for (let pkg of fs.globSync(['packages/@react-{spectrum,aria,stately}/*/', 'packages/@internationalized/{message,string,date,number}/'])) {
  if (pkg === 'packages/@react-spectrum/s2') {
    continue;
  }

  let modulePath = `${pkg}/dist/module.js`;
  if (fs.existsSync(modulePath)) {
    fs.copyFileSync(modulePath, `${pkg}/dist/import.mjs`);

    // Replace .mjs with .js for webpack 4.
    let js = fs.readFileSync(modulePath, 'utf8');
    js = js.replace(regex, '.js$1');
    fs.writeFileSync(modulePath, js);
  }
  
  // Create .js versions.
  for (let file of glob.sync(`${pkg}/dist/**/*.mjs`)) {
    if (file === `${pkg}/dist/import.mjs`) {
      continue;
    }
    let js = fs.readFileSync(file, 'utf8');
    js = js.replace(regex, '.js$1');
    fs.writeFileSync(file.replace('.mjs', '.js'), js);
  }
}
