const {Namer} = require('@parcel/plugin');
const path = require('path');

module.exports = new Namer({
  name({bundle, bundleGraph, options}) {
    if (!bundle.isEntry || bundle.type !== 'html') {
      // let default namer handle it
      return null;
    }

    // Get relative path to entry file from the project root (will be e.g. `packages/@react-spectrum/button/docs/Button.mdx`)
    let entryFilePath = path.relative(options.projectRoot, bundle.getMainEntry().filePath);
    let parts = entryFilePath.split(path.sep);

    let basename = path.basename(entryFilePath, path.extname(entryFilePath)) + '.html';
    if (parts[1] === 'dev') {
      return path.join(...parts.slice(4, -1), basename);
    }

    return path.join(
      parts[1].replace(/^@/, ''),
      ...parts.slice(4, -1),
      basename
    );
  }
});
