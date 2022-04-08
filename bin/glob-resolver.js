const fs = require('fs');
const glob = require('glob');
const path = require('path');
const crypto = require('crypto');

const cacheDir = path.join(__dirname, '..', 'node_modules', '.cache', 'glob');
try {
  fs.mkdirSync(cacheDir, {recursive: true});
} catch (err) {
  // ignore
}

module.exports = (request, options) => {
  if (request.endsWith('*.json')) {
    let files = glob.sync(request, {cwd: options.basedir});
    let source = '';
    for (let file of files) {
      source += `exports['${path.basename(file, '.json')}'] = require('${path.join(options.basedir, file)}');\n`;
    }
    let hash = crypto.createHash('md5');
    hash.update(path.join(options.basedir, request));
    let filename = path.join(cacheDir, hash.digest('hex'));
    fs.writeFileSync(filename, source);
    return filename;
  }

  return options.defaultResolver(request, options);
};
