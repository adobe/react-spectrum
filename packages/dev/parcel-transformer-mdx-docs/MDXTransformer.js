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
const flatMap = require('unist-util-flatmap');
const treeSitter = require('tree-sitter-highlight');
const {fragmentUnWrap, fragmentWrap} = require('./MDXFragments');
const yaml = require('js-yaml');
const dprint = require('dprint-node');
const t = require('@babel/types');
const processCSS = require('./processCSS');

const IMPORT_MAPPINGS = {
  '@react-spectrum/theme-default': {
    theme: 'defaultTheme'
  },
  '@react-spectrum/theme-dark': {
    theme: 'darkTheme'
  }
};

module.exports = new Transformer({
  async loadConfig({config}) {
    let pkg = await config.getPackage();
    return {
      version: pkg.version
    };
  },
  async transform({asset, options, config}) {
    let exampleCode = [];
    let cssCode = [];
    let preReleaseParts = config.version.match(/(alpha)|(beta)|(rc)/);
    let preRelease = preReleaseParts ? preReleaseParts[0] : '';

    let visit = (await import('unist-util-visit')).visit;
    const extractExamples = () => (tree, file) => (
      flatMap(tree, node => {
        if (node.type === 'code') {
          let [meta, ...options] = (node.meta || '').split(' ');
          if (meta === 'import') {
            exampleCode.push(node.value);
            node.meta = null;
            return [];
          }

          let keepIndividualImports = meta === 'keepIndividualImports' || options.includes('keepIndividualImports');

          if (meta === 'example' || meta === 'snippet') {
            let id = `example-${exampleCode.length}`;

            // TODO: Parsing code with regex is bad. Replace with babel transform or something.
            let code = node.value;
            code = code.replace(/import ((?:.|\n)*?) from (['"].*?['"]);?/g, (m, x, s) => {
              if (meta === 'example' && s[1] === '.') {
                exampleCode.push(`import ${x} from "extract:${s.slice(1, -1)}.mdx";`);
              } else if (s.slice(1, -1) !== 'your-component-library') {
                exampleCode.push(m);
              }
              return '';
            });

            let provider = 'ExampleProvider';
            if (options.includes('themeSwitcher=true')) {
              exampleCode.push('import {ExampleThemeSwitcher} from "@react-spectrum/docs/src/ExampleThemeSwitcher";\n');
              provider = 'ExampleThemeSwitcher';
            }

            if (!options.includes('render=false')) {
              let props = options.includes('hidden') ? 'isHidden' : '';
              if (/function (.|\n)*}\s*$/.test(code)) {
                let name = code.match(/function (.*?)\s*\(/)[1];
                code = `${code}\nRENDER_FNS.push(() => ReactDOM.createRoot(document.getElementById("${id}")).render(<${provider} ${props}><${name} /></${provider}>));`;
              } else if (/^<(.|\n)*>$/m.test(code)) {
                code = code.replace(/^(<(.|\n)*>)$/m, `RENDER_FNS.push(() => ReactDOM.createRoot(document.getElementById("${id}")).render(<${provider} ${props}>$1</${provider}>));`);
              }
            }

            if (!options.includes('export=true')) {
              code = `(function() {\n${code}\n})();`;
            }

            exampleCode.push(code);

            // We'd like to exclude certain sections of the code from being rendered on the page, but they need to be there to actually
            // execute. So, you can wrap that section in a ///- begin collapse -/// ... ///- end collapse -/// block to mark it.
            node.value = node.value.replace(/\n*\/\/\/- begin collapse -\/\/\/(.|\n)*?\/\/\/- end collapse -\/\/\/(\s*\n*(?=\s*(\/\/|\/\*)))?/g, () => '').trim();

            if (options.includes('render=false')) {
              node.meta = null;
              return transformExample(node, preRelease, keepIndividualImports);
            }

            if (meta === 'snippet') {
              node.meta = null;
              return [
                {
                  type: 'mdxJsxFlowElement',
                  name: 'div',
                  attributes: [
                    {
                      type: 'mdxJsxAttribute',
                      name: 'id',
                      value: id
                    }
                  ]
                }
              ];
            }

            node.meta = options.includes('hidden') ? null : 'example';
            let highlightedCode = transformExample(node, preRelease, keepIndividualImports);
            let output = {
              type: 'mdxJsxFlowElement',
              name: 'div',
              attributes: [
                {
                  type: 'mdxJsxAttribute',
                  name: 'id',
                  value: id
                }
              ]
            };

            if (options.includes('flip') || options.includes('standalone')) {
              output.attributes.push({
                type: 'mdxJsxAttribute',
                name: 'className',
                value: options.includes('standalone') ? 'standalone' : 'flip'
              });
              return [
                output,
                ...highlightedCode
              ];
            }

            return [
              ...highlightedCode,
              output
            ];
          }

          if (node.lang === 'css') {
            if (node.meta && node.meta.includes('render=false')) {
              return responsiveCode(node);
            }
            cssCode.push(node.value);

            let code = node.meta && node.meta.includes('hidden') ? [] : responsiveCode(node);
            return code;
          }

          return transformExample(node, preRelease, keepIndividualImports);
        }

        return [node];
      })
    );

    let appendCSS = () => async (tree) => {
      let css = await processCSS(cssCode, asset, options, minimal);

      tree.children.push(
        {
          type: 'mdxJsxFlowElement',
          name: 'style',
          attributes: [
            {
              type: 'mdxJsxAttribute',
              name: 'dangerouslySetInnerHTML',
              value: {
                type: 'mdxJsxAttributeValueExpression',
                value: JSON.stringify({__html: css}),
                data: {
                  estree: {
                    type: 'Program',
                    body: [{
                      type: 'ExpressionStatement',
                      expression: {
                        type: 'ObjectExpression',
                        properties: [{
                          type: 'Property',
                          kind: 'init',
                          key: {
                            type: 'Identifier',
                            name: '__html'
                          },
                          value: {
                            type: 'Literal',
                            value: css
                          }
                        }]
                      }
                    }]
                  }
                }
              }
            }
          ],
          children: []
        }
      );
      return tree;
    };

    let toc = [];
    let title = '';
    let navigationTitle;
    let category = '';
    let type = '';
    let keywords = [];
    let description = '';
    let date = '';
    let author = '';
    let image = '';
    let hidden = false;
    let minimal = false;
    let order;
    let util = (await import('mdast-util-toc')).toc;
    const extractToc = (options) => {
      const settings = options || {};
      const depth = settings.maxDepth || 6;
      const tight = settings.tight;
      const skip = settings.skip;

      function transformer(node) {
        let fullToc = util(node, {
          maxDepth: depth,
          tight: tight,
          skip: skip
        }).map;

        function findLink(node) {
          if (node.type === 'link') {
            return node;
          }

          if (node.children) {
            for (let child of node.children) {
              let link = findLink(child);
              if (link) {
                return link;
              }
            }
          }
        }

        /**
         * Go from complex structure that the mdx plugin renders from to a simpler one
         * it starts as an array because we start with the h2's not h1.
         * @example [{id, textContent, children: [{id, textContent, children: ...}, ...]}, ...]
         */
        function treeConverter(tree, first = false) {
          let newTree = {};
          if (tree.type === 'list') {
            return tree.children.map(treeNode => treeConverter(treeNode));
          } else if (tree.type === 'listItem') {
            let [name, nodes] = tree.children;
            newTree.children = [];
            if (nodes) {
              newTree.children = treeConverter(nodes);
            }
            let link = findLink(name);
            newTree.id = link.url.split('#').pop();
            newTree.textContent = link.children[0].value;
          }
          return newTree;
        }

        // Sometimes pages do not have any notable md structure -- just jsx
        if (fullToc) {
          toc = treeConverter(fullToc || {}, true);
          title = toc[0].textContent;
          toc = toc[0].children;
        }

        // Piggy back here to grab additional metadata.
        let metadata = node.children.find(c => c.type === 'yaml');
        if (metadata) {
          let yamlData = yaml.safeLoad(metadata.value);
          // title defined in yaml data will override
          title = yamlData.title || title;
          navigationTitle = yamlData.navigationTitle;
          category = yamlData.category || '';
          keywords = yamlData.keywords || [];
          description = yamlData.description || '';
          date = yamlData.date || '';
          author = yamlData.author || '';
          order = yamlData.order;
          hidden = yamlData.hidden;
          type = yamlData.type || '';
          minimal = yamlData.minimal || false;
          if (yamlData.image) {
            image = asset.addDependency({
              specifier: yamlData.image,
              specifierType: 'url'
            });
          }
          if (yamlData.preRelease) {
            preRelease = yamlData.preRelease;
          }
        }

        return node;
      }

      return transformer;
    };

    /**
     * Adds an `example` class to `pre` tags followed by examples.
     * This allows us to remove the bottom rounded corners, but only when
     * there is a rendered example below.
     */
    function wrapExamples() {
      return (tree) => (
        flatMap(tree, node => {
          if (node.tagName === 'pre' && node.children && node.children.length > 0 && node.children[0].tagName === 'code' && node.children[0].data?.meta) {
            node.properties.className = node.children[0].data.meta.split(' ');
          }

          return [node];
        })
      );
    }

    function highlight(options) {
      return (tree) => {
        visit(tree, 'code', node => {
          if (!node.lang) {
            return;
          }
          let language = treeSitter.Language[node.lang.toUpperCase()];
          if (!language) {
            return;
          }
          if (!node.data) {
            node.data = {};
          }
          let highlighted = treeSitter.highlightHast(node.value, language);

          // Add <mark> elements wrapping highlighted regions, marked by comments in the code.
          if (node.value.includes('- begin highlight -')) {
            let highlightParent = null;
            let highlightedNodes = [];
            flatMap(highlighted, (node, index, parent) => {
              if (node.properties?.className === 'comment' && /- begin highlight -/.test(node.children[0].value)) {
                // Handle JSX-style comments, e.g. {/* foo */}
                let prev = parent.children[index - 1];
                if (prev?.children?.[0]?.value === '{') {
                  prev.children = [];
                  prev = parent.children[index - 2];
                }

                // Remove extra newline before comment.
                if (prev?.type === 'text') {
                  prev.value = prev.value.replace(/\n( *)$/, '\n');
                }

                highlightParent = parent;
                highlightedNodes = [];
                return [];
              } else if (node.properties?.className === 'comment' && /- end highlight -/.test(node.children?.[0].value)) {
                highlightParent = null;
                let res = [{
                  type: 'element',
                  tagName: 'mark',
                  children: highlightedNodes
                }];

                // Remove closing brace from JSX-style starting comments, e.g. {/* foo */}
                if (highlightedNodes[0]?.children?.[0]?.value === '}') {
                  highlightedNodes.shift();
                }

                // Remove extra newline after starting comment, but keep indentation.
                if (highlightedNodes[0]?.type === 'text' && /^\s+/.test(highlightedNodes[0].value)) {
                  let node = highlightedNodes[0];
                  node.value = node.value.replace(/^\s*\n+(\s*)/, '$1');
                }

                // Remove opening brace from JSX-style ending comments.
                let last = highlightedNodes[highlightedNodes.length - 1];
                if (last?.children?.[0]?.value === '{') {
                  highlightedNodes.pop();
                }

                // Remove extra newline before ending comment.
                last = highlightedNodes[highlightedNodes.length - 1];
                if (last?.type === 'text' && /^\s+$/.test(last?.value)) {
                  highlightedNodes.pop();
                }

                // Remove closing brace from JSX-style ending comments.
                let next = parent.children?.[index + 1];
                if (next?.children?.[0]?.value === '}') {
                  parent.children[index + 1] = {type: 'text', value: ''};
                  next = parent.children?.[index + 2];
                }

                // Remove extra newline after ending comment.
                if (next?.type === 'text') {
                  next.value = next.value.replace(/^ *\n/, '');
                }

                return res;
              } else if (highlightParent && parent === highlightParent) {
                highlightedNodes.push(node);
                return [];
              }

              return [node];
            });
          }

          node.data.hChildren = [highlighted];
        });
        return tree;
      };
    }

    let {compile} = await import('@mdx-js/mdx');
    let frontmatter = (await import('remark-frontmatter')).default;
    let slug = (await import('remark-slug')).default;
    let compiled = await compile(await asset.getCode(), {
      providerImportSource: '@mdx-js/react',
      remarkPlugins: [
        slug,
        extractToc,
        extractExamples,
        fragmentWrap,
        [frontmatter, {type: 'yaml', anywhere: true, marker: '-'}],
        highlight,
        fragmentUnWrap,
        appendCSS
      ],
      rehypePlugins: [
        wrapExamples
      ]
    });

    asset.type = 'jsx';
    asset.setCode(String(compiled));
    asset.meta.toc = toc;
    asset.meta.title = title;
    asset.meta.navigationTitle = navigationTitle;
    asset.meta.category = category;
    asset.meta.description = description;
    asset.meta.keywords = keywords;
    asset.meta.date = date;
    asset.meta.author = author;
    asset.meta.image = image;
    asset.meta.order = order;
    asset.meta.hidden = hidden;
    asset.meta.isMDX = true;
    asset.meta.preRelease = preRelease;
    asset.meta.type = type;
    asset.isBundleSplittable = false;

    let clientBundle = '';
    if (!minimal) {
      // Generate the client bundle. We always need the client script,
      // and the docs script when there's a TOC or an example on the page.
      clientBundle = 'import \'@react-spectrum/docs/src/client\';\n';
      if (toc.length || exampleCode.length > 0) {
        clientBundle += 'import \'@react-spectrum/docs/src/docs\';\n';
      }
    }

    // Add example code collected from the MDX.
    if (exampleCode.length > 0) {
      if (minimal) {
        clientBundle += 'const ExampleProvider = React.Fragment;\n';
      } else {
        clientBundle += "import {Example as ExampleProvider} from '@react-spectrum/docs/src/ThemeSwitcher';\n";
      }
      clientBundle += `import React from 'react';
import ReactDOM from 'react-dom/client';
let RENDER_FNS = [];
${exampleCode.join('\n')}
for (let render of RENDER_FNS) {
  render();
}
export default {};
`;
    }

    let assets = [
      asset,
      {
        type: 'tsx',
        content: clientBundle,
        uniqueKey: 'client',
        isBundleSplittable: true,
        sideEffects: true,
        env: {
          // We have to override all of the environment options to ensure this doesn't inherit
          // anything from the parent asset, whose environment is set below.
          context: 'browser',
          engines: asset.env.engines,
          outputFormat: asset.env.shouldScopeHoist ? 'esmodule' : 'global',
          includeNodeModules: asset.env.includeNodeModules,
          shouldScopeHoist: asset.env.shouldScopeHoist,
          shouldOptimize: asset.env.shouldOptimize
        },
        meta: {
          isMDX: false
        }
      }
    ];

    // Add a dependency on the client bundle. It should not inherit its entry status from the page,
    // and should always be placed in a separate bundle.
    asset.addDependency({
      specifier: 'client',
      specifierType: 'esm',
      needsStableName: false,
      priority: 'parallel'
    });

    // Override the environment of the page bundle. It will run in node as part of the SSG optimizer.
    asset.setEnvironment({
      context: 'node',
      engines: {
        node: process.versions.node,
        browsers: asset.env.engines.browsers
      },
      outputFormat: 'commonjs',
      includeNodeModules: {
        // These don't need to be bundled.
        react: false,
        'react-dom': false,
        'intl-messageformat': false,
        'globals-docs': false,
        lowlight: false,
        scheduler: false,
        'markdown-to-jsx': false,
        'prop-types': false
      },
      shouldScopeHoist: false,
      shouldOptimize: false
    });

    return assets;
  }
});

function transformExample(node, preRelease, keepIndividualImports) {
  if (node.lang !== 'tsx' && node.lang !== 'jsx') {
    return responsiveCode(node);
  }

  if (/^<(.|\n)*>$/m.test(node.value)) {
    node.value = node.value.replace(/^(<(.|\n)*>)$/m, '(<WRAPPER>$1</WRAPPER>)');
  }

  let force = false;

  /* Replace individual package imports in the code
   * with monorepo imports if building for production and not a pre-release
   */
  if (!preRelease && /@react-spectrum|@react-aria|@react-stately/.test(node.value)) {
    let specifiers = {};
    let typeSpecifiers = {};
    const recast = require('recast');
    const traverse = require('@babel/traverse').default;
    const {parse} = require('@babel/parser');
    let ast = recast.parse(node.value, {
      parser: {
        parse() {
          return parse(node.value, {
            sourceType: 'module',
            plugins: ['jsx', 'typescript'],
            tokens: true
          });
        }
      }
    });

    traverse(ast, {
      ImportDeclaration(path) {
        if (/^(@react-spectrum|@react-aria|@react-stately)/.test(path.node.source.value) && !/test-utils/.test(path.node.source.value) && !keepIndividualImports) {
          let lib = path.node.source.value.split('/')[0];
          let s = path.node.importKind === 'type' ? typeSpecifiers : specifiers;
          if (!s[lib]) {
            s[lib] = [];
          }

          let mapping = IMPORT_MAPPINGS[path.node.source.value];
          for (let specifier of path.node.specifiers) {
            let mapped = mapping && mapping[specifier.imported.name];
            if (mapped && specifier.local.name === specifier.imported.name) {
              path.scope.rename(specifier.local.name, mapped);
              s[lib].push(mapped);
            } else {
              s[lib].push(specifier.imported.name);
            }
          }

          path.remove();
        }
      },
      Statement(path) {
        path.skip();
      },
      Program: {
        exit(path) {
          let process = (specifiers, importKind) => {
            for (let lib in specifiers) {
              let names = specifiers[lib];
              if (names.length > 0) {
                let monopackage = lib === '@react-spectrum' ? '@adobe/react-spectrum' : lib.slice(1);
                let literal =  t.stringLiteral(monopackage);

                let decl = t.importDeclaration(
                  names.map(s => t.importSpecifier(t.identifier(s), t.identifier(s))),
                  literal
                );

                decl.importKind = importKind;
                path.unshiftContainer('body', [decl]);
              }
            }
          };

          process(specifiers, 'value');
          process(typeSpecifiers, 'type');
        }
      }
    });

    node.value = recast.print(ast, {objectCurlySpacing: false, quote: 'single'}).code.replace(/(<WRAPPER>(?:.|\n)*<\/WRAPPER>)/g, '\n($1)');
    force = true;
  }

  return responsiveCode(node, force);
}

function responsiveCode(node, force) {
  if (!node.lang) {
    return [node];
  }

  if (node.meta?.includes('format=false')) {
    node.value = node.value.replace(/^\(?<WRAPPER>((?:.|\n)*)<\/WRAPPER>\)?;?\s*$/m, '$1');
    return [node];
  }

  let large = {
    ...node,
    meta: node.meta ? `${node.meta} large` : 'large',
    value: formatCode(node, node.value, 80, force)
  };

  let medium = {
    ...node,
    meta: node.meta ? `${node.meta} medium` : 'medium',
    value: formatCode(node, large.value, 60, force)
  };

  let small = {
    ...node,
    meta: node.meta ? `${node.meta} small` : 'small',
    value: formatCode(node, medium.value, 25, force)
  };

  return [
    large,
    medium,
    small
  ];
}

function formatCode(node, code, printWidth = 80, force = false) {
  if (!force && code.split('\n').every(line => line.length <= printWidth)) {
    return code.replace(/^\(?<WRAPPER>((?:.|\n)*)<\/WRAPPER>\)?;?\s*$/m, '$1');
  }

  if (node.lang === 'css' || node.lang === 'json') {
    return node.value;
  }

  let res = dprint.format('example.' + node.lang, node.value, {
    quoteStyle: 'preferSingle',
    'jsx.quoteStyle': 'preferDouble',
    trailingCommas: 'never',
    lineWidth: printWidth,
    'importDeclaration.spaceSurroundingNamedImports': false,
    'importDeclaration.forceSingleLine': printWidth >= 80
  });

  return res.replace(/^\(?<WRAPPER>((?:.|\n)*)<\/WRAPPER>\)?;?\s*$/m, (str, contents) =>
    contents.replace(/^\s{2}/gm, '').trim()
  );
}
