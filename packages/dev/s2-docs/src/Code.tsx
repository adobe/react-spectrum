import {CodeFold} from './CodeFold';
import {CodeProps} from './VisualExampleClient';
import {HastNode, HastTextNode, highlightHast, Language} from 'tree-sitter-highlight';
import React, {ReactNode} from 'react';
import {style} from '@react-spectrum/s2/style' with {type: 'macro'};

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
  variable: style({color: 'fuchsia-1000'}),
  import: style({display: '--import-display'})
};

const mark = style({
  display: 'block',
  backgroundColor: 'blue-800/15',
  borderColor: 'blue-800',
  borderWidth: 0,
  borderStartWidth: 2,
  borderStyle: 'solid',
  marginX: 'calc(var(--code-padding-x) * -1)',
  paddingX: 'calc(var(--code-padding-x) - self(borderStartWidth))',
  color: 'inherit'
});

function Highlight({children}) {
  return <mark className={mark}>{children}</mark>;
}

const groupings = {
  highlight: Highlight,
  collapse: CodeFold
};

export interface ICodeProps {
  children: string,
  lang?: string,
  hideImports?: boolean
}
 
export function Code({children, lang, hideImports = true}: ICodeProps) {
  if (lang) {
    // @ts-ignore
    let highlighted = highlightHast(children, Language[lang.toUpperCase()]);
    let lineNodes = lines(highlighted);
    let idx = lineNodes.findIndex(line => !/^(["']use client["']|(\s*$))/.test(text(line)));
    if (idx > 0) {
      lineNodes = lineNodes.slice(idx);
    }

    if (hideImports) {
      // Group into hidden and visible nodes.
      // Hidden nodes will include all import statements. If a highlighted block is seen,
      // then we'll hide all the lines up until 2 lines before this.
      let hidden: HastNode[] = [];
      let visible: HastNode[] = [];
      let seenNonImportLine = false;
      let hasHighlight = false;
      for (let line of lineNodes) {
        if (!seenNonImportLine && /^(["']use client["']|@?import|(\s*$))/.test(text(line))) {
          hidden.push(line);
        } else {
          seenNonImportLine = true;
          visible.push(line);
        }

        if (line.tagName === 'highlight' && !hasHighlight) {
          hasHighlight = true;
          // Center highlighted lines within collapsed window (~8 lines).
          let highlightedLines = line.children.length;
          let contextLines = highlightedLines < 6
            ? Math.floor((8 - highlightedLines) / 2)
            : 2;
          contextLines++;
          hidden.push(...visible.slice(0, -contextLines));
          visible = visible.slice(-contextLines);
        }
      }

      if (hidden.length && visible.length) {
        lineNodes = [
          {
            type: 'element',
            tagName: 'span',
            children: hidden,
            properties: {
              className: 'import'
            }
          },
          ...visible
        ];
      }
    }
    
    return <code>{renderChildren(lineNodes, 0)}</code>;
  }

  return <code className={style({font: {default: 'code-xs', lg: 'code-sm'}, backgroundColor: 'layer-1', paddingX: 4, borderWidth: 1, borderColor: 'gray-100', borderStyle: 'solid', borderRadius: 'sm', whiteSpace: 'pre-wrap'})}>{children}</code>;
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
      currentLine = [];
      return;
    }
    let childNode = {
      type: 'element',
      tagName: 'div',
      children: [{...node, children: currentLine}]
    } as HastNode;
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
      let begin = comment.match(/^(?:\/\/\/|\/\*)- begin (.+) -(?:\/\/\/|\*\/)$/);
      if (begin) {
        grouping = {
          type: 'element',
          tagName: begin[1],
          children: []
        } as any;
        currentLine = [];
        skip = true;
        continue;
      } else if (grouping && (comment.startsWith('///- end ') || comment.startsWith('/*- end '))) {
        resultLines.push(grouping);
        grouping = null;
        currentLine = [];
        skip = true;
        continue;
      }
    }

    let result = lines(child as HastNode);
    if (result.length) {
      currentLine.push(...result[0].children);
    }
    if (result.length > 1) {
      endLine();
      for (let i = 1; i < result.length - 1; i++) {
        currentLine = result[i].children;
        endLine();
      }
      currentLine = result.at(-1)!.children;
    }
  }

  if (currentLine.length) {
    endLine();
  }

  return resultLines;
}

function renderHast(node: HastNode | HastTextNode, key: number, indent = ''): ReactNode {
  if (node.type === 'element' && 'children' in node) {
    let childArray: ReactNode[] = renderChildren(node.children, key);
    if (node.tagName === 'div') {
      if (typeof childArray.at(-1) === 'string') {
        childArray[childArray.length - 1] += '\n';
      } else {
        childArray.push('\n');
      }
    }

    let children = childArray.length === 1 ? childArray[0] : childArray;
    let className = node.properties?.className.split(' ').map(c => styles[c]).filter(Boolean).join(' ') || undefined;
    if (node.properties?.className === 'comment' && text(node) === '/* PROPS */') {
      return <CodeProps key={key} indent={indent} />;
    }
    
    // CodeProps includes the indent and newlines in case there are no props to show.
    if (node.tagName === 'div' && typeof childArray[0] === 'string' && /^\s+$/.test(childArray[0]) && React.isValidElement(childArray[1]) && childArray[1].type === CodeProps) {
      children = childArray[1];
    }

    if (node.tagName === 'span' && !className) {
      return children;
    }

    if (node.tagName === 'div' && !className) {
      return children;
    }

    let type = groupings[node.tagName] || node.tagName;
    if (type === 'div') {
      // we inserted a newline, so treat this as inline.
      type = 'span';
    }

    return React.createElement(type, {...node.properties, className, key}, children);
  } else {
    // @ts-ignore
    return node.value;
  }
}

function renderChildren(children: (HastNode | HastTextNode)[], key: number) {
  let childArray: ReactNode[] = [];
  for (let [i, child] of children.entries()) {
    let indent = i === 1 && typeof childArray[0] === 'string' && /^\s+$/.test(childArray[0]) ? childArray[0] : '';
    let childNode = renderHast(child, key, indent);
    let childNodes = Array.isArray(childNode) ? childNode : [childNode];
    for (let childNode of childNodes) {
      if (typeof childNode === 'string' && typeof childArray.at(-1) === 'string') {
        childArray[childArray.length - 1] += childNode;
      } else {
        childArray.push(childNode);
        key++;
      }
    }
  }

  return childArray;
}

function text(node) {
  if (node.type === 'text') {
    return node.value;
  } else {
    return node.children.map(c => text(c)).join('');
  }
}
