import {existsSync, readFileSync} from 'fs';
import {parse} from '@babel/parser';
const path = require('path');
import traverse from '@babel/traverse';

// These are exported but there are no codemods written for them yet.
// Don't replace imports yet.
const skipped = new Set(['Accordion', 'Card', 'CardView', 'ActionBar']);

export function getComponents(): Set<string> {
  // Determine list of available components in S2 from index.ts
  let availableComponents = new Set<string>();
  let indexPath: string;

  try {
    const packagePath = require.resolve('@react-spectrum/s2');
    indexPath = path.join(
      path.dirname(packagePath),
      process.env.NODE_ENV === 'test' ? 'index.ts' : '../../exports/index.ts'
    );
  } catch {
    const workspaceIndexPath = path.resolve(
      __dirname,
      '../../../../../@react-spectrum/s2/exports/index.ts'
    );
    if (!existsSync(workspaceIndexPath)) {
      throw new Error('Could not resolve @react-spectrum/s2 source for codemods.');
    }
    indexPath = workspaceIndexPath;
  }

  let index = parse(readFileSync(indexPath, 'utf8'), {
    sourceType: 'module',
    plugins: ['typescript']
  });
  traverse(index, {
    ExportNamedDeclaration(path) {
      if (path.node.exportKind === 'value') {
        for (let specifier of path.node.specifiers) {
          let name =
            specifier.exported.type === 'Identifier'
              ? specifier.exported.name
              : specifier.exported.value;
          if (!skipped.has(name)) {
            availableComponents.add(name);
          }
        }
      }
    }
  });

  return availableComponents;
}
