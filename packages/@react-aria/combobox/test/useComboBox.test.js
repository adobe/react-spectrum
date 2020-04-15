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

import React from 'react';
import {renderHook} from 'react-hooks-testing-library';
import {useComboBox} from '../';

describe('useComboBox', function () {
  let state = {};
  let setOpen = jest.fn(); 

  beforeEach(() => {
  });

  afterEach(() => {
    setOpen.mockClear();
  });

  it('should return default props for all the button group elements', function () {
    let props = {
      label: 'test label',
      buttonRef: {current: true},
      textFieldRef: {current: true}
    };

    let {result} = renderHook(() => useComboBox(props, state));
    let {triggerProps, inputProps, menuProps, labelProps} = result.current;
  
    expect(labelProps.id).toBeTruthy();
    expect(labelProps.htmlFor).toBe(inputProps.id);
    expect(inputProps.id).toBeTruthy();
    expect(inputProps['aria-labelledby']).toBe(labelProps.id);
    expect(inputProps.role).toBe('combobox');
    expect(inputProps['aria-autocomplete']).toBe('list');
    expect(inputProps['aria-controls']).toBeFalsy();

    expect(menuProps.id).toBeTruthy();
    expect(menuProps['aria-labelledby']).toBe(triggerProps.id);
    expect(triggerProps.id).toBeTruthy();
    expect(triggerProps.tabIndex).toBe(-1);
    expect(triggerProps['aria-haspopup']).toBeTruthy();
  });


  // Write test for:
  // Everything should be linked to each other with the appropriate aria attributes
    // aria-labelledby/aria-controls/aria-label/etc
  // stuff has default ids 
  // button gets menuTrigger props (test via react testing library clicks) and it is properly hooked up to show state
    // most of these will get testing in component test probably (keydown interactions, open and close)
  // textfield gets the correct type and other textfield props (onInputChange is passed as onChange to useTextField hook?)
    // readOnly, isDisabled, etc

  // Figure out test for other interactions
    // onFocus, onKeyPress etc
});
