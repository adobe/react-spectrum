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
import {act, renderHook} from 'react-hooks-testing-library';
import {useSearchFieldState} from '../';

describe('useSearchFieldState', () => {
  let onChange = jest.fn();
  let newValue = 'newValue';

  afterEach(() => {
    onChange.mockClear();
  });

  it('should be controlled if props.value is defined', () => {
    let props = {
      value: 'blah',
      onChange
    };
    let {result} = renderHook(() => useSearchFieldState(props));
    expect(result.current.value).toBe(props.value);
    act(() => result.current.setValue(newValue));
    expect(result.current.value).toBe(props.value);
    expect(onChange).toHaveBeenCalledWith(newValue);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('should start with value = props.defaultValue if props.value is not defined and props.defaultValue is defined', () => {
    let props = {
      defaultValue: 'blah',
      onChange
    };
    let {result} = renderHook(() => useSearchFieldState(props));
    expect(result.current.value).toBe(props.defaultValue);
    act(() => result.current.setValue(newValue));
    expect(result.current.value).toBe(newValue);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('should default to uncontrolled with value = "" if defaultValue and value aren\'t defined', () => {
    let props = {
      onChange
    };
    let {result} = renderHook(() => useSearchFieldState(props));
    expect(result.current.value).toBe('');
    act(() => result.current.setValue(newValue));
    expect(result.current.value).toBe(newValue);
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('should convert numeric values to strings (uncontrolled)', () => {
    let props = {
      defaultValue: 13
    };

    let {result} = renderHook(() => useSearchFieldState(props));
    expect(result.current.value).toBe(props.defaultValue.toString()); 
  });

  it('should convert an array of string values to a string (uncontrolled)', () => {
    let props = {
      defaultValue: ['hi', 'this', 'is', 'me']
    };

    let {result} = renderHook(() => useSearchFieldState(props));
    expect(result.current.value).toBe(props.defaultValue.toString()); 
  });

  it('should convert numeric values to strings (controlled)', () => {
    let props = {
      value: 13
    };
    
    let {result} = renderHook(() => useSearchFieldState(props));
    expect(result.current.value).toBe(props.value.toString()); 
  });

  it('should convert an array of string values to a string (controlled)', () => {
    let props = {
      value: ['hi', 'this', 'is', 'me']
    };

    let {result} = renderHook(() => useSearchFieldState(props));
    expect(result.current.value).toBe(props.value.toString()); 
  });
});
