#!/usr/bin/env node

let {parseArgs} = require('util');
let globSync = require('glob').sync;
let fs = require('fs');
let path = require('path');
const exec = require('child_process').execSync;

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
    name: {
      type: 'string'
    },
    version: {
      type: 'string'
    }
  }
});

let pkgJson = `{
  "name": "${args.values.name}",
  "version": "${args.values.version}",
  "peerDependencies": {
    "@react-spectrum/s2": ">=0.8.0",
    "react": "^18.0.0 || ^19.0.0-rc.1",
    "react-dom": "^18.0.0 || ^19.0.0-rc.1"
  },
  "devDependencies": {
    "@react-spectrum/s2": ">=0.8.0",
    "react": "^18.0.0 || ^19.0.0-rc.1",
    "react-dom": "^18.0.0 || ^19.0.0-rc.1"
  },
  "files": [
    "icons-src",
    ${args.values.output}
  ],
  "exports": {
    "./${args.values.output}/*": {
      "types": "./${args.values.output}/*.d.ts",
      "module": "./${args.values.output}/*.mjs",
      "import": "./${args.values.output}/*.mjs",
      "require": "./${args.values.output}/*.cjs"
    }
  },
}`;

async function run() {
  fs.mkdirSync(args.values.name, {recursive: true});
  let pkgJsonPath = path.join(args.values.name, 'package.json');
  fs.writeFileSync(pkgJsonPath, pkgJson);
  let iconDir = path.join(args.values.name, 'icons-src');
  fs.mkdirSync(iconDir, {recursive: true});
  let iconFiles = globSync(path.join(args.values.input, '**/*.svg'), {absolute: true});
  for (let iconFile of iconFiles) {
    let iconName = path.basename(iconFile, '.svg');
    let iconPath = path.join(iconDir, `${iconName}.svg`);
    fs.copyFileSync(iconFile, iconPath);
  }
  exec('yarn install --no-immutable', {cwd: args.values.name});
  exec(`yarn transform-icons --input ${iconDir} --output ${path.join(args.values.name, args.values.output)} --isLibrary`);
}

run();

