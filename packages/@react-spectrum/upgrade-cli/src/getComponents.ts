import traverse from '@babel/traverse';
import {parse} from '@babel/parser';
import {readFileSync} from 'fs';

export function getComponents() {
  // Determine list of available components in S2 from index.ts
  let availableComponents = new Set();
  let index = parse(readFileSync(__dirname + '/../../src/index.ts', 'utf8'), {sourceType: 'module', plugins: ['typescript']});
  traverse(index, {
    ExportNamedDeclaration(path) {
      if (path.node.exportKind === 'value') {
        for (let specifier of path.node.specifiers) {
          availableComponents.add(specifier.exported.type === 'Identifier' ? specifier.exported.name : specifier.exported.value);
        }
      }
    }
  });

  return availableComponents;
}
