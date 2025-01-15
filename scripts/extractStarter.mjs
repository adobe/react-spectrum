/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/* eslint-disable */
import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
import glob from 'glob';
import fs from 'fs';
import {basename, resolve, dirname} from 'path';
import {visit} from 'unist-util-visit';
import recast from 'recast';
import traverse from '@babel/traverse';
import {parse} from '@babel/parser';
import * as t from '@babel/types';
import postcss from 'postcss';
import dprint from 'dprint-node';

fs.mkdirSync(`starters/docs/src`, {recursive: true});
fs.mkdirSync(`starters/docs/stories`, {recursive: true});

for (let file of glob.sync('packages/react-aria-components/docs/*.mdx')) {
  if (!/^[A-Z]/.test(basename(file)) || /^Tree|^Autocomplete/.test(basename(file))) {
    continue;
  }

  // Parse the MDX file, and extract the CSS and Reusable wrappers section.
  let contents = fs.readFileSync(file);
  let ast = unified().use(remarkParse).use(remarkMdx).parse(contents);

  let heading;
  let firstExample = '';
  let reusableWrapper = '';
  let imports = '';
  let css = '';
  visit(ast, node => {
    if (node.type === 'heading' && node.depth === 2) {
      heading = node.children[0].value;
    }

    if (node.type === 'code' && node.lang === 'tsx') {
      if (heading === 'Reusable wrappers') {
        reusableWrapper += node.value + '\n';
      } else if (heading === 'Example') {
        firstExample += node.value + '\n';
      }

      let m = node.value.match(/import .*? from .*?;/g);
      if (m) {
        imports += m.join('\n') + '\n\n';
      }
    }

    if (node.type === 'code' && node.lang === 'css' && !node.meta?.includes('render=false') && heading !== 'Advanced customization') {
      css += node.value + '\n\n';
    }
  });

  let name = basename(file, '.mdx');
  if (name === 'Table') {
    // Special case for Table which doesn't have a wrapper component in the docs.
    // We need one for the Storybook auto-generated docs to work.
    reusableWrapper = reusableWrapper
      .replace('<Table ', '<MyTable ').replace('/Table>', '/MyTable>')
      .replace('function MyColumn', `function MyTable(props: TableProps) {
  return <Table {...props} />
}

function MyColumn`);
  }

  let usedClasses = new Set();
  if (reusableWrapper) {
    fs.writeFileSync(`starters/docs/src/${name}.tsx`, processJS(file, imports + reusableWrapper, usedClasses));
    fs.writeFileSync(`starters/docs/stories/${name}.stories.tsx`, generateStory(file, imports, reusableWrapper));
  } else {
    console.log('No reusable wrapper section in ' + file);
    // A couple special cases to handle later.
    if (name !== 'DropZone' && name !== 'FileTrigger' && name !== 'Group') {
      fs.writeFileSync(`starters/docs/src/${name}.tsx`, generateWrapper(name));
      fs.writeFileSync(`starters/docs/stories/${name}.stories.tsx`, generateStory(file, imports, firstExample, true));
    }
  }

  if (name !== 'DropZone' && name !== 'FileTrigger' && name !== 'Group') {
    fs.writeFileSync(`starters/docs/src/${name}.css`, processCSS(css, usedClasses));
  }
}

let theme = fs.readFileSync('packages/@react-aria/example-theme/src/index.css', 'utf8');
theme = `/* Base styles */
:root {
  font-family: system-ui;
  font-size: 14px;
  line-height: 1.5;
  background: var(--background-color);
}

${theme}
`;
fs.writeFileSync('starters/docs/src/theme.css', theme);

for (let file of glob.sync('starters/docs/src/*.css')) {
  removeCircularDeps(file);
}

/** Processes the JS code for a "Reusable wrappers" example from the docs. */
function processJS(sourceFilename, code, usedClasses) {
  if (/^<(.|\n)*>$/m.test(code)) {
    code = code.replace(/^(<(.|\n)*>)$/m, '').trim() + '\n';
  }

  let ast = recast.parse(code, {
    parser: {
      parse() {
        return parse(code, {
          sourceFilename,
          sourceType: 'module',
          plugins: ['jsx', 'typescript'],
          tokens: true,
          errorRecovery: true
        });
      }
    }
  });

  removeDuplicateImports(ast);

  // Remove unused imports, add exports.
  let imports = new Map();
  let component = basename(sourceFilename, '.mdx');
  let importsToAppend = [t.importDeclaration([], t.stringLiteral(`./${component}.css`))];
  traverse.default(ast, {
    'ImportSpecifier|ImportDefaultSpecifier'(specifier) {
      let binding = specifier.scope.getBinding(specifier.node.local.name);
      if (binding?.referencePaths.length === 0) {
        specifier.remove();
      }
    },
    ImportDeclaration: {
      exit(path) {
        if (path.node.source.value.endsWith('.css')) {
          return;
        }

        if (path.node.specifiers.length === 0) {
          path.remove();
        } else if (imports.has(path.node.source.value)) {
          // merge imports with the same source
          imports.get(path.node.source.value).pushContainer('specifiers', path.node.specifiers);
          path.remove();
          path.scope.crawl();
        } else {
          imports.set(path.node.source.value, path);
        }
      }
    },
    'FunctionDeclaration|TSInterfaceDeclaration': {
      exit(path) {
        // GridList/Table define their own checkboxes, but we can share the one from the Checkbox docs.
        if (path.node.id.name === 'MyCheckbox' && component !== 'Checkbox') {
          path.scope.getBinding('Checkbox')?.path.remove();
          path.scope.getBinding('CheckboxProps')?.path.remove();
          path.scope.rename('MyCheckbox', 'Checkbox');
          if (path.scope.getBinding('Checkbox').referencePaths.length > 0) {
            importsToAppend.unshift(t.importDeclaration([t.importSpecifier(t.identifier('Checkbox'), t.identifier('Checkbox'))], t.stringLiteral('./Checkbox')));
          }
          path.remove();
          return;
        }

        // Rename wrappers from `MyXXX` to just `XXX`.
        if (path.node.id.name.startsWith('My')) {
          let name = path.node.id.name.slice(2);
          if (name === 'Item') {
            name = basename(sourceFilename, '.mdx') + 'Item';
          }

          // If the name already exists (e.g. the RAC import), rename that to `AriaXXX`.
          let binding = path.scope.getBinding(name);
          if (binding) {
            if (binding.path.isImportSpecifier()) {
              binding.path.replaceWith(t.cloneNode(binding.path.node));
            }
            path.scope.rename(name, 'Aria' + name);
          }

          path.scope.rename(path.node.id.name, name);
        }

        path.replaceWith(t.exportNamedDeclaration(path.node));
        path.skip();
      }
    },
    JSXAttribute(path) {
      if (path.node.name.name === 'className') {
        // Remove className prop from RAC components (not DOM elements).
        // Otherwise, track used classes so we can remove unused ones from the CSS.
        if (/^[A-Z]/.test(path.parent.name.name) && !/color-picker/.test(path.node.value?.value)) {
          path.remove();
        } else if (t.isStringLiteral(path.node.value)) {
          for (let c of path.node.value.value.split(/\s+/)) {
            usedClasses.add(c);
          }
        }
      }
    },
    Program: {
      exit(path) {
        // Add import for the CSS file.
        let lastImport = path.get('body').filter(p => p.isImportDeclaration()).pop();
        lastImport.insertAfter(importsToAppend);
      }
    }
  });

  code = recast.print(ast, {objectCurlySpacing: false, quote: 'single'}).code;
  return dprint.format(`${component}.tsx`, code, {
    quoteStyle: 'preferSingle',
    'jsx.quoteStyle': 'preferDouble',
    trailingCommas: 'never',
    'importDeclaration.spaceSurroundingNamedImports': false
  });
}

/** Processes the docs CSS. Removes empty rules, merges adjacent rules, removes unused selectors, and rewrites imports. */
function processCSS(css, usedClasses) {
  let ast = postcss.parse(css);

  ast.walkRules(rule => {
    if (rule.nodes.length === 0 || rule.nodes.every(node => node.type === 'comment')) {
      rule.remove();
    } else {
      let prev = rule.prev();
      if (prev?.type === 'rule' && prev.selector === rule.selector) {
        rule.nodes[0].raws.before = '\n' + rule.nodes[0].raws.before;
        prev.nodes.push(...rule.nodes);
        rule.remove();
      } else if (rule.selectors.every(s => !s.startsWith('.react-aria-') && s[0] === '.' && !usedClasses.has(s.slice(1).split(' ')[0]))) {
        console.log('Removing unused rule ' + rule.selector);
        rule.remove();
      }
    }
  });

  ast.walkAtRules('import', rule => {
    rule.params = rule.params
      .replace(/\.mdx(["'])/, '.css$1')
      .replace('@react-aria/example-theme', './theme.css')
      .replace(/\s*layer\(.*?\)/, '');
    if (rule.prev()?.type === 'atrule') {
      rule.raws.before = '\n';
    }
  });

  ast.walkAtRules('media', rule => {
    if (rule.nodes.length === 0 || rule.nodes.every(node => node.type === 'comment')) {
      rule.remove();
    }
  })

  return ast.toString().trim() + '\n';
}

/** Generates a storybook story for a "Reusable wrappers" example from the docs. */
function generateStory(filename, imports, code, skipImports = false) {
  // Match the JSX part of the code.
  let example = code.match(/^(<(.|\n)*>)$/m, '');
  if (!example) {
    return '';
  }

  let name = basename(filename, '.mdx');
  code = imports + `
import type {Meta} from '@storybook/react';

const meta: Meta<typeof ${name}> = {
  component: ${name},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs']
};

export default meta;

export const Example = () => (
  ${example[0].replace(/\n/g, '\n  ')}
);
`;

  let ast = recast.parse(code, {
    parser: {
      parse() {
        return parse(code, {
          sourceType: 'module',
          plugins: ['jsx', 'typescript'],
          tokens: true,
          errorRecovery: true
        });
      }
    }
  });

  removeDuplicateImports(ast);

  let imported = new Set();
  if (skipImports) {
    imported.add(name);
  }

  let args = new Map();
  if (name === 'ListBox' || name === 'GridList') {
    // Avoid onAction getting a storybook control, which changes the selection behavior.
    args.set('onAction', t.nullLiteral());
  } else if (name === 'Table') {
    args.set('onRowAction', t.nullLiteral());
  }

  traverse.default(ast, {
    'ImportSpecifier|ImportDefaultSpecifier'(specifier) {
      let binding = specifier.scope.getBinding(specifier.node.local.name);
      if (binding?.referencePaths.length === 0 || (skipImports && specifier.node.local.name === name)) {
        specifier.remove();
      }
    },
    ReferencedIdentifier(path) {
      if (path.node.name === 'Meta' || !/^[A-Z]/.test(path.node.name)) {
        return;
      }

      if (!path.scope.getBinding(path.node.name) && !skipImports) {
        if (path.node.name === 'MyItem') {
          path.node.name = name + 'Item';
        } else if (path.node.name.startsWith('My')) {
          path.node.name = path.node.name.slice(2);
        }

        let binding = path.scope.getBinding(path.node.name);
        if (binding) {
          binding.path.remove();
        }

        imported.add(path.node.name);
      }
    },
    JSXAttribute(path) {
      if (path.parent.name.name === name && !path.node.name.name.includes('-')) {
        args.set(path.node.name.name, t.isJSXExpressionContainer(path.node.value) ? path.node.value.expression : path.node.value);
        path.remove();
      }
    },
    JSXOpeningElement: {
      exit(path) {
        if (path.node.name.name === name) {
          path.pushContainer('attributes', t.jsxSpreadAttribute(t.identifier('args')));
        }
      }
    },
    ExportNamedDeclaration: {
      exit(path) {
        if (path.get('declaration.declarations.0.init').isArrowFunctionExpression()) {
          let param = t.identifier('args');
          param.typeAnnotation = t.tsTypeAnnotation(t.tsAnyKeyword()); // real prop type might have generics we don't know about
          path.get('declaration.declarations.0.init').pushContainer('params', param);

          if (args.size > 0) {
            path.insertAfter(t.expressionStatement(t.assignmentExpression(
              '=',
              t.memberExpression(t.identifier('Example'), t.identifier('args')),
              t.objectExpression([...args].map(([key, value]) =>
                t.objectProperty(t.identifier(key), value)
              ))
            )));
          }
        }
      }
    },
    Program: {
      exit(path) {
        for (let stmt of path.get('body')) {
          if (stmt.isImportDeclaration() && stmt.node.specifiers.length === 0) {
            stmt.remove();
          }
        }

        // Special case for Checkbox in a CheckboxGroup. Reuse the same instance from the Checkbox docs.
        let imports = [];
        if (imported.has('Checkbox') && name !== 'Checkbox') {
          imported.delete('Checkbox');
          imports.push(
            t.importDeclaration(
              [t.importSpecifier(t.identifier('Checkbox'), t.identifier('Checkbox'))],
              t.stringLiteral('../src/Checkbox')
            )
          );
        }

        imports.push(
          t.importDeclaration(
            [...imported].map(i => t.importSpecifier(t.identifier(i), t.identifier(i))),
            t.stringLiteral(`../src/${name}`)
          )
        );

        let [p] = path.unshiftContainer('body', imports);
        p.skip();
      }
    }
  });

  code = recast.print(ast, {objectCurlySpacing: false, quote: 'single'}).code;
  return dprint.format(`${name}.tsx`, code, {
    quoteStyle: 'preferSingle',
    'jsx.quoteStyle': 'preferDouble',
    trailingCommas: 'never',
    'importDeclaration.spaceSurroundingNamedImports': false
  });
}

/** Removes duplicate import statements from a babel ast. */
function removeDuplicateImports(ast) {
  let declared = new Set();
  traverse.default(ast, {
    noScope: true,
    ImportSpecifier(specifier) {
      if (declared.has(specifier.node.local.name)) {
        specifier.remove();
      } else {
        declared.add(specifier.node.local.name);
      }
    }
  });
}

/** Removes circular dependencies from the CSS, which breaks webpack. */
function removeCircularDeps(file, seen = new Set()) {
  let ast = postcss.parse(fs.readFileSync(file, 'utf8'));

  let deps = new Set();
  let modified = false;
  ast.walkAtRules('import', rule => {
    let dep = resolve(dirname(file), rule.params.match(/['"](.*?)['"]/)[1]);
    if (seen.has(dep)) {
      console.log(`removing circular dep ${rule.params} in ${file}`);
      rule.remove();
      modified = true;
    } else {
      deps.add(dep);
    }
  });

  if (modified) {
    fs.writeFileSync(file, ast.toString());
  }

  seen.add(file);
  for (let dep of deps) {
    removeCircularDeps(dep, seen);
  }
  seen.delete(file);
}

/** Generates a wrapper component when there is no Reusable wrappers section */
function generateWrapper(name) {
  let typeName = `${name}Props`;
  if (name === 'Modal') {
    typeName = 'ModalOverlayProps';
  }

  let typeParams = '';
  let generic = '';
  if (name === 'Breadcrumbs') {
    typeParams = '<T extends object>';
    generic = '<T>';
  }

  return `import {${name} as RAC${name}, ${typeName}} from 'react-aria-components';
import './${name}.css';

export function ${name}${typeParams}(props: ${typeName}${generic}) {
  return <RAC${name} {...props} />;
}
`
}
