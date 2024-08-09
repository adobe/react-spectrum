#!/usr/bin/env node

let {Parcel} = require('@parcel/core');
let {parseArgs} = require('util');
let path = require('path');

const args = parseArgs({
  options: {
    icons: {
      type: 'string',
      short: 'i',
      multiple: true
    },
    output: {
      type: 'string',
      short: 'o'
    }
  }
});

let bundler = new Parcel({
  entries: args.values.icons,
  config: require.resolve('@react-spectrum/s2-icon-builder/.parcelrc'),
  shouldDisableCache: true,
  defaultTargetOptions: {
    distDir: args.values.output
  },
  targets: {
    main: {
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
