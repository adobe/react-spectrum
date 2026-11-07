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

import {renderHook} from '@react-spectrum/test-utils-internal';
import {useListFormatter} from '../../src/i18n/useListFormatter';

describe('useListFormatter', () => {
  it('reuses the formatter when options are shallowly equal', () => {
    let {result, rerender} = renderHook(
      ({options}) => useListFormatter(options),
      {initialProps: {options: {type: 'conjunction'}}}
    );
    let formatter = result.current;

    rerender({options: {type: 'conjunction'}});
    expect(result.current).toBe(formatter);

    rerender({options: {type: 'disjunction'}});
    expect(result.current).not.toBe(formatter);
    expect(result.current.format(['a', 'b'])).toBe('a or b');
  });

  it('reuses the formatter when options are omitted', () => {
    let {result, rerender} = renderHook(() => useListFormatter());
    let formatter = result.current;

    rerender();

    expect(result.current).toBe(formatter);
  });
});
