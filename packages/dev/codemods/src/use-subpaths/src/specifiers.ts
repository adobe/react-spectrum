/* eslint-disable max-depth */
import fs from 'fs';
import Module from 'module';
import {parse} from '@babel/parser';
import path from 'path';
import url from 'url';

export const MONOPACKAGE_ROOTS = [
  '@adobe/react-spectrum',
  '@react-spectrum/s2',
  'react-aria-components',
  'react-aria',
  'react-stately'
];

const specifiersByPackage: Record<string, Record<string, string[]>> = {};

/** Builds a mapping of monopackage -> export -> subpaths that contain the export. */
export function getSpecifiersByPackage(from: string) {
  for (let pkg of MONOPACKAGE_ROOTS) {
    if (specifiersByPackage[pkg]) {
      continue;
    }

    let dir: string;
    try {
      let pkgPath = path.dirname(
        Module.findPackageJSON(pkg, url.pathToFileURL(from || `${process.cwd()}/index`))!
      );
      dir = `${pkgPath}/dist/types/exports`;
      if (!fs.existsSync(dir)) {
        dir = `${pkgPath}/exports`;
      }

      if (!fs.existsSync(dir)) {
        continue;
      }
    } catch {
      continue;
    }

    let exports: Record<string, string[]> = {};
    for (let entry of fs.readdirSync(dir, {withFileTypes: true})) {
      if (entry.name === 'index.ts' || entry.name === 'index.d.ts' || !entry.isFile()) {
        continue;
      }

      let contents = fs.readFileSync(`${dir}/${entry.name}`, 'utf8');
      let ast = parse(contents, {
        sourceType: 'module',
        plugins: ['typescript']
      });

      let subpath = entry.name.replace(/(\.d)?\.ts$/, '');
      let importSpecifier = `${pkg}/${subpath}`;
      for (let node of ast.program.body) {
        if (node.type === 'ExportNamedDeclaration') {
          for (let specifier of node.specifiers) {
            if (specifier.type !== 'ExportSpecifier') {
              continue;
            }

            let exported =
              specifier.exported.type === 'Identifier'
                ? specifier.exported.name
                : specifier.exported.value;
            exports[exported] ??= [];
            if (exported.startsWith(subpath)) {
              exports[exported].unshift(importSpecifier);
            } else {
              exports[exported].push(importSpecifier);
            }
          }
        }
      }

      specifiersByPackage[pkg] = exports;
    }
  }

  return specifiersByPackage;
}
