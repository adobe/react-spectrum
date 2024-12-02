const fs = require('fs');
const glob = require('glob');

let pkg = process.argv[process.argv.length - 1];
let regex = /(.*)\.module\.js(?!.map)/g;
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
