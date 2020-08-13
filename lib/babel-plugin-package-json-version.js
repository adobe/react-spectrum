const { dirname } = require('path');
const readPkgUp = require('read-pkg-up');

module.exports = function versionTransform() {
  return {
    visitor: {
      Identifier(path, { filename }) {
        if (path.node.name === '__PACKAGE_JSON_VERSION__') {
          // find and read nearest package.json file
          const resolvedPackage = readPkgUp.sync({ cwd: dirname(filename) });
          if (!resolvedPackage) {
            throw new Error(`could not resolve package.json from ${filepath}`);
          }
          // replace reference with version string
          const { version } = resolvedPackage.packageJson;
          path.replaceWithSourceString('"' + version + '"');
        }
      },
    },
  };
};
