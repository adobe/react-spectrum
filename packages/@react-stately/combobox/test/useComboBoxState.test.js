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

import {act, renderHook} from '@testing-library/react-hooks';
import {Item} from '@react-stately/collections';
import React from 'react';
import {useComboBoxState} from '../';

describe('useComboBoxState tests', function () {
  describe('open state', function () {
    let onOpenChange;
    let defaultProps;
    beforeEach(() => {
      onOpenChange = jest.fn();
      let collator = {compare: jest.fn().mockReturnValue(true)};
      defaultProps = {isFocused: true, items: [{id: 1, name: 'one'}], children: (props) => <Item>{props.name}</Item>, onOpenChange, collator};
    });
    it('should be closed by default', function () {
      let initialProps = defaultProps;
      let {result} = renderHook((props) => useComboBoxState(props), {initialProps});
      expect(result.current.isOpen).toBe(false);

      act(() => {
        result.current.open();
      });
      expect(result.current.isOpen).toBe(true);
      expect(onOpenChange).toHaveBeenCalledWith(true);

      act(() => result.current.close());
      expect(result.current.isOpen).toBe(false);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('should be set open by default if defaultOpen is true and isFocused is true', function () {
      let initialProps = {...defaultProps, defaultOpen: true};
      let {result} = renderHook((props) => useComboBoxState(props), {initialProps});

      act(() => result.current.setFocused(true));

      expect(result.current.isOpen).toBe(true);

      act(() => result.current.close());
      expect(result.current.isOpen).toBe(false);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('open should be a controllable value', function () {
      let initialProps = {...defaultProps, isOpen: true};
      let {result, rerender} = renderHook((props) => useComboBoxState(props), {initialProps});
      act(() => result.current.setFocused(true));

      expect(result.current.isOpen).toBe(true);

      act(() => result.current.close());
      expect(result.current.isOpen).toBe(true);
      expect(onOpenChange).toHaveBeenCalledWith(false);


      rerender({...defaultProps, isOpen: false});
      expect(result.current.isOpen).toBe(false);

      act(() => result.current.open());
      expect(result.current.isOpen).toBe(false);
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe('values', function () {
    let onInputChange;
    let defaultProps;
    beforeEach(() => {
      onInputChange = jest.fn();
      let collator = {compare: jest.fn().mockReturnValue(true)};
      defaultProps = {items: [{id: 1, name: 'one'}], children: (props) => <Item>{props.name}</Item>, onInputChange, collator};
    });

    it('can have a default value', function () {
      let initialProps = {...defaultProps, defaultInputValue: 'hello'};
      let {result} = renderHook((props) => useComboBoxState(props), {initialProps});
      expect(result.current.inputValue).toBe('hello');
    });

    it('fires an event when the value is changed and updates if uncontrolled', function () {
      let initialProps = {...defaultProps, defaultInputValue: 'hello'};
      let {result} = renderHook((props) => useComboBoxState(props), {initialProps});
      expect(result.current.inputValue).toBe('hello');
      expect(onInputChange).not.toHaveBeenCalled();
      act(() => result.current.setInputValue('hellow'));
      expect(result.current.inputValue).toBe('hellow');
      expect(onInputChange).toHaveBeenCalledWith('hellow');
    });

    it('starts blank if no (default) value', function () {
      let initialProps = {...defaultProps};
      let {result} = renderHook((props) => useComboBoxState(props), {initialProps});
      expect(result.current.inputValue).toBe('');
      expect(onInputChange).not.toHaveBeenCalled();
      act(() => result.current.setInputValue('h'));
      expect(result.current.inputValue).toBe('h');
      expect(onInputChange).toHaveBeenCalledWith('h');
    });

    it('can be controlled', function () {
      let initialProps = {...defaultProps, inputValue: 'hello'};
      let {result} = renderHook((props) => useComboBoxState(props), {initialProps});
      expect(result.current.inputValue).toBe('hello');
      expect(onInputChange).not.toHaveBeenCalled();
      act(() => result.current.setInputValue('hellow'));
      expect(result.current.inputValue).toBe('hello');
      expect(onInputChange).toHaveBeenCalledWith('hellow');
    });
  });

  describe('collection', function () {
    let onSelectionChange;
    let defaultProps;
    beforeEach(() => {
      onSelectionChange = jest.fn();
      let collator = {compare: jest.fn().mockReturnValue(true)};
      defaultProps = {items: [{key: '0', name: 'one'}, {key: '1', name: 'onomatopoeia'}], children: (props) => <Item {...props}>{props.name}</Item>, onSelectionChange, collator};
    });

    it('support selectedKey', function () {
      let initialProps = {...defaultProps, selectedKey: '0'};
      let {result} = renderHook((props) => useComboBoxState(props), {initialProps});
      expect(result.current.selectionManager.selectionMode).toBe('single');
      expect(result.current.selectionManager.selectedKeys).toContain('0');
      expect(result.current.selectionManager.selectedKeys).not.toContain('1');

      act(() => result.current.selectionManager.replaceSelection('1'));
      expect(result.current.selectionManager.selectedKeys).toContain('0');
      expect(result.current.selectionManager.selectedKeys).not.toContain('1');
      expect(onSelectionChange).toHaveBeenCalledWith('1');
    });

    it('support defaultSelectedKey', function () {
      let initialProps = {...defaultProps, defaultSelectedKey: '0'};
      let {result} = renderHook((props) => useComboBoxState(props), {initialProps});
      expect(result.current.selectionManager.selectionMode).toBe('single');
      expect(result.current.selectionManager.selectedKeys).toContain('0');
      expect(result.current.selectionManager.selectedKeys).not.toContain('1');

      act(() => result.current.selectionManager.replaceSelection('1'));
      expect(result.current.selectionManager.selectedKeys).toContain('1');
      expect(result.current.selectionManager.selectedKeys).not.toContain('0');
      expect(onSelectionChange).toHaveBeenCalledWith('1');
    });

    it('supports sdefault no selection', function () {
      let initialProps = {...defaultProps};
      let {result} = renderHook((props) => useComboBoxState(props), {initialProps});
      expect(result.current.selectionManager.selectionMode).toBe('single');
      expect(result.current.selectionManager.selectedKeys.size).toBe(0);

      act(() => result.current.selectionManager.replaceSelection('1'));
      expect(result.current.selectionManager.selectedKeys).toContain('1');
      expect(result.current.selectionManager.selectedKeys).not.toContain('0');
      expect(onSelectionChange).toHaveBeenCalledWith('1');
    });
  });
});
