
let fs = require('fs-extra');
let fg = require('fast-glob');
let path = require('path');
const yargs = require('yargs');

let argv = yargs
  .option('dryRun', {type: 'boolean'})
  .argv;

function run() {
  let packagesDir = path.join(__dirname, '..', 'packages');
  let packages = fg.sync(`${packagesDir}/**/package.json`, {
    ignore: ['**/node_modules/**', '**/dev/**', '**/build-tools/**']
  });

  for (let packageJSON of packages) {
    let json = JSON.parse(fs.readFileSync(packageJSON), 'utf8');
    if (json.exports) {
      delete json.exports;
    }
    let main = json.main;
    let module = json.module;
    let newPackageJSON = {};
    for (let [field, value] of Object.entries(json)) {
      newPackageJSON[field] = value;
      if (field === 'main') {
        newPackageJSON.exports = {
          import: `./${module}`,
          require: `./${main}`
        };

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

run();
