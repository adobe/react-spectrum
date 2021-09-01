/*
 * Copyright 2021 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {LayoutInfo, Rect} from '../';

describe('LayoutInfo', () => {
  it('should return a copy of the current LayoutInfo after calling copy()', () => {
    let layoutInfo = new LayoutInfo('loader', 'key', new Rect(10, 10, 10, 10));
    layoutInfo.parentKey = 'parent key';
    layoutInfo.estimatedSize = true;
    layoutInfo.isSticky = true;
    layoutInfo.opacity = 3;
    layoutInfo.transform = 'scale3d(0.8, 0.8, 0.8)';
    layoutInfo.zIndex = 5;
    // Cursory check that layoutInfo has been changed
    expect(layoutInfo.zIndex).toBe(5);

    let copy = layoutInfo.copy();
    expect(copy).toEqual(layoutInfo);

  });
});
