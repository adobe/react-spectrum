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
const mdx = require('@mdx-js/mdx');
const flatMap = require('unist-util-flatmap');
const treeSitter = require('remark-tree-sitter');
const {fragmentUnWrap, fragmentWrap} = require('./MDXFragments');
const frontmatter = require('remark-frontmatter');
const slug = require('remark-slug');
const util = require('mdast-util-toc');
const yaml = require('js-yaml');
const prettier = require('prettier');

module.exports = new Transformer({
  async transform({asset, options}) {
    let exampleCode = [];
    const extractExamples = () => (tree, file) => (
      flatMap(tree, node => {
        if (node.type === 'code') {
          let [meta, ...options] = (node.meta || '').split(' ');
          if (meta === 'import') {
            exampleCode.push(node.value);
            node.meta = null;
            return [];
          }

          if (meta === 'example' || meta === 'snippet') {
            let id = `example-${exampleCode.length}`;

            // TODO: Parsing code with regex is bad. Replace with babel transform or something.
            let code = node.value;
            code = code.replace(/import ((?:.|\n)*?) from (['"].*?['"]);?/g, (m) => {
              exampleCode.push(m);
              return '';
            });

            let provider = meta === 'example' ? 'ExampleProvider' : 'SnippetProvider';
            if (options.includes('themeSwitcher=true')) {
              exampleCode.push('import {ExampleThemeSwitcher} from "@react-spectrum/docs/src/ExampleThemeSwitcher";\n');
              provider = 'ExampleThemeSwitcher';
            }

            if (/^\s*function (.|\n)*}\s*$/.test(code)) {
              let name = code.match(/^\s*function (.*?)\s*\(/)[1];
              code = `(function () {
                ${code}
                ReactDOM.render(<${provider}><${name} /></${provider}>, document.getElementById("${id}"));
              })();`;
            } else if (/^<(.|\n)*>$/m.test(code)) {
              code = `(function () {
                ${code.replace(/^(<(.|\n)*>)$/m, `ReactDOM.render(<${provider}>$1</${provider}>, document.getElementById("${id}"));`)}
              })();`;
            }

            exampleCode.push(code);

            // We'd like to exclude certain sections of the code from being rendered on the page, but they need to be there to actuall
            // execute. So, you can wrap that section in a ///- begin collapse -/// ... ///- end collapse -/// block to mark it.
            node.value = node.value.replace(/\n*\/\/\/- begin collapse -\/\/\/(.|\n)*\/\/\/- end collapse -\/\/\//g, '').trim();
            node.meta = 'example';

            return [
              ...responsiveCode(node),
              {
                type: 'jsx',
                value: `<div id="${id}" />`
              }
            ];
          }

          if (node.lang === 'css') {
            return [
              ...responsiveCode(node),
              {
                type: 'jsx',
                value: '<style>{`' + node.value + '`}</style>'
              }
            ];
          }

          return responsiveCode(node);
        }

        return [node];
      })
    );

    let toc = [];
    let title = '';
    let category = '';
    let keywords = [];
    let description = '';
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

        /**
         * go from complex structure that the mdx plugin renders from to a simpler one
         * it starts as an array because we start with the h2's not h1
         * [{id, textContent, children: [{id, textContent, children: ...}, ...]}, ...]
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
            newTree.id = name.children[0].url.split('#').pop();
            newTree.textContent = name.children[0].children[0].value;
          }
          return newTree;
        }

        // Sometimes pages do not have any notable md structure -- just jsx
        if (fullToc) {
          toc = treeConverter(fullToc || {}, true);
          title = toc[0].textContent;
          toc = toc[0].children;
        }

        /*
         * Piggy back here to grab additional metadata.
         */
        let metadata = node.children.find(c => c.type === 'yaml');
        if (metadata) {
          let yamlData = yaml.safeLoad(metadata.value);
          // title defined in yaml data will override
          title = yamlData.title || title;
          category = yamlData.category || '';
          keywords = yamlData.keywords || [];
          description = yamlData.description || '';
        }

        return node;
      }

      return transformer;
    };

    // Adds an `example` class to `pre` tags followed by examples.
    // This allows us to remove the bottom rounded corners, but only when
    // there is a rendered example below.
    function wrapExamples() {
      return (tree) => (
        flatMap(tree, node => {
          if (node.tagName === 'pre' && node.children && node.children.length > 0 && node.children[0].tagName === 'code' && node.children[0].properties.metastring) {
            node.properties.className = node.children[0].properties.metastring.split(' ');
          }

          return [node];
        })
      );
    }

    const compiled = await mdx(await asset.getCode(), {
      remarkPlugins: [
        slug,
        extractToc,
        extractExamples,
        fragmentWrap,
        [frontmatter, {type: 'yaml', anywhere: true, marker: '-'}],
        [
          treeSitter,
          {
            grammarPackages: [
              '@atom-languages/language-typescript',
              '@atom-languages/language-css'
            ]
          }
        ],
        fragmentUnWrap
      ],
      rehypePlugins: [
        wrapExamples
      ]
    });

    let exampleBundle = exampleCode.length === 0
      ?  ''
      : `import React from 'react';
import ReactDOM from 'react-dom';
import {Example as ExampleProvider, Snippet as SnippetProvider} from '@react-spectrum/docs/src/ThemeSwitcher';
${exampleCode.join('\n')}
export default {};
`;

    // Ensure that the HTML asset always changes so that the packager runs
    asset.type = 'html';
    asset.setCode(Math.random().toString(36).slice(4));
    asset.meta.toc = toc;
    asset.meta.title = title;
    asset.meta.category = category;
    asset.meta.description = description;
    asset.meta.keywords = keywords;

    let assets = [
      asset,
      {
        type: 'jsx',
        content: `/* @jsx mdx */
import React from 'react';
import { mdx } from '@mdx-js/react'
${compiled}
`,
        isInline: true,
        isSplittable: false,
        uniqueKey: 'page',
        env: {
          context: 'node',
          engines: {
            node: process.versions.node
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
          scopeHoist: false,
          minify: false
        }
      }
    ];

    asset.addDependency({
      moduleSpecifier: '@react-spectrum/docs/src/client',
      isAsync: true
    });

    if (toc.length || exampleBundle) {
      asset.addDependency({
        moduleSpecifier: '@react-spectrum/docs/src/docs',
        isAsync: true
      });
    }

    asset.addDependency({
      moduleSpecifier: 'page'
    });

    if (exampleBundle) {
      assets.push({
        type: 'jsx',
        content: exampleBundle,
        uniqueKey: 'example',
        env: {
          outputFormat: asset.env.scopeHoist ? 'esmodule' : 'global'
        }
      });

      asset.addDependency({
        moduleSpecifier: 'example',
        isAsync: true
      });
    }

    return assets;
  }
});

function responsiveCode(node) {
  if (!node.lang) {
    return [node];
  }

  let large = {
    ...node,
    meta: node.meta ? `${node.meta} large` : 'large',
    value: formatCode(node, 80)
  };

  let medium = {
    ...node,
    meta: node.meta ? `${node.meta} medium` : 'medium',
    value: formatCode(large, 60)
  };

  let small = {
    ...node,
    meta: node.meta ? `${node.meta} small` : 'small',
    value: formatCode(medium, 25)
  };

  return [
    large,
    medium,
    small
  ];
}

function formatCode(node, printWidth = 80) {
  let code = node.value;
  if (code.split('\n').every(line => line.length <= printWidth)) {
    return code;
  }

  if (/^<(.|\n)*>$/m.test(code)) {
    code = code.replace(/^(<(.|\n)*>)$/m, '<WRAPPER>$1</WRAPPER>');
  }

  code = prettier.format(code, {
    parser: node.lang === 'css' ? 'css' : 'babel-ts',
    singleQuote: true,
    jsxBracketSameLine: true,
    bracketSpacing: false,
    trailingComma: 'none',
    printWidth
  });

  return code.replace(/^<WRAPPER>((?:.|\n)*)<\/WRAPPER>;?\s*$/m, (str, contents) =>
    contents.replace(/^\s{2}/gm, '').trim()
  );
}
