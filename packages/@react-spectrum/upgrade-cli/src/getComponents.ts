import {parse} from '@babel/parser';
import {readFileSync} from 'fs';
import traverse from '@babel/traverse';

export function getComponents() {
  // Determine list of available components in S2 from index.ts
  let availableComponents = new Set();
  // TODO: this won't work once we publish the upgrade-cli (dir structure will be different).
  let index = parse(readFileSync(__dirname + '/../../s2/src/index.ts', 'utf8'), {sourceType: 'module', plugins: ['typescript']});
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
