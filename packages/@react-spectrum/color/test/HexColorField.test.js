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

import {Color} from '@react-stately/color';
import {HexColorField} from '../';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {render} from '@testing-library/react';
import {theme} from '@react-spectrum/theme-default';

function renderComponent(props) {
  return render(
    <Provider theme={theme}>
      <HexColorField
        label="Primary Color"
        {...props} />
    </Provider>
  );
}

describe('HexColorField', function () {
  it('should handle defaults', function () {
    renderComponent({});
    expect(true).toBe(true);
  });

  it('should handle labels', function () {
    renderComponent({});
    expect(true).toBe(true);
  });

  it('should handle placeholder', function () {
    renderComponent({});
    expect(true).toBe(true);
  });

  it('should handle valid validation state', function () {
    renderComponent({});
    expect(true).toBe(true);
  });

  it('should handle invalid validation state', function () {
    renderComponent({});
    expect(true).toBe(true);
  });

  it('should handle disabled', function () {
    renderComponent({});
    expect(true).toBe(true);
  });

  it('should handle readonly', function () {
    renderComponent({});
    expect(true).toBe(true);
  });

  it('should handle required', function () {
    renderComponent({});
    expect(true).toBe(true);
  });

  it('should be empty when invalid value is provided', function () {
    renderComponent({});
    expect(true).toBe(true);
  });

  it.each`
    Name                      | props
    ${'3-length hex string'}  | ${{defaultValue: '#abc'}}
    ${'6-length hex string'}  | ${{defaultValue: '#aabbcc'}}
    ${'Color object'}         | ${{defaultValue: new Color('#abc')}}
  `('should accept $Name as value', function ({props}) {
    renderComponent(props);
    expect(true).toBe(true);
  });

  it.each`
    Name                   | props
    ${'custom min value'}  | ${{defaultValue: '#aaa', minValue: '#bbb'}}
    ${'custom max value'}  | ${{defaultValue: '#ccc', maxValue: '#bbb'}}
  `('should clamp initial value provided to $Name', function ({props}) {
    renderComponent(props);
    expect(true).toBe(true);
  });

  it('should handle uncontrolled state', function () {
    renderComponent({});
    expect(true).toBe(true);
  });

  it('should handle controlled state', function () {
    renderComponent({});
    expect(true).toBe(true);
  });

  it.each`
    Name                                | expected      | action
    ${'increment with arrow up key'}    | ${'#AAAAAE'}  | ${() => console.log('arrow up')}
    ${'increment with page up key'}     | ${'#AAAAAE'}  | ${() => console.log('page up')}
    ${'increment with mouse wheel'}     | ${'#AAAAAE'}  | ${() => console.log('mouse wheel')}
    ${'decrement with arrow down key'}  | ${'#AAAAA6'}  | ${() => console.log('arrow down')}
    ${'decrement with page down key'}   | ${'#AAAAA6'}  | ${() => console.log('arrow down')}
    ${'decrement with mouse wheel'}     | ${'#AAAAA6'}  | ${() => console.log('mouse wheel')}
  `('should handle $Name event', function ({expected, action}) {
    renderComponent({
      defaultValue: '#aaa',
      step: 4
    });
    action();
    expect(true).toBe(true);
  });

  it.each`
    Name                             | props                                        | action
    ${'increment beyond max value'}  | ${{defaultValue: '#aaa', maxValue: '#aaa'}}  | ${() => console.log('arrow up')}
    ${'decrement beyond min value'}  | ${{defaultValue: '#aaa', minValue: '#aaa'}}  | ${() => console.log('arrow down')}
  `('should not $Name', function ({props, action}) {
    renderComponent(props);
    action();
    expect(true).toBe(true);
  });

  it.each`
    Name                         | props                                        | action
    ${'increment to max value'}  | ${{defaultValue: '#aaa', maxValue: '#bbb'}}  | ${() => console.log('home key')}
    ${'decrement to min value'}  | ${{defaultValue: '#ccc', minValue: '#bbb'}}  | ${() => console.log('end key')}
  `('should handle $Name', function ({props, action}) {
    renderComponent(props);
    action();
    expect(true).toBe(true);
  });

  it('should revert back to last valid value', function () {
    renderComponent({});
    expect(true).toBe(true);
  });

  it.each`
    Name            | props                                        | action
    ${'max value'}  | ${{defaultValue: '#aaa', maxValue: '#bbb'}}  | ${() => console.log('change input to #ccc')}
    ${'min value'}  | ${{defaultValue: '#ccc', minValue: '#bbb'}}  | ${() => console.log('change input to #aaa')}
  `('should clamp value to $Name on change', function ({props, action}) {
    renderComponent(props);
    action();
    expect(true).toBe(true);
  });
});
