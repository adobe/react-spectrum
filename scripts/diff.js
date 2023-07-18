const exec = require('child_process').execSync;
const spawn = require('child_process').spawnSync;
const fs = require('fs');

let packages = JSON.parse(exec('yarn workspaces info --json').toString().split('\n').slice(1, -2).join('\n'));
let uuid = require('uuid')();

let ksdiff = process.argv.includes('--ksdiff');
let codeOnly = process.argv.includes('--code-only');
let help = process.argv.includes('--help');

if (help) {
  console.log('');
  console.log('This script performs a diff of changed packages since their last released version.');
  console.log('The following options are supported:');
  console.log('');
  console.log('--ksdiff – View the diff using Kaleidoscope rather than in the terminal');
  console.log('--code-only – Exclude changes to docs, tests, stories, and chromatic');
  console.log('');
  return;
}

// Diff each package individually. Some packages might have been skipped during last release,
// so we cannot simply look at the last tag on the whole repo.
for (let name in packages) {
  let filePath = packages[name].location + '/package.json';
  let pkg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!pkg.private) {
    // Diff this package since the last published version, according to the package.json.
    // The release script creates a tag for each package version.
    let tag = `${pkg.name}@${pkg.version}`;
    let args = [];
    if (ksdiff) {
      // Override Kaleidoscope difftool command to use UUID, so that we can group all changes across packages together.
      args.push('-c', `difftool.Kaleidoscope.cmd=ksdiff --partial-changeset --UUID ${uuid} --relative-path "$MERGED" -- "$LOCAL" "$REMOTE"`);
      args.push('difftool');
    } else {
      args.push('diff');
    }

    args.push('--exit-code', tag + '..HEAD',  packages[name].location);

    if (codeOnly) {
      args.push(':!**/docs/**', ':!**/test/**', ':!**/stories/**', ':!**/chromatic/**');
    }

    spawn('git', args, {
      stdio: 'inherit'
    });
  }
}

if (ksdiff) {
  exec(`ksdiff --mark-changeset-as-closed ${uuid}`);
}
