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
import {useToastState} from '../';

describe('useToastState', () => {
  let newValue = [{
    content: 'Toast Message',
    props: {}
  }];

  it('should be able to update via setToasts', () => {
    let {result} = renderHook(() => useToastState());
    expect(result.current.toasts).toStrictEqual([]);
    act(() => result.current.setToasts(newValue));
    expect(result.current.toasts).toStrictEqual(newValue);
  });

  it('should add a new toast via onAdd', () => {
    let {result} = renderHook(() => useToastState());
    expect(result.current.toasts).toStrictEqual([]);
    act(() => result.current.onAdd(newValue[0].content, newValue[0].props));
    expect(result.current.toasts).toStrictEqual(newValue);
  });

  it('should be able to add multiple toasts', () => {
    let secondToast = {
      content: 'Second Toast',
      props: {variant: 'info'}
    };
    let {result} = renderHook(() => useToastState());
    expect(result.current.toasts).toStrictEqual([]);
    act(() => result.current.onAdd(newValue[0].content, newValue[0].props));
    expect(result.current.toasts).toStrictEqual(newValue);
    act(() => result.current.onAdd(secondToast.content, secondToast.props));
    expect(result.current.toasts.length).toBe(2);
    expect(result.current.toasts[0]).toStrictEqual(newValue[0]);
    expect(result.current.toasts[1]).toStrictEqual(secondToast);
  });
});
