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
var postcss = require('postcss');
const fs = require('fs');

const customPropertyRegExp = /^--[A-z][\w-]*$/;

// Parse variables from a file with postcss.
function getVars(file) {
  let contents = fs.readFileSync(file, 'utf8');
  let root = postcss.parse(contents);

  let vars = {};
  root.walkRules(rule => {
    rule.walkDecls(decl => {
      if (customPropertyRegExp.test(decl.prop)) {
        vars[decl.prop] = decl.value;
      }
    });
  });

  return vars;
}

// Find variables with unique values, and create a mapping between them.
function getUniqueVars(vars) {
  let unique = {};
  for (let key in vars) {
    if (!unique[vars[key]]) {
      unique[vars[key]] = [key];
    } else {
      unique[vars[key]].push(key);
    }
  }

  let mappings = {};
  for (let val in unique) {
    for (let key of unique[val]) {
      mappings[key] = unique[val];
    }
  }

  return mappings;
}

// Get unique variables, static variables, and a mapping of original variable names.
function getVariableMappings(themes) {
  let themeVars = {};
  for (let theme of themes) {
    let values = getVars(`packages/@adobe/spectrum-css-temp/vars/spectrum-${theme}.css`);
    let mappings = getUniqueVars(values);
    themeVars[theme] = {values, mappings};
  }

  let {values, mappings} = themeVars[themes[0]];
  let mapping = {};
  let static = {};
  let vars = {};
  for (let v in mappings) {
    // If the variable does not change values across themes, save it in the static variables list
    let isStatic = themes.every(t => themeVars[t].values[v] === values[v]);
    if (isStatic) {
      static[v] = values[v];
      continue;
    }

    // Find a variable that exists in the mappings across all themes
    let mapped = mappings[v].find(mapped => {
      return themes.every(t => {
        return themeVars[t].mappings[v].includes(mapped);
      });
    });

    if (!mapped) {
      throw new Error('Could not find mapping');
    }

    // If the variable maps to itself, add it to the mapping of unique variables
    if (mapped === v) {
      for (let t of themes) {
        if (!vars[t]) {
          vars[t] = {};
        }

        vars[t][v] = themeVars[t].values[v];
      }
    } else {
      // Otherwise, map the variable to one of the unique variables.
      mapping[v] = mapped;
    }
  }

  for (let mapped in mapping) {
    for (let t of themes) {
      if (themeVars[t].values[mapped] !== themeVars[t].values[mapping[mapped]] || !vars[t][mapping[mapped]]) {
        throw new Error('Invalid mapping ' + mapped + ' ' + mapping[mapped]);
      }
    }
  }

  return {mapping, vars, static};
}

let themes = getVariableMappings(['dark', 'darkest', 'light', 'lightest', 'middark', 'midlight']);
let scales = getVariableMappings(['large', 'medium']);
let globals = getVars('packages/@adobe/spectrum-css-temp/vars/spectrum-global.css');

exports.themes = themes.vars;
exports.scales = scales.vars;
exports.mapping = Object.assign({}, themes.mapping, scales.mapping);
exports.static = Object.assign({}, themes.static, scales.static, globals);

exports.generate = function generate(theme, vars) {
  return `.spectrum--${theme} {\n${Object.keys(vars).map(v => `  ${v}: ${vars[v]};`).join('\n')}\n}`;
};
