import {parse} from '@babel/parser';
import path from 'path';
import {readFileSync} from 'fs';
import traverse from '@babel/traverse';

export function getComponents(): Set<string> {
  // Determine list of available components in S2 from index.ts
  let availableComponents = new Set<string>();
  const indexPath = process.env.NODE_ENV === 'test' ? path.resolve(__dirname, '../../../../../@react-spectrum/s2/src/index.ts') : require.resolve('@react-spectrum/s2/src/index.ts');
  let index = parse(readFileSync(indexPath, 'utf8'), {sourceType: 'module', plugins: ['typescript']});
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
