/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {actHook as act, renderHook} from '@react-spectrum/test-utils-internal';
import {useNumberFieldState} from '../../src/numberfield/useNumberFieldState';

describe('useNumberFieldState', () => {
  describe('formatOptions stability', () => {
    it('does not reset inputValue when re-rendered with same formatOptions content', () => {
      let initialFormatOptions = {
        style: 'unit',
        unit: 'millisecond',
        useGrouping: false
      } as Intl.NumberFormatOptions;
      let {result, rerender} = renderHook(
        ({formatOptions}) => useNumberFieldState({defaultValue: 1, formatOptions, locale: 'en-US'}),
        {initialProps: {formatOptions: initialFormatOptions}}
      );

      // Simulate user typing '2' (without committing)
      act(() => {
        result.current.setInputValue('2');
      });
      expect(result.current.inputValue).toBe('2');

      // Re-render with new-reference but same-content formatOptions (simulates inline object literal)
      rerender({
        formatOptions: {
          style: 'unit',
          unit: 'millisecond',
          useGrouping: false
        } as Intl.NumberFormatOptions
      });

      // inputValue should NOT be reset to '1' (the formatted defaultValue)
      expect(result.current.inputValue).toBe('2');
    });

    it('resets inputValue when formatOptions content actually changes', () => {
      let {result, rerender} = renderHook(
        ({formatOptions}) =>
          useNumberFieldState({defaultValue: 1024, formatOptions, locale: 'en-US'}),
        {
          initialProps: {
            formatOptions: {style: 'currency', currency: 'EUR'} as Intl.NumberFormatOptions
          }
        }
      );

      expect(result.current.inputValue).toBe('€1,024.00');

      rerender({formatOptions: {style: 'currency', currency: 'USD'}});

      expect(result.current.inputValue).toBe('$1,024.00');
    });

    it('does not reset inputValue when re-rendered with undefined formatOptions', () => {
      let {result, rerender} = renderHook(
        ({formatOptions}) => useNumberFieldState({defaultValue: 1, formatOptions, locale: 'en-US'}),
        {initialProps: {formatOptions: undefined as Intl.NumberFormatOptions | undefined}}
      );

      act(() => {
        result.current.setInputValue('2');
      });
      expect(result.current.inputValue).toBe('2');

      rerender({formatOptions: undefined});

      expect(result.current.inputValue).toBe('2');
    });
  });
});
