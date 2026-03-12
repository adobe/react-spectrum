const fs = require('fs');
const glob = require('glob');
const path = require('path');

let regex = /(.*)\.module\.js(?!.map)/g;

// Add .mjs equivalents for individual packages for Node.js.
for (let pkg of fs.globSync(['packages/@react-{spectrum,aria,stately}/*/', 'packages/@internationalized/{message,string,date,number}/'])) {
  if (fs.existsSync(`${pkg}/dist/module.js`)) {
    let js = fs.readFileSync(`${pkg}/dist/module.js`, 'utf8');
    js = js.replace(regex, '$1.mjs');
    fs.writeFileSync(`${pkg}/dist/import.mjs`, js);
  }

  for (let file of glob.sync(`${pkg}/dist/*.module.js`)) {
    let js = fs.readFileSync(file, 'utf8');
    js = js.replace(regex, '$1.mjs');
    fs.writeFileSync(file.replace(regex, '$1.mjs'), js);
  }
}

// Add extra shims for bundlers that don't support package.json exports.
for (let pkg of ['@adobe/react-spectrum', 'react-aria', 'react-stately', 'react-aria-components']) {
  for (let file of fs.globSync(`packages/${pkg}/dist/exports/**/*.{mjs,cjs}`)) {
    let shim = file.replace('/dist/exports/', '/');
    let specifier = `./${file.replace(`packages/${pkg}/`, '')}`;
    let contents = '';
    if (path.extname(shim) === '.cjs') {
      contents = `module.exports = require('${specifier}');\n`;
    } else {
      contents = `export * from '${specifier}';\n`;
    }

    fs.mkdirSync(path.dirname(shim), {recursive: true});
    fs.writeFileSync(shim, contents);
  }
}
