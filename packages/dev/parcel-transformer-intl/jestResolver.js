const compile = require('./compileMessage');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const cacheDir = path.join(__dirname, '..', '..', '..', 'node_modules', '.cache', 'intl');
try {
  fs.mkdirSync(cacheDir, {recursive: true});
} catch (err) {
  // ignore
}

module.exports = (request, options) => {
  let resolved = options.defaultResolver(request, options);
  if (/packages\/.*\/.*\/intl\/.*\.json$/.test(resolved)) {
    let sourceText = fs.readFileSync(resolved, 'utf8');
    let json = JSON.parse(sourceText);
    let res = '';
    for (let key in json) {
      res += 'exports[' + JSON.stringify(key) + '] = ' + compile(json[key]) + ';\n';
    }

    let hash = crypto.createHash('md5');
    hash.update(resolved);
    resolved = path.join(cacheDir, hash.digest('hex') + '.js');
    fs.writeFileSync(resolved, res);
  }

  return resolved;
};
