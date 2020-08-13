const { resolve, sep, dirname } = require('path');
const { existsSync } = require('fs');

const PACKAGE_JSON = 'package.json';

// returns path to closest package.json file while traversing up from given filepath
// this is compatible with a yarn/lerna workspaces environment
const resolvePackageJsonPath = (filepath) => {
  let packageJsonPath = resolve(dirname(filepath), PACKAGE_JSON);
  // while the parent directory does not have package.json and not at root of path
  while (!existsSync(packageJsonPath)) {
    const prevPackageJsonPath = packageJsonPath;
    // step up into parent directory
    packageJsonPath = resolve(dirname(dirname(packageJsonPath)), PACKAGE_JSON);
    // ensure not already at root
    if (packageJsonPath === prevPackageJsonPath) {
      throw new Error(`could not resolve ${PACKAGE_JSON} from ${filepath}`);
    }
  }
  // found a package.json file
  return packageJsonPath;
}

module.exports = function versionTransform() {
  return {
    visitor: {
      Identifier(path, { filename }) {
        if (path.node.name === '__PACKAGE_JSON_VERSION__') {
          // find nearest package.json file
          const packagePath = resolvePackageJsonPath(filename);
          // replace reference with version string
          const { version } = require(packagePath);          
          path.replaceWithSourceString('"' + version + '"');
        }
      },
    },
  };
};
