# @react-aria/optimize-locales-plugin

A build plugin to optimize React Aria to only include translated strings for locales that your app supports. It currently supports Vite, Rollup, Webpack, and esbuild via [unplugin](https://github.com/unjs/unplugin), as well as Turbopack via a webpack loader. For Parcel, please use `@react-aria/parcel-resolver-optimize-locales`.

## Configuration

Any strings for locales other than the ones listed in the configuration as shown below will be removed from your bundle. See the [documentation](https://react-spectrum.adobe.com/react-aria/internationalization.html#supported-locales) for a full list of supported locales.

### webpack

```js
// webpack.config.js
const optimizeLocales = require('@react-aria/optimize-locales-plugin');

module.exports = {
  // ...
  plugins: [
    optimizeLocales.webpack({
      locales: ['en-US', 'fr-FR']
    })
  ]
};
```

### Next.js

```js
// next.config.js
const optimizeLocales = require('@react-aria/optimize-locales-plugin');

module.exports = {
  webpack(config) {
    config.plugins.push(
      optimizeLocales.webpack({
        locales: ['en-US', 'fr-FR']
      })
    );
    return config;
  }
};
```

When using Turbopack, spread the plugin's rules into the existing `turbopack.rules` configuration:

```ts
// next.config.ts
import type {NextConfig} from 'next';
import optimizeLocales from '@react-aria/optimize-locales-plugin';

const localeOptimization = optimizeLocales.turbopack({
  locales: ['en-US', 'fr-FR']
});

const config: NextConfig = {
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css'
      },
      ...localeOptimization.rules
    }
  }
};

export default config;
```

### Vite

```js
// vite.config.js
import optimizeLocales from '@react-aria/optimize-locales-plugin';

export default {
  plugins: [
    optimizeLocales.vite({
      locales: ['en-US', 'fr-FR']
    })
  ]
};
```

### Rollup

```js
// rollup.config.js
import optimizeLocales from '@react-aria/optimize-locales-plugin';

export default {
  plugins: [
    optimizeLocales.rollup({
      locales: ['en-US', 'fr-FR']
    })
  ]
};
```

### Esbuild

```js
import {build} from 'esbuild';
import optimizeLocales from '@react-aria/optimize-locales-plugin';

build({
  plugins: [
    optimizeLocales.esbuild({
      locales: ['en-US', 'fr-FR']
    })
  ]
});
```
