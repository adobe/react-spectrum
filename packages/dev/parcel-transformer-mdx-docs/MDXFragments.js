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

const flatMap = require('unist-util-flatmap');

/**
 * Takes example code blocks in mdx files that are just React Tags and wraps all of them into
 * a single Fragment shorthand node. This way syntax trees can parse them and return something meaningful.
 */
const fragmentWrap = () => (tree, file) => (
  flatMap(tree, node => {
    if (node.type === 'code') {
      if (/^example/.test(node.meta)) {
        if (/^<(.|\n)*>$/m.test(node.value)) {
          node.value = node.value.replace(/^(<(.|\n)*>)$/m, '<WRAPPER>\n$1\n</WRAPPER>');
        }

        return [node];
      }

      if (node.meta === 'snippet') {
        return [];
      }
    }

    return [node];
  })
);

function match(children, i, ...texts) {
  if (children.length < i + texts.length) {
    return false;
  }

  for (let t = 0; t < texts.length; t++, i++) {
    let text = texts[t];
    let child = children[i];

    if (child.type === 'element') {
      if (child.children && child.children[0] && child.children[0].value !== text) {
        return false;
      }
    } else if (child.type === 'text') {
      if (child.value !== text) {
        return false;
      }
    }
  }

  return true;
}

/**
 * This undoes the above wrapping for display purposes.
 */
const fragmentUnWrap = () => (tree, file) => (
  flatMap(tree, node => {
    if (node.type === 'code') {
      if (/^example|^snippet/.test(node.meta) && node.data && node.data.hChildren) {
        let children = node.data.hChildren[0].children;
        for (let i = 0; i < children.length; i++) {
          if (match(children, i, '<', 'WRAPPER', '>', '\n')) {
            children.splice(i, 4);
          }

          if (match(children, i, '\n', '<', '/', 'WRAPPER', '>')) {
            children.splice(i, 5);
          }
        }

        return [
          node
        ];
      }
    }

    return [node];
  })
);

module.exports = {fragmentUnWrap, fragmentWrap};

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
