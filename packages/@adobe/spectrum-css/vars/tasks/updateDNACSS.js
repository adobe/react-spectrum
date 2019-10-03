/*
Copyright 2019 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const path = require('path');
const logger = require('gulplog');
const gulp = require('gulp');
const replace = require('gulp-replace');
const Balthazar = require('@spectrum/balthazar');

function generateDNACSS() {
  const outputPath = path.resolve('css');
  const CSS_OUTPUT_TYPE = Balthazar.OUTPUT_TYPES.css;
  // the api for convert is destination, type, path-to-json
  // default path to json will look for node_modules/@spectrum/spectrum-dna locally
  const dnaPath = path.join(path.dirname(require.resolve('@spectrum/spectrum-dna')), '..');
  return Balthazar.convertVars(outputPath, CSS_OUTPUT_TYPE, dnaPath);
}

function postProcessDNACSS() {
  return gulp.src([
    'css/spectrum-*.css',
    '!css/spectrum-medium.css',
    '!css/spectrum-large.css'
  ])
    // replace anything with a value of 'transparent' with an actual transparent color
    .pipe(replace(/(.*?:) transparent;\n/g, '$1 rgba(0, 0, 0, 0);\n'))
    .pipe(gulp.dest('css/'));
}

exports.updateDNACSS = gulp.series(
  generateDNACSS,
  postProcessDNACSS
);
