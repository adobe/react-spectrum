const glob = require('fast-glob');
const fs = require('fs');
const assert = require('assert');

let packages = glob.sync(__dirname + '/packages/@react-{aria,spectrum,stately}/*/package.json');

for (let pkg of packages) {
  let json = JSON.parse(fs.readFileSync(pkg));
  assert(json.main, `${pkg} did not have "main"`);
  assert(json.module, `${pkg} did not have "module"`);
  assert(json.types, `${pkg} did not have "types"`);
  assert(json.source, `${pkg} did not have "source"`);
  assert.deepEqual(json.files, ['dist'], `${pkg} did not match "files"`);
  assert.equal(json.sideEffects, false, `${pkg} is missing sideEffects: false`);
  assert(!json.dependencies || !json.dependencies['@adobe/spectrum-css-temp'], `${pkg} has @adobe/spectrum-css-temp in dependencies instead of devDependencies`);
  assert(!json.dependencies || !json.dependencies['@babel/runtime'], `${pkg} is missing a dependency on @babel/runtime`);

  if (json.name.startsWith('@react-spectrum') && json.devDependencies && json.devDependencies['@adobe/spectrum-css-temp']) {
    assert.deepEqual(json.targets, {
      main: {
        includeNodeModules: ['@adobe/spectrum-css-temp']
      },
      module: {
        includeNodeModules: ['@adobe/spectrum-css-temp']
      }
    }, `${pkg} did not match "targets"`);
  }
}
