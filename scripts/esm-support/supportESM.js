
let fs = require('fs-extra');
let fg = require('fast-glob');
let path = require('path');
const yargs = require('yargs');

let argv = yargs
  .option('dryRun', {type: 'boolean'})
  .argv;
let packagesDir = path.join(__dirname, '..', '..', 'packages');

function fixPkgJsons() {
  let packages = fg.sync(`${packagesDir}/**/package.json`, {
    ignore: ['**/node_modules/**', '**/dev/**', '**/build-tools/**', '**/spectrum-icons/**']
  });

  for (let packageJSON of packages) {
    let json = JSON.parse(fs.readFileSync(packageJSON), 'utf8');
    if (json.exports) {
      delete json.exports;
    }
    let main = json.main;
    if (json.module && json.module.endsWith('.js')) {
      json.module = json.module.replace(/\.js$/, '.mjs');
    }
    let module = json.module;
    let newPackageJSON = {};
    for (let [field, value] of Object.entries(json)) {
      newPackageJSON[field] = value;
      if (field === 'module' && module) {
        newPackageJSON.exports = {
          types: './dist/types.d.ts'
        };
        if (module) {
          newPackageJSON.exports.import = `./${module}`;
        }
        if (main) {
          newPackageJSON.exports.require = `./${main}`;
        }

        if (argv.dryRun) {
          console.log('setting main field in ', json.name);
        }
      }
    }
    if (!argv.dryRun) {
      let pkg = JSON.stringify(newPackageJSON, null, 2);
      fs.writeFileSync(packageJSON, `${pkg}\n`);
    }
  }
}

function run() {
  fixPkgJsons();
}

run();
