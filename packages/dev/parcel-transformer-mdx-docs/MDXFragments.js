const flatMap = require('unist-util-flatmap');

const openingTag = '<>\n';
const closingTag = '\n</>';

const get = p => o =>
  p.reduce((xs, x) =>
    (xs && xs[x]) ? xs[x] : null, o);

/**
 * Takes example code blocks in mdx files that are just React Tags and wraps all of them into
 * a single Fragment shorthand node. This way syntax trees can parse them and return something meaningful
 */
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

/**
 * This undoes the above wrapping for display purposes.
 */
const fragmentUnWrap = () => (tree, file) => (
  flatMap(tree, node => {
    if (node.type === 'code') {
      if (node.meta === 'example' && node.data && node.data.hChildren) {
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
