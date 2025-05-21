import { Transformer } from '@parcel/plugin';
import { enrichCsf, formatCsf, babelParse, CsfFile } from '@storybook/csf-tools';
import * as t from '@babel/types';
import {parse} from '@babel/parser';
import path from 'path';
import crypto from 'crypto';
import { getClient, getCacheDir } from './react-docgen-typescript';
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
    let {code: compiledCode, rawMappings} = processCsf(code, asset.filePath, docs, name) as any;

    let map = new SourceMap(options.projectRoot);
    if (rawMappings) {
      map.addIndexedMappings(rawMappings);
    }

    // Invalidate the asset whenever any types change.
    asset.invalidateOnFileChange(path.join(getCacheDir(options), 'sentinel'));
    asset.setCode(compiledCode);
    asset.setMap(map);
    return [asset];
  }
});

function processCsf(code: string, filePath: string, docs: ComponentDoc | null, refreshName: string | null) {
  let ast = parse(code, {
    sourceFilename: filePath,
    sourceType: 'module',
    plugins: ['typescript', 'jsx', 'importAttributes', 'classProperties'],
    tokens: true
  });

  let csf = new CsfFile(ast, {
    fileName: filePath,
    makeTitle: title => title || 'default'
  }).parse();
  enrichCsf(csf, csf);

  // Extract story functions into separate components. This enables React Fast Refresh to work properly.
  let count = 0;
  let addComponent = (node: t.Function) => {
    let name = 'Story' + count++;
    csf._ast.program.body.push(t.functionDeclaration(
      t.identifier(name),
      node.params.map(p => t.cloneNode(p)),
      t.isExpression(node.body) ? t.blockStatement([t.returnStatement(node.body)]) : node.body
    ));
    node.body = t.blockStatement([
      t.returnStatement(
        t.jsxElement(
          t.jsxOpeningElement(
            t.jsxIdentifier(name),
            node.params.length && t.isIdentifier(node.params[0]) ? [t.jsxSpreadAttribute(t.cloneNode(node.params[0]))] : [],
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
    let render = node.properties.find(p => (t.isObjectProperty(p) || t.isObjectMethod(p)) && t.isIdentifier(p.key) && p.key.name === 'render');
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
      let node = csf.getStoryExport(name);

      // Generate a hash of the args and parameters. If this changes, we bail out of Fast Refresh.
      let annotations = csf._storyAnnotations[name];
      let storyHash = '';
      if (annotations) {
        let hash = crypto.createHash('md5');
        if (annotations.args) {
          hash.update(code.slice(annotations.args.start!, annotations.args.end!));
        }
        if (annotations.parameters) {
          hash.update(code.slice(annotations.parameters.start!, annotations.parameters.end!));
        }
        storyHash = hash.digest('hex');
      }

      if (t.isFunction(node)) {
        // CSF 2 style function story.
        let c = addComponent(node);
        csf._ast.program.body.push(t.expressionStatement(
          t.assignmentExpression(
            '=',
            t.memberExpression(t.identifier(name), t.identifier('_internalComponent')),
            t.identifier(c)
          )
        ));

        if (storyHash) {
          csf._ast.program.body.push(t.expressionStatement(
            t.assignmentExpression(
              '=',
              t.memberExpression(t.identifier(name), t.identifier('_hash')),
              t.stringLiteral(storyHash)
            )
          ));
        }
      } else if (node.type === 'ObjectExpression') {
        handleRenderProperty(node);
        if (storyHash) {
          node.properties.push(t.objectProperty(t.identifier('_hash'), t.stringLiteral(storyHash)));
        }
      }
    }
  }

  // Hash the default export to invalidate Fast Refresh.
  if (csf._metaNode?.type === 'ObjectExpression') {
    if (docs) {
      let component = csf._metaNode.properties.find(p => t.isObjectProperty(p) && t.isIdentifier(p.key) && p.key.name === 'component');
      if (t.isObjectProperty(component) && t.isExpression(component.value)) {
        component.value = t.sequenceExpression([
          t.assignmentExpression('=', t.memberExpression(component.value, t.identifier('__docgenInfo')), t.valueToNode(docs)),
          component.value
        ]);
      }
    }

    
    if (refreshName) {
      handleRenderProperty(csf._metaNode);

      let hash = crypto.createHash('md5');
      hash.update(code.slice(csf._metaNode.start!, csf._metaNode.end!));
      hash.update(JSON.stringify(docs));
      let metaHash = hash.digest('hex');
      csf._metaNode.properties.push(t.objectProperty(t.identifier('_hash'), t.stringLiteral(metaHash)));
    }
  }

  if (refreshName) {
    wrapRefresh(csf._ast.program, filePath, refreshName);
  }

  // @ts-ignore
  return formatCsf(csf, {sourceFileName: filePath, sourceMaps: true, importAttributesKeyword: 'with'});
}

function wrapRefresh(program: t.Program, filePath: string, refreshName: string) {
  let wrapperPath = `${path.relative(
    path.dirname(filePath),
    __dirname,
  )}/csf-hmr.js`;

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
          statements.push(t.expressionStatement(t.assignmentExpression('=', t.identifier(name), t.identifier(id))));
        }
      } else if (statement.specifiers) {
        for (let specifier of statement.specifiers) {
          if (t.isExportSpecifier(specifier)) {
            let name = refreshName + '$Export' + exportVars.length;
            exportVars.push(t.variableDeclarator(t.identifier(name)));
            exports.push(t.exportSpecifier(t.identifier(name), specifier.exported));
            statements.push(t.expressionStatement(t.assignmentExpression('=', t.identifier(name), specifier.local)));
          }
        }
      }
    } else if (t.isExportDefaultDeclaration(statement)) {
      if (t.isExpression(statement.declaration)) {
        let name = refreshName + '$Export' + exportVars.length;
        exportVars.push(t.variableDeclarator(t.identifier(name)));
        exports.push(t.exportSpecifier(t.identifier(name), t.identifier('default')));
        statements.push(t.expressionStatement(t.assignmentExpression('=', t.identifier(name), statement.declaration)));
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
      t.variableDeclarator(t.identifier(refreshName + '$PrevRefreshReg'), t.memberExpression(t.identifier('window'), t.identifier('$RefreshReg$'))),
      t.variableDeclarator(t.identifier(refreshName + '$PrevRefreshSig'), t.memberExpression(t.identifier('window'), t.identifier('$RefreshSig$')))
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
        ),
      ]),
      null,
      t.blockStatement([
        t.expressionStatement(
          t.assignmentExpression(
            '=', 
            t.memberExpression(t.identifier('window'), t.identifier('$RefreshReg$')),
            t.identifier(refreshName + '$PrevRefreshReg')
          ),
        ),
        t.expressionStatement(
          t.assignmentExpression(
            '=', 
            t.memberExpression(t.identifier('window'), t.identifier('$RefreshSig$')),
            t.identifier(refreshName + '$PrevRefreshSig')
          ),
        ),
      ])
    ),
    t.exportNamedDeclaration(null, exports)
  ];
}
