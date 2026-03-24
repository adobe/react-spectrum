const fs = require('fs');
const glob = require('glob');
const path = require('path');
const swc = require('@swc/core');

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

// Add extra shims for bundlers that don't support package.json exports, specifically webpack 4 and Parcel (without config).
for (let pkg of ['@adobe/react-spectrum', 'react-aria', 'react-stately', 'react-aria-components']) {
  for (let file of fs.globSync(`packages/${pkg}/dist/exports/**/*.js`)) {
    // webpack 4 does not support importing non-ESM modules from .mjs files, so rename to .js
    // This should be sufficient because Parcel prioritizes .js over .cjs.
    // We do not support any tools that only support CommonJS.
    let shim = file.replace('/dist/exports/', '/');
    let specifier = path.relative(path.dirname(shim), file);
    if (!specifier.startsWith('.')) {
      specifier = './' + specifier;
    }
    let contents = `export * from '${specifier}';\n`;

    fs.mkdirSync(path.dirname(shim), {recursive: true});
    fs.writeFileSync(shim, contents);
  }
}
