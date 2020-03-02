/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const {Transformer} = require('@parcel/plugin');
const {parse} = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const doctrine = require('doctrine');

module.exports = new Transformer({
  async transform({asset, options}) {
    if (asset.type === 'json') {
      return [asset];
    }

    let code = await asset.getCode();
    let ast = parse(code, {
      filename: this.name,
      allowReturnOutsideFunction: true,
      strictMode: false,
      sourceType: 'module',
      plugins: ['exportDefaultFrom', 'exportNamespaceFrom', 'dynamicImport', 'typescript', 'jsx']
    });

    let exports = {};

    traverse(ast, {
      ExportNamedDeclaration(path) {
        if (path.node.source) {
          let symbols = new Map();
          for (let specifier of path.node.specifiers) {
            symbols.set(specifier.exported.name, specifier.local.name);
            asset.symbols.set(specifier.exported.name, specifier.local.name);
          }

          asset.addDependency({
            moduleSpecifier: path.node.source.value,
            symbols,
            pipeline: 'docs-json'
          });
        } else if (path.node.declaration) {
          if (t.isIdentifier(path.node.declaration.id)) {
            asset.symbols.set(path.node.declaration.id.name, path.node.declaration.id.name);
            // console.log('EXPORT', path.node.declaration.id.name, processExport(path.get('declaration')));
            exports[path.node.declaration.id.name] = processExport(path.get('declaration'));
          } else {
            let identifiers = t.getBindingIdentifiers(path.node.declaration);
            for (let id of Object.keys(identifiers)) {
              console.log('ID', id);
              asset.symbols.set(identifiers[id].name, identifiers[id].name);
            }
          }
        } else if (path.node.specifiers.length > 0) {
          for (let specifier of path.node.specifiers) {
            let binding = path.scope.getBinding(specifier.local.name);
            if (binding) {
              exports[specifier.exported.name] = processExport(binding.path);
              asset.symbols.set(specifier.exported.name, specifier.local.name);
            }
          }
        }
      },

      ExportAllDeclaration(path) {
        asset.addDependency({
          moduleSpecifier: path.node.source.value,
          symbols: new Map([['*', '*']]),
          pipeline: 'docs-json'
        });
      },

      ExportDefaultDeclaration(path) {

      }
    });

    function processExport(path) {
      if (path.isVariableDeclarator()) {
        if (!path.node.init) {
          return;
        }

        let docs = getJSDocs(path.parentPath);
        let value = processExport(path.get('init'));
        addDocs(value, docs);
        return value;
      }

      if (isReactForwardRef(path)) {
        return processExport(path.get('arguments.0'));
      }


      if (path.isFunction()) {
        console.log("are you a func")
        if (isReactComponent(path)) {
          let props = path.node.params[0];
          let docs = getJSDocs(path);
          return {
            type: 'component',
            props: props && props.typeAnnotation
              ? processExport(path.get('params.0.typeAnnotation.typeAnnotation'))
              : null,
            description: docs.description || null
          };
        } else {
          // TODO: normal function
        }
      }

      if (path.isTSTypeReference()) {
        if (path.node.typeParameters) {
          return {
            type: 'application',
            base: processExport(path.get('typeName')),
            typeParameters: path.get('typeParameters.params').map(p => processExport(p))
          };
        }

        return processExport(path.get('typeName'));
      }

      if (path.isImportSpecifier()) {
        asset.addDependency({
          moduleSpecifier: path.parent.source.value,
          symbols: new Map([[path.node.imported.name, path.node.local.name]]),
          pipeline: 'docs-json'
        });

        return {
          type: 'reference',
          local: path.node.local.name,
          imported: path.node.imported.name,
          specifier: path.parent.source.value
        };
      }

      if (path.isTSTypeAliasDeclaration()) {
        let docs = getJSDocs(path);
        return {
          type: 'alias',
          id: `${asset.filePath}:${path.node.id.name}`,
          name: path.node.id.name,
          value: processExport(path.get('typeAnnotation')),
          typeParameters: path.node.typeParameters ? path.get('typeParameters.params').map(p => processExport(p)) : [],
          description: docs.description || null,
          access: docs.access
        };
      }

      if (path.isTSInterfaceDeclaration()) {
        let properties = {};
        for (let propertyPath of path.get('body.body')) {
          let property = processExport(propertyPath);
          if (property) {
            properties[property.name] = property;
          } else {
            console.log('UNKNOWN PROPERTY', propertyPath.node);
          }
        }

        let exts = path.node.extends ? path.get('extends').map(e => processExport(e)) : [];
        let docs = getJSDocs(path);

        return addDocs({
          type: 'interface',
          id: `${asset.filePath}:${path.node.id.name}`,
          name: path.node.id.name,
          extends: exts,
          properties,
          typeParameters: path.node.typeParameters ? path.get('typeParameters.params').map(p => processExport(p)) : []
        }, docs);
      }

      if (path.isTSTypeLiteral()) {
        let properties = {};
        for (let member of path.get('members')) {
          let property = processExport(member);
          if (property) {
            properties[property.name] = property;
          } else {
            console.log('UNKNOWN PROPERTY', member.node);
          }
        }

        return {
          type: 'object',
          properties
        };
      }

      if (path.isTSPropertySignature()) {
        let name = t.isStringLiteral(path.node.key) ? path.node.key.value : path.node.key.name;
        let docs = getJSDocs(path);
        return addDocs({
          type: 'property',
          name,
          value: processExport(path.get('typeAnnotation.typeAnnotation')),
          optional: path.node.optional || false
        }, docs);
      }

      if (path.isTSMethodSignature()) {
        let name = t.isStringLiteral(path.node.key) ? path.node.key.value : path.node.key.name;
        let docs = getJSDocs(path);
        return addDocs({
          type: 'property',
          name,
          value: {
            type: 'function',
            parameters: path.get('parameters').map(p => ({
              type: 'parameter',
              name: p.node.name,
              value: processExport(p.get('typeAnnotation.typeAnnotation'))
            })),
            return: path.node.typeAnnotation
              ? processExport(path.get('typeAnnotation.typeAnnotation'))
              : {type: 'any'},
            typeParameters: path.node.typeParameters
              ? path.get('typeParameters.params').map(p => processExport(p))
              : []
          }
        }, docs);
      }

      if (path.isTSExpressionWithTypeArguments()) {
        if (path.node.typeParameters) {
          return {
            type: 'application',
            base: processExport(path.get('expression')),
            typeParameters: path.get('typeParameters.params').map(p => processExport(p))
          };
        }

        return processExport(path.get('expression'));
      }

      if (path.isIdentifier()) {
        let binding = path.scope.getBinding(path.node.name);
        if (!binding) {
          return {
            type: 'identifier',
            name: path.node.name
          };
        }

        return processExport(binding.path);
      }

      if (path.isTSBooleanKeyword()) {
        return {type: 'boolean'};
      }

      if (path.isTSStringKeyword()) {
        return {type: 'string'};
      }

      if (path.isTSNumberKeyword()) {
        return {type: 'number'};
      }

      if (path.isTSAnyKeyword()) {
        return {type: 'any'};
      }

      if (path.isTSNullKeyword()) {
        return {type: 'null'};
      }

      if (path.isTSVoidKeyword()) {
        return {type: 'void'};
      }

      if (path.isTSObjectKeyword()) {
        return {type: 'object'}; // ???
      }

      if (path.isTSArrayType()) {
        return {
          type: 'array',
          elementType: processExport(path.get('elementType'))
        };
      }

      if (path.isTSUnionType()) {
        return {
          type: 'union',
          elements: path.get('types').map(t => processExport(t))
        };
      }

      if (path.isTSLiteralType()) {
        return {
          type: typeof path.node.literal.value,
          value: path.node.literal.value
        };
      }

      if (path.isTSFunctionType() || path.isTSConstructorType()) {
        return {
          type: 'function',
          parameters: path.get('parameters').map(p => ({
            type: 'parameter',
            name: p.node.name,
            value: p.node.typeAnnotation ? processExport(p.get('typeAnnotation.typeAnnotation')) : {type: 'any'}
          })),
          return: path.node.typeAnnotation ? processExport(path.get('typeAnnotation.typeAnnotation')) : {type: 'any'},
          typeParameters: path.node.typeParameters ? path.get('typeParameters.params').map(p => processExport(p)) : []
        };
      }

      if (path.isTSIntersectionType()) {
        return {
          type: 'intersection',
          types: path.get('types').map(p => processExport(p))
        };
      }

      if (path.isTSTypeParameter()) {
        return {
          type: 'typeParameter',
          name: path.node.name,
          default: path.node.default ? processExport(path.get('default')) : null
        };
      }

      console.log('UNKNOWN TYPE', path.node.type);
    }

    function isReactForwardRef(path) {
      return isReactCall(path, 'forwardRef');
    }

    function isReactCall(path, name) {
      if (!path.isCallExpression()) {
        return false;
      }

      if (!t.isMemberExpression(path.node.callee)) {
        return path.get('callee').referencesImport('react', name);
      }

      if (path.get('callee.object').referencesImport('react', 'default')) {
        return t.isIdentifier(path.node.callee.property, {name});
      }

      return false;
    }

    function isReactComponent(path) {
      if (path.isFunction()) {
        let returnsJSX = false;
        path.traverse({
          ReturnStatement(path) {
            let ret = path.node.argument;
            if (t.isJSXElement(ret) || t.isJSXFragment(ret) || isReactCall(path.get('argument'), 'cloneElement')) {
              returnsJSX = true;
            }
          }
        });

        return returnsJSX;
      }

      // TODO: classes

      return false;
    }

    function getJSDocs(path) {
      let comments = getDocComments(path);
      if (comments) {
        let parsed = doctrine.parse(comments, {
          // have doctrine itself remove the comment asterisks from content
          unwrap: true,
          // enable parsing of optional parameters in brackets, JSDoc3 style
          sloppy: true,
          // `recoverable: true` is the only way to get error information out
          recoverable: true
        });

        let result = {
          description: parsed.description
        };

        for (let tag of parsed.tags) {
          if (tag.title === 'default') {
            result.default = tag.description;
          } else if (tag.title === 'access') {
            result.access = tag.description;
          } else if (tag.title === 'private') {
            result.access = 'private';
          } else if (tag.title === 'protected') {
            result.access = 'protected';
          } else if (tag.title === 'public') {
            result.access = 'private';
          } else if (tag.title === 'return' || tag.title === 'returns') {
            result.return = tag.description;
          } else if (tag.title === 'param') {
            if (!result.params) {
              result.params = {};
            }

            result.params[tag.name] = tag.description;
          }
        }

        return result;
      }

      return {};
    }

    function getDocComments(path) {
      if (path.node.leadingComments) {
        return path.node.leadingComments.filter(isJSDocComment).map(c => c.value).join('\n');
      }

      if (path.parentPath.isExportDeclaration() && path.parent.leadingComments) {
        return path.parent.leadingComments.filter(isJSDocComment).map(c => c.value).join('\n');
      }

      return null;
    }

    function isJSDocComment(comment) {
      const asterisks = comment.value.match(/^(\*+)/);
      return (
        comment.type === 'CommentBlock' && asterisks && asterisks[1].length === 1
      );
    }

    function addDocs(value, docs) {
      if (!value) {
        return value;
      }

      if (docs.description) {
        value.description = docs.description;
      }

      if (docs.access) {
        value.access = docs.access;
      }

      if (value.type === 'property') {
        value.default = docs.default || value.default || null;
        if (value.value && value.value.type === 'function') {
          addFunctionDocs(value.value, docs);
        }
      }

      if (value.type === 'function') {
        addFunctionDocs(value, docs);
      }

      return value;
    }

    function addFunctionDocs(value, docs) {
      let params = docs.params || {};
      for (let param of value.parameters) {
        param.description = params[param.name] || param.description || null;
      }

      if (value.return) {
        value.return.description = docs.return || value.return.description || null;
      }
    }

    // return Object.keys(exports).map()

    // console.log(exports)
    asset.type = 'json';
    asset.setCode(JSON.stringify(exports, false, 2));
    return [asset];
  }
});
