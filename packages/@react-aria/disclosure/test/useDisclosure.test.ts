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
import {PressEvent} from '@react-types/shared';
import {useDisclosure} from '../src/useDisclosure';
import {useDisclosureState} from '@react-stately/disclosure';

describe('useDisclosure', () => {
  let defaultProps = {};
  let ref = {current: document.createElement('div')};

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return correct aria attributes when collapsed', () => {
    let {result} = renderHook(() => {
      let state = useDisclosureState(defaultProps);
      return useDisclosure({}, state, ref);
    });

    let {buttonProps, panelProps} = result.current;

    expect(buttonProps['aria-expanded']).toBe(false);
    expect(panelProps.hidden).toBe(true);
    expect(panelProps['aria-hidden']).toBe(true);
  });

  it('should return correct aria attributes when expanded', () => {
    let {result} = renderHook(() => {
      let state = useDisclosureState({defaultExpanded: true});
      return useDisclosure({}, state, ref);
    });

    let {buttonProps, panelProps} = result.current;

    expect(buttonProps['aria-expanded']).toBe(true);
    expect(panelProps.hidden).toBe(false);
  });

  it('should handle expanding on press event (with mouse)', () => {
    let {result} = renderHook(() => {
      let state = useDisclosureState({});
      let disclosure = useDisclosure({}, state, ref);
      return {state, disclosure};
    });

    act(() => {
      result.current.disclosure.buttonProps.onPress?.({pointerType: 'mouse'} as PressEvent);
    });

    expect(result.current.state.isExpanded).toBe(true);
  });

  it('should handle expanding on press start event (with keyboard)', () => {
    let {result} = renderHook(() => {
      let state = useDisclosureState({});
      let disclosure = useDisclosure({}, state, ref);
      return {state, disclosure};
    });

    let event = (e: Partial<PressEvent>) => (e as PressEvent);

    act(() => {
      result.current.disclosure.buttonProps.onPressStart?.(event({pointerType: 'keyboard'}) as PressEvent);
    });

    expect(result.current.state.isExpanded).toBe(true);
  });

  it('should not toggle when disabled', () => {
    let {result} = renderHook(() => {
      let state = useDisclosureState({});
      let disclosure = useDisclosure({isDisabled: true}, state, ref);
      return {state, disclosure};
    });

    act(() => {
      result.current.disclosure.buttonProps.onPress?.({pointerType: 'mouse'} as PressEvent);
    });

    expect(result.current.state.isExpanded).toBe(false);
  });

  it('should set correct IDs for accessibility', () => {
    let {result} = renderHook(() => {
      let state = useDisclosureState({});
      return useDisclosure({}, state, ref);
    });

    let {buttonProps, panelProps} = result.current;

    expect(buttonProps['aria-controls']).toBe(panelProps.id);
    expect(panelProps['aria-labelledby']).toBe(buttonProps.id);
  });

  it('should expand when beforematch event occurs', () => {
    // Mock 'onbeforematch' support on document.body
    // @ts-ignore
    const originalOnBeforeMatch = document.body.onbeforematch;
    Object.defineProperty(document.body, 'onbeforematch', {
      value: null,
      writable: true,
      configurable: true
    });
  
    const ref = {current: document.createElement('div')};
  
    const {result} = renderHook(() => {
      const state = useDisclosureState({});
      const disclosure = useDisclosure({}, state, ref);
      return {state, disclosure};
    });
  
    expect(result.current.state.isExpanded).toBe(false);
    expect(ref.current.getAttribute('hidden')).toBe('until-found');
  
    // Simulate the 'beforematch' event
    act(() => {
      const event = new Event('beforematch', {bubbles: true});
      ref.current.dispatchEvent(event);
    });
  
    expect(result.current.state.isExpanded).toBe(true);
    expect(ref.current.hasAttribute('hidden')).toBe(false);
  
    Object.defineProperty(document.body, 'onbeforematch', {
      value: originalOnBeforeMatch,
      writable: true,
      configurable: true
    });
  });

  it('should not expand when beforematch event occurs if controlled and closed', () => {
    // Mock 'onbeforematch' support on document.body
    // @ts-ignore
    const originalOnBeforeMatch = document.body.onbeforematch;
    Object.defineProperty(document.body, 'onbeforematch', {
      value: null,
      writable: true,
      configurable: true
    });
  
    const ref = {current: document.createElement('div')};
  
    const onExpandedChange = jest.fn();
  
    const {result} = renderHook(() => {
      const state = useDisclosureState({isExpanded: false, onExpandedChange});
      const disclosure = useDisclosure({isExpanded: false}, state, ref);
      return {state, disclosure};
    });
  
    expect(result.current.state.isExpanded).toBe(false);
    expect(ref.current.getAttribute('hidden')).toBe('until-found');
  
    // Simulate the 'beforematch' event
    act(() => {
      const event = new Event('beforematch', {bubbles: true});
      ref.current.dispatchEvent(event);
    });
  
    expect(result.current.state.isExpanded).toBe(false);
    expect(ref.current.getAttribute('hidden')).toBe('until-found');
    expect(onExpandedChange).toHaveBeenCalledTimes(1);
    expect(onExpandedChange).toHaveBeenCalledWith(true);
  
    Object.defineProperty(document.body, 'onbeforematch', {
      value: originalOnBeforeMatch,
      writable: true,
      configurable: true
    });
  });
});
