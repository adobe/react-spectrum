import {Transformer} from '@parcel/plugin';
import {enrichCsf, formatCsf, loadCsf} from 'storybook/internal/csf-tools';
import {parse} from '@babel/parser';
import generate, {type GeneratorOptions} from '@babel/generator';
import * as t from '@babel/types';
import path from 'path';
import crypto from 'crypto';
import {getClient, getCacheDir} from './react-docgen-typescript';
import {ComponentDoc} from 'react-docgen-typescript';
import SourceMap from '@parcel/source-map';

// Storybook parses the story file, adds its docs, and says where the stories and the meta are.
// Everything else edits our own Babel parse: Storybook 10 exposes Babel nodes and Storybook 11
// ESTree nodes, so only the offsets of Storybook's nodes are read, which mean the same in both.

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
    if (compiledMap) {
      map.addVLQMap(compiledMap);
    }

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
): Promise<{code: string; map: any}> {
  // Storybook 11 reads offsets in code whose line endings it normalized to \n, and Storybook 10 in
  // the code as given; normalizing first makes them index the same text as our own parse.
  code = code.replace(/\r\n?/g, '\n');
  let makeTitle = (title: string) => title || 'default';
  let csf = loadCsf(code, {fileName: filePath, makeTitle}).parse();

  // Hash the args and parameters as written, before docs parameters are added.
  let storyHashes: Record<string, string> = {};
  for (let name in csf._storyExports) {
    let annotations = csf._storyAnnotations[name];
    if (annotations) {
      let hash = crypto.createHash('md5');
      // Storybook 11 keeps a legacy `Story.story = {parameters}` as `story`, where Storybook 10
      // spread it into the other annotations.
      for (let key of ['args', 'parameters', 'story']) {
        let annotation = annotations[key];
        if (annotation) {
          hash.update(code.slice(annotation.start!, annotation.end!));
        }
      }
      storyHashes[name] = hash.digest('hex');
    }
  }
  let metaSource = csf._metaNode ? code.slice(csf._metaNode.start!, csf._metaNode.end!) : null;

  await enrichCsf(csf, csf);
  let enriched = formatCsf(csf, {
    sourceFileName: filePath,
    sourceMaps: true,
    // Storybook 10 prints with Babel, which needs this to print import attributes.
    importAttributesKeyword: 'with'
  } as Parameters<typeof formatCsf>[1]) as {code: string; map: any};
  if (!docs && !refreshName) {
    return enriched;
  }

  // Storybook finds the stories and the meta in the enriched code, and we look up the Babel nodes
  // at the same offsets in our own parse of it.
  csf = loadCsf(enriched.code, {fileName: filePath, makeTitle}).parse();
  let ast = parse(enriched.code, {
    sourceType: 'module',
    sourceFilename: filePath,
    plugins: [
      'jsx',
      'decorators-legacy',
      'classProperties',
      /^\s*\/\/\s*@flow/.test(enriched.code) ? 'flow' : 'typescript'
    ]
  });
  let nodes = nodesBySpan(ast.program);
  let nodeAt = <T extends t.Node>(
    span: {start?: number | null; end?: number | null} | undefined,
    is: (node: t.Node) => node is T
  ): T | undefined => nodes.get(`${span?.start}:${span?.end}`)?.find(is);

  // Extract story functions into separate components. This enables React Fast Refresh to work properly.
  let count = 0;
  let addComponent = (node: t.Function) => {
    let name = 'Story' + count++;
    ast.program.body.push(
      t.functionDeclaration(
        t.identifier(name),
        node.params.map(p => t.cloneNode(p)),
        t.isExpression(node.body) ? t.blockStatement([t.returnStatement(node.body)]) : node.body
      ) as any
    );
    node.body = t.blockStatement([
      t.returnStatement(
        t.jsxElement(
          t.jsxOpeningElement(
            t.jsxIdentifier(name),
            node.params.length && t.isIdentifier(node.params[0])
              ? [t.jsxSpreadAttribute(t.cloneNode(node.params[0]))]
              : [],
            true
          ),
          null,
          [],
          true
        )
      )
    ]);
    return name;
  };

  let handleRenderProperty = (node: t.ObjectExpression) => {
    // CSF 3 style object story. Extract render function into a component.
    let render = node.properties.find(
      p =>
        (t.isObjectProperty(p) || t.isObjectMethod(p)) &&
        t.isIdentifier(p.key) &&
        p.key.name === 'render'
    );
    if (render?.type === 'ObjectProperty' && t.isFunction(render.value)) {
      let c = addComponent(render.value);
      node.properties.push(t.objectProperty(t.identifier('_internalComponent'), t.identifier(c)));
    } else if (render?.type === 'ObjectMethod') {
      let c = addComponent(render);
      node.properties.push(t.objectProperty(t.identifier('_internalComponent'), t.identifier(c)));
    } else if (t.isObjectProperty(render) && render.value.type === 'Identifier') {
      render.value = t.arrowFunctionExpression(
        [t.identifier('args')],
        t.jsxElement(
          t.jsxOpeningElement(
            t.jsxIdentifier(render.value.name),
            [t.jsxSpreadAttribute(t.identifier('args'))],
            true
          ),
          null,
          [],
          true
        )
      );
    }
  };

  if (refreshName) {
    for (let name in csf._storyExports) {
      let node = nodeAt(
        csf.getStoryExport(name),
        (n): n is t.Function | t.ObjectExpression => t.isFunction(n) || t.isObjectExpression(n)
      );

      // A hash of the args and parameters. If this changes, we bail out of Fast Refresh.
      let storyHash = storyHashes[name] ?? '';

      if (t.isFunction(node)) {
        // CSF 2 style function story.
        let c = addComponent(node);
        ast.program.body.push(
          t.expressionStatement(
            t.assignmentExpression(
              '=',
              t.memberExpression(t.identifier(name), t.identifier('_internalComponent')),
              t.identifier(c)
            )
          ) as any
        );

        if (storyHash) {
          ast.program.body.push(
            t.expressionStatement(
              t.assignmentExpression(
                '=',
                t.memberExpression(t.identifier(name), t.identifier('_hash')),
                t.stringLiteral(storyHash)
              )
            ) as any
          );
        }
      } else if (node) {
        handleRenderProperty(node);
        if (storyHash) {
          node.properties.push(t.objectProperty(t.identifier('_hash'), t.stringLiteral(storyHash)));
        }
      }
    }
  }

  // Hash the default export to invalidate Fast Refresh.
  let metaNode = nodeAt(csf._metaNode, t.isObjectExpression);
  if (metaNode) {
    if (docs) {
      let component: any = metaNode.properties.find(
        (p: any) => t.isObjectProperty(p) && t.isIdentifier(p.key) && p.key.name === 'component'
      );
      if (t.isObjectProperty(component) && t.isExpression(component.value)) {
        component.value = t.sequenceExpression([
          t.assignmentExpression(
            '=',
            t.memberExpression(component.value, t.identifier('__docgenInfo')),
            t.valueToNode(docs)
          ),
          component.value
        ]);
      }
    }

    if (refreshName) {
      handleRenderProperty(metaNode);

      let hash = crypto.createHash('md5');
      hash.update(metaSource ?? '');
      hash.update(JSON.stringify(docs));
      let metaHash = hash.digest('hex');
      metaNode.properties.push(t.objectProperty(t.identifier('_hash'), t.stringLiteral(metaHash)));
    }
  }

  if (refreshName) {
    wrapRefresh(ast.program, filePath, refreshName);
  }

  // The generator chains its map onto Storybook's. Its types lack these two options.
  let generatorOptions: GeneratorOptions & {
    inputSourceMap: unknown;
    importAttributesKeyword: 'with';
  } = {
    sourceFileName: filePath,
    sourceMaps: true,
    inputSourceMap: enriched.map,
    importAttributesKeyword: 'with'
  };
  let {code: compiledCode, map} = generate(ast, generatorOptions, enriched.code);
  return {code: compiledCode, map};
}

// Every node of a tree by its offsets. Nodes that share their offsets with others, such as an
// expression statement and its expression, are listed outermost first.
function nodesBySpan(root: t.Node) {
  let nodes = new Map<string, t.Node[]>();
  let visit = (node: t.Node) => {
    let key = `${node.start}:${node.end}`;
    let list = nodes.get(key);
    if (list) {
      list.push(node);
    } else {
      nodes.set(key, [node]);
    }
    for (let field of t.VISITOR_KEYS[node.type] ?? []) {
      let value = (node as any)[field];
      for (let child of Array.isArray(value) ? value : [value]) {
        if (child && typeof child.type === 'string') {
          visit(child);
        }
      }
    }
  };
  visit(root);
  return nodes;
}

function wrapRefresh(program: t.Program, filePath: string, refreshName: string) {
  let wrapperPath = `${path.relative(path.dirname(filePath), __dirname)}/csf-hmr.js`;

  // Group imports, exports, and body statements which will be wrapped in a try...catch.
  let imports: (t.ImportDeclaration | t.ExportDeclaration)[] = [];
  let statements: t.Statement[] = [];
  let exportVars: t.VariableDeclarator[] = [];
  let exports: t.ExportSpecifier[] = [];

  for (let statement of program.body) {
    if (t.isImportDeclaration(statement) || t.isExportAllDeclaration(statement)) {
      imports.push(statement);
    } else if (t.isExportNamedDeclaration(statement)) {
      if (statement.exportKind === 'type' || statement.source) {
        imports.push(statement);
      } else if (statement.declaration) {
        statements.push(statement.declaration);
        for (let id in t.getOuterBindingIdentifiers(statement.declaration)) {
          let name = refreshName + '$Export' + exportVars.length;
          exportVars.push(t.variableDeclarator(t.identifier(name)));
          exports.push(t.exportSpecifier(t.identifier(name), t.identifier(id)));
          statements.push(
            t.expressionStatement(t.assignmentExpression('=', t.identifier(name), t.identifier(id)))
          );
        }
      } else if (statement.specifiers) {
        for (let specifier of statement.specifiers) {
          if (t.isExportSpecifier(specifier)) {
            let name = refreshName + '$Export' + exportVars.length;
            exportVars.push(t.variableDeclarator(t.identifier(name)));
            exports.push(t.exportSpecifier(t.identifier(name), specifier.exported));
            statements.push(
              t.expressionStatement(
                t.assignmentExpression('=', t.identifier(name), specifier.local)
              )
            );
          }
        }
      }
    } else if (t.isExportDefaultDeclaration(statement)) {
      if (t.isExpression(statement.declaration)) {
        let name = refreshName + '$Export' + exportVars.length;
        exportVars.push(t.variableDeclarator(t.identifier(name)));
        exports.push(t.exportSpecifier(t.identifier(name), t.identifier('default')));
        statements.push(
          t.expressionStatement(
            t.assignmentExpression('=', t.identifier(name), statement.declaration)
          )
        );
      } else {
        statements.push(statement.declaration);
        let name = refreshName + '$Export' + exportVars.length;
        exportVars.push(t.variableDeclarator(t.identifier(name)));
        exports.push(t.exportSpecifier(t.identifier(name), t.identifier('default')));
      }
    } else {
      statements.push(statement);
    }
  }

  program.body = [
    ...imports,
    t.importDeclaration(
      [t.importNamespaceSpecifier(t.identifier(refreshName + '$Helpers'))],
      t.stringLiteral(wrapperPath)
    ),
    t.variableDeclaration('var', exportVars),
    t.variableDeclaration('var', [
      t.variableDeclarator(
        t.identifier(refreshName + '$PrevRefreshReg'),
        t.memberExpression(t.identifier('window'), t.identifier('$RefreshReg$'))
      ),
      t.variableDeclarator(
        t.identifier(refreshName + '$PrevRefreshSig'),
        t.memberExpression(t.identifier('window'), t.identifier('$RefreshSig$'))
      )
    ]),
    t.expressionStatement(
      t.callExpression(
        t.memberExpression(t.identifier(refreshName + '$Helpers'), t.identifier('prelude')),
        [t.identifier('module')]
      )
    ),
    t.tryStatement(
      t.blockStatement([
        ...statements,
        t.expressionStatement(
          t.callExpression(
            t.memberExpression(t.identifier(refreshName + '$Helpers'), t.identifier('postlude')),
            [t.identifier('module')]
          )
        )
      ]),
      null,
      t.blockStatement([
        t.expressionStatement(
          t.assignmentExpression(
            '=',
            t.memberExpression(t.identifier('window'), t.identifier('$RefreshReg$')),
            t.identifier(refreshName + '$PrevRefreshReg')
          )
        ),
        t.expressionStatement(
          t.assignmentExpression(
            '=',
            t.memberExpression(t.identifier('window'), t.identifier('$RefreshSig$')),
            t.identifier(refreshName + '$PrevRefreshSig')
          )
        )
      ])
    ),
    t.exportNamedDeclaration(null, exports)
  ];
}
