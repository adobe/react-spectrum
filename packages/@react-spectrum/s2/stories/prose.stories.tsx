/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {createPortal} from 'react-dom';
import type {Meta} from '@storybook/react';
import {prose} from '../style/prose' with {type: 'macro'};
// @ts-ignore
import ProseExample from './prose.mdx';
import React, {ReactNode, useEffect, useRef, useState} from 'react';
import {style} from '../style/spectrum-theme' with {type: 'macro'};

const meta: Meta = {
  tags: ['autodocs'],
  title: 'Prose'
};

export default meta;

export const Example = () => (
  <MarginVisualizer>
    <article className={`${prose()} ${style({maxWidth: 800, marginX: 'auto'})}`}>
      <ProseExample components={{CodeBlock: 'pre'}} />
    </article>
  </MarginVisualizer>
);

let componentMapping = {
  h1: 'font:heading-xl; margin:heading',
  h2: 'font:heading-lg; margin:heading',
  h3: 'font:heading; margin:heading',
  h4: 'font:heading-sm; margin:heading',
  h5: 'font:heading-xs; margin:heading',
  h6: 'font:heading-2xs; margin:heading',
  pre: 'font:code-sm; margin:body',
  p: 'font:body; margin:body',
  ul: 'font:body; margin:body',
  ol: 'font:body; margin:body',
  li: 'font:body; margin:body',
  blockquote: 'font:body; margin:body',
  hr: 'margin:32px',
  code: 'font:code; margin:none',
  kbd: 'font:ui; margin:none',
  a: 'font: body; margin:none',
  table: 'font:ui; margin:body',
  thead: 'font:ui; margin:none',
  th: 'font:ui; margin:none',
  td: 'font:ui; margin:none',
  img: 'font:body; margin:none',
  video: 'font:body; margin:none',
  figure: 'font:body; margin:body',
  figcaption: 'font:body-sm; margin:body'
};

// ---------------------------------------------------------------------------
// Margin visualizer (story-only debugging tool)
//
// Toggling the button overlays every non-zero top/bottom (block) margin in the
// prose article. Each margin is drawn as a red box positioned over the margin
// gap, with a label to its right showing the responsible CSS selector and the
// margin size. When two margin boxes overlap (e.g. collapsed adjacent margins),
// the taller one wins as the red box and the shorter ones are drawn as blue
// vertical lines off to the side, each with their own compact label.
// ---------------------------------------------------------------------------

interface MarginBox {
  side: 'top' | 'bottom';
  size: number;
  selector: string;
  mapping: string;
  // Document coordinates.
  left: number;
  top: number;
  width: number;
  height: number;
  type: 'red' | 'blue';
  // Position within its overlap group (0 = tallest/red).
  groupIndex: number;
}

function MarginVisualizer({children}: {children: ReactNode}) {
  let [active, setActive] = useState(false);
  let [boxes, setBoxes] = useState<MarginBox[]>([]);
  let ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!active) {
      setBoxes([]);
      return;
    }

    let recompute = () => {
      if (ref.current) {
        setBoxes(computeBoxes(ref.current));
      }
    };

    // Wait a frame so layout/fonts have settled before measuring.
    let raf = requestAnimationFrame(recompute);
    window.addEventListener('resize', recompute);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', recompute);
    };
  }, [active]);

  return (
    <>
      <button
        type="button"
        onClick={() => setActive(a => !a)}
        style={{
          position: 'fixed',
          top: 12,
          right: 12,
          zIndex: 10000,
          padding: '6px 12px',
          font: '13px/1 sans-serif',
          cursor: 'pointer'
        }}>
        {active ? 'Hide margins' : 'Show margins'}
      </button>
      <div ref={ref}>{children}</div>
      {active && createPortal(<MarginOverlay boxes={boxes} />, document.body)}
    </>
  );
}

function MarginOverlay({boxes}: {boxes: MarginBox[]}) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        pointerEvents: 'none',
        zIndex: 9999
      }}>
      {boxes.map((box, i) =>
        box.type === 'red' ? <RedBox key={i} box={box} /> : <BlueLine key={i} box={box} />
      )}
    </div>
  );
}

function RedBox({box}: {box: MarginBox}) {
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: box.left,
          top: box.top,
          width: box.width,
          height: box.height,
          outline: '1px solid red',
          boxSizing: 'border-box'
        }}
        className={style({backgroundColor: 'red-200'})}
      />
      <div
        style={{
          position: 'absolute',
          left: box.left + box.width + 6,
          top: box.top,
          font: '11px/1.3 monospace',
          whiteSpace: 'nowrap',
          paddingLeft: '4px',
          paddingRight: '4px'
        }}
        className={style({backgroundColor: 'red-700', color: 'black'})}>
        <div>
          {box.selector}
          {box.mapping && <span> {box.mapping}</span>}
        </div>
        <div>
          {box.side === 'top' ? 'margin-top' : 'margin-bottom'}: {box.size}px
        </div>
      </div>
    </>
  );
}

function BlueLine({box}: {box: MarginBox}) {
  // Step each successive blue line further into the left gutter.
  let offset = (box.groupIndex - 1) * 64;
  let x = box.left - 12 - offset;
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: box.top,
          width: 2,
          height: box.height
        }}
        className={style({backgroundColor: 'blue-700'})}
      />
      <div
        style={{
          position: 'absolute',
          left: x - 4,
          top: box.top,
          transform: 'translateX(-100%)',
          font: '10px/1.3 monospace',
          whiteSpace: 'nowrap',
          textAlign: 'right',
          paddingLeft: '4px',
          paddingRight: '4px'
        }}
        className={style({backgroundColor: 'blue-700', color: 'black'})}>
        <div>
          {box.selector}
          {box.mapping && <span> {box.mapping}</span>}
        </div>
        <div>
          {box.side === 'top' ? 'margin-top' : 'margin-bottom'}: {box.size}px
        </div>
      </div>
    </>
  );
}

function computeBoxes(root: HTMLElement): MarginBox[] {
  let prose = root.querySelector('.prose') ?? root;
  let scrollX = window.scrollX;
  let scrollY = window.scrollY;
  let entries: Omit<MarginBox, 'type' | 'groupIndex'>[] = [];

  for (let el of prose.querySelectorAll<HTMLElement>('*')) {
    let cs = getComputedStyle(el);
    let rect = el.getBoundingClientRect();
    for (let side of ['top', 'bottom'] as const) {
      let prop = side === 'top' ? 'margin-top' : 'margin-bottom';
      let size = parseFloat(cs.getPropertyValue(prop));
      if (!size || size <= 0) {
        continue;
      }
      entries.push({
        side,
        size,
        selector: findSelector(el, prop),
        mapping: componentMapping[el.tagName.toLowerCase()] ?? '',
        left: rect.left + scrollX,
        width: rect.width,
        top: (side === 'top' ? rect.top - size : rect.bottom) + scrollY,
        height: size
      });
    }
  }

  return resolveOverlaps(entries);
}

// Group margins that overlap (sharing both horizontal and vertical space). The
// tallest in each group becomes the red box; the rest become blue lines.
function resolveOverlaps(entries: Omit<MarginBox, 'type' | 'groupIndex'>[]): MarginBox[] {
  let n = entries.length;
  let parent = entries.map((_, i) => i);
  let find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  let union = (a: number, b: number) => {
    parent[find(a)] = find(b);
  };

  let overlaps = (a: (typeof entries)[number], b: (typeof entries)[number]) => {
    let horizontal = a.left < b.left + b.width && b.left < a.left + a.width;
    let vertical = a.top < b.top + b.height && b.top < a.top + a.height;
    return horizontal && vertical;
  };

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (overlaps(entries[i], entries[j])) {
        union(i, j);
      }
    }
  }

  let groups = new Map<number, typeof entries>();
  for (let i = 0; i < n; i++) {
    let root = find(i);
    let group = groups.get(root) ?? [];
    group.push(entries[i]);
    groups.set(root, group);
  }

  let result: MarginBox[] = [];
  for (let group of groups.values()) {
    // Tallest margin first wins as the red box.
    group.sort((a, b) => b.size - a.size);
    group.forEach((entry, index) => {
      result.push({...entry, type: index === 0 ? 'red' : 'blue', groupIndex: index});
    });
  }
  return result;
}

// Find the CSS selector responsible for the element's current margin on the
// given side by scanning all stylesheets for matching rules that declare it,
// then picking the cascade winner (highest specificity, last in source order).
function findSelector(el: Element, prop: 'margin-top' | 'margin-bottom'): string {
  let candidates: {selector: string; specificity: number; order: number}[] = [];
  let order = 0;

  let record = (selectors: string[], declaration: CSSStyleDeclaration) => {
    let o = order++;
    if (!declaresMargin(declaration, prop)) {
      return;
    }
    for (let selector of selectors) {
      try {
        if (el.matches(selector)) {
          candidates.push({selector, specificity: specificity(selector), order: o});
        }
      } catch {
        // Ignore selectors el.matches can't parse.
      }
    }
  };

  // `context` is the list of resolved selectors of the enclosing style rule, so
  // nested declarations/rules can be attributed to (and matched against) their
  // parent. CSS nesting splits declarations that follow a nested rule into a
  // separate `CSSNestedDeclarations` sub-rule with no selector of its own.
  let walk = (rules: CSSRuleList, context: string[]) => {
    for (let rule of Array.from(rules)) {
      let styleRule = rule as CSSStyleRule;
      let grouping = rule as CSSGroupingRule;
      if (styleRule.selectorText) {
        let resolved = resolveSelectors(styleRule.selectorText, context);
        record(resolved, styleRule.style);
        if (styleRule.cssRules && styleRule.cssRules.length) {
          walk(styleRule.cssRules, resolved);
        }
      } else if (styleRule.style && !grouping.cssRules) {
        // CSSNestedDeclarations: belongs to the parent rule's selector.
        record(context, styleRule.style);
      } else if (grouping.cssRules) {
        // @media / @supports: keep the same context.
        walk(grouping.cssRules, context);
      }
    }
  };

  for (let sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList | null = null;
    try {
      rules = sheet.cssRules;
    } catch {
      // Cross-origin stylesheet; skip.
      continue;
    }
    if (rules) {
      walk(rules, []);
    }
  }

  if (candidates.length === 0) {
    return '(unknown)';
  }
  candidates.sort((a, b) => a.specificity - b.specificity || a.order - b.order);
  return candidates[candidates.length - 1].selector;
}

// Resolve a (possibly nested) selector list against its parent context,
// substituting `&` with the parent selector per CSS nesting semantics.
function resolveSelectors(selectorText: string, context: string[]): string[] {
  let list = splitSelectorList(selectorText);
  if (context.length === 0) {
    return list;
  }
  let resolved: string[] = [];
  for (let selector of list) {
    for (let parent of context) {
      resolved.push(
        selector.includes('&') ? selector.replace(/&/g, `:is(${parent})`) : `${parent} ${selector}`
      );
    }
  }
  return resolved;
}

function declaresMargin(style: CSSStyleDeclaration, prop: 'margin-top' | 'margin-bottom'): boolean {
  let blockSide = prop === 'margin-top' ? 'margin-block-start' : 'margin-block-end';
  return Boolean(
    style.getPropertyValue(prop) ||
    style.getPropertyValue('margin') ||
    style.getPropertyValue('margin-block') ||
    style.getPropertyValue(blockSide)
  );
}

// Split a selector list on top-level commas (ignoring commas inside `:is()` etc.).
function splitSelectorList(text: string): string[] {
  let parts: string[] = [];
  let depth = 0;
  let current = '';
  for (let ch of text) {
    if (ch === '(') {
      depth++;
    } else if (ch === ')') {
      depth--;
    }
    if (ch === ',' && depth === 0) {
      if (current.trim()) {
        parts.push(current.trim());
      }
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) {
    parts.push(current.trim());
  }
  return parts;
}

// Rough CSS specificity for a single (comma-free) selector: a=IDs, b=classes/
// attributes/pseudo-classes, c=type/pseudo-element selectors.
function specificity(selector: string): number {
  let ids = (selector.match(/#[\w-]+/g) || []).length;
  let classes = (selector.match(/\.[\w-]+|\[[^\]]+\]|:[\w-]+(?:\([^)]*\))?/g) || []).length;
  let types = (selector.replace(/::?[\w-]+(?:\([^)]*\))?/g, ' ').match(/[a-zA-Z][\w-]*/g) || [])
    .length;
  return ids * 100 + classes * 10 + types;
}
