/*
 * Copyright 2024 Adobe. All rights reserved.
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
import {useDisclosureGroupState} from '../src/useDisclosureGroupState';

describe('useDisclosureGroupState', () => {
  it('should initialize with empty expandedKeys when not provided', () => {
    const {result} = renderHook(() => useDisclosureGroupState({}));
    expect(result.current.expandedKeys.size).toBe(0);
  });

  it('should initialize with defaultExpandedKeys when provided', () => {
    const {result} = renderHook(() =>
      useDisclosureGroupState({defaultExpandedKeys: ['item1']})
    );
    expect(result.current.expandedKeys.has('item1')).toBe(true);
    expect(result.current.expandedKeys.has('item2')).toBe(false);
  });

  it('should initialize with multiple defaultExpandedKeys when provided, and if allowsMultipleExpanded is true', () => {
    const {result} = renderHook(() =>
      useDisclosureGroupState({defaultExpandedKeys: ['item1', 'item2'], allowsMultipleExpanded: true})
    );
    expect(result.current.expandedKeys.has('item1')).toBe(true);
    expect(result.current.expandedKeys.has('item2')).toBe(true);
  });

  it('should allow controlled expandedKeys prop', () => {
    const {result, rerender} = renderHook(
      ({expandedKeys}) => useDisclosureGroupState({expandedKeys}),
      {initialProps: {expandedKeys: ['item1']}}
    );
    expect(result.current.expandedKeys.has('item1')).toBe(true);

    rerender({expandedKeys: ['item2']});
    expect(result.current.expandedKeys.has('item1')).toBe(false);
    expect(result.current.expandedKeys.has('item2')).toBe(true);
  });

  it('should toggle key correctly when allowsMultipleExpanded is false', () => {
    const {result} = renderHook(() => useDisclosureGroupState({}));
    act(() => {
      result.current.toggleKey('item1');
    });
    expect(result.current.expandedKeys.has('item1')).toBe(true);

    act(() => {
      result.current.toggleKey('item2');
    });
    expect(result.current.expandedKeys.has('item1')).toBe(false);
    expect(result.current.expandedKeys.has('item2')).toBe(true);
  });

  it('should toggle key correctly when allowsMultipleExpanded is true', () => {
    const {result} = renderHook(() =>
      useDisclosureGroupState({allowsMultipleExpanded: true})
    );
    act(() => {
      result.current.toggleKey('item1');
    });
    expect(result.current.expandedKeys.has('item1')).toBe(true);

    act(() => {
      result.current.toggleKey('item2');
    });
    expect(result.current.expandedKeys.has('item1')).toBe(true);
    expect(result.current.expandedKeys.has('item2')).toBe(true);
  });

  it('should call onExpandedChange when expanded keys change', () => {
    const onExpandedChange = jest.fn();
    const {result} = renderHook(() =>
      useDisclosureGroupState({onExpandedChange})
    );

    act(() => {
      result.current.toggleKey('item1');
    });
    expect(onExpandedChange).toHaveBeenCalledWith(new Set(['item1']));
  });

  it('should not expand more than one key when allowsMultipleExpanded is false', () => {
    const {result} = renderHook(() => useDisclosureGroupState({}));
    act(() => {
      result.current.toggleKey('item1');
      result.current.toggleKey('item2');
    });
    expect(result.current.expandedKeys.size).toBe(1);
    expect(result.current.expandedKeys.has('item2')).toBe(true);
  });

  it('should respect isDisabled prop', () => {
    const {result} = renderHook(() => useDisclosureGroupState({isDisabled: true}));
    expect(result.current.isDisabled).toBe(true);
  });
});
