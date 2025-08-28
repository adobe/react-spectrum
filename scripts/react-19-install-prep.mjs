import fs from 'node:fs';
import spawn from 'cross-spawn';

// setting the version to 'next' won't work due to a yarn 1 bug
let results = JSON.parse(await run('npm', ['view', 'react@next', '--json']));
let version = results['dist-tags']['next'];
let data = fs.readFileSync('./packages/dev/docs/package.json');
let pkg = JSON.parse(data);
pkg.dependencies['react'] = version;
pkg.dependencies['react-dom'] = version;

let result =  JSON.stringify(pkg, false, 2);
fs.writeFileSync('./packages/dev/docs/package.json', result);


let content = fs.readFileSync('./package.json', 'utf8');
let rootpkg = JSON.parse(content);
rootpkg.resolutions['react'] = version;
rootpkg.resolutions['react-dom'] = version;
fs.writeFileSync('./package.json', JSON.stringify(rootpkg, null, 2));


function run(cmd, args, opts) {
  return new Promise((resolve, reject) => {
    let child = spawn(cmd, args, opts);
    let result = '';
    child.stdout?.on('data', function(data) {
      result += data.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error('Child process failed'));
        return;
      }

      resolve(result);
    });
  });
}

// {
//   "_id": "react@19.0.0-rc-dfd30974ab-20240613",
//   "_rev": "3541-90d5195cbfb1b1e06460ff97a217d2f9",
//   "name": "react",
//   "description": "React is a JavaScript library for building user interfaces.",
//   "dist-tags": {
//   "latest": "18.3.1",
//     "beta": "19.0.0-beta-26f2496093-20240514",
//     "experimental": "0.0.0-experimental-dfd30974ab-20240613",
//     "rc": "19.0.0-rc-dfd30974ab-20240613",
//     "next": "19.0.0-rc-dfd30974ab-20240613",
//     "canary": "19.0.0-rc-dfd30974ab-20240613"
// },
