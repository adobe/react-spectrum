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

import {filterDOMProps} from '../../src/utils/filterDOMProps';

describe('filterDOMProps', () => {
  it('always includes id', () => {
    expect(filterDOMProps({id: 'foo'})).toEqual({id: 'foo'});
  });

  it('strips global attributes when global is not requested', () => {
    let props = {dir: 'rtl', hidden: true, suppressHydrationWarning: true};
    expect(filterDOMProps(props)).toEqual({});
  });

  it('includes global attributes when global is requested', () => {
    let props = {
      dir: 'rtl',
      lang: 'en',
      hidden: true,
      inert: true,
      translate: 'no',
      suppressHydrationWarning: true
    } as const;
    expect(filterDOMProps(props, {global: true})).toEqual(props);
  });

  it('includes suppressHydrationWarning when global is requested', () => {
    expect(filterDOMProps({suppressHydrationWarning: true}, {global: true})).toEqual({
      suppressHydrationWarning: true
    });
  });

  it('strips suppressHydrationWarning when global is not requested', () => {
    expect(filterDOMProps({suppressHydrationWarning: true})).toEqual({});
  });
});
