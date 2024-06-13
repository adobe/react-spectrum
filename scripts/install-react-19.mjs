import fs from 'node:fs';

let root = fs.readFileSync('./package.json');
let rpkg = JSON.parse(root);
let data = fs.readFileSync('./packages/dev/docs/package.json');
let pkg = JSON.parse(data);
pkg.dependencies['react'] = rpkg.dependencies['react'];
pkg.dependencies['react-dom'] = rpkg.dependencies['react-dom'];

let result =  JSON.stringify(pkg, false, 2);
fs.writeFileSync('./packages/dev/docs/package.json', result);
