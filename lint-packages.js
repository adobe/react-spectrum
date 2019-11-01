const glob = require('fast-glob');
const fs = require('fs');
const assert = require('assert');
const chalk = require('chalk');

let path = require('path');
let packages = glob.sync(__dirname + '/packages/@react-{aria,spectrum,stately}/*/package.json');
let errors = false;

// soft assert won't fail the whole thing, allowing us to accumulate all errors at once
// there's probably a nicer way to do this, but well... sometimes it's good enough. feel free to update me :)
// maybe turn me into an actual eslint plugin so we get their format for styling
function softAssert(val, message) {
  try {
    assert(val, message);
  } catch {
    console.error(chalk.red(message));
    errors = true;
  }
}
softAssert.deepEqual = function (val, val2, message) {
  try {
    assert.deepEqual(val, val2, message);
  } catch {
    console.error(chalk.red(message));
    errors = true;
  }
}
softAssert.equal = function (val, val2, message) {
  try {
    assert.equal(val, val2, message);
  } catch {
    console.error(chalk.red(message));
    errors = true;
  }
}

for (let pkg of packages) {
  let json = JSON.parse(fs.readFileSync(pkg));
  softAssert(json.main, `${pkg} did not have "main"`);
  softAssert(json.main.endsWith('.js'), `${pkg}#main should be a .js file but got "${json.main}"`);
  softAssert(json.module, `${pkg} did not have "module"`);
  softAssert(json.module.endsWith('.js'), `${pkg}#module should be a .js file but got "${json.module}"`);
  softAssert(json.types, `${pkg} did not have "types"`);
  softAssert(json.types.endsWith('.d.ts'), `${pkg}#types should be a .d.ts file but got "${json.types}"`);
  softAssert(json.source, `${pkg} did not have "source"`);
  softAssert.deepEqual(json.files, ['dist'], `${pkg} did not match "files"`);
  softAssert.equal(json.sideEffects, false, `${pkg} is missing sideEffects: false`);
  softAssert(!json.dependencies || !json.dependencies['@adobe/spectrum-css-temp'], `${pkg} has @adobe/spectrum-css-temp in dependencies instead of devDependencies`);
  softAssert(json.dependencies && json.dependencies['@babel/runtime'], `${pkg} is missing a dependency on @babel/runtime`);

  if (json.name.startsWith('@react-spectrum') && json.devDependencies && json.devDependencies['@adobe/spectrum-css-temp']) {
    softAssert.deepEqual(json.targets, {
      main: {
        includeNodeModules: ['@adobe/spectrum-css-temp']
      },
      module: {
        includeNodeModules: ['@adobe/spectrum-css-temp']
      }
    }, `${pkg} did not match "targets"`);
  }

  softAssert(json.publishConfig && json.publishConfig.access === 'public', `${pkg} has missing or incorrect publishConfig`);

  let topIndexExists = fs.existsSync(path.join(pkg, '..', 'index.ts'));
  if (topIndexExists) {
    let contents = fs.readFileSync(path.join(pkg, '..', 'index.ts'));
    softAssert.equal(contents, "export * from './src';\n", `contents of ${path.join(pkg, '..', 'index.ts')} are not "export * from './src';"`);
  }
  softAssert(topIndexExists, `${pkg} is missing an index.ts`);
  softAssert(fs.existsSync(path.join(pkg, '..', 'src', 'index.ts')), `${pkg} is missing a src/index.ts`);
}

if (errors) {
  return process.exit(1);
}
