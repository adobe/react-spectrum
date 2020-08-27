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

import {Color} from '../src/Color';
import {renderHook} from '@testing-library/react-hooks';
import {useHexColorFieldState} from '../';

describe('useHexColorFieldState tests', function () {
  it('should accept 6-length hex string', function () {
    let props = {defaultValue: '#aabbcc'};
    const {result} = renderHook(() => useHexColorFieldState(props));
    expect(result.current.colorValue.value).toEqual({
      red: 170,
      green: 187,
      blue: 204,
      alpha: 1
    });
    expect(result.current.inputValue).toBe('#AABBCC');
    expect(result.current.textValue).toBe('#AABBCC');
  });

  it('should accept 3-length hex string', function () {
    let props = {defaultValue: '#abc'};
    const {result} = renderHook(() => useHexColorFieldState(props));
    expect(result.current.colorValue.value).toEqual({
      red: 170,
      green: 187,
      blue: 204,
      alpha: 1
    });
    expect(result.current.inputValue).toBe('#AABBCC');
    expect(result.current.textValue).toBe('#AABBCC');
  });

  it('should accept Color value', function () {
    let props = {defaultValue: new Color('#aabbcc')};
    const {result} = renderHook(() => useHexColorFieldState(props));
    expect(result.current.colorValue.value).toEqual({
      red: 170,
      green: 187,
      blue: 204,
      alpha: 1
    });
    expect(result.current.inputValue).toBe('#AABBCC');
    expect(result.current.textValue).toBe('#AABBCC');
  });

});
