import {Transformer} from '@parcel/plugin';
import {
  type CsfSourceMap,
  type ESTree,
  type ESTreeNode,
  type FunctionNode,
  type SourceEditor,
  appendStatement,
  appendToList,
  enrichCsf,
  formatCsf,
  isFunction,
  loadCsf,
  objectList,
  outerSpan,
  removeStatement,
  statementSpan,
  staticKey,
  textOf,
  wrapExpression
} from 'storybook/internal/csf-tools';
import path from 'path';
import crypto from 'crypto';
import {getClient, getCacheDir} from './react-docgen-typescript';
import {ComponentDoc} from 'react-docgen-typescript';
import SourceMap from '@parcel/source-map';

module.exports = new Transformer({
  async transform({asset, options}) {
    let docs: ComponentDoc | null = null;
    if (asset.type === 'ts' || asset.type === 'tsx') {
      let client = await getClient(options);
      docs = await client.getDocs(asset.filePath);
    }
    let code = await asset.getCode();
    let name = options.hmrOptions ? `$parcel$ReactRefresh$${asset.id.slice(-4)}` : null;
    let {code: compiledCode, map: compiledMap} = await processCsf(code, asset.filePath, docs, name);

    let map = new SourceMap(options.projectRoot);
    map.addVLQMap(compiledMap);

    // Invalidate the asset whenever any types change.
    asset.invalidateOnFileChange(path.join(getCacheDir(options), 'sentinel'));
    asset.setCode(compiledCode);
    asset.setMap(map);
    return [asset];
  }
});

async function processCsf(
  code: string,
  filePath: string,
  docs: ComponentDoc | null,
  refreshName: string | null
) {
  let csf = loadCsf(code, {
    fileName: filePath,
    makeTitle: title => title || 'default'
  }).parse();
  let editor = csf._editor;
  // The Fast Refresh wrapper goes first, so statements appended below land after the `;` it ends a
  // default export with, and not after an import it moves up.
  let closeRefresh = refreshName ? wrapRefresh(editor, filePath, refreshName) : null;
  await enrichCsf(csf, csf);

  // Story functions become components, so that React Fast Refresh can update them. Their code stays
  // where it is, and so does its source map.
  let components = new Map<FunctionNode, string>();
  // Components named inside an expression, which need a `var`.
  let variables: string[] = [];
  let addComponent = (fn: FunctionNode) => {
    // A template bound by several stories becomes one component.
    let name = components.get(fn);
    if (name) {
      return name;
    }
    name = 'Story' + components.size;
    components.set(fn, name);
    let [first] = fn.params;
    let params = first ? editor.code.slice(first.start, fn.params.at(-1)!.end) : '';
    let props = first?.type === 'Identifier' ? ` {...${first.name}}` : '';
    let element = `<${name}${props} />`;
    let parent = editor.parentOf(fn);
    if (fn.type === 'FunctionDeclaration' && fn.id) {
      // `function Primary(args) {…}` becomes a wrapper, followed by `function Story0(args) {…}`.
      editor.edits.appendRight(
        fn.start,
        `function ${fn.id.name}(${params}) {\n  return ${element};\n}\n`
      );
      editor.edits.update(fn.id.start, fn.id.end, name);
    } else if (parent?.type === 'VariableDeclarator' && parent.id.type === 'Identifier') {
      // `const Primary: Story = (args) => …` becomes
      // `const Primary = (args) => <Story0 {...args} />, Story0: Story = (args) => …`.
      let {id} = parent;
      editor.edits.update(
        id.start,
        id.start + id.name.length,
        `${id.name} = (${params}) => ${element}, ${name}`
      );
    } else {
      // `render: (args) => …` becomes `render: (Story0 = (args) => …, (args) => <Story0 {...args} />)`.
      variables.push(name);
      wrapExpression(editor, fn, `(${name} = `, `, (${params}) => ${element})`);
    }
    return name;
  };

  // The component a CSF 3 `render` function becomes. `render: Button` becomes
  // `render: args => <Button {...args} />`, so React renders `Button` instead of calling it.
  let renderComponent = (object: ESTree.ObjectExpression) => {
    let render = property(object, 'render');
    if (!render) {
      return;
    }
    let {value} = render;
    if (isFunction(value)) {
      if (render.method) {
        // `render(args) {…}` becomes `render: function (args) {…}`, which `addComponent` then
        // wraps like any `render` function.
        let keyword = `${value.async ? 'async ' : ''}function${value.generator ? '*' : ''} `;
        editor.edits.update(render.start, value.start, 'render: ');
        wrapExpression(editor, value, keyword, '');
      }
      return addComponent(value);
    }
    if (value.type === 'Identifier') {
      let span = render.shorthand ? render : outerSpan(value);
      let key = render.shorthand ? 'render: ' : '';
      editor.edits.update(span.start, span.end, `${key}args => <${value.name} {...args} />`);
    }
  };

  // Fast Refresh registers a story's `_internalComponent`, and bails out when its `_hash` changes.
  let register = (object: ESTree.ObjectExpression, hash: string) => {
    let component = renderComponent(object);
    let members = component ? [`_internalComponent: ${component}`] : [];
    appendToList(editor, objectList(editor, object), [...members, `_hash: "${hash}"`]);
  };

  let meta = csf._metaNodeIsSynthetic ? undefined : csf._metaNode;
  let statements: string[] = [];
  if (refreshName) {
    for (let name in csf._storyExports) {
      let node = csf.getStoryExport(name);
      // `story` is a legacy `Story.story = {…}`.
      let {args, parameters, story} = csf._storyAnnotations[name];
      let hash = md5(
        ...[args, parameters, story].flatMap(annotation => (annotation ? textOf(annotation) : []))
      );
      if (isFunction(node)) {
        // A CSF 2 function story.
        statements.push(
          `${name}._internalComponent = ${addComponent(node)};`,
          `${name}._hash = "${hash}";`
        );
      } else if (node?.type === 'ObjectExpression') {
        register(node, hash);
      }
    }
    if (meta) {
      register(meta, md5(textOf(meta), JSON.stringify(docs)));
    }
  }

  let component = meta && property(meta, 'component');
  if (docs && component && !component.method) {
    let {value} = component;
    let target = value.type === 'Identifier' ? value.name : `(${textOf(value)})`;
    statements.push(`${target}.__docgenInfo = ${JSON.stringify(docs)};`);
  }

  if (statements.length) {
    appendStatement(editor, statements.join('\n'));
  }
  closeRefresh?.(variables);

  return formatCsf(csf, {sourceMaps: true}) as {
    code: string;
    map: CsfSourceMap;
  };
}

function property(object: ESTree.ObjectExpression, key: string) {
  return object.properties.find(
    (p): p is ESTree.ObjectProperty =>
      p.type === 'Property' && p.kind === 'init' && staticKey(p) === key
  );
}

function md5(...texts: string[]) {
  let hash = crypto.createHash('md5');
  for (let text of texts) {
    hash.update(text);
  }
  return hash.digest('hex');
}

// Wrap the module for React Fast Refresh: imports and re-exports stay on top, the rest runs in a
// `try` between the refresh prelude and postlude, and every export goes through a variable that
// a final `export {…}` exports. The function it returns closes the `try` once the other edits
// are made, declaring the variables they assign.
function wrapRefresh(editor: SourceEditor, filePath: string, refreshName: string) {
  let {edits, code} = editor;
  let wrapperPath = `${path.relative(path.dirname(filePath), __dirname)}/csf-hmr.js`;
  let helpers = `${refreshName}$Helpers`;
  let exportVars: string[] = [];
  let exports: string[] = [];
  let exportVar = (exported: string) => {
    let name = refreshName + '$Export' + exportVars.length;
    exportVars.push(name);
    exports.push(`${name} as ${exported}`);
    return name;
  };

  let body = editor.program.body;
  let first = body.findIndex(statement => !staysOnTop(statement));
  let hoisted: string[] = [];
  body.forEach((statement, index) => {
    if (staysOnTop(statement)) {
      // Imports cannot go inside the `try`, so the ones below other code move up.
      if (first !== -1 && index > first) {
        hoisted.push(editor.source(statement));
        removeStatement(editor, statement);
      }
    } else if (statement.type === 'ExportNamedDeclaration') {
      let {declaration} = statement;
      if (declaration) {
        edits.update(statement.start, declaration.start, '');
        let assignments = bindingNames(declaration).map(id => `${exportVar(id)} = ${id};`);
        if (assignments.length) {
          edits.appendLeft(statement.end, `\n${assignments.join('\n')}`);
        }
      } else {
        let assignments = statement.specifiers
          .filter(specifier => specifier.exportKind !== 'type')
          .map(
            specifier => `${exportVar(textOf(specifier.exported))} = ${textOf(specifier.local)};`
          );
        edits.update(statement.start, statement.end, assignments.join('\n'));
      }
    } else if (statement.type === 'ExportDefaultDeclaration') {
      let {declaration} = statement;
      let variable = exportVar('default');
      if (
        (declaration.type === 'FunctionDeclaration' || declaration.type === 'ClassDeclaration') &&
        declaration.id
      ) {
        edits.update(statement.start, declaration.start, '');
        edits.appendLeft(statement.end, `\n${variable} = ${declaration.id.name};`);
      } else {
        edits.update(statement.start, outerSpan(declaration).start, `${variable} = `);
        if (code[statement.end - 1] !== ';') {
          edits.appendLeft(statement.end, ';');
        }
      }
    }
  });

  let start = first === -1 ? code.length : statementSpan(editor, body[first]).start;
  let header = [
    ...hoisted,
    `import * as ${helpers} from ${JSON.stringify(wrapperPath)};`,
    ...(exportVars.length ? [`var ${exportVars.join(', ')};`] : []),
    `var ${refreshName}$PrevRefreshReg = window.$RefreshReg$, ${refreshName}$PrevRefreshSig = window.$RefreshSig$;`,
    `${helpers}.prelude(module);`,
    'try {'
  ];
  edits.appendLeft(start, header.join('\n') + '\n');

  return (variables: string[]) => {
    if (variables.length) {
      edits.appendLeft(start, `var ${variables.join(', ')};\n`);
    }
    edits.append(
      [
        '',
        `${helpers}.postlude(module);`,
        '} finally {',
        `  window.$RefreshReg$ = ${refreshName}$PrevRefreshReg;`,
        `  window.$RefreshSig$ = ${refreshName}$PrevRefreshSig;`,
        '}',
        `export { ${exports.join(', ')} };`,
        ''
      ].join('\n')
    );
  };
}

// Directives, imports, re-exports and type declarations, which have to stay outside the `try`.
function staysOnTop(statement: ESTreeNode) {
  switch (statement.type) {
    case 'ExpressionStatement':
      return !!statement.directive;
    case 'ImportDeclaration':
    case 'ExportAllDeclaration':
    case 'TSImportEqualsDeclaration':
      return true;
    case 'ExportNamedDeclaration':
      return (
        statement.exportKind === 'type' ||
        !!statement.source ||
        declaresTypes(statement.declaration)
      );
    case 'ExportDefaultDeclaration':
      return declaresTypes(statement.declaration);
    default:
      return false;
  }
}

// Types, `declare`s and namespaces.
function declaresTypes(node: ESTreeNode | null) {
  switch (node?.type) {
    case 'TSInterfaceDeclaration':
    case 'TSTypeAliasDeclaration':
    case 'TSModuleDeclaration':
    case 'TSDeclareFunction':
      return true;
    default:
      return !!node && 'declare' in node && !!node.declare;
  }
}

// The names a declaration binds, such as `a` and `b` in `const {a, b: [b]} = value`.
function bindingNames(node: ESTreeNode | null | undefined): string[] {
  switch (node?.type) {
    case 'VariableDeclaration':
      return node.declarations.flatMap(declarator => bindingNames(declarator.id));
    case 'FunctionDeclaration':
    case 'ClassDeclaration':
    case 'TSEnumDeclaration':
      return node.id ? [node.id.name] : [];
    case 'Identifier':
      return [node.name];
    case 'ObjectPattern':
      return node.properties.flatMap(property =>
        bindingNames(property.type === 'RestElement' ? property : property.value)
      );
    case 'ArrayPattern':
      return node.elements.flatMap(element => bindingNames(element));
    case 'AssignmentPattern':
      return bindingNames(node.left);
    case 'RestElement':
      return bindingNames(node.argument);
    default:
      return [];
  }
}
