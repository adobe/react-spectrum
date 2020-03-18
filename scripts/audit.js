
import glob from 'fast-glob';
import fs from 'fs';
import path from 'path';

let startingPackages = glob.sync(path.dirname(__dirname) + '/packages/@react-spectrum/*/package.json');
let allPackages = glob.sync(path.dirname(__dirname) + '/packages/**/package.json', {ignore: ['**/node_modules/**', '**/dist/**', '**/.parcel-cache/**']});

function isOurs(dep, ourPackages) {
  return ourPackages.some(ourDep => ourDep.includes(dep));
}

function getPathToPackage(dep, ourPackages) {
  return ourPackages.find(ourDep => ourDep.includes(dep));
}

function traceDeps(dep, ourPackages) {
  let nextPackage = getPathToPackage(dep, ourPackages);
  let contents = fs.readFileSync(nextPackage, 'utf8');
  let parsed = JSON.parse(contents);
  let name = parsed.name;
  let isPrivate = parsed.private;
  ourPackagesInUse.set(name, {...ourPackagesInUse.get(name), isPrivate});
  let deps = parsed.dependencies;
  deps && Object.entries(deps).filter(([key]) => {
    return isOurs(key, ourPackages);
  }).forEach(([key, value]) => {
    if (ourPackagesInUse.has(key)) {
      let versions = ourPackagesInUse.get(key).versions;
      ourPackagesInUse.set(key, {...ourPackagesInUse.get(key), versions: [...versions, value]});
    }
    ourPackagesInUse.set(key, {versions: [value]});
    traceDeps(key, ourPackages);
  });
}

let ourPackagesInUse = new Map();

for (let file of startingPackages) {
  let contents = fs.readFileSync(file, 'utf8');
  let parsed = JSON.parse(contents);
  let name = parsed.name;
  let isPrivate = parsed.private;
  if (!isPrivate) {
    ourPackagesInUse.set(name, {versions: [parsed.version], isPrivate});
    let deps = parsed.dependencies;
    deps && Object.entries(deps).filter(([key]) => {
      return isOurs(key, allPackages);
    }).forEach(([key, value]) => {
      if (ourPackagesInUse.has(key)) {
        ourPackagesInUse.set(key, {...ourPackagesInUse.get(key), versions: [...ourPackagesInUse.get(key).versions, value]});
      }
      ourPackagesInUse.set(key, {versions: [value]});
      traceDeps(key, allPackages);
    });
  }
}

console.log(ourPackagesInUse);

ourPackagesInUse.forEach((value, key) => {
  let pkgPath = getPathToPackage(key, allPackages);
  let moduleFiles = glob.sync(pkgPath.match(/(.*)[\/\\]/)[1] + '/**/*.{js,ts,tsx}', {ignore: ['**/node_modules/**', '**/*.test.js']});

  for (let file of moduleFiles) {
    let contents = fs.readFileSync(file, 'utf8');
    if (/ts-ignore/.test(contents) || /eslint-disable/.test(contents)) {
      console.log('has an ignore', file);
    }
  }
});
