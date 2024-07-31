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

import {mergeStyles} from '../runtime';
import {style} from '../spectrum-theme';

describe('mergeStyles', () => {
  it('should merge styles', () => {
    let a = style({backgroundColor: 'red-1000', color: 'pink-100'});
    let b = style({fontSize: 'body-xs', backgroundColor: 'gray-50'});
    let expected = style({backgroundColor: 'gray-50', color: 'pink-100', fontSize: 'body-xs'});
    let merged = mergeStyles(a, b);
    expect(merged).toBe(expected);
  });

  it('should merge with arbitrary values', () => {
    let a = style({backgroundColor: 'red-1000', color: '[hotpink]'});
    let b = style({fontSize: '[15px]', backgroundColor: 'gray-50'});
    let expected = style({backgroundColor: 'gray-50', color: '[hotpink]', fontSize: '[15px]'});
    let merged = mergeStyles(a, b);
    expect(merged).toBe(expected);
  });
});
