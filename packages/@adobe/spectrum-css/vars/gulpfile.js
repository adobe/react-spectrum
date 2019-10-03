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

const gulp = require('gulp');
const logger = require('gulplog');
const fs = require('fs');
const del = require('del');
const path = require('path');

function clean() {
  return del('dist/*');
}

function prepareBuild(cb) {
  var dir = 'dist';
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
  }
  cb();
}

// Builds a list of unique variables from DNA for each theme and scale.
function buildVars(cb) {
  let vars = require('./generate');
  for (let theme in vars.themes) {
    fs.writeFileSync(`dist/spectrum-${theme}-unique.css`, vars.generate(theme, vars.themes[theme]));
  }

  for (let scale in vars.scales) {
    fs.writeFileSync(`dist/spectrum-${scale}-unique.css`, vars.generate(scale, vars.scales[scale]));
  }

  cb();
}

function copySources() {
  return gulp.src([
    'css/spectrum-metadata.json',
    'css/*.css'
  ])
    .pipe(gulp.dest('dist/'))
}

let build = gulp.series(
  clean,
  prepareBuild,
  gulp.parallel(
    buildVars,
    copySources
  )
);

exports.clean = clean;
exports.default = build;
exports.build = exports.buildLite = exports.buildHeavy = build;
