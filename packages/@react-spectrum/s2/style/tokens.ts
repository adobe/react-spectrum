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
