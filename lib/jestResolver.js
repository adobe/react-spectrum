const {compileStrings} = require('@internationalized/string-compiler');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const {threadId} = require('worker_threads');

const cacheDir = path.join(__dirname, '..', 'node_modules', '.cache', 'intl');
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
    let res = compileStrings(json);

    let hash = crypto.createHash('md5');
    hash.update(res);
    let cacheFile = path.join(cacheDir, hash.digest('hex') + '.js');

    // If cache file already exists, return it.
    if (fs.existsSync(cacheFile)) {
      return cacheFile;
    }

    // Otherwise, write it atomically to avoid race conditions between threads/processes.
    let tmpFile = cacheFile + '.' + process.pid + (threadId != null ? '.' + threadId : '');
    fs.writeFileSync(tmpFile, res);
    fs.renameSync(tmpFile, cacheFile);
    return cacheFile;
  }

  return resolved;
};
