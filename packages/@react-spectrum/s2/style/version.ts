import fs from 'node:fs';
import path from 'node:path';

export function getThemeVersion() {
  let s2PkgPath = require.resolve('@react-spectrum/s2');
  while (s2PkgPath.length > 2) {
    const filePath = path.join(s2PkgPath, 'package.json');
    try {
      const stats = fs.statSync(filePath, {throwIfNoEntry: false});
      if (stats?.isFile()) {
        break;
      }
    } catch { /* empty */ }
    s2PkgPath = path.dirname(s2PkgPath);
  }
  const s2PkgMetadata = require(path.join(s2PkgPath, 'package.json'));
  // This logic sucks, but 'A' is present at the beginning of all allowedOverrides
  // We add the hash of the version to the 'A' to make regex in S2 components allow the rules
  return 'A' + hashSemVer(s2PkgMetadata.version);
}

function hashSemVer(version: string) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  const base = alphabet.length;
  const [major, minor, patch] = version.split('.').map(Number);
  const combined = (major << 16) | (minor << 8) | patch;
  let hashStr = '';
  let num = combined;
  while (num > 0) {
    hashStr = alphabet[num % base] + hashStr;
    num = Math.floor(num / base);
  }
  return hashStr;
}
