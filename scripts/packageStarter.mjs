import {execFileSync} from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

if (process.argv.length !== 3) {
  console.error(
    'Usage: node scripts/packageStarter.mjs <archive.zip> (from the starter directory)'
  );
  process.exit(1);
}

const archive = path.resolve(process.argv[2]);
const rootPackageJSON = JSON.parse(
  fs.readFileSync(new URL('../package.json', import.meta.url), 'utf8')
);
const packageJSON = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'react-aria-starter-'));

try {
  const tempArchive = path.join(tempDir, 'starter.zip');
  execFileSync(
    'zip',
    [
      '-r',
      tempArchive,
      '.',
      '-x',
      '.gitignore',
      '.DS_Store',
      'node_modules/*',
      'storybook-static/*',
      '.yarn/releases/*',
      path.basename(archive)
    ],
    {stdio: 'inherit'}
  );
  fs.writeFileSync(
    path.join(tempDir, 'package.json'),
    JSON.stringify({...packageJSON, packageManager: rootPackageJSON.packageManager}, null, 2) + '\n'
  );
  execFileSync('zip', ['-j', tempArchive, path.join(tempDir, 'package.json')], {stdio: 'inherit'});
  fs.copyFileSync(tempArchive, archive);
} finally {
  fs.rmSync(tempDir, {recursive: true, force: true});
}
