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
import {Item} from '@react-stately/collections';
import React from 'react';
import {useComboBoxState} from '../';
import {useFilter} from 'react-aria';

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
      expect(onOpenChange).toHaveBeenCalledWith(true, undefined);

      act(() => result.current.close());
      expect(result.current.isOpen).toBe(false);
      expect(onOpenChange).toHaveBeenCalledWith(false, undefined);
    });

    it('onOpenChange should return the reason that open was called', function () {
      let initialProps = defaultProps;
      let {result} = renderHook((props) => useComboBoxState(props), {initialProps});

      act(() => {
        result.current.open(undefined, 'focus');
      });
      expect(result.current.isOpen).toBe(true);
      expect(onOpenChange).toHaveBeenCalledWith(true, 'focus');

      act(() => result.current.close());
      expect(result.current.isOpen).toBe(false);
      expect(onOpenChange).toHaveBeenCalledWith(false, undefined);

      act(() => {
        result.current.open(undefined, 'input');
      });
      expect(result.current.isOpen).toBe(true);
      expect(onOpenChange).toHaveBeenCalledWith(true, 'input');

      act(() => result.current.close());

      act(() => {
        result.current.open(undefined, 'manual');
      });
      expect(result.current.isOpen).toBe(true);
      expect(onOpenChange).toHaveBeenCalledWith(true, 'manual');
    });

    it('onOpenChange should return the reason that toggle was called when opening', function () {
      let initialProps = defaultProps;
      let {result} = renderHook((props) => useComboBoxState(props), {initialProps});

      act(() => {
        result.current.toggle(undefined, 'focus');
      });
      expect(result.current.isOpen).toBe(true);
      expect(onOpenChange).toHaveBeenCalledWith(true, 'focus');

      act(() => result.current.toggle(undefined, 'focus'));
      expect(result.current.isOpen).toBe(false);
      expect(onOpenChange).toHaveBeenCalledWith(false, undefined);

      act(() => {
        result.current.toggle(undefined, 'input');
      });
      expect(result.current.isOpen).toBe(true);
      expect(onOpenChange).toHaveBeenCalledWith(true, 'input');

      act(() => result.current.close());

      act(() => {
        result.current.toggle(undefined, 'manual');
      });
      expect(result.current.isOpen).toBe(true);
      expect(onOpenChange).toHaveBeenCalledWith(true, 'manual');
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

    it('does not change selection on close', () => {
      let initialProps = defaultProps;
      let {result} = renderHook((props) => useComboBoxState(props), {initialProps});

      act(() => {
        result.current.open();
      });
      act(() => {
        result.current.selectionManager.setFocusedKey(1);
      });
      act(() => {
        result.current.close();
      });
      expect(result.current.selectedKey).not.toBe(1);
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
      defaultProps = {items: [{id: '0', name: 'one'}, {id: '1', name: 'onomatopoeia'}], children: (props) => <Item {...props}>{props.name}</Item>, onSelectionChange, collator};
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

    it('supports default no selection', function () {
      let initialProps = {...defaultProps};
      let {result} = renderHook((props) => useComboBoxState(props), {initialProps});
      expect(result.current.selectionManager.selectionMode).toBe('single');
      expect(result.current.selectionManager.selectedKeys.size).toBe(0);

      act(() => result.current.selectionManager.replaceSelection('1'));
      expect(result.current.selectionManager.selectedKeys).toContain('1');
      expect(result.current.selectionManager.selectedKeys).not.toContain('0');
      expect(onSelectionChange).toHaveBeenCalledWith('1');
    });

    it('won\'t update the returned collection if the combobox is closed (uncontrolled items)', function () {
      let filter = renderHook((props) => useFilter(props), {sensitivity: 'base'});
      let initialProps = {...defaultProps, items: null, defaultItems: [{id: '0', name: 'one'}, {id: '1', name: 'onomatopoeia'}], defaultInputValue: '', defaultFilter: filter.result.current.contains};
      let {result} = renderHook((props) => useComboBoxState(props), {initialProps});
      expect(result.current.collection.size).toEqual(2);
      expect(result.current.inputValue).toBe('');

      act(() => {result.current.open();});
      act(() => result.current.setInputValue('onom'));
      expect(result.current.inputValue).toBe('onom');
      expect(result.current.collection.size).toEqual(1);
      expect(result.current.collection.getItem('1').rendered).toBe('onomatopoeia');

      // The input value updates, but the returned collection still only contains onomatopoeia
      act(() => {result.current.setFocused(false);});
      expect(result.current.collection.size).toEqual(1);
      expect(result.current.inputValue).toBe('');
      expect(result.current.collection.getItem('1').rendered).toBe('onomatopoeia');

      // Subsequent calls that would close the menu don't update the tracked lastCollection
      act(() => {result.current.commit();});
      expect(result.current.collection.size).toEqual(1);
      expect(result.current.inputValue).toBe('');
      expect(result.current.collection.getItem('1').rendered).toBe('onomatopoeia');

      act(() => {result.current.close();});
      expect(result.current.collection.size).toEqual(1);
      expect(result.current.inputValue).toBe('');
      expect(result.current.collection.getItem('1').rendered).toBe('onomatopoeia');

      act(() => {result.current.revert();});
      expect(result.current.collection.size).toEqual(1);
      expect(result.current.inputValue).toBe('');
      expect(result.current.collection.getItem('1').rendered).toBe('onomatopoeia');

      act(() => {result.current.open();});
      expect(result.current.collection.size).toEqual(2);
    });

    it('won\'t update the returned collection if the combobox is closed (controlled items)', function () {
      let initialProps = {...defaultProps};
      let {result, rerender} = renderHook((props) => useComboBoxState(props), {initialProps});
      expect(result.current.collection.size).toEqual(2);

      act(() => {result.current.open();});
      rerender({...initialProps, items: [{id: '1', name: 'onomatopoeia'}]});
      // Returned collection reflects the items provided by the user since the combobox is open
      expect(result.current.collection.size).toEqual(1);
      expect(result.current.collection.getItem('1').rendered).toBe('onomatopoeia');

      act(() => {result.current.setFocused(false);});
      // Returned collection reflects the old items provided by the user when the combobox is closed
      expect(result.current.collection.size).toEqual(1);
      expect(result.current.collection.getItem('1').rendered).toBe('onomatopoeia');
      rerender(initialProps);
      expect(result.current.collection.size).toEqual(1);
      expect(result.current.collection.getItem('1').rendered).toBe('onomatopoeia');

      // Subsequent calls that would close the menu don't update the tracked lastCollection
      act(() => {result.current.commit();});
      expect(result.current.collection.size).toEqual(1);
      expect(result.current.inputValue).toBe('');
      expect(result.current.collection.getItem('1').rendered).toBe('onomatopoeia');

      act(() => {result.current.close();});
      expect(result.current.collection.size).toEqual(1);
      expect(result.current.inputValue).toBe('');
      expect(result.current.collection.getItem('1').rendered).toBe('onomatopoeia');

      act(() => {result.current.revert();});
      expect(result.current.collection.size).toEqual(1);
      expect(result.current.inputValue).toBe('');
      expect(result.current.collection.getItem('1').rendered).toBe('onomatopoeia');

      // When the combobox is opened again, the returned collection of items updates to reflect the items provided by the user
      act(() => {result.current.open();});
      expect(result.current.collection.size).toEqual(2);
    });
  });
});
