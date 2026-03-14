/*
 * Copyright 2025 Adobe. All rights reserved.
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
import {useDescription, useDynamicDescription} from '../src/useDescription';

describe('useDescription', () => {
  it('should return an id if description is provided', () => {
    let {result} = renderHook(() => useDescription('Test description'));
    expect(result.current['aria-describedby']).toMatch(/^react-aria-description-\d+$/);
  });

  it('should return undefined if no description is provided', () => {
    let {result} = renderHook(() => useDescription());
    expect(result.current['aria-describedby']).toBeUndefined();
  });

  it('should reuse the same id for the same description', () => {
    let {result: result1} = renderHook(() => useDescription('Test description'));
    let {result: result2} = renderHook(() => useDescription('Test description'));
    expect(result1.current['aria-describedby']).toBe(result2.current['aria-describedby']);
  });

  it('should create a new id for a new description', () => {
    let {result: result1} = renderHook(() => useDescription('Test description 1'));
    let {result: result2} = renderHook(() => useDescription('Test description 2'));
    expect(result1.current['aria-describedby']).not.toBe(result2.current['aria-describedby']);
  });

  it('should clean up description node on unmount', () => {
    let {result, unmount} = renderHook(() => useDescription('Test description'));
    let id = result.current['aria-describedby'];
    expect(document.getElementById(id!)).not.toBeNull();
    unmount();
    expect(document.getElementById(id!)).toBeNull();
  });

  it('should not clean up if other components are using the same description', () => {
    let {result: result1, unmount: unmount1} = renderHook(() => useDescription('Test description'));
    let {unmount: unmount2} = renderHook(() => useDescription('Test description'));
    let id = result1.current['aria-describedby'];
    expect(document.getElementById(id!)).not.toBeNull();
    unmount1();
    expect(document.getElementById(id!)).not.toBeNull();
    unmount2();
    expect(document.getElementById(id!)).toBeNull();
  });
});

describe('useDynamicDescription', () => {
  it('should return an id if description is provided', () => {
    let {result} = renderHook(() => useDynamicDescription('Test description', 'dynamic-1'));
    expect(result.current['aria-describedby']).toMatch(/^react-aria-description-\d+$/);
  });

  it('should return undefined if no description is provided', () => {
    let {result} = renderHook(() => useDynamicDescription(undefined, 'dynamic-2'));
    expect(result.current['aria-describedby']).toBeUndefined();
  });

  it('should reuse the same id for the same description key', () => {
    let {result: result1} = renderHook(() => useDynamicDescription('Test description', 'shared-key'));
    let {result: result2} = renderHook(() => useDynamicDescription('Test description', 'shared-key'));
    expect(result1.current['aria-describedby']).toBe(result2.current['aria-describedby']);
  });

  it('should create a new id for a different description key', () => {
    let {result: result1} = renderHook(() => useDynamicDescription('Test description', 'dynamic-3'));
    let {result: result2} = renderHook(() => useDynamicDescription('Test description', 'dynamic-4'));
    expect(result1.current['aria-describedby']).not.toBe(result2.current['aria-describedby']);
  });

  it('should keep the same id and update text content when description changes for the same key', () => {
    let {result, rerender} = renderHook(
      ({description}: {description?: string}) => useDynamicDescription(description, 'dynamic-5'),
      {initialProps: {description: 'Test description 1'}}
    );

    let id = result.current['aria-describedby'];
    let node = document.getElementById(id!);
    expect(node?.textContent).toBe('Test description 1');

    act(() => {
      rerender({description: 'Test description 2'});
    });

    expect(result.current['aria-describedby']).toBe(id);
    expect(document.getElementById(id!)).toBe(node);
    expect(node?.textContent).toBe('Test description 2');
  });

  it('should keep the same id for the lifetime of the component', () => {
    let {result, rerender} = renderHook(
      ({description}: {description?: string}) => useDynamicDescription(description, 'dynamic-6'),
      {initialProps: {description: 'Test description'}}
    );

    let id = result.current['aria-describedby'];
    let node = document.getElementById(id!);

    act(() => {
      rerender({description: ''});
    });

    expect(result.current['aria-describedby']).toBeUndefined();
    expect(document.getElementById(id!)).toBe(node);
    expect(node?.textContent).toBe('Test description');

    act(() => {
      rerender({description: 'Updated description'});
    });

    expect(result.current['aria-describedby']).toBe(id);
    expect(document.getElementById(id!)).toBe(node);
    expect(node?.textContent).toBe('Updated description');
  });

  it('should not clean up if other components are using the same description key', () => {
    let {result: result1, unmount: unmount1} = renderHook(() => useDynamicDescription('Test description', 'shared-cleanup'));
    let {unmount: unmount2} = renderHook(() => useDynamicDescription('Test description', 'shared-cleanup'));
    let id = result1.current['aria-describedby'];
    expect(document.getElementById(id!)).not.toBeNull();
    unmount1();
    expect(document.getElementById(id!)).not.toBeNull();
    unmount2();
    expect(document.getElementById(id!)).toBeNull();
  });

  it('should clean up description node on unmount', () => {
    let {result, unmount} = renderHook(() => useDynamicDescription('Test description', 'dynamic-7'));
    let id = result.current['aria-describedby'];
    expect(document.getElementById(id!)).not.toBeNull();
    unmount();
    expect(document.getElementById(id!)).toBeNull();
  });
});
