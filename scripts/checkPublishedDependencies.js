const fs = require('fs');
const path = require('path');
const exec = require('child_process').execSync;

let output = exec('yarn workspaces info --json').toString().replace(/^(.|\n)*?\{/, '{').replace(/\}\nDone in .*\n?$/, '}');
let workspacePackages = JSON.parse(output);

let excludedPackages = new Set([
  '@adobe/spectrum-css-temp',
  '@react-spectrum/test-utils',
  '@spectrum-icons/build-tools',
  '@react-spectrum/docs'
]);

let missing = new Set();
for (let pkg in workspacePackages) {
  let json = JSON.parse(fs.readFileSync(path.join(__dirname, '..', workspacePackages[pkg].location, 'package.json'), 'utf8'));
  if (json.private) {
    continue;
  }

  for (let dep of workspacePackages[pkg].workspaceDependencies) {
    let json = JSON.parse(fs.readFileSync(path.join(__dirname, '..', workspacePackages[dep].location, 'package.json'), 'utf8'));
    if (json.private && !excludedPackages.has(json.name)) {
      missing.add(dep);
    }
  }
}

if (missing.size) {
  console.error('The following packages are marked private but are dependencies of published packages:');
  console.error(missing);
  process.exit(1);
}
