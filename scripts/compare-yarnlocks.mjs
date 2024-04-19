
import fs from 'node:fs';
import semver from 'semver';
import chalk from 'chalk';
import yargs from 'yargs/yargs';

let argv = yargs(process.argv.slice(2))
  .option('v1', {type: 'string'})
  .option('v4', {type: 'string'})
  .option('new', {alias: 'n', type: 'boolean'})
  .option('resolutions', {alias: 'r', type: 'boolean'})
  .option('differences', {alias: 'd', type: 'boolean'})
  .help()
  .argv;

// example node ./scripts/compare-yarnlocks.mjs -d --v1 ..../react-spectrum/yarn.lock --v4 ..../react-spectrum/yarn.lock

let yarn4Lock = fs.readFileSync(argv.v4, 'utf8');
let yarn1Lock = fs.readFileSync(argv.v1, 'utf8');

let yarn4Entries = {};
let yarn4Lines = yarn4Lock.split('\n');
let i = 0;
for (let line of yarn4Lines) {
  if (line.startsWith('"')) {
    // match a string which may start with an @ and separated by a @
    let name = line.match(/"(@?.*?)@.*"/)[1];
    let version = yarn4Lines[i+1].match(/version: (.*)/)[1];
    if (yarn4Entries[name]) {
      yarn4Entries[name].push(version);
    } else {
      yarn4Entries[name] = [version];
    }
  }
  i++
}
i = 0;
// do the same thing with yarn1
let yarn1Entries = {};
let yarn1Lines = yarn1Lock.split('\n');
for (let line of yarn1Lines) {
  if (line.startsWith('"')) {
    let name = line.match(/"(@?.*?)@.*"/)[1];
    let version = yarn1Lines[i+1].match(/version "(.*)"/)[1];
    if (yarn1Entries[name]) {
      yarn1Entries[name].push(version);
    } else {
      yarn1Entries[name] = [version];
    }
  }
  i++
}

let keys = new Set();
for (let [name, version] of Object.entries(yarn4Entries)) {
  keys.add(name);
}

for (let [name, version] of Object.entries(yarn1Entries)) {
  keys.add(name);
}

console.log(chalk.cyan('total differences'), keys.size);
let newPackages = [];
let recommendation = [];
argv.differences && console.log(chalk.magenta('different versions'));
for (let key of keys) {
  let v1 = yarn1Entries[key];
  let v4 = yarn4Entries[key];
  if (
    v1 && v4
    && v1.length === v4.length
    && v1.every((version) => v4.some((version4) => version === version4))
  ) {
    continue;
  }
  if (v4 && v4.some((version) => version.includes('local'))) {
    continue;
  }
  if (v4 && !v1) {
    newPackages.push(`"${key}": "${v4[0]}",`);
    continue;
  } else {
    argv.differences && console.log('key', key, 'v1', v1, 'v4', v4);
  }
  if (v1 && v1.length === 1 && v4 && v4.length === 1) {
    if (semver.compare(v1[0], v4[0]) === 1) {
      recommendation.push(`"${key}": "${v1[0]}",`);
    } else {
      recommendation.push(`"${key}": "${v4[0]}",`);
    }
  }
}
argv.resolutions && console.log(chalk.magenta('Recommended Resolutions?'));
argv.resolutions && console.log(recommendation.join('\n'));
argv.new && console.log(chalk.magenta('Net new packages, from peers?'));
argv.new && console.log(newPackages.join('\n'));


