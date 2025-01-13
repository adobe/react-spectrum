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

// package.json in this directory is not the real package.json. Lint rule not smart enough.
// eslint-disable-next-line rulesdir/imports
import * as tokens from '@adobe/spectrum-tokens/dist/json/variables.json';

export function getToken(name: keyof typeof tokens): string {
  return (tokens[name] as any).value;
}

export function colorToken(name: keyof typeof tokens) {
  let token = tokens[name] as typeof tokens['gray-25'];
  return `light-dark(${token.sets.light.value}, ${token.sets.dark.value})`;
}

export function weirdColorToken(name: keyof typeof tokens) {
  let token = tokens[name] as typeof tokens['accent-background-color-default'];
  return `light-dark(${token.sets.light.sets.light.value}, ${token.sets.dark.sets.dark.value})`;
}

type ReplaceColor<S extends string> = S extends `${infer S}-color-${infer N}` ? `${S}-${N}` : S;

export function colorScale<S extends string>(scale: S): Record<ReplaceColor<Extract<keyof typeof tokens, `${S}-${number}`>>, ReturnType<typeof colorToken>> {
  let res: any = {};
  let re = new RegExp(`^${scale}-\\d+$`);
  for (let token in tokens) {
    if (re.test(token)) {
      res[token.replace('-color', '')] = colorToken(token as keyof typeof tokens);
    }
  }
  return res;
}

export function simpleColorScale<S extends string>(scale: S): Record<Extract<keyof typeof tokens, `${S}-${number}`>, string> {
  let res: any = {};
  let re = new RegExp(`^${scale}-\\d+$`);
  for (let token in tokens) {
    if (re.test(token)) {
      res[token] = (tokens as any)[token].value;
    }
  }
  return res;
}

function extractOpacity(color: string): number {
  return Number(color.match(/^rgba\(\d+, \d+, \d+, ([.\d]+)\)$/)?.[1] ?? 1);
}

/** 
 * This swaps between white or black based on the background color.
 * After testing against all RGB background colors, 49.44 minimizes the number of WCAG 4.5:1 contrast failures.
 */
export function autoStaticColor(bg = 'var(--s2-container-bg)', alpha = 1) {
  return `lch(from ${bg} calc((49.44 - l) * infinity) 0 0 / ${alpha})`;
}

export function generateOverlayColorScale(bg = 'var(--s2-container-bg)') {
  return {
    'transparent-overlay-25': autoStaticColor(bg, extractOpacity(getToken('transparent-white-25'))),
    'transparent-overlay-50': autoStaticColor(bg, extractOpacity(getToken('transparent-white-50'))),
    'transparent-overlay-75': autoStaticColor(bg, extractOpacity(getToken('transparent-white-75'))),
    'transparent-overlay-100': autoStaticColor(bg, extractOpacity(getToken('transparent-white-100'))),
    'transparent-overlay-200': autoStaticColor(bg, extractOpacity(getToken('transparent-white-200'))),
    'transparent-overlay-300': autoStaticColor(bg, extractOpacity(getToken('transparent-white-300'))),
    'transparent-overlay-400': autoStaticColor(bg, extractOpacity(getToken('transparent-white-400'))),
    'transparent-overlay-500': autoStaticColor(bg, extractOpacity(getToken('transparent-white-500'))),
    'transparent-overlay-600': autoStaticColor(bg, extractOpacity(getToken('transparent-white-600'))),
    'transparent-overlay-700': autoStaticColor(bg, extractOpacity(getToken('transparent-white-700'))),
    'transparent-overlay-800': autoStaticColor(bg, extractOpacity(getToken('transparent-white-800'))),
    'transparent-overlay-900': autoStaticColor(bg, extractOpacity(getToken('transparent-white-900'))),
    'transparent-overlay-1000': autoStaticColor(bg, extractOpacity(getToken('transparent-white-1000')))
  };
}

function pxToRem(px: string | number) {
  if (typeof px === 'string') {
    px = parseFloat(px);
  }
  return px / 16 + 'rem';
}

export function fontSizeToken(name: keyof typeof tokens) {
  let token = tokens[name] as typeof tokens['font-size-100'];
  return {
    default: pxToRem(token.sets.desktop.value),
    touch: pxToRem(token.sets.mobile.value)
  };
}
