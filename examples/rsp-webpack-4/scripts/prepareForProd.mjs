
import fs from 'node:fs';

let pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
delete pkg.workspaces;
fs.writeFileSync('package.json', JSON.stringify(pkg, false, 2));
