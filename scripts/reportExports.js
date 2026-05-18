/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const fs = require('fs');
const path = require('path');
const fg = require('fast-glob');
const ts = require('typescript');
const {parseArgs} = require('util');

const rootDir = path.join(__dirname, '..');
const packagesDir = path.join(rootDir, 'packages');
const args = parseArgs({
  options: {
    note: {
      type: 'string',
      multiple: true
    }
  }
});

main();

function main() {
  let exportFiles = fg
    .sync('**/exports/**/*.ts', {
      cwd: packagesDir,
      absolute: true,
      ignore: ['**/*.d.ts']
    })
    .sort((a, b) => a.localeCompare(b));

  let program = ts.createProgram(exportFiles, {
    allowJs: false,
    checkJs: false,
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    noEmit: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ESNext
  });

  let checker = program.getTypeChecker();
  let report = [];

  for (let fileName of exportFiles) {
    let sourceFile = program.getSourceFile(fileName);
    if (!sourceFile) {
      continue;
    }

    let moduleSymbol = checker.getSymbolAtLocation(sourceFile);
    let exports = moduleSymbol ? checker.getExportsOfModule(moduleSymbol) : [];
    let exportNames = exports.map(symbol => symbol.getName()).sort((a, b) => a.localeCompare(b));

    let specifier = getImportSpecifier(fileName);

    report.push({
      specifier,
      packageName: getPackageName(specifier),
      isRoot: isRootSpecifier(specifier),
      isPrivate: specifier.includes('/private/'),
      exports: exportNames
    });
  }

  report.sort((a, b) => a.specifier.localeCompare(b.specifier));
  let packageData = buildPackageData(report);
  let noteFilters = args.values.note ?? [];

  for (let entry of report) {
    let lines = [];
    let {specifier, exports: exportNames} = entry;

    for (let exportName of exportNames) {
      let notes = getExportNotes(entry, exportName, packageData);
      if (matchesNoteFilter(notes, noteFilters)) {
        lines.push(`- \`${exportName}\`${notes.length > 0 ? ` (${notes.join(', ')})` : ''}`);
      }
    }

    if (lines.length > 0) {
      console.log(`## ${specifier}`);
      console.log('');
      for (let line of lines) {
        console.log(line);
      }
      console.log('');
    }
  }
}

function getImportSpecifier(fileName) {
  let packageDir = findPackageDir(path.dirname(fileName));
  let packageJson = JSON.parse(fs.readFileSync(path.join(packageDir, 'package.json'), 'utf8'));
  let relativePath = path.relative(path.join(packageDir, 'exports'), fileName);
  let withoutExtension = relativePath.replace(/\.ts$/, '').split(path.sep).join('/');

  return withoutExtension === 'index'
    ? packageJson.name
    : `${packageJson.name}/${withoutExtension}`;
}

function findPackageDir(startDir) {
  let currentDir = startDir;

  while (currentDir.startsWith(packagesDir)) {
    let packageJsonPath = path.join(currentDir, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      return currentDir;
    }

    let parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) {
      break;
    }

    currentDir = parentDir;
  }

  throw new Error(`Unable to find package.json for ${startDir}`);
}

function buildPackageData(report) {
  let packageData = new Map();

  for (let entry of report) {
    let data = packageData.get(entry.packageName);
    if (!data) {
      data = {
        rootExports: new Set(),
        subpathExports: new Set(),
        privateExports: new Set(),
        privateExportPaths: new Map()
      };
      packageData.set(entry.packageName, data);
    }

    for (let exportName of entry.exports) {
      if (entry.isRoot) {
        data.rootExports.add(exportName);
      } else {
        data.subpathExports.add(exportName);
      }

      if (entry.isPrivate) {
        data.privateExports.add(exportName);
        let privatePaths = data.privateExportPaths.get(exportName);
        if (!privatePaths) {
          privatePaths = new Set();
          data.privateExportPaths.set(exportName, privatePaths);
        }

        privatePaths.add(entry.specifier);
      }
    }
  }

  return packageData;
}

function getExportNotes(entry, exportName, packageData) {
  let data = packageData.get(entry.packageName);
  let notes = [];

  if (entry.isRoot) {
    if (data.privateExports.has(exportName)) {
      notes.push(
        `also exported from private subpath: ${formatSpecifierList(data.privateExportPaths.get(exportName))}`
      );
    }

    if (!data.subpathExports.has(exportName)) {
      notes.push('not exported from a subpath');
    }
  } else {
    if (entry.isPrivate && data.rootExports.has(exportName)) {
      notes.push(
        `also exported from index via private subpath: ${formatSpecifierList(data.privateExportPaths.get(exportName))}`
      );
    }

    if (!entry.isPrivate && !data.rootExports.has(exportName)) {
      notes.push('not exported from index');
    }
  }

  return notes;
}

function getPackageName(specifier) {
  if (specifier.startsWith('@')) {
    return specifier.split('/').slice(0, 2).join('/');
  }

  return specifier.split('/')[0];
}

function isRootSpecifier(specifier) {
  return specifier === getPackageName(specifier);
}

function matchesNoteFilter(notes, noteFilters) {
  if (noteFilters.length === 0) {
    return true;
  }

  return noteFilters.some(filter => notes.some(note => note.includes(filter)));
}

function formatSpecifierList(specifiers) {
  return Array.from(specifiers)
    .sort((a, b) => a.localeCompare(b))
    .join(', ');
}
