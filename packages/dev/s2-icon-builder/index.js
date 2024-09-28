#!/usr/bin/env node

let {Parcel} = require('@parcel/core');
let {parseArgs} = require('util');

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
    }
  }
});

let bundler = new Parcel({
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
});

async function run() {
  try {
    let {bundleGraph, buildTime} = await bundler.run();
    let bundles = bundleGraph.getBundles();
    console.log(`✨ Built ${bundles.length} icons in ${buildTime}ms!`);
  } catch (err) {
    console.log(err);
  }
}

run();
