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

import {Item} from '@react-stately/collections';
import {ListLayout} from '@react-stately/layout';
import React from 'react';
import {renderHook} from '@testing-library/react-hooks';
import {useComboBox} from '../';
import {useSingleSelectListState} from '@react-stately/list';

describe('useComboBox', function () {
  let setOpen = jest.fn();
  let setFocusedKey = jest.fn();

  let defaultProps = {items: [{id: 1, name: 'one'}], children: (props) => <Item>{props.name}</Item>};
  let {result} = renderHook(() => useSingleSelectListState(defaultProps));
  let mockLayout = new ListLayout({
    rowHeight: 40
  });
  mockLayout.collection = result.current.collection;

  afterEach(() => {
    setOpen.mockClear();
    setFocusedKey.mockClear();
  });

  it('should return default props for all the button group elements', function () {
    let props = {
      label: 'test label',
      popoverRef: React.createRef(),
      triggerRef: React.createRef(),
      textFieldRef: React.createRef(),
      layout: mockLayout
    };

    let {result} = renderHook(() => useComboBox(props, useSingleSelectListState(defaultProps)));
    let {triggerProps, inputProps, listBoxProps, labelProps} = result.current;

    expect(labelProps.id).toBeTruthy();
    expect(labelProps.htmlFor).toBe(inputProps.id);
    expect(inputProps.id).toBeTruthy();
    expect(inputProps['aria-labelledby']).toBe(labelProps.id);
    expect(inputProps.role).toBe('combobox');
    expect(inputProps['aria-autocomplete']).toBe('list');
    expect(inputProps['aria-controls']).toBeFalsy();
    expect(inputProps['aria-activedescendant']).toBeFalsy();
    expect(listBoxProps.id).toBeTruthy();
    expect(listBoxProps['aria-labelledby']).toBe(triggerProps.id);
    expect(triggerProps.id).toBeTruthy();
    expect(triggerProps.excludeFromTabOrder).toBeTruthy();
    expect(triggerProps['aria-haspopup']).toBeTruthy();
    expect(triggerProps['aria-expanded']).toBeFalsy();
    expect(triggerProps['aria-controls']).toBeFalsy();
    expect(triggerProps['onPress']).toBeTruthy();
    expect(triggerProps['onPressStart']).toBeTruthy();
    expect(triggerProps['onKeyDown']).toBeTruthy();
  });
});
