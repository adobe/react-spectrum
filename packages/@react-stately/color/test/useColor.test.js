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
import {useColor} from '../';

describe('useColor tests', function () {
  it('should accept string value', function () {
    let {result} = renderHook(() => useColor('#abc'));
    expect(result.current.color).toBeInstanceOf(Color);
    expect(result.current.color.getChannelValue('red')).toBe(170);
    expect(result.current.color.getChannelValue('green')).toBe(187);
    expect(result.current.color.getChannelValue('blue')).toBe(204);
    expect(result.current.color.getChannelValue('alpha')).toBe(1);
    expect(result.current.colorInt).toBe(11189196);
  });

  it('should return the same Color object if provided as argument', function () {
    let color = new Color('#abc');
    let {result} = renderHook(() => useColor(color));
    expect(result.current.color).toBe(color);
    expect(result.current.colorInt).toBe(color.toHexInt());
  });
});
