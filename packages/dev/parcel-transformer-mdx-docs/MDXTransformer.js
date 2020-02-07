const {Transformer} = require('@parcel/plugin');
const mdx = require('@mdx-js/mdx');
const flatMap = require('unist-util-flatmap');
const treeSitter = require('remark-tree-sitter');

module.exports = new Transformer({
  async transform({asset}) {
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

    const openingTag = '<>\n';
    const closingTag = '\n</>';
    const fragmentWrap = () => (tree, file) => (
      flatMap(tree, node => {
        if (node.type === 'code') {
          if (node.meta === 'example') {
            let code = node.value;
            if (!code.startsWith('function ')) {
              node.value = `${openingTag}${code}${closingTag}`;
            }

            return [
              node
            ];
          }
        }

        return [node];
      })
    );

    const get = p => o =>
      p.reduce((xs, x) =>
        (xs && xs[x]) ? xs[x] : null, o);

    /**
     * Example of what the nodes look like
{
  type: 'code',
  lang: 'tsx',
  meta: 'example',
  value: '<>\n<Button variant="cta">Test</Button>\n</>',
  position: Position {
    start: { line: 28, column: 1, offset: 646 },
    end: { line: 30, column: 4, offset: 700 },
    indent: [ 1, 1 ]
  },
  data: {
    hProperties: { className: [ 'tree-sitter', 'language-tsx' ] },
    hChildren: [
      {
        type: 'element',
        tagName: 'span',
        properties: { className: [ 'source', 'ts' ] },
        children: [
          {
            type: 'element',
            tagName: 'span',
            properties: { className: [ 'keyword', 'operator', 'js' ] },
            children: [ { type: 'text', value: '<' } ]
          },
          {
            type: 'element',
            tagName: 'span',
            properties: { className: [ 'keyword', 'operator', 'js' ] },
            children: [ { type: 'text', value: '>' } ]
          },
          { type: 'text', value: '\n' },
          ...
          { type: 'text', value: '\n' },
          {
            type: 'element',
            tagName: 'span',
            properties: { className: [ 'keyword', 'operator', 'js' ] },
            children: [ { type: 'text', value: '<' } ]
          },
          {
            type: 'element',
            tagName: 'span',
            properties: { className: [ 'keyword', 'operator', 'js' ] },
            children: [ { type: 'text', value: '/' } ]
          },
          {
            type: 'element',
            tagName: 'span',
            properties: { className: [ 'keyword', 'operator', 'js' ] },
            children: [ { type: 'text', value: '>' } ]
          }
     */

    const fragmentUnWrap = () => (tree, file) => (
      flatMap(tree, node => {
        if (node.type === 'code') {
          if (node.meta === 'example' && node.data.hChildren) {
            if (get(['data', 'hChildren', 0, 'children', 1, 'children', 0, 'value'])(node) === '>') {
              // unshift the children that make up `<>\n`
              node.data.hChildren[0].children.shift();
              node.data.hChildren[0].children.shift();
              node.data.hChildren[0].children.shift();

              // remove the last children that make up `\n</>`
              node.data.hChildren[0].children.length = node.data.hChildren[0].children.length - 4;

              // fix the 'value' field to reflect what we've done getting rid of the wrapping <></>
              node.value = node.value.slice(3, node.value.length - 4);
            }

            return [
              node
            ];
          }
        }

        return [node];
      })
    );

    const compiled = await mdx(await asset.getCode(), {
      remarkPlugins: [extractExamples, fragmentWrap, [treeSitter, {grammarPackages: ['@atom-languages/language-typescript']}], fragmentUnWrap]
    });

    let exampleBundle = exampleCode.length === 0
      ?  ''
      : `import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from '@react-spectrum/provider';
import {theme} from '@react-spectrum/theme-default';
${exampleCode.join('\n')}
`;

    // Ensure that the HTML asset always changes so that the packager runs
    let random = Math.random().toString(36).slice(4);
    let assets = [
      {
        type: 'html',
        code: exampleBundle ? `${random}<script src="example"></script>` : random
      },
      {
        type: 'jsx',
        code: `/* @jsx mdx */
import React from 'react';
import { mdx } from '@mdx-js/react'
${compiled}
`,
        isInline: true,
        uniqueKey: 'page',
        env: {
          context: 'node',
          outputFormat: 'commonjs',
          includeNodeModules: {
            react: false
          }
        }
      }
    ];

    if (exampleBundle) {
      assets.push({
        type: 'jsx',
        code: exampleBundle,
        uniqueKey: 'example'
      });
    }

    return assets;
  }
});
