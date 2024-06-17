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

import {parseColor, useColorFieldState} from '@react-stately/color';
import React from 'react';
import {renderHook} from '@react-spectrum/test-utils-internal';
import {useColorField} from '../';

describe('useColorField', function () {
  let ref;

  beforeEach(() => {
    ref = React.createRef();
    ref.current = document.createElement('input');
  });

  let renderColorFieldHook = (props) => {
    let {result} = renderHook(() => useColorField({
      'aria-label': 'Primary Color',
      ...props
    }, useColorFieldState(props), ref));
    return result.current;
  };

  it('handles defaults', function () {
    let {inputProps} = renderColorFieldHook({});
    expect(inputProps.type).toBe('text');
    expect(inputProps.autoComplete).toBe('off');
    expect(inputProps.autoCorrect).toBe('off');
    expect(inputProps.id).toBeTruthy();
    expect(inputProps.role).toBe('textbox');
    expect(inputProps['aria-valuenow']).toBeNull();
    expect(inputProps['aria-valuetext']).toBeNull();
    expect(inputProps['aria-valuemin']).toBeNull();
    expect(inputProps['aria-valuemax']).toBeNull();
    expect(inputProps['aria-required']).toBeUndefined();
    expect(inputProps['aria-disabled']).toBeUndefined();
    expect(inputProps['aria-readonly']).toBeUndefined();
    expect(inputProps['aria-invalid']).toBeUndefined();
    expect(inputProps.disabled).toBe(false);
    expect(inputProps.readOnly).toBe(false);
    expect(inputProps.spellCheck).toBe('false');
  });

  it('should return props for colorValue provided', function () {
    let colorValue = parseColor('#ff88a0');
    let {inputProps} = renderColorFieldHook({value: colorValue});
    expect(inputProps['aria-valuenow']).toBeNull();
    expect(inputProps['aria-valuetext']).toBeNull();
    expect(inputProps['value']).toBe('#FF88A0');
  });

  it('should return props for label', function () {
    let {labelProps, inputProps} = renderColorFieldHook({
      'aria-label': undefined,
      label: 'Secondary Color'
    });
    expect(labelProps.id).toBeTruthy();
    expect(labelProps.htmlFor).toBe(inputProps.id);
    expect(inputProps.id).toBeTruthy();
    expect(inputProps['aria-labelledby']).toBe(labelProps.id);
    expect(inputProps['aria-label']).toBeUndefined(); // because label prop is provided instead of aria-label
  });

  it('should return prop for invalid', function () {
    let {inputProps} = renderColorFieldHook({isInvalid: true});
    expect(inputProps['aria-invalid']).toBe(true);
  });

  it('should return prop for required', function () {
    let {inputProps} = renderColorFieldHook({isRequired: true});
    expect(inputProps['aria-required']).toBe(true);
  });

  it('should return prop for readonly', function () {
    let {inputProps} = renderColorFieldHook({isReadOnly: true});
    expect(inputProps['aria-readonly']).toBe(true);
    expect(inputProps.readOnly).toBe(true);
  });

  it('should return prop for disabled', function () {
    let {inputProps} = renderColorFieldHook({isDisabled: true});
    expect(inputProps['aria-disabled']).toBe(true);
    expect(inputProps.disabled).toBe(true);
  });
});
