import {Transformer} from '@parcel/plugin';
import {
  type CsfFile,
  type ESTree,
  type ESTreeNode,
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
    map.addVLQMap(compiledMap as Parameters<SourceMap['addVLQMap']>[0]);

    // Invalidate the asset whenever any types change.
    asset.invalidateOnFileChange(path.join(getCacheDir(options), 'sentinel'));
    asset.setCode(compiledCode);
    asset.setMap(map);
    return [asset];
  }
});

type AnyFunction = ESTree.Function | ESTree.ArrowFunctionExpression;

// The edits are text edits on the file Storybook parsed, so code they do not touch keeps its
// source map. Text inserted at an offset goes after what was inserted there before, so the edits
// that wrap code go first. The edits that wrap the module for Fast Refresh come next: removing or
// overwriting text also drops what was inserted in it or at its edges, and none of the edits
// before touch those ranges. Statements are appended last, after the statements that were removed.
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

  // The variables whose value is a function, which can be renamed in place.
  let declarators = new Map<ESTreeNode, ESTreeNode>();
  for (let statement of csf._program.body) {
    let declaration =
      statement.type === 'ExportNamedDeclaration' ? statement.declaration : statement;
    if (declaration?.type === 'VariableDeclaration') {
      for (let declarator of declaration.declarations) {
        if (declarator.id.type === 'Identifier' && declarator.init && isFunction(declarator.init)) {
          declarators.set(declarator.init, declarator);
        }
      }
    }
  }
  // Extract story functions into separate components. This enables React Fast Refresh to work properly.
  let components = new Map<ESTreeNode, string>();
  // Components extracted from expressions are assigned inside them, so they need variables.
  let variables: string[] = [];
  // The wrapper that renders a component with the props the story function got.
  let wrapperOf = (fn: AnyFunction, name: string) => {
    let [first] = fn.params;
    let params = first ? csf._code.slice(first.start, fn.params.at(-1)!.end) : '';
    let props = first?.type === 'Identifier' ? ` {...${first.name}}` : '';
    return {params, element: `<${name}${props} />`};
  };
  let addComponent = (fn: AnyFunction) => {
    let name = components.get(fn);
    if (name) {
      return name;
    }
    name = 'Story' + components.size;
    components.set(fn, name);
    let {params, element} = wrapperOf(fn, name);
    let declarator = declarators.get(fn);
    if (fn.type === 'FunctionDeclaration' && fn.id) {
      // `function Primary(args) {…}` becomes a wrapper, followed by `function Story0(args) {…}`.
      editor.edits.appendRight(
        fn.start,
        `function ${fn.id.name}(${params}) {\n  return ${element};\n}\n`
      );
      editor.edits.overwrite(fn.id.start, fn.id.end, name);
    } else if (declarator) {
      // `const Primary = (args) => …` becomes
      // `const Story0 = (args) => …, Primary = (args) => <Story0 {...args} />`.
      let {id} = declarator as {id: ESTree.IdentifierName};
      editor.edits.overwrite(id.start, id.start + id.name.length, name);
      editor.edits.appendLeft(declarator.end, `, ${id.name} = (${params}) => ${element}`);
    } else {
      // `render: (args) => …` becomes `render: (Story0 = (args) => …, (args) => <Story0 {...args} />)`.
      variables.push(name);
      wrapExpression(editor, fn, `(${name} = `, `, (${params}) => ${element})`);
    }
    return name;
  };

  let handleRenderProperty = (node: ESTree.ObjectExpression, members: string[]) => {
    // CSF 3 style object story. Extract render function into a component.
    let render = node.properties.find(
      (p): p is ESTree.ObjectProperty => p.type === 'Property' && staticKey(p) === 'render'
    );
    if (!render) {
      return;
    }
    let value = render.value as ESTreeNode;
    if (render.method) {
      let fn = value as ESTree.Function;
      if (render.kind !== 'init' || fn.async || fn.generator) {
        return;
      }
      // `render(args) {…}` becomes `render: (Story0 = function Story0(args) {…}, …)`.
      let name = 'Story' + components.size;
      components.set(fn, name);
      variables.push(name);
      let {params, element} = wrapperOf(fn, name);
      editor.edits.overwrite(render.start, fn.start, `render: (${name} = function ${name}`);
      editor.edits.appendLeft(render.end, `, (${params}) => ${element})`);
      members.push(`_internalComponent: ${name}`);
    } else if (isFunction(value)) {
      members.push(`_internalComponent: ${addComponent(value)}`);
    } else if (value.type === 'Identifier') {
      let span = render.shorthand ? render : outerSpan(value);
      let key = render.shorthand ? 'render: ' : '';
      editor.edits.overwrite(span.start, span.end, `${key}args => <${value.name} {...args} />`);
    }
  };
  let statements: string[] = [];
  if (refreshName) {
    for (let name in csf._storyExports) {
      let node = csf.getStoryExport(name);

      // Generate a hash of the args and parameters. If this changes, we bail out of Fast Refresh.
      let annotations = csf._storyAnnotations[name];
      let storyHash = '';
      if (annotations) {
        let hash = crypto.createHash('md5');
        // Storybook 11 keeps a legacy `Story.story = {parameters}` as a `story` annotation, where
        // Storybook 10 spread its members into the other annotations.
        for (let key of ['args', 'parameters', 'story']) {
          let annotation = annotations[key];
          if (annotation) {
            hash.update(textOf(annotation));
          }
        }
        storyHash = hash.digest('hex');
      }

      if (isFunction(node)) {
        // CSF 2 style function story.
        let c = addComponent(node);
        statements.push(`${name}._internalComponent = ${c};`);
        if (storyHash) {
          statements.push(`${name}._hash = ${JSON.stringify(storyHash)};`);
        }
      } else if (node?.type === 'ObjectExpression') {
        let members: string[] = [];
        handleRenderProperty(node, members);
        if (storyHash) {
          members.push(`_hash: ${JSON.stringify(storyHash)}`);
        }
        if (members.length) {
          appendToList(editor, objectList(editor, node), members);
        }
      }
    }
  }

  let meta = csf._metaNodeIsSynthetic ? undefined : csf._metaNode;
  if (meta) {
    if (docs) {
      let component = meta.properties.find(
        (p): p is ESTree.ObjectProperty =>
          p.type === 'Property' && !p.method && staticKey(p) === 'component'
      );
      if (component) {
        let value = component.value as ESTreeNode;
        let target =
          value.type === 'Identifier' || (value.type === 'MemberExpression' && !value.optional)
            ? textOf(value)
            : `(${textOf(value)})`;
        statements.push(`${target}.__docgenInfo = ${JSON.stringify(docs)};`);
      }
    }

    if (refreshName) {
      // Hash the default export to invalidate Fast Refresh.
      let members: string[] = [];
      handleRenderProperty(meta, members);
      let hash = crypto.createHash('md5');
      hash.update(textOf(meta));
      hash.update(JSON.stringify(docs));
      members.push(`_hash: ${JSON.stringify(hash.digest('hex'))}`);
      appendToList(editor, objectList(editor, meta), members);
    }
  }

  let closeRefresh = refreshName ? wrapRefresh(csf, filePath, refreshName) : null;

  await enrichCsf(csf, csf);

  if (statements.length) {
    csf._appendStatement(statements.join('\n'));
  }
  closeRefresh?.(variables);

  return formatCsf(csf, {sourceMaps: true, sourceFileName: filePath}) as {
    code: string;
    map: object;
  };
}

// Wrap the module for React Fast Refresh: imports and re-exports stay on top, the rest runs in a
// `try` between the refresh prelude and postlude, and every export goes through a variable that
// a final `export {…}` exports.
function wrapRefresh(csf: CsfFile, filePath: string, refreshName: string) {
  let editor = csf._editor;
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

  let body = csf._program.body;
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
        edits.remove(statement.start, declaration.start);
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
        if (assignments.length) {
          edits.overwrite(statement.start, statement.end, assignments.join('\n'));
        } else {
          edits.remove(statement.start, statement.end);
        }
      }
    } else if (statement.type === 'ExportDefaultDeclaration') {
      let declaration = statement.declaration as ESTreeNode;
      let variable = exportVar('default');
      if (
        (declaration.type === 'FunctionDeclaration' || declaration.type === 'ClassDeclaration') &&
        declaration.id
      ) {
        edits.remove(statement.start, declaration.start);
        edits.appendLeft(statement.end, `\n${variable} = ${declaration.id.name};`);
      } else {
        edits.overwrite(statement.start, outerSpan(declaration).start, `${variable} = `);
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

  // Close the `try`, once every other edit is made.
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

// Directives, imports, re-exports and type-only exports, which have to stay outside the `try`.
function staysOnTop(statement: ESTreeNode) {
  switch (statement.type) {
    case 'ExpressionStatement':
      return !!(statement as {directive?: string}).directive;
    case 'ImportDeclaration':
    case 'ExportAllDeclaration':
    case 'TSImportEqualsDeclaration':
      return true;
    case 'ExportNamedDeclaration':
      return (
        statement.exportKind === 'type' ||
        !!statement.source ||
        !!(statement.declaration as {declare?: boolean} | null)?.declare ||
        isTypeDeclaration(statement.declaration)
      );
    case 'ExportDefaultDeclaration':
      return isTypeDeclaration(statement.declaration as ESTreeNode);
    default:
      return false;
  }
}

function isTypeDeclaration(node: ESTreeNode | null | undefined) {
  return (
    node?.type === 'TSInterfaceDeclaration' ||
    node?.type === 'TSTypeAliasDeclaration' ||
    node?.type === 'TSModuleDeclaration' ||
    node?.type === 'TSDeclareFunction'
  );
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
