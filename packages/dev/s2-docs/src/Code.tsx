import { style } from '@react-spectrum/s2/style' with {type: 'macro'};
import React, {ReactElement, ReactNode} from 'react';
import {highlightHast, HastNode, HastTextNode, Language} from 'tree-sitter-highlight';
import flatMap from 'unist-util-flatmap';
import { Collapse } from './Collapse';
import docs from 'docs:@react-spectrum/s2';
import { InlineLink, LinkType } from './types';
import { CodeProps } from './VisualExampleClient';

const property = style({color: 'indigo-1000'});
const fn = style({color: 'red-1000'});
export const styles = {
  keyword: style({color: 'magenta-1000'}),
  string: style({color: 'green-1000'}),
  number: style({color: 'pink-1000'}),
  property,
  attribute: property,
  function: fn,
  tag: fn,
  constructor: fn,
  comment: style({color: 'gray-700'}),
  variable: style({color: 'fuchsia-1000'})
};

const mark = style({
  display: 'block',
  backgroundColor: 'blue-800/15',
  borderColor: 'blue-800',
  borderWidth: 0,
  borderStartWidth: 2,
  borderStyle: 'solid',
  marginX: -32,
  paddingX: 32,
  color: '[inherit]'
});

function Highlight({children}) {
  return <mark className={mark}>{children}</mark>;
}

const groupings = {
  highlight: Highlight,
  collapse: Collapse
};
 
export function Code({children, className, lang, hideImports}) {
  if (lang) {
    let highlighted = highlightHast(children, Language[lang.toUpperCase()]);
    let lineNodes = lines(highlighted);
    if (hideImports) {
      let idx = lineNodes.findIndex(line => !/^("use client"|import|(\s*$))/.test(text(line)));
      if (idx >= 0) {
        lineNodes = lineNodes.slice(idx);
      }
    }
    return <code>{lineNodes.map((line, i) => renderHast(line, i))}</code>;
  }

  return <code className={style({font: 'code-sm', backgroundColor: 'layer-1', paddingX: 4, borderWidth: 1, borderColor: 'gray-100', borderStyle: 'solid', borderRadius: 'sm', whiteSpace: 'pre-wrap'})}>{children}</code>;
}

function lines(node: HastNode) {
  let resultLines: HastNode[] = [];
  let currentLine: (HastNode | HastTextNode)[] = [];
  // let properties: Record<string, string> = {};
  let grouping: HastNode | null = null;
  let skip = false;
  let endLine = () => {
    if (skip) {
      skip = false;
      return;
    }
    let childNode = {
      type: 'element',
      tagName: 'div',
      children: [{...node, children: currentLine}]
    };
    if (grouping) {
      grouping.children.push(childNode);
    } else {
      resultLines.push(childNode);
    }
    currentLine = [];
  };

  for (let child of node.children) {
    if (child.type === 'text' && 'value' in child) {
      let parts = child.value.split('\n');
      for (let part of parts.slice(0, -1)) {
        if (part.length) {
          currentLine.push({type: 'text', value: part});
        }
        endLine();
      }
      let last = parts.at(-1);
      if (last?.length) {
        currentLine.push({type: 'text', value: last});
      }
      continue;
    } else if ('properties' in child && child.properties?.className === 'comment') {
      let comment = text(child);
      if (comment.startsWith('///- begin ')) {
        grouping = {
          type: 'element',
          tagName: comment.slice('///- begin '.length, -(' -///'.length)),
          children: []
        };
        currentLine = [];
        skip = true;
        continue;
      } else if (comment.startsWith('///- end ') && grouping) {
        resultLines.push(grouping);
        grouping = null;
        currentLine = [];
        skip = true;
        continue;
      }
    }

    let result = lines(child);
    if (result.length) {
      currentLine.push(...result[0].children);
    }
    if (result.length > 1) {
      endLine();
      for (let i = 1; i < result.length - 1; i++) {
        currentLine = result[i].children;
        endLine();
      }
      currentLine = result.at(-1).children;
    }
  }

  if (currentLine.length) {
    endLine();
  }

  return resultLines;
}

function renderHast(node: HastNode | HastTextNode, key: number): ReactNode {
  if (node.type === 'element' && 'children' in node) {
    let childArray = node.children.map((child, i) => renderHast(child, i));
    if (node.tagName === 'div') {
      childArray.push('\n');
    }

    // Merge adjacent text nodes.
    for (let i = childArray.length - 1; i >= 1; i--) {
      if (typeof childArray[i] === 'string' && typeof childArray[i - 1] === 'string') {
        // @ts-ignore - we just checked the type above
        childArray[i - 1] += childArray[i];
        childArray.splice(i, 1);
      }
    }

    let children = childArray.length === 1 ? childArray[0] : childArray;
    let className = node.properties?.className.split(' ').map(c => styles[c]).filter(Boolean).join(' ') || undefined;
    if (/function|constructor|tag/.test(node.properties?.className) && !/method/.test(node.properties?.className) && text(node) === 'Switch') {
      // return <a href={'/' + text(node)} {...node.properties} className={className} key={key}>{children}</a>;
      return <InlineLink key={key} type={docs.exports.Switch} />;
    }
    if (node.properties?.className === 'comment' && text(node) === '/* PROPS */') {
      return <CodeProps key={key} />;
    }
    if (node.tagName === 'span' && !className) {
      return children;
    }
    if (node.tagName === 'div') {
      return children;
    }
    let type = groupings[node.tagName] || node.tagName;
    return React.createElement(type, {...node.properties, className, key}, children);
  } else {
    return node.value;
  }
}

function text(node) {
  if (node.type === 'text') {
    return node.value;
  } else {
    return node.children.map(c => text(c)).join('');
  }
}
