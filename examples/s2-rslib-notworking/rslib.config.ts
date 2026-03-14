import { pluginReact } from '@rsbuild/plugin-react';
import { defineConfig } from '@rslib/core';
import { rspack as macros } from 'unplugin-parcel-macros';

export default defineConfig({
  source: {
    entry: {
      index: ['./src/index.tsx'],
    },
  },
  lib: [
    {
      bundle: true,
      dts: true,
      format: 'esm',
    },
  ],
  output: {
    target: 'web',
  },
  plugins: [pluginReact()],
  tools: {
    /**
     * Add the macros plugin to enable support for React Spectrum S2 styles.
     * This is a webpack plugin, so it is added to the rspack config. We should
     * use the appendPlugins rather than appending it directly to the config, as
     * this is the recommended way to add plugins.
     */
    rspack: (config, { appendPlugins }) => {
      appendPlugins(macros());
      return config;
    },
  },
});
