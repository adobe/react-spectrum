import {Resolver} from '@parcel/plugin';

export default new Resolver({
  async resolve({specifier}) {
    if (!specifier.includes('@react-spectrum/s2')) {
      return {
        filePath: import.meta.resolve(specifier).replaceAll('file:///', '/')
      };
    }

    // Let the next resolver in the pipeline handle
    // this dependency.
    return null;
  }
});
