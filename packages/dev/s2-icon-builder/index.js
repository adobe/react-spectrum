#!/usr/bin/env node

let path = require('path');
let {Parcel} = require('@parcel/core');
let {parseArgs} = require('util');
let globSync = require('glob').sync;
let fs = require('fs');

const args = parseArgs({
  options: {
    input: {
      type: 'string',
      short: 'i',
      multiple: true
    },
    type: {
      type: 'string',
      default: 'icon'
    },
    output: {
      type: 'string',
      short: 'o'
    },
    isLibrary: {
      type: 'boolean'
    }
  }
});

let options = {
  entries: args.values.input,
  config: require.resolve('@react-spectrum/s2-icon-builder/.parcelrc'),
  shouldDisableCache: true,
  defaultTargetOptions: {
    distDir: args.values.output
  },
  targets: {
    [args.values.type]: {
      distDir: args.values.output,
      isLibrary: true,
      includeNodeModules: false
    }
  },
  engines: {
    browsers: ['last 1 Chrome version']
  }
};

if (args.values.isLibrary) {
  options = {
    entries: args.values.input,
    config: require.resolve('@react-spectrum/s2-icon-builder/.parcelrc-library'),
    shouldDisableCache: true,
    mode: 'production',
    defaultTargetOptions: {
      shouldScopeHoist: true,
      shouldOptimize: false
    },
    targets: {
      [`${args.values.type}-module`]: {
        distDir: args.values.output,
        isLibrary: true,
        includeNodeModules: false,
        outputFormat: 'esmodule',
        engines: {
          browsers: ['last 2 Chrome versions, last 2 Safari versions, last 2 Firefox versions, last 2 Edge versions']
        }
      },
      [`${args.values.type}-main`]: {
        distDir: args.values.output,
        isLibrary: true,
        includeNodeModules: false,
        outputFormat: 'commonjs',
        engines: {
          browsers: ['last 2 Chrome versions, last 2 Safari versions, last 2 Firefox versions, last 2 Edge versions']
        }
      }
    }
  };
}

let bundler = new Parcel(options);

async function run() {
  try {
    let {bundleGraph, buildTime} = await bundler.run();
    let bundles = bundleGraph.getBundles();
    console.log(`✨ Built ${bundles.length} icons in ${buildTime}ms!`);
  } catch (err) {
    console.log(err);
  }
}

run().then(() => {
  if (args.values.isLibrary) {
    for (let file of globSync(`${path.join(args.values.output, '.')}/*.mjs`)) {
      fs.writeFileSync(file.replace('.mjs', '.d.ts'), `import type {IconProps} from '@react-spectrum/s2';
import type {ReactNode} from 'react';

declare function Icon(props: IconProps): ReactNode;
export default Icon;
    `);
    }
  }
});
