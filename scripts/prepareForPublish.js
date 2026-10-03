'use strict';

const fs = require('fs');
const path = require('path');

function prepare(dir) {
  let manifestPath = path.join(dir, 'package.json');
  let contents = fs.readFileSync(manifestPath, 'utf8');
  let manifest = JSON.parse(contents);
  fs.writeFileSync(path.join(dir, 'exports', '.package-json-before-pack'), contents, {flag: 'wx'});
  delete manifest.source;
  for (let conditions of Object.values(manifest.exports)) {
    if (conditions && typeof conditions === 'object') {
      delete conditions.source;
    }
  }
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}

function restore(dir) {
  let backup = path.join(dir, 'exports', '.package-json-before-pack');
  fs.writeFileSync(path.join(dir, 'package.json'), fs.readFileSync(backup));
  fs.unlinkSync(backup);
}

module.exports = {prepare, restore};

if (require.main === module) {
  module.exports[process.argv[2]](process.cwd());
}
