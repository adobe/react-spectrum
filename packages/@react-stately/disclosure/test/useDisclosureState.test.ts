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
import {useDisclosureState} from '../src/useDisclosureState';

describe('useDisclosureState', () => {
  it('should initialize as not expanded by default', () => {
    const {result} = renderHook(() => useDisclosureState({}));
    expect(result.current.isExpanded).toBe(false);
  });

  it('should initialize with defaultExpanded when provided', () => {
    const {result} = renderHook(() => useDisclosureState({defaultExpanded: true}));
    expect(result.current.isExpanded).toBe(true);
  });

  it('should allow controlled isExpanded prop', () => {
    const {result, rerender} = renderHook(
      ({isExpanded}) => useDisclosureState({isExpanded}),
      {initialProps: {isExpanded: true}}
    );
    expect(result.current.isExpanded).toBe(true);

    rerender({isExpanded: false});
    expect(result.current.isExpanded).toBe(false);
  });

  it('should call onExpandedChange when expanded state changes', () => {
    const onExpandedChange = jest.fn();
    const {result} = renderHook(() =>
      useDisclosureState({onExpandedChange})
    );

    act(() => {
      result.current.expand();
    });
    expect(onExpandedChange).toHaveBeenCalledWith(true);

    act(() => {
      result.current.collapse();
    });
    expect(onExpandedChange).toHaveBeenCalledWith(false);
  });

  it('should toggle expanded state correctly', () => {
    const {result} = renderHook(() => useDisclosureState({}));

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isExpanded).toBe(true);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isExpanded).toBe(false);
  });

  it('should not change state when controlled', () => {
    const onExpandedChange = jest.fn();
    const {result} = renderHook(() =>
      useDisclosureState({isExpanded: false, onExpandedChange})
    );

    act(() => {
      result.current.expand();
    });
    expect(result.current.isExpanded).toBe(false);
    expect(onExpandedChange).toHaveBeenCalledWith(true);
  });
});
