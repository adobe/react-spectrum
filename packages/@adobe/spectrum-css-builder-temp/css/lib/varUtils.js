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
const postcss = require('postcss');
const concat = require('gulp-concat');
const through = require('through2');
const fsp = require('fs').promises;
const path = require('path');

function getVarValues(css) {
  let root = postcss.parse(css);
  let variables = {};

  root.walkRules((rule, ruleIndex) => {
    rule.walkDecls((decl) => {
      variables[decl.prop] = decl.value;
    });
  });

  return variables;
}

const varDir = path.join(path.dirname(require.resolve('@spectrum-css/vars')), '..');

async function readDNAVariables(file) {
  let css = await fsp.readFile(path.join(varDir, 'css', file));
  let vars = getVarValues(css);
  return vars;
}

function getAllComponentVars() {
  return new Promise((resolve, reject) => {
    let variableList;

    gulp.src([
      `${varDir}/css/components/*.css`,
      `${varDir}/css/globals/*.css`
    ])
      .pipe(concat('everything.css'))
      .pipe(through.obj(function getAllVars(file, enc, cb) {
        variableList = getVarValues(file.contents.toString());

        cb(null, file);
      }))
      .on('finish', () => {
        resolve(variableList);
      })
      .on('error', reject);
  });
}

exports.getAllComponentVars = getAllComponentVars;
exports.readDNAVariables = readDNAVariables;
