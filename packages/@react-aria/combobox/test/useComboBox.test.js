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
import {useComboBoxState} from '@react-stately/combobox';
import {useSingleSelectListState} from '@react-stately/list';

describe('useComboBox', function () {
  let preventDefault = jest.fn();
  let stopPropagation = jest.fn();
  let event = (e) => ({
    ...e,
    preventDefault,
    stopPropagation
  });

  let defaultProps = {items: [{id: 1, name: 'one'}], children: (props) => <Item>{props.name}</Item>};
  let {result} = renderHook(() => useSingleSelectListState(defaultProps));
  let mockLayout = new ListLayout({
    rowHeight: 40
  });
  mockLayout.collection = result.current.collection;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return default props for all the button group elements', function () {
    let props = {
      label: 'test label',
      popoverRef: React.createRef(),
      buttonRef: React.createRef(),
      inputRef: React.createRef(),
      listBoxRef: React.createRef(),
      layout: mockLayout
    };

    let {result} = renderHook(() => useComboBox(props, useSingleSelectListState(defaultProps)));
    let {buttonProps, inputProps, listBoxProps, labelProps} = result.current;

    expect(labelProps.id).toBeTruthy();
    expect(labelProps.htmlFor).toBe(inputProps.id);
    expect(inputProps.id).toBeTruthy();
    expect(inputProps['aria-labelledby']).toBe(labelProps.id);
    expect(inputProps.role).toBe('combobox');
    expect(inputProps['aria-autocomplete']).toBe('list');
    expect(inputProps['aria-controls']).toBeFalsy();
    expect(inputProps['aria-activedescendant']).toBeFalsy();
    expect(listBoxProps.id).toBeTruthy();
    expect(listBoxProps['aria-labelledby']).toBe(`${labelProps.id} ${listBoxProps.id}`);
    expect(buttonProps.id).toBeTruthy();
    expect(buttonProps.excludeFromTabOrder).toBeTruthy();
    expect(buttonProps['aria-haspopup']).toBeTruthy();
    expect(buttonProps['aria-expanded']).toBeFalsy();
    expect(buttonProps['aria-controls']).toBeFalsy();
    expect(buttonProps['onPress']).toBeTruthy();
    expect(buttonProps['onPressStart']).toBeTruthy();
    expect(buttonProps['onKeyDown']).toBeTruthy();
  });

  it('should prevent default on Enter if isOpen', function () {
    let props = {
      label: 'test label',
      popoverRef: React.createRef(),
      buttonRef: React.createRef(),
      inputRef: {
        current: {
          contains: jest.fn()
        }
      },
      listBoxRef: React.createRef(),
      layout: mockLayout,
      isOpen: true
    };

    let {result, rerender} = renderHook((props) => useComboBox(props, useComboBoxState(props)), {initialProps: props});
    let {inputProps} = result.current;

    inputProps.onKeyDown(event({key: 'Enter'}));
    expect(preventDefault).toHaveBeenCalledTimes(1);

    rerender({...props, isOpen: false});
    result.current.inputProps.onKeyDown(event({key: 'Enter'}));
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it('calls onMenuOpenManual if menu is closed and arrow down/up/button is pressed', function () {
    let onMenuOpenManualSpy = jest.fn();
    let props = {
      label: 'test label',
      popoverRef: React.createRef(),
      buttonRef: React.createRef(),
      inputRef: {
        current: {
          contains: jest.fn(),
          focus: jest.fn()
        }
      },
      listBoxRef: React.createRef(),
      layout: mockLayout,
      onMenuOpenManual: onMenuOpenManualSpy,
      isOpen: true
    };

    let {result: state, rerender: rerenderState} = renderHook((props) => useComboBoxState(props), {initialProps: props});
    // mock open and toggle so we don't get act issues
    state.current.open = jest.fn();
    state.current.toggle = jest.fn();

    let {result, rerender} = renderHook((props) => useComboBox(props, state.current), {initialProps: props});
    let {inputProps, buttonProps} = result.current;
    inputProps.onKeyDown(event({key: 'ArrowDown'}));
    expect(onMenuOpenManualSpy).toHaveBeenCalledTimes(0);
    inputProps.onKeyDown(event({key: 'ArrowUp'}));
    expect(onMenuOpenManualSpy).toHaveBeenCalledTimes(0);
    buttonProps.onPress(event({pointerType: 'touch'}));
    expect(onMenuOpenManualSpy).toHaveBeenCalledTimes(0);
    buttonProps.onPressStart(event({pointerType: 'keyboard'}));
    expect(onMenuOpenManualSpy).toHaveBeenCalledTimes(0);

    // Update state isOpen state
    rerenderState({...props, isOpen: false});
    rerender(props);
    result.current.inputProps.onKeyDown(event({key: 'ArrowDown'}));
    expect(onMenuOpenManualSpy).toHaveBeenCalledTimes(1);
    result.current.inputProps.onKeyDown(event({key: 'ArrowUp'}));
    expect(onMenuOpenManualSpy).toHaveBeenCalledTimes(2);
    result.current.buttonProps.onPress(event({pointerType: 'touch'}));
    expect(onMenuOpenManualSpy).toHaveBeenCalledTimes(3);
    result.current.buttonProps.onPressStart(event({pointerType: 'keyboard'}));
    expect(onMenuOpenManualSpy).toHaveBeenCalledTimes(4);
  });


  it('calls open with showWholeMenuOnOpen', function () {
    let openSpy = jest.fn();
    let toggleSpy = jest.fn();
    let props = {
      label: 'test label',
      popoverRef: React.createRef(),
      buttonRef: React.createRef(),
      inputRef: {
        current: {
          contains: jest.fn(),
          focus: jest.fn()
        }
      },
      listBoxRef: React.createRef(),
      layout: mockLayout,
      isOpen: false,
      showWholeMenuOnOpen: true
    };

    let {result: state} = renderHook((props) => useComboBoxState(props), {initialProps: props});
    state.current.open = openSpy;
    state.current.toggle = toggleSpy;
    // Try calling renderHook on useComboboxstate first? Then can spy on state.toggle and state.opne
    let {result, rerender} = renderHook((props) => useComboBox(props, state.current), {initialProps: props});
    let {inputProps, buttonProps} = result.current;
    inputProps.onKeyDown(event({key: 'ArrowDown'}));
    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(openSpy).toHaveBeenLastCalledWith('first', true);
    expect(toggleSpy).toHaveBeenCalledTimes(0);
    inputProps.onKeyDown(event({key: 'ArrowUp'}));
    expect(openSpy).toHaveBeenCalledTimes(2);
    expect(openSpy).toHaveBeenLastCalledWith('last', true);
    expect(toggleSpy).toHaveBeenCalledTimes(0);
    buttonProps.onPress(event({pointerType: 'touch'}));
    expect(openSpy).toHaveBeenCalledTimes(2);
    expect(toggleSpy).toHaveBeenCalledTimes(1);
    expect(toggleSpy).toHaveBeenLastCalledWith(null, true);
    buttonProps.onPressStart(event({pointerType: 'mouse'}));
    expect(openSpy).toHaveBeenCalledTimes(2);
    expect(toggleSpy).toHaveBeenCalledTimes(2);
    expect(toggleSpy).toHaveBeenLastCalledWith(null, true);

    rerender({...props, showWholeMenuOnOpen: false});
    result.current.inputProps.onKeyDown(event({key: 'ArrowDown'}));
    expect(openSpy).toHaveBeenCalledTimes(3);
    expect(openSpy).toHaveBeenLastCalledWith('first', false);
    expect(toggleSpy).toHaveBeenCalledTimes(2);
    result.current.inputProps.onKeyDown(event({key: 'ArrowUp'}));
    expect(openSpy).toHaveBeenCalledTimes(4);
    expect(openSpy).toHaveBeenLastCalledWith('last', false);
    expect(toggleSpy).toHaveBeenCalledTimes(2);
    result.current.buttonProps.onPress(event({pointerType: 'touch'}));
    expect(openSpy).toHaveBeenCalledTimes(4);
    expect(toggleSpy).toHaveBeenCalledTimes(3);
    expect(toggleSpy).toHaveBeenLastCalledWith(null, false);
    result.current.buttonProps.onPressStart(event({pointerType: 'mouse'}));
    expect(openSpy).toHaveBeenCalledTimes(4);
    expect(toggleSpy).toHaveBeenCalledTimes(4);
    expect(toggleSpy).toHaveBeenLastCalledWith(null, false);
  });
});
