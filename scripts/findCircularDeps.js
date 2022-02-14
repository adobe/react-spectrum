const exec = require('child_process').execSync;

let workspaces = JSON.parse(exec('yarn workspaces info --json').toString().split('\n').slice(1, -2).join('\n'));

for (let pkg in workspaces) {
  addDep(pkg);
}

function addDep(dep, seen = new Set()) {
  if (seen.has(dep)) {
    let arr = [...seen];
    let index = arr.indexOf(dep);
    console.log(`Circular dependency detected: ${arr.slice(index).join(' -> ')} -> ${dep}`);
    process.exit(1);
  }

  seen.add(dep);

  for (let d of workspaces[dep].workspaceDependencies) {
    addDep(d, seen);
  }

  seen.delete(dep);
}
