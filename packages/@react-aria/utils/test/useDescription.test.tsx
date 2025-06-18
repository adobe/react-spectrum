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
  it('should return a stable aria-describedby id', () => {
    const {result, unmount} = renderHook(({text}) => useDynamicDescription(text), {
      initialProps: {text: 'Initial description'}
    });

    const {descriptionProps} = result.current;
    expect(descriptionProps['aria-describedby']).toBeDefined();
    const id = descriptionProps['aria-describedby']!;

    const node = document.getElementById(id);
    expect(node).not.toBeNull();
    expect(node!.textContent).toBe('Initial description');
    expect((node as HTMLElement).style.display).toBe('none');

    act(() => {
      const {setDescription} = result.current;
      setDescription('Updated description');
    });

    const updatedNode = document.getElementById(id);
    expect(updatedNode).toBe(node); // Same element instance
    expect(updatedNode!.textContent).toBe('Updated description');
    expect(document.querySelectorAll(`#${id}`).length).toBe(1);

    unmount();
    expect(document.getElementById(id)).toBeNull();
  });

  it('should update text when initialDescription prop changes without changing id', () => {
    const {result, rerender} = renderHook(({text}) => useDynamicDescription(text), {
      initialProps: {text: 'First'}
    });

    const id = result.current.descriptionProps['aria-describedby']!;
    expect(document.getElementById(id)!.textContent).toBe('First');

    rerender({text: 'Second'});

    expect(result.current.descriptionProps['aria-describedby']).toBe(id);
    expect(document.getElementById(id)!.textContent).toBe('Second');
  });

  it('should reuse the same node for multiple hooks with identical descriptions and clean up when the last unmounts', () => {
    const {result: result1, unmount: unmount1} = renderHook(() => useDynamicDescription('Shared description'));
    const {result: result2, unmount: unmount2} = renderHook(() => useDynamicDescription('Shared description'));

    const id1 = result1.current.descriptionProps['aria-describedby']!;
    const id2 = result2.current.descriptionProps['aria-describedby']!;

    // Both hooks should reference the same id and therefore the same element.
    expect(id1).toBe(id2);
    const node = document.getElementById(id1)!;
    expect(node).not.toBeNull();
    expect(node.textContent).toBe('Shared description');

    // Unmounting the first hook should not remove the element since the second still references it.
    unmount1();
    expect(document.getElementById(id1)).not.toBeNull();

    // After the final unmount, the element should be removed.
    unmount2();
    expect(document.getElementById(id1)).toBeNull();
  });

  it('should lazily create a node when setDescription is called after an undefined initial description', () => {
    const {result, unmount} = renderHook(() => useDynamicDescription(undefined));

    expect(result.current.descriptionProps['aria-describedby']).toBeUndefined();

    act(() => {
      result.current.setDescription('Lazy description');
    });

    const id = result.current.descriptionProps['aria-describedby']!;
    expect(id).toMatch(/^react-aria-description-\d+$/);
    const node = document.getElementById(id);
    expect(node).not.toBeNull();
    expect(node!.textContent).toBe('Lazy description');

    unmount();
    expect(document.getElementById(id)).toBeNull();
  });

  it('should ignore undefined values passed to setDescription and keep existing text', () => {
    const {result} = renderHook(() => useDynamicDescription('Keep me'));
    const id = result.current.descriptionProps['aria-describedby']!;
    const nodeBefore = document.getElementById(id);
    expect(nodeBefore!.textContent).toBe('Keep me');

    act(() => {
      result.current.setDescription(undefined);
    });

    expect(result.current.descriptionProps['aria-describedby']).toBe(id);
    const nodeAfter = document.getElementById(id);
    expect(nodeAfter).toBe(nodeBefore);
    expect(nodeAfter!.textContent).toBe('Keep me');
  });
}); 
