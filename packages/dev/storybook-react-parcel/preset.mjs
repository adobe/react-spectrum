import {fileURLToPath} from 'node:url';

// Storybook 10 requires core.builder to be a fully resolved entry-point path,
// not a package name or directory. See MIGRATION.md §"`core.builder` configuration
// must be a fully resolved path".
export const core = {
  builder: fileURLToPath(import.meta.resolve('storybook-builder-parcel')),
  // core.renderer has no path-resolution requirement in SB10; it stays as a bare
  // package specifier and is resolved by Storybook's preset loader.
  renderer: '@storybook/react'
};
