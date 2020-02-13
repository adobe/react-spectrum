const {Resolver} = require('@parcel/plugin');
const NodeResolver = require('@parcel/node-resolver-core').default;

module.exports = new Resolver({
  resolve({dependency, options, filePath}) {
    if (dependency.pipeline === 'docs' || dependency.pipeline === 'docs-json') {
      const resolver = new NodeResolver({
        extensions: ['ts', 'tsx', 'd.ts', 'js'],
        mainFields: ['source', 'types', 'main'],
        options
      });
  
      return resolver.resolve({
        filename: filePath,
        isURL: dependency.isURL,
        parent: dependency.sourcePath,
        env: dependency.env
      });
    }
  }
});
