/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

/*
 * THROWAWAY: exploded-layer visualization of PromptFieldContainer for design handoff.
 *
 * Rather than reconstruct the layer stack by hand (it's built from build-time token
 * macros and varies by variant/state), we render the *real* PromptField, read the
 * resolved `background-image` and `box-shadow` off the two painted elements (the outer
 * border <Group> and the inner container <div>), split each into its individual layers,
 * and lay every layer out as its own plane in a 3D exploded stack — plus a legend with
 * the exact resolved CSS for each. So it always matches whatever the component actually
 * renders for the selected variant/state.
 */

import type {Meta} from '@storybook/react';
import {PromptField, PromptFieldSubmitButton, PromptTokenField} from '../src/PromptField';
import React, {useEffect, useRef, useState} from 'react';
import {useLayoutEffect} from '@react-aria/utils';

const meta: Meta = {
  title: 'AI/PromptField Exploded',
  parameters: {layout: 'fullscreen'},
  argTypes: {
    variant: {control: 'radio', options: ['balanced', 'prominent', 'subtle']},
    isGenerating: {control: 'boolean'},
    forceHovered: {control: 'boolean'},
    forceFocused: {control: 'boolean'},
    colorScheme: {control: 'radio', options: ['light', 'dark']},
    gap: {control: {type: 'range', min: 0, max: 200, step: 5}},
    tiltX: {control: {type: 'range', min: 0, max: 80, step: 1}},
    tiltZ: {control: {type: 'range', min: -60, max: 60, step: 1}}
  },
  args: {
    variant: 'balanced',
    isGenerating: false,
    forceHovered: false,
    forceFocused: false,
    colorScheme: 'light',
    gap: 45,
    tiltX: 56,
    tiltZ: -25
  }
};

export default meta;

/** Split a comma-separated CSS value at the _top_ level (ignoring commas inside parens). */
function splitTopLevel(value: string): string[] {
  let out: string[] = [];
  let depth = 0;
  let cur = '';
  for (let ch of value) {
    if (ch === '(') {
      depth++;
    } else if (ch === ')') {
      depth--;
    }
    if (ch === ',' && depth === 0) {
      out.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  if (cur.trim()) {
    out.push(cur.trim());
  }
  return out;
}

interface Layer {
  kind: 'background' | 'shadow';
  /** Renderable CSS (token markers left intact — they render via their fallback value). */
  css: string;
  /** Same layer with token markers replaced by their dotted token name, for the legend. */
  display: string;
  /** Token names referenced by this layer, in order. */
  tokens: string[];
  /** Human label for the role of this layer. */
  role: string;
}

interface Element {
  name: string;
  radius: number;
  width: number;
  height: number;
  layers: Layer[];
}

/** Short, best-effort description of what a single layer is. */
function describe(kind: 'background' | 'shadow', css: string): string {
  if (kind === 'background') {
    if (css.startsWith('linear-gradient')) {
      return 'linear-gradient';
    }
    if (css.startsWith('radial-gradient')) {
      return 'radial-gradient';
    }
    return 'fill';
  }
  let inset = css.trimStart().startsWith('inset');
  return inset ? 'inset shadow' : 'drop shadow';
}

/**
 * A shadow contributes nothing if its color is fully transparent, or if all of
 * its length values (offset-x, offset-y, blur, spread) are 0 — e.g. the
 * `inset 0 0 0 0 transparent` placeholder kept only to make transitions smooth.
 */
function isInvisibleShadow(css: string): boolean {
  // Transparent color: `transparent`, or an rgba()/color() with a 0 alpha.
  if (/\btransparent\b/.test(css)) {
    return true;
  }
  let rgba = css.match(/rgba?\(([^)]+)\)/);
  if (rgba) {
    let parts = rgba[1].split(/[,/]/).map(p => parseFloat(p.trim()));
    if (parts.length >= 4 && parts[3] === 0) {
      return true;
    }
  }
  // Modern color functions (oklch(), oklab(), color(), hsl(), lab(), etc.) carry
  // their alpha after a slash, e.g. `oklch(0.6 0.2 320 / 0)` or `color(srgb 1 0 1 / 0%)`.
  let slashAlpha = css.match(/\/\s*(\d*\.?\d+)%?\s*\)/);
  if (slashAlpha && parseFloat(slashAlpha[1]) === 0) {
    return true;
  }
  // All length values are zero (strip out the color first so its digits don't count).
  let lengths = css.replace(/\b\w+\([^)]*\)/g, '').match(/-?\d*\.?\d+px/g);
  if (lengths && lengths.length > 0 && lengths.every(l => parseFloat(l) === 0)) {
    return true;
  }
  return false;
}

/* ---- authored-CSS reading, so token-name markers survive ---------------- *
 * The `token()` macro wraps every color in `var(--_t-<slug>, <value>)`. Those
 * markers only survive in the *authored* CSS, so instead of reading computed
 * styles we walk the CSSOM: find the class rule for the element, resolve the
 * custom-property cascade for the element's current data-* state, then decode
 * the markers back into token names for the legend.
 * -------------------------------------------------------------------------- */

/** Find the top-level `.<cls>` style rule, descending through @layer/@media groups. */
function findClassRule(cls: string): CSSStyleRule | null {
  let visit = (rules: CSSRuleList): CSSStyleRule | null => {
    for (let rule of Array.from(rules)) {
      if ((rule as CSSStyleRule).selectorText === `.${cls}`) {
        return rule as CSSStyleRule;
      }
      let grouped = (rule as CSSGroupingRule).cssRules;
      if (grouped && !(rule as CSSStyleRule).selectorText) {
        let found = visit(grouped);
        if (found) {
          return found;
        }
      }
    }
    return null;
  };
  for (let sheet of Array.from(document.styleSheets)) {
    try {
      let found = visit(sheet.cssRules);
      if (found) {
        return found;
      }
    } catch {
      // cross-origin stylesheet — skip
    }
  }
  return null;
}

/** Does a nested `&`-relative selector (possibly comma-separated) match `el`? */
function selectorMatches(el: HTMLElement, selectorText: string): boolean {
  return splitTopLevel(selectorText).some(sel => {
    let s = sel.trim().replace(/^&/, '').trim();
    if (s === '') {
      return true;
    }
    try {
      return el.matches(s);
    } catch {
      return false;
    }
  });
}

interface Collected {
  props: Record<string, string>;
  background: string;
  boxShadow: string;
}

/** Walk a matched rule + its matching nested rules, collecting declarations in cascade order. */
function collect(rule: CSSStyleRule, el: HTMLElement, out: Collected): void {
  let read = (style: CSSStyleDeclaration) => {
    // Custom properties come through the indexed iteration reliably.
    for (let i = 0; i < style.length; i++) {
      let name = style[i];
      if (name.startsWith('--')) {
        out.props[name] = style.getPropertyValue(name);
      }
    }
    // Read background/box-shadow via the longhand explicitly. `background` is
    // authored as a shorthand, and iterating/serializing the shorthand is
    // unreliable for multi-layer values — but `background-image` always carries
    // the gradient list. Only overwrite when this rule actually declares it.
    let bg = style.getPropertyValue('background-image') || style.getPropertyValue('background');
    if (bg && bg !== 'none') {
      out.background = bg;
    }
    let bs = style.getPropertyValue('box-shadow');
    if (bs && bs !== 'none') {
      out.boxShadow = bs;
    }
  };
  read(rule.style);
  let children = (rule as CSSGroupingRule).cssRules;
  if (!children) {
    return;
  }
  for (let child of Array.from(children)) {
    let sel = (child as CSSStyleRule).selectorText;
    if (sel != null) {
      if (selectorMatches(el, sel)) {
        collect(child as CSSStyleRule, el, out);
      }
    } else if ((child as any).style) {
      // CSSNestedDeclarations — bare declarations that belong to this scope
      read((child as any).style);
    }
  }
}

/**
 * Split the inside of `var(...)` into its name and (optional) fallback at the first top-level
 * comma.
 */
function splitVar(inner: string): {name: string; fb: string} {
  let depth = 0;
  for (let i = 0; i < inner.length; i++) {
    let ch = inner[i];
    if (ch === '(') {
      depth++;
    } else if (ch === ')') {
      depth--;
    } else if (ch === ',' && depth === 0) {
      return {name: inner.slice(0, i).trim(), fb: inner.slice(i + 1).trim()};
    }
  }
  return {name: inner.trim(), fb: ''};
}

/** Substitute var() references from `props`, keeping `--_t-*` markers and unknown vars intact. */
function resolveVars(
  str: string,
  props: Record<string, string>,
  seen: Set<string> = new Set()
): string {
  let out = '';
  let i = 0;
  while (i < str.length) {
    let idx = str.indexOf('var(', i);
    if (idx < 0) {
      out += str.slice(i);
      break;
    }
    out += str.slice(i, idx);
    let depth = 1;
    let j = idx + 4;
    for (; j < str.length && depth > 0; j++) {
      if (str[j] === '(') {
        depth++;
      } else if (str[j] === ')') {
        depth--;
      }
    }
    let {name, fb} = splitVar(str.slice(idx + 4, j - 1));
    if (name.startsWith('--_t-')) {
      // keep the token marker; still resolve inside its fallback so it renders
      out += `var(${name}, ${resolveVars(fb, props, seen)})`;
    } else if (props[name] != null && !seen.has(name)) {
      out += resolveVars(props[name], props, new Set([...seen, name]));
    } else if (fb) {
      out += resolveVars(fb, props, seen);
    } else {
      out += `var(${name})`;
    }
    i = j;
  }
  return out;
}

/** Replace every `var(--_t-slug, fallback)` marker; `mode` picks the token name or the raw value. */
function decodeMarkers(str: string, mode: 'name' | 'value', tokens: string[] = []): string {
  let out = '';
  let i = 0;
  while (i < str.length) {
    let idx = str.indexOf('var(--_t-', i);
    if (idx < 0) {
      out += str.slice(i);
      break;
    }
    out += str.slice(i, idx);
    let depth = 1;
    let j = idx + 4;
    for (; j < str.length && depth > 0; j++) {
      if (str[j] === '(') {
        depth++;
      } else if (str[j] === ')') {
        depth--;
      }
    }
    let {name, fb} = splitVar(str.slice(idx + 4, j - 1));
    let tokenName = name.replace(/^--_t-/, '').replace(/__/g, '.');
    tokens.push(tokenName);
    out += mode === 'name' ? `token(${tokenName})` : decodeMarkers(fb, 'value', tokens);
    i = j;
  }
  return out;
}

/** Collapse every `light-dark(light, dark)` to the branch for the active color scheme. */
function pickScheme(str: string, scheme: 'light' | 'dark'): string {
  let token = 'light-dark(';
  let out = '';
  let i = 0;
  while (i < str.length) {
    let idx = str.indexOf(token, i);
    if (idx < 0) {
      out += str.slice(i);
      break;
    }
    out += str.slice(i, idx);
    let depth = 1;
    let j = idx + token.length;
    for (; j < str.length && depth > 0; j++) {
      if (str[j] === '(') {
        depth++;
      } else if (str[j] === ')') {
        depth--;
      }
    }
    let args = splitTopLevel(str.slice(idx + token.length, j - 1));
    let picked = scheme === 'dark' ? (args[1] ?? args[0]) : args[0];
    out += pickScheme(picked ?? '', scheme);
    i = j;
  }
  return out;
}

function toLayer(
  kind: 'background' | 'shadow',
  resolved: string,
  i: number,
  scheme: 'light' | 'dark'
): Layer {
  let picked = pickScheme(resolved, scheme);
  let tokens: string[] = [];
  let role = describe(kind, decodeMarkers(picked, 'value', tokens));
  return {
    kind,
    css: picked.replace(/(linear|radial)-gradient\((.+)\)/, (m, t, args) => {
      let res = '';
      let parens = 0;
      for (let c of args) {
        res += c;
        if (c === '(') {
          parens++;
        } else if (c === ')') {
          parens--;
        } else if (c === ',' && parens === 0) {
          res += '\n ';
        }
      }
      return `${t}-gradient(\n  ${res}\n)`;
    }),
    display: decodeMarkers(picked, 'name')
      .replace(/rgb\(from token\((.+?)\) r g b \/ (\d+%)\)/g, 'token($1, $2)')
      .replace(/(linear|radial)-gradient\((.+)\)/, (m, t, args) => {
        let res = '';
        let parens = 0;
        for (let c of args) {
          res += c;
          if (c === '(') {
            parens++;
          } else if (c === ')') {
            parens--;
          } else if (c === ',' && parens === 0) {
            res += '\n ';
          }
        }
        return `${t}-gradient(\n  ${res}\n)`;
      }),
    tokens: [...new Set(tokens)],
    role
  };
}

/**
 * Order layers front-to-back to match CSS paint order: inset shadows sit on top
 * of the background, drop shadows sit behind it.
 */
function orderLayers(shadowLayers: Layer[], bgLayers: Layer[]): Layer[] {
  let inset = shadowLayers.filter(l => l.role === 'inset shadow');
  let drop = shadowLayers.filter(l => l.role === 'drop shadow');
  return [...inset, ...bgLayers, ...drop];
}

/** Read a layer stack from the authored CSS (token markers preserved). */
function readAuthored(el: HTMLElement, scheme: 'light' | 'dark'): Layer[] | null {
  let out: Collected = {props: {}, background: '', boxShadow: ''};
  for (let cls of Array.from(el.classList)) {
    let rule = findClassRule(cls);
    if (
      rule &&
      (rule.style.getPropertyValue('background-image') ||
        rule.style.getPropertyValue('background') ||
        rule.style.getPropertyValue('box-shadow'))
    ) {
      collect(rule, el, out);
    }
  }
  if (!out.background && !out.boxShadow) {
    return null;
  }
  // Strip CSS comments (the box-shadow carries an inline `/* placeholder */`).
  let stripComments = (s: string) =>
    s
      .replace(/\/\*[\s\S]*?\*\//g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  let bg = splitTopLevel(resolveVars(stripComments(out.background), out.props)).filter(
    l => l && l !== 'none'
  );
  let shadows = splitTopLevel(resolveVars(stripComments(out.boxShadow), out.props)).filter(
    l => l && l !== 'none'
  );
  let shadowLayers = shadows
    .map((l, i) => toLayer('shadow', l, i, scheme))
    // Test the resolved value, not the marker string — a token *name* like
    // `--_t-transparent-white-50` would otherwise trip the `transparent` check.
    .filter(l => !isInvisibleShadow(decodeMarkers(l.css, 'value')));
  let bgLayers = bg.map((l, i) => toLayer('background', l, i, scheme));
  return orderLayers(shadowLayers, bgLayers);
}

function readElement(el: HTMLElement, name: string, scheme: 'light' | 'dark'): Element {
  let cs = getComputedStyle(el);
  let rect = el.getBoundingClientRect();

  let layers: Layer[] | null = null;
  try {
    layers = readAuthored(el, scheme);
  } catch {
    layers = null;
  }

  if (!layers) {
    // Fallback: resolved computed values (no token names available).
    let bgImages = splitTopLevel(cs.backgroundImage).filter(l => l && l !== 'none');
    let bgLayers: Layer[] = bgImages.map(css => ({
      kind: 'background' as const,
      css,
      display: css,
      tokens: [],
      role: describe('background', css)
    }));
    if (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') {
      bgLayers.push({
        kind: 'background',
        css: cs.backgroundColor,
        display: cs.backgroundColor,
        tokens: [],
        role: 'background-color'
      });
    }
    let shadows = splitTopLevel(cs.boxShadow).filter(
      l => l && l !== 'none' && !isInvisibleShadow(l)
    );
    let shadowLayers: Layer[] = shadows.map(css => ({
      kind: 'shadow' as const,
      css,
      display: css,
      tokens: [],
      role: describe('shadow', css)
    }));
    layers = orderLayers(shadowLayers, bgLayers);
  }

  return {
    name,
    radius: parseFloat(cs.borderTopLeftRadius) || 0,
    width: rect.width,
    height: rect.height,
    layers
  };
}

function Plane({
  layer,
  el,
  z,
  num,
  tiltX,
  tiltZ
}: {
  layer: Layer;
  el: Element;
  z: number;
  num: number;
  tiltX: number;
  tiltZ: number;
}) {
  let style: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: el.width,
    height: el.height,
    marginTop: -el.height / 2,
    marginLeft: -el.width / 2,
    borderRadius: el.radius,
    transform: `translateZ(${z}px)`,
    transformStyle: 'preserve-3d',
    // faint outline so an empty plane still reads as a card
    outline: '1px solid rgba(128,128,128,0.2)'
  };

  if (layer.kind === 'background') {
    style.backgroundImage = layer.css.startsWith('rgb') ? undefined : layer.css;
    style.backgroundColor = layer.css.startsWith('rgb') ? layer.css : undefined;
  } else {
    // Fill with mid-gray so both light and dark inset/drop shadows are visible.
    // style.backgroundColor = 'rgb(150,150,150)';
    // style.outline = '1px solid rgba(128,128,128,0.35)';
    style.boxShadow = layer.css;
  }

  return (
    <div style={style}>
      {/* Number badge, counter-rotated to face the camera regardless of tilt. */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          left: -30,
          width: 24,
          height: 24,
          borderRadius: '50%',
          background: layer.kind === 'shadow' ? '#0d66d0' : '#d83790',
          color: '#fff',
          fontSize: 13,
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
          // undo the stack's `rotateX(tiltX) rotateZ(tiltZ)` (inverse, reverse order)
          transform: `rotateZ(${-tiltZ}deg) rotateX(${-tiltX}deg) translateZ(2px)`
        }}>
        {num}
      </div>
    </div>
  );
}

function Exploded(props: any) {
  let {variant, isGenerating, forceHovered, forceFocused, colorScheme, gap, tiltX, tiltZ} = props;
  let sourceRef = useRef<HTMLDivElement>(null);
  let [elements, setElements] = useState<Element[]>([]);

  // Force interaction data-attributes on the painted elements (throwaway).
  useEffect(() => {
    let root = sourceRef.current;
    if (!root) {
      return;
    }
    let group = root.querySelector('[role="group"]') as HTMLElement | null;
    let inner = group?.firstElementChild as HTMLElement | null;
    for (let el of [group, inner]) {
      if (!el) {
        continue;
      }
      if (forceHovered) {
        el.setAttribute('data-hovered', 'true');
      } else {
        el.removeAttribute('data-hovered');
      }
      if (forceFocused) {
        el.setAttribute('data-focused', 'true');
      } else {
        el.removeAttribute('data-focused');
      }
    }
  }, [variant, isGenerating, forceHovered, forceFocused, colorScheme]);

  useLayoutEffect(() => {
    let root = sourceRef.current;
    if (!root) {
      return;
    }
    // Let transitions settle and forced attributes apply before reading.
    let id = setTimeout(() => {
      let group = root.querySelector('[role="group"]') as HTMLElement | null;
      let inner = group?.firstElementChild as HTMLElement | null;
      if (!group || !inner) {
        return;
      }
      setElements([
        readElement(inner, 'Inner container (border-radius 24px)', colorScheme),
        readElement(group, 'Outer border (border-radius 30px)', colorScheme)
      ]);
    }, 800);
    return () => clearTimeout(id);
  }, [variant, isGenerating, forceHovered, forceFocused, colorScheme]);

  // Continuous number per layer, in legend order (inner then outer), shared by
  // the per-plane badges and the side legend so a badge maps to a legend entry.
  let layerNumber = new Map<Layer, number>();
  let n = 0;
  for (let el of elements) {
    for (let layer of el.layers) {
      layerNumber.set(layer, ++n);
    }
  }

  // Build the z-ordered stack back-to-front (later = closer to viewer = higher
  // on screen). A group label follows each element's planes, so it sits in front
  // of that group: the outer-border label lands between the two groups, and the
  // inner-container label lands at the very top of the stack.
  type Item =
    | {kind: 'plane'; layer: Layer; el: Element}
    | {kind: 'label'; el: Element; count: number};
  let items: Item[] = [];
  for (let el of [...elements].reverse()) {
    for (let layer of el.layers.toReversed()) {
      items.push({kind: 'plane', layer, el});
    }
    items.push({kind: 'label', el, count: el.layers.length});
  }

  // Assign a z position to each item; add extra padding on either side of a label
  // so it reads clearly in the gap between groups.
  let labelGap = gap + 20;
  let positions: number[] = [];
  let cursor = 0;
  items.forEach((it, idx) => {
    if (idx > 0) {
      let boundary = it.kind === 'label' || items[idx - 1].kind === 'label';
      cursor += boundary ? labelGap : gap;
    }
    positions.push(cursor);
  });
  let mid = (positions[0] + positions[positions.length - 1]) / 2;
  positions = positions.map(p => p - mid);

  return (
    <div
      style={{
        // @ts-ignore
        colorScheme,
        background: colorScheme === 'dark' ? '#1d1d1d' : '#f4f4f4',
        color: colorScheme === 'dark' ? '#eee' : '#222',
        minHeight: '100vh',
        padding: 32,
        fontFamily: 'ui-sans-serif, system-ui, sans-serif'
      }}>
      <h2 style={{margin: '0 0 4px'}}>PromptFieldContainer — exploded layers</h2>
      <p style={{margin: '0 0 24px', opacity: 0.7, maxWidth: 720, fontSize: 13}}>
        Each plane below is a single <code>background-image</code> or <code>box-shadow</code> layer,
        read live off the real component for the current variant/state. Colors are shown as their
        design-token names (recovered from markers the token macro embeds), with the resolved value
        underneath. Front-most planes paint on top. Use the Storybook controls to change variant,
        state, hover/focus and color scheme.
      </p>

      {/* The real, un-exploded component (source of truth). */}
      <div
        style={{
          width: 560,
          maxWidth: '90vw',
          marginBottom: 48,
          // @ts-ignore custom property drives the theme hue
          '--brand': 'rgb(236, 105, 255)'
        }}>
        <div ref={sourceRef}>
          <PromptField variant={variant} isGenerating={isGenerating}>
            <div style={{display: 'flex', gap: 16, alignItems: 'center'}}>
              <PromptTokenField />
              <PromptFieldSubmitButton />
            </div>
          </PromptField>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 20,
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          marginTop: 80
        }}>
        {/* 3D exploded stack */}
        <div
          style={{
            flex: '0 0 auto',
            perspective: 1800,
            perspectiveOrigin: '50% 40%',
            width: 620,
            height: 680,
            overflow: 'visible',
            // @ts-ignore
            colorScheme
          }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
              transformStyle: 'preserve-3d',
              transform: `rotateX(${tiltX}deg) rotateZ(${tiltZ}deg)`
            }}>
            {items.map((it, i) =>
              it.kind === 'plane' ? (
                <Plane
                  key={i}
                  layer={it.layer}
                  el={it.el}
                  num={layerNumber.get(it.layer)!}
                  tiltX={tiltX}
                  tiltZ={tiltZ}
                  z={positions[i]}
                />
              ) : (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    // sit inline at the label's depth, billboarded to the camera
                    transform:
                      `translateZ(${positions[i]}px) ` +
                      `rotateX(${-tiltX}deg) ` +
                      'translate(-50%, -50%)',
                    whiteSpace: 'nowrap',
                    padding: '6px 16px',
                    borderRadius: 999,
                    fontSize: 14,
                    fontWeight: 700,
                    background: colorScheme === 'dark' ? '#eee' : '#222',
                    color: colorScheme === 'dark' ? '#111' : '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.4)'
                  }}>
                  {it.el.name.split(' (')[0]}
                  <span style={{fontWeight: 400, opacity: 0.7, marginLeft: 6}}>
                    {it.count} {it.count === 1 ? 'layer' : 'layers'}
                  </span>
                </div>
              )
            )}
          </div>
        </div>

        {/* Legend: exact CSS, back-to-front */}
        <div style={{flex: '1 1 320px', minWidth: 320}}>
          {elements.map(el => (
            <div key={el.name} style={{marginBottom: 24}}>
              <h3 style={{margin: '0 0 8px', fontSize: 14}}>{el.name}</h3>
              <ul style={{margin: 0, padding: 0, listStyle: 'none', fontSize: 12, lineHeight: 1.5}}>
                {el.layers.map((layer, i) => (
                  <li
                    key={i}
                    style={{marginBottom: 6, display: 'flex', gap: 8, alignItems: 'flex-start'}}>
                    <span
                      style={{
                        flex: '0 0 auto',
                        marginTop: 1,
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: layer.kind === 'shadow' ? '#0d66d0' : '#d83790',
                        color: '#fff',
                        fontSize: 11,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                      {layerNumber.get(layer)}
                    </span>
                    <div style={{minWidth: 0}}>
                      <strong style={{textTransform: 'uppercase', fontSize: 10, opacity: 0.6}}>
                        {layer.kind} · {layer.role}
                      </strong>
                      {/* Token names for this layer, if any were recovered. */}
                      {/* {layer.tokens.length > 0 && (
                        <div style={{display: 'flex', flexWrap: 'wrap', gap: 4, margin: '2px 0'}}>
                          {layer.tokens.map((t, ti) => (
                            <code
                              key={ti}
                              style={{
                                background: colorScheme === 'dark' ? '#3a3a3a' : '#e6e6e6',
                                borderRadius: 4,
                                padding: '1px 5px',
                                fontSize: 11
                              }}>
                              {t}
                            </code>
                          ))}
                        </div>
                      )} */}
                      {/* Layer CSS with token names inlined (falls back to resolved value). */}
                      <div
                        style={{
                          fontFamily: 'ui-monospace, monospace',
                          wordBreak: 'break-all',
                          whiteSpace: 'pre-wrap',
                          opacity: 0.9
                        }}>
                        {layer.display}
                      </div>
                      {/* Fully-resolved value, for reference. */}
                      {/* {layer.tokens.length > 0 && (
                        <div
                          style={{
                            fontFamily: 'ui-monospace, monospace',
                            wordBreak: 'break-all',
                            whiteSpace: 'pre-wrap',
                            opacity: 0.45,
                            fontSize: 11,
                            marginTop: 2
                          }}>
                          {decodeMarkers(layer.css, 'value')}
                        </div>
                      )} */}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const Exploded_ = {
  name: 'Exploded',
  render: (args: any) => <Exploded {...args} />
};
