/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const findUp = require('find-up');
const path = require('path');
const fs = require('fs');
const Module = require('module');
const substrings = ['-', '+'];

const devDependencies = new Set([
  '@adobe/spectrum-css-temp',
  '@react-spectrum/style-macro-s1',
  '@parcel/macros',
  '@adobe/spectrum-tokens'
]);

module.exports = {
  meta: {
    fixable: 'code'
  },
  create: function (context) {
    let processNode = (node) => {
      if (!node.source || node.importKind === 'type') {
        return;
      }

      let source = node.source.value.replace(/^[a-z-]+:/, '');
      if (source.startsWith('.') || Module.builtinModules.includes(source)) {
        return;
      }

      // Split the import specifier on slashes. If it starts with an @ then it's
      // a scoped package, otherwise just take the first part.
      let parts = source.split('/');
      let pkgName = source.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0];

      // Search for a package.json starting from the current filename
      let pkgPath = findUp.sync('package.json', {cwd: path.dirname(context.getFilename())});
      if (!pkgPath) {
        return;
      }

      let pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

      // The only dev dependency should be spectrum-css.
      if (exists(pkg.devDependencies, pkgName) && devDependencies.has(pkgName)) {
        return;
      }

      if (!exists(pkg.dependencies, pkgName) && !exists(pkg.peerDependencies, pkgName) && pkgName !== pkg.name) {
        context.report({
          node,
          message: `Missing dependency on ${pkgName}.`,
          fix(fixer) {
            // Attempt to find a package in the monorepo. If the dep is for an external library,
            // then we cannot auto fix it because we don't know the version to add.
            let depPath = __dirname + '/../packages/' + pkgName + '/package.json';
            if (!fs.existsSync(depPath)) {
              return;
            }

            let depPkg = JSON.parse(fs.readFileSync(depPath, 'utf8'));
            let pkgVersion = substrings.some(v => depPkg.version.includes(v)) ?  depPkg.version : `^${depPkg.version}`;

            if (pkgName === '@react-spectrum/provider') {
              pkg.peerDependencies = insertObject(pkg.peerDependencies, pkgName, pkgVersion);
            } else {
              pkg.dependencies = insertObject(pkg.dependencies, pkgName, pkgVersion);
            }

            fs.writeFileSync(pkgPath, JSON.stringify(pkg, false, 2) + '\n');

            // Fake fix so eslint doesn't show the error.
            return {
              range: [0, 0],
              text: ''
            };
          }
        });
      }
    };

    return {
      ImportDeclaration: processNode,
      ExportNamedDeclaration: processNode,
      ExportAllDeclaration: processNode
    };
  }
};

function exists(deps, name) {
  return deps && deps[name];
}

// Insert a key into an object and sort it.
function insertObject(obj, key, value) {
  obj[key] = value;

  let res = {};
  for (let key of Object.keys(obj).sort()) {
    res[key] = obj[key];
  }

  return res;
}
