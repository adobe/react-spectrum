const Balthazar = require('@spectrum/balthazar');
const path = require('path');
const fsp = require('fs').promises;
const gulp = require('gulp');
const ext = require('replace-ext');
const logger = require('gulplog');
const through = require('through2');

function generateDNAJSON() {
  const outputPath = path.resolve('temp/json/');
  const CSS_OUTPUT_TYPE = Balthazar.OUTPUT_TYPES.json;
  // the api for convert is destination, type, path-to-json
  // default path to json will look for node_modules/@spectrum/spectrum-dna locally
  const dnaPath = path.join(path.dirname(require.resolve('@spectrum/spectrum-dna')), '..');
  return Balthazar.convertVars(outputPath, CSS_OUTPUT_TYPE, dnaPath);
}

let dnaModules = [];
function generateDNAJS() {
  return gulp.src('temp/json/*.json')
    .pipe(through.obj(function translateJSON(file, enc, cb) {
      let data = JSON.parse(String(file.contents));
      let contents = '';
      let moduleName = path.basename(file.path).replace(/^spectrum-(.*?)\.json/, '$1');
      for (let varName in data) {
        contents += `exports[${JSON.stringify(varName).replace(/spectrum-(global-)?/, '')}] = ${JSON.stringify(data[varName])};\n`
      }
      file.contents = Buffer.from(contents);
      file.path = path.join(file.base, `${moduleName}.js`);

      dnaModules.push(moduleName);

      cb(null, file);
    }))
    .pipe(gulp.dest('js/'))
}

async function generateDNAJSIndex() {
  await fsp.writeFile('js/index.js',
`${dnaModules.map(module => `exports[${JSON.stringify(module.replace(/^spectrum-(.*?)\.js/, '$1'))}] = require("./${module}.js");`).join('\n')}
`);
}

exports.updateDNAJS = gulp.series(
  generateDNAJSON,
  generateDNAJS,
  generateDNAJSIndex
);
