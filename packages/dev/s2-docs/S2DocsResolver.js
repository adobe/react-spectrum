const {Resolver} = require('@parcel/plugin');

module.exports = new Resolver({
  resolve({dependency}) {
    // Ignore URL dependencies in MDX files.
    if (dependency.sourcePath?.endsWith('.mdx') && dependency.isOptional) {
      return {isExcluded: true};
    }
  }
});
