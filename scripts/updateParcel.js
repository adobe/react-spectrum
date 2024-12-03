const glob = require('glob');
const fs = require('fs');

let tag = process.argv[2] || 'latest';
let versions = new Map();

async function update(pkg) {
  let json = JSON.parse(fs.readFileSync(pkg, 'utf8'));
  await updateDeps(json.dependencies);
  await updateDeps(json.devDependencies);
  await updateDeps(json.peerDependencies);
  await updateDeps(json.resolutions);
  fs.writeFileSync(pkg, JSON.stringify(json, false, 2) + '\n');
}

async function updateDeps(deps = {}) {
  for (let dep in deps) {
    if (dep.startsWith('@parcel/') || dep === 'parcel') {
      deps[dep] = await getVersion(dep);
    }
  }
}

async function getVersion(name) {
  if (versions.has(name)) {
    return versions.get(name);
  }
  let res = await fetch('https://registry.npmjs.com/' + name);
  let json = await res.json();
  let version = json['dist-tags'][tag];
  versions.set(name, version);
  return version;
}

async function run() {
  await update('package.json');
  for (let pkg of glob.sync('packages/**/*/package.json')) {
    await update(pkg);
  }
}

run();
