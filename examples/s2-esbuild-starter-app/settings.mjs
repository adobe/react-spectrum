import esbuildPluginTsc from 'esbuild-plugin-tsc';
import macros from 'unplugin-parcel-macros';

export function createBuildSettings(options) {
  return {
    entryPoints: ['./index.jsx'],
    bundle: true,
    plugins: [
      macros.esbuild(),
      esbuildPluginTsc({
        force: true
      }),
    ],
    ...options
  };
}
