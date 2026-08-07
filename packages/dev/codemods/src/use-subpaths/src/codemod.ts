/* eslint-disable max-depth */
import {API, FileInfo} from 'jscodeshift';
import {getSpecifiersByPackage, MONOPACKAGE_ROOTS} from './specifiers';
import {parse} from '@babel/parser';
import {parse as recastParse} from 'recast';
import * as t from '@babel/types';

function getImportedName(specifier: t.ImportSpecifier): string {
  return specifier.imported.type === 'Identifier'
    ? specifier.imported.name
    : specifier.imported.value;
}

function getImportKey(specifier: t.ImportSpecifier): string {
  const importedName = getImportedName(specifier);
  const localName = specifier.local?.name ?? importedName;
  const importKind = specifier.importKind ?? 'value';
  return `${importKind}:${importedName}:${localName}`;
}

function getImportDeclarationKey(node: t.ImportDeclaration): string {
  return (node.importKind ?? 'value') + ':' + node.source.value;
}

function getNamedSpecifierKeys(importDeclaration: t.ImportDeclaration): Set<string> {
  let keys = new Set<string>();
  for (let specifier of importDeclaration.specifiers ?? []) {
    if (specifier.type === 'ImportSpecifier') {
      keys.add(getImportKey(specifier));
    }
  }

  return keys;
}

function createImportDeclaration(
  source: string,
  importKind: t.ImportSpecifier['importKind'],
  specifiers: t.ImportSpecifier[]
): t.ImportDeclaration {
  let declaration = t.importDeclaration(specifiers, t.stringLiteral(source));
  declaration.importKind = importKind ?? 'value';
  return declaration;
}

function resolveTargetSource(
  candidates: string[],
  uniqueSources: Set<string>,
  existingImports: Map<string, any>
): string {
  // Group with the first unique source that contained a candidate.
  // For example if you imported ListBox, ActionGroup, and Item, Item would be grouped with ListBox.
  for (let source of uniqueSources) {
    if (candidates.includes(source)) {
      return source;
    }
  }

  // Group with an already existing import.
  for (let source of existingImports.keys()) {
    if (candidates.includes(source)) {
      return source;
    }
  }

  return candidates[0];
}

function moduleAugmentsRouterConfig(body: t.TSModuleBlock): boolean {
  for (let stmt of body.body) {
    if (
      stmt.type === 'TSInterfaceDeclaration' &&
      stmt.id.type === 'Identifier' &&
      stmt.id.name === 'RouterConfig'
    ) {
      return true;
    }

    if (
      stmt.type === 'ExportNamedDeclaration' &&
      stmt.declaration?.type === 'TSInterfaceDeclaration' &&
      stmt.declaration.id.type === 'Identifier' &&
      stmt.declaration.id.name === 'RouterConfig'
    ) {
      return true;
    }
  }

  return false;
}

export default function transformer(file: FileInfo, api: API): string {
  let specifiersByPackage = getSpecifiersByPackage(file.path);
  let j = api.jscodeshift.withParser({
    parse(source: string) {
      return recastParse(source, {
        parser: {
          parse(innerSource: string) {
            return parse(innerSource, {
              sourceType: 'module',
              plugins: [
                'jsx',
                'typescript',
                'importAssertions',
                'dynamicImport',
                'decorators-legacy',
                'classProperties',
                'classPrivateProperties',
                'classPrivateMethods',
                'exportDefaultFrom',
                'exportNamespaceFrom',
                'objectRestSpread',
                'optionalChaining',
                'nullishCoalescingOperator',
                'topLevelAwait'
              ],
              tokens: true,
              errorRecovery: true
            });
          }
        }
      });
    }
  });

  let root = j(file.source);
  let program = root.get().node.program as t.Program;
  let uniqueSources = new Set<string>();
  let existingImports = new Map<string, t.ImportDeclaration>();
  let didChange = false;

  for (let node of program.body) {
    if (node.type === 'ImportDeclaration') {
      let source = node.source.value;
      if (typeof source !== 'string') {
        continue;
      }

      existingImports.set(getImportDeclarationKey(node), node);

      if (source in specifiersByPackage) {
        let sourceMap = specifiersByPackage[source];
        for (let specifier of node.specifiers ?? []) {
          if (specifier.type !== 'ImportSpecifier') {
            continue;
          }

          let importedName = getImportedName(specifier);
          let candidates = sourceMap[importedName];
          if (
            candidates &&
            (candidates.length === 1 || candidates[0] === `${source}/${importedName}`)
          ) {
            let importKind = node.importKind || 'value';
            uniqueSources.add(importKind + ':' + candidates[0]);
          }
        }
      }
    }

    if (node.type === 'TSModuleDeclaration' && node.declare && node.id.type === 'StringLiteral') {
      let mod = node.id.value;
      if (
        !MONOPACKAGE_ROOTS.includes(mod) ||
        node.body?.type !== 'TSModuleBlock' ||
        !moduleAugmentsRouterConfig(node.body)
      ) {
        continue;
      }

      let target = `${mod}/Provider`;
      let candidates = specifiersByPackage[mod]?.Provider;
      if (!candidates?.includes(target)) {
        continue;
      }

      node.id = t.stringLiteral(target);
      didChange = true;
    }
  }

  program.body = program.body.flatMap(node => {
    if (node.type !== 'ImportDeclaration') {
      return [node];
    }

    let source = node.source.value;
    if (typeof source !== 'string' || !(source in specifiersByPackage)) {
      return [node];
    }

    let importDeclaration = node;
    let sourceMap = specifiersByPackage[node.source.value];
    let movedSpecifiersBySource = new Map<string, any[]>();

    importDeclaration.specifiers = importDeclaration.specifiers.filter(specifier => {
      if (specifier.type !== 'ImportSpecifier') {
        return true;
      }

      let importedName = getImportedName(specifier);
      let candidates = sourceMap[importedName];
      if (!candidates || candidates.length === 0) {
        return true;
      }

      let importKind = node.importKind || 'value';
      let targetSource =
        candidates.length === 1
          ? importKind + ':' + candidates[0]
          : resolveTargetSource(
              candidates.map(c => importKind + ':' + c),
              uniqueSources,
              existingImports
            );

      let movedSpecifiers = movedSpecifiersBySource.get(targetSource) ?? [];
      movedSpecifiers.push(t.cloneNode(specifier, true));
      movedSpecifiersBySource.set(targetSource, movedSpecifiers);
      didChange = true;
      return false;
    });

    if (movedSpecifiersBySource.size === 0) {
      return [node];
    }

    let newDeclarations: t.Statement[] = [];
    if (importDeclaration.specifiers.length > 0) {
      newDeclarations.push(node);
    }

    for (let [targetSource, movedSpecifiers] of movedSpecifiersBySource) {
      let destinationImport = existingImports.get(targetSource);

      if (!destinationImport) {
        destinationImport = createImportDeclaration(
          targetSource.slice(targetSource.indexOf(':') + 1),
          importDeclaration.importKind,
          []
        );
        newDeclarations.push(destinationImport);
        existingImports.set(targetSource, destinationImport);
      }

      let existingSpecifierKeys = getNamedSpecifierKeys(destinationImport);
      for (let movedSpecifier of movedSpecifiers) {
        let key = getImportKey(movedSpecifier);
        if (!existingSpecifierKeys.has(key)) {
          destinationImport.specifiers.push(movedSpecifier);
          existingSpecifierKeys.add(key);
        }
      }
    }

    return newDeclarations;
  });

  return didChange ? root.toSource({quote: 'single'}) : file.source;
}
