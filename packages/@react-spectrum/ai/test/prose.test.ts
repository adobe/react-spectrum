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

import {prose} from '../src/style/prose';

it('emits nested language-specific font weights', () => {
  let css = '';
  prose.call({
    addAsset({content}) {
      css = content;
    }
  });

  expect(css).toMatch(
    /&:lang\(ja, ko, zh, zh-Hant, zh-Hans\) \{\s+font-weight: 800;\s+&:lang\(ja, ko, zh\) \{ font-weight: 700; \}\s+\}/
  );
  expect(css).not.toContain('undefined');
  expect(css).not.toContain('[object Object]');
});
