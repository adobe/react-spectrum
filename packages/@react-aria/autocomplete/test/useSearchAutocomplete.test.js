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

import {Item} from '@react-stately/collections';
import React from 'react';
import {renderHook} from '@react-spectrum/test-utils-internal';
import {useComboBoxState} from '@react-stately/combobox';
import {useSearchAutocomplete} from '../';

describe('useSearchAutocomplete', function () {
  let preventDefault = jest.fn();
  let stopPropagation = jest.fn();
  let event = (e) => ({
    ...e,
    nativeEvent: {
      isComposing: false
    },
    preventDefault,
    stopPropagation
  });

  let defaultProps = {items: [{id: 1, name: 'one'}], children: (props) => <Item>{props.name}</Item>};

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return default props for all the elements', function () {
    let props = {
      label: 'test label',
      popoverRef: React.createRef(),
      inputRef: React.createRef(),
      listBoxRef: React.createRef()
    };

    let {result} = renderHook(() => useSearchAutocomplete(props, useComboBoxState(defaultProps)));
    let {inputProps, listBoxProps, labelProps} = result.current;

    expect(labelProps.id).toBeTruthy();
    expect(labelProps.htmlFor).toBe(inputProps.id);
    expect(inputProps.id).toBeTruthy();
    expect(inputProps['aria-labelledby']).toBe(labelProps.id);
    expect(inputProps.role).toBe('combobox');
    expect(inputProps['aria-autocomplete']).toBe('list');
    expect(inputProps['aria-controls']).toBeFalsy();
    expect(inputProps['aria-activedescendant']).toBeFalsy();
    expect(listBoxProps.id).toBeTruthy();
    expect(listBoxProps['aria-labelledby']).toBe(`${listBoxProps.id} ${labelProps.id}`);
  });

  it('calls open and toggle with the expected parameters when arrow down/up is pressed', function () {
    let openSpy = jest.fn();
    let toggleSpy = jest.fn();
    let props = {
      label: 'test label',
      popoverRef: React.createRef(),
      inputRef: {
        current: document.createElement('input')
      },
      listBoxRef: React.createRef()
    };

    let {result: state} = renderHook((props) => useComboBoxState(props), {initialProps: props});
    state.current.open = openSpy;
    state.current.toggle = toggleSpy;

    let {result} = renderHook((props) => useSearchAutocomplete(props, state.current), {initialProps: props});
    let {inputProps} = result.current;
    inputProps.onKeyDown(event({key: 'ArrowDown'}));
    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(openSpy).toHaveBeenLastCalledWith('first', 'manual');
    expect(toggleSpy).toHaveBeenCalledTimes(0);
    inputProps.onKeyDown(event({key: 'ArrowUp'}));
    expect(openSpy).toHaveBeenCalledTimes(2);
    expect(openSpy).toHaveBeenLastCalledWith('last', 'manual');
    expect(toggleSpy).toHaveBeenCalledTimes(0);
  });
});
