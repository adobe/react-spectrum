const {compileMessages} = require('@internationalized/message-compiler');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const cacheDir = path.join(__dirname, '..', 'node_modules', '.cache', 'intl');
try {
  fs.mkdirSync(cacheDir, {recursive: true});
} catch (err) {
  // ignore
}

module.exports = (request, options) => {
  let resolved = options.defaultResolver(request, options);
  if (/packages\/.*\/.*\/intl\/.*\.json$/.test(resolved)) {
    let hash = crypto.createHash('md5');
    hash.update(resolved);
    let cacheFile = path.join(cacheDir, hash.digest('hex') + '.js');

    try {
      // Don't recompile if the cache file already exists and was modified in the last 1 second.
      if (fs.statSync(cacheFile).mtimeMs < (Date.now() - 1000)) {
        return cacheFile;
      }
    } catch (err) {
      // ignore.
    }

    let sourceText = fs.readFileSync(resolved, 'utf8');
    let json = JSON.parse(sourceText);
    let res = compileMessages(json);
    fs.writeFileSync(cacheFile, res);
    return cacheFile;
  }

  return resolved;
};
