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

// This generates a low specificity rule to define a default value for
// --s2-color-scheme. This is used when rendering
// a <Provider> without setting a colorScheme prop, and when page.css is not present.
// It is equivalent to setting `color-scheme: light dark`, but without overriding
// the browser default for content outside the provider.
// Also set defaults for --s2-scale here.
export function generateDefaultColorSchemeStyles(this: MacroContext | void): void {
  if (this && typeof this.addAsset === 'function') {
    this.addAsset({
      type: 'css',
      content: `@layer _.a {
        :where(:root, :host) {
          --s2-color-scheme: light dark;
          --s2-scale: 1;
          --s2-font-size-base: 14;

          /* For backward compatibility in two cases:
           *   1. When a component compiled with an earlier version of S2 is embedded in a newer provider.
           *   2. When S2 CSS is compiled with lightningcss, setting color-scheme via a variable does not work. */
          --lightningcss-light: initial;
          --lightningcss-dark: ;

          @media (prefers-color-scheme: dark) {
            --lightningcss-light: ;
            --lightningcss-dark: initial;
          }

          @media not ((hover: hover) and (pointer: fine)) {
            --s2-scale: 1.25;
            --s2-font-size-base: 17;
          }
        }
      }`
    });
  }
}
