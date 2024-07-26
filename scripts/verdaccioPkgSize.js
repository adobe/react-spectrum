const fs = require('fs-extra');
const path = require('path');
const glob = require('fast-glob');
const exec = require('child_process').execSync;

verdaccioPkgSize();

// Creates a file listing the tarball sizes of every Verdaccio published package
// Assumes that the verdaccio db json exists and that the store for the packages is ~/.config/verdaccio/storage/
function verdaccioPkgSize() {
  let verdaccioStorePath = exec('echo ~/.config/verdaccio/storage/').toString().trim();

  if (!fs.existsSync(verdaccioStorePath)) {
    verdaccioStorePath = path.join(__dirname, '..', 'verdaccio', 'storage/');
  }

  let json = {};
  let verdaccioDBPath = path.join(__dirname, '..', 'verdaccio', 'storage', '.verdaccio-db.json');
  let publishedPackages = JSON.parse(fs.readFileSync(verdaccioDBPath), 'utf').list;
  for (let pkg of publishedPackages) {
    let tarballPath = glob.sync(`**/${pkg}/*.tgz`, {cwd: verdaccioStorePath}).sort().at(-1);
    let size = fs.statSync(verdaccioStorePath + tarballPath).size / 1000;
    json[pkg] = size;
  }

  fs.writeFileSync('publish.json', JSON.stringify(json, null, 2));
}
