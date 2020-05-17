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

module.exports = new Transformer({
  async transform({asset, options}) {
    let exampleCode = [];
    const extractExamples = () => (tree, file) => (
      flatMap(tree, node => {
        if (node.type === 'code') {
          if (node.meta === 'import') {
            exampleCode.push(node.value);
            node.meta = null;
            return [];
          }

          if (node.meta === 'example') {
            let id = `example-${exampleCode.length}`;

            // TODO: Parsing code with regex is bad. Replace with babel transform or something.
            let code = node.value;
            code = code.replace(/import (\{(?:.|\n)*?\}) from (['"].*?['"]);?/g, (m) => {
              exampleCode.push(m);
              return '';
            });

            if (/^\s*function (.|\n)*}\s*$/.test(code)) {
              let name = code.match(/^\s*function (.*?)\s*\(/)[1];
              code = `(function () {
                ${code}
                ReactDOM.render(<ExampleProvider><${name} /></ExampleProvider>, document.getElementById("${id}"));
              })();`;
            } else if (/^<(.|\n)*>$/m.test(code)) {
              code = `(function () {
                ${code.replace(/^(<(.|\n)*>)$/m, `ReactDOM.render(<ExampleProvider>$1</ExampleProvider>, document.getElementById("${id}"));`)}
              })();`;
            }

            exampleCode.push(code);

            // We'd like to exclude certain sections of the code from being rendered on the page, but they need to be there to actuall
            // execute. So, you can wrap that section in a ///- begin collapse -/// ... ///- end collapse -/// block to mark it.
            node.value = node.value.replace(/\n*\/\/\/- begin collapse -\/\/\/(.|\n)*\/\/\/- end collapse -\/\/\//g, '').trim();

            return [
              node,
              {
                type: 'jsx',
                value: `<div id="${id}" />`
              }
            ];
          }

          if (node.lang === 'css') {
            return [
              node,
              {
                type: 'jsx',
                value: '<style>{`' + node.value + '`}</style>'
              }
            ];
          }
        }

        return [node];
      })
    );

    let toc = [];
    let title = '';
    let category = '';
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

        toc = treeConverter(fullToc, true);
        title = toc[0].textContent;
        toc = toc[0].children;

        /*
         * Piggy back here to grab additional metadata.
         * Should probably use js-yaml at some point.
         */ 
        let metadata = node.children.find(c => c.type === 'yaml');
        if (metadata) {
          let matches = /^category:\s(\w+)$/.exec(metadata.value);
          category = matches ? matches[1] : '';
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
          if (node.tagName === 'pre' && node.children && node.children.length > 0 && node.children[0].tagName === 'code' && node.children[0].properties.metastring === 'example') {
            node.properties.className = ['example'];
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
import {Example as ExampleProvider} from '@react-spectrum/docs/src/ThemeSwitcher';
${exampleCode.join('\n')}
export default {};
`;

    // Ensure that the HTML asset always changes so that the packager runs
    asset.type = 'html';
    asset.setCode(Math.random().toString(36).slice(4));
    asset.meta.toc = toc;
    asset.meta.title = title;
    asset.meta.category = category;

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
