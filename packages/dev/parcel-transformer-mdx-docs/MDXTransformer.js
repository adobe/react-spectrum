const {Transformer} = require('@parcel/plugin');
const mdx = require('@mdx-js/mdx');
const flatMap = require('unist-util-flatmap');
const treeSitter = require('remark-tree-sitter');
const {fragmentUnWrap, fragmentWrap} = require('./MDXFragments');
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

            let code = node.value;
            if (code.startsWith('function ')) {
              let name = code.match(/^function (.*?)\s*\(/)[1];
              code = `(function () {
                ${code}
                ReactDOM.render(<Provider theme={theme} UNSAFE_className="example"><${name} /></Provider>, document.getElementById("${id}"));
              })();`;
            } else {
              code = `ReactDOM.render(<Provider theme={theme} UNSAFE_className="example">${code}</Provider>, document.getElementById("${id}"));`;
            }

            exampleCode.push(code);

            return [
              node,
              {
                type: 'jsx',
                value: `<div id="${id}" />`
              }
            ];
          }
        }

        return [node];
      })
    );

    let toc = [];
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
        toc = toc[0].children;

        return node;
      }

      return transformer;
    };

    const compiled = await mdx(await asset.getCode(), {
      remarkPlugins: [slug, extractToc, extractExamples, fragmentWrap, [treeSitter, {grammarPackages: ['@atom-languages/language-typescript']}], fragmentUnWrap]
    });

    let exampleBundle = exampleCode.length === 0
      ?  ''
      : `import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from '@react-spectrum/provider';
import {theme} from '@react-spectrum/theme-default';
${exampleCode.join('\n')}
export default {};
`;

    // Ensure that the HTML asset always changes so that the packager runs
    asset.type = 'html';
    asset.setCode(Math.random().toString(36).slice(4));
    asset.meta.toc = toc;

    let assets = [
      asset,
      {
        type: 'jsx',
        code: `/* @jsx mdx */
import React from 'react';
import { mdx } from '@mdx-js/react'
${compiled}
`,
        isInline: true,
        isSplittable: false,
        uniqueKey: 'page',
        env: {
          context: 'node',
          outputFormat: 'commonjs',
          includeNodeModules: {
            react: false
          },
          scopeHoist: false,
          minify: false
        }
      }
    ];

    asset.addDependency({
      moduleSpecifier: 'page'
    });

    if (exampleBundle) {
      assets.push({
        type: 'jsx',
        code: exampleBundle,
        uniqueKey: 'example',
        env: {
          outputFormat: options.scopeHoist ? 'esmodule' : 'global'
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
