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

import {MacroContext} from '@parcel/macros';
import tokens from '@adobe/spectrum-tokens/dist/json/variables.json';

function colorToken(token: typeof tokens['gray-25']) {
  return `light-dark(${token.sets.light.value}, ${token.sets.dark.value})`;
}

function weirdColorToken(token: typeof tokens['background-layer-2-color']) {
  return `light-dark(${token.sets.light.sets.light.value}, ${token.sets.dark.sets.dark.value})`;
}

export function generatePageStyles(this: MacroContext | void) {
  if (this && typeof this.addAsset === 'function') {
    this.addAsset({
      type: 'css',
      content: `html {
        color-scheme: light dark;
        --s2-container-bg: ${colorToken(tokens['background-base-color'])};
        background: var(--s2-container-bg);
        --s2-scale: 1;

        @media not ((hover: hover) and (pointer: fine)) {
          --s2-scale: 1.25;
        }

        &[data-color-scheme=light] {
          color-scheme: light;
        }

        &[data-color-scheme=dark] {
          color-scheme: dark;
        }

        &[data-background=layer-1] {
          --s2-container-bg: ${colorToken(tokens['background-layer-1-color'])};
        }

        &[data-background=layer-2] {
          --s2-container-bg: ${weirdColorToken(tokens['background-layer-2-color'])};
        }
      }`
    });
  }
}

// This generates a low specificity rule to define default values for 
// --lightningcss-light and --lightningcss-dark. This is used when rendering
// a <Provider> without setting a colorScheme prop, and when page.css is not present.
// It is equivalent to setting `color-scheme: light dark`, but without overriding
// the browser default for content outside the provider.
// Also set defaults for --s2-scale here.
export function generateDefaultColorSchemeStyles(this: MacroContext | void) {
  if (this && typeof this.addAsset === 'function') {
    this.addAsset({
      type: 'css',
      content: `@layer _.a {
        :where(html) {
          --lightningcss-light: initial;
          --lightningcss-dark: ;
          --s2-scale: 1;

          @media (prefers-color-scheme: dark) {
            --lightningcss-light: ;
            --lightningcss-dark: initial;
          }

          @media not ((hover: hover) and (pointer: fine)) {
            --s2-scale: 1.25;
          }
        }
      }`
    });
  }
}
