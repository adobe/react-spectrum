const fs = require('fs');
const glob = require('glob');
const path = require('path');

let regex = /\.mjs(['"])/g;

// Add .mjs equivalents for individual packages for Node.js.
for (let pkg of fs.globSync(['packages/@react-{spectrum,aria,stately}/*/'])) {
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
    if (!file.endsWith('index.js')) {
      writePackageExportShim(file);
    }
  }
}

if (process.env.PARCEL_V3) {
  // S2 icons use a package self-reference so that Icon is shared across the separate icon and
  // component build targets. Only add this shim because other S2 subpaths do not need legacy support.
  let s2Icon = 'packages/@react-spectrum/s2/dist/exports/Icon.mjs';
  if (fs.existsSync(s2Icon)) {
    writePackageExportShim(s2Icon);
  }
}

function writePackageExportShim(file) {
  let extension = path.extname(file);

  // webpack 4 does not support importing non-ESM modules from .mjs files, so most packages use
  // the generated .js variant. S2 is built directly to .mjs and only needs the Icon shim.
  let shim = file.replace('/dist/exports/', '/');
  let specifier = path.relative(shim, file);

  let dir = shim.slice(0, -extension.length);
  fs.mkdirSync(dir, {recursive: true});
  fs.writeFileSync(
    dir + '/package.json',
    JSON.stringify(
      {
        main: specifier.slice(0, -extension.length) + '.cjs',
        module: specifier,
        types: path.relative(
          shim,
          file.replace('/dist/exports/', '/dist/types/exports/').slice(0, -extension.length) +
            '.d.ts'
        )
      },
      null,
      2
    ) + '\n'
  );
}
