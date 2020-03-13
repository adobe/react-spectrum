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
  let toastKey = 'toast1';
  let newValue = [{
    content: 'Toast Message',
    props: {timeout: 0, toastKey}
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
    expect(result.current.toasts).toStrictEqual([{...newValue[0], timer: undefined}]);
  });

  it('should be able to add multiple toasts', () => {
    let secondToast = {
      content: 'Second Toast',
      props: {variant: 'info', timeout: 0}
    };
    let {result} = renderHook(() => useToastState());
    expect(result.current.toasts).toStrictEqual([]);

    act(() => result.current.onAdd(newValue[0].content, newValue[0].props));
    expect(result.current.toasts).toStrictEqual([{...newValue[0], timer: undefined}]);

    act(() => result.current.onAdd(secondToast.content, secondToast.props));
    expect(result.current.toasts.length).toBe(2);
    expect(result.current.toasts[0]).toStrictEqual({...newValue[0], timer: undefined});
    expect(result.current.toasts[1]).toStrictEqual({...secondToast, timer: undefined});
  });

  it('should remove a toast via onRemove', () => {
    let {result} = renderHook(() => useToastState({value: newValue}));
    expect(result.current.toasts).toStrictEqual(newValue);

    act(() => result.current.onRemove(toastKey));
    expect(result.current.toasts).toStrictEqual([]);
  });

  it('onRemove should remove a toast by toastKey', () => {
    let toast1Key = 'toast1';
    let toast2Key = 'toast2';
    let toast3Key = 'toast3';
    let threeToasts = [{
      content: 'Toast One',
      props: {timeout: 0, toastKey: toast1Key}
    }, {
      content: 'Toast Two',
      props: {timeout: 0, toastKey: toast2Key}
    }, {
      content: 'Toast Three',
      props: {timeout: 0, toastKey: toast3Key}
    }];

    let {result} = renderHook(() => useToastState({value: threeToasts}));
    expect(result.current.toasts).toStrictEqual(threeToasts);
    expect(result.current.toasts.length).toEqual(3);

    act(() => result.current.onRemove(toast2Key));
    expect(result.current.toasts.length).toEqual(2);
    expect(result.current.toasts[0].props.toastKey).toEqual(toast1Key);
    expect(result.current.toasts[1].props.toastKey).toEqual(toast3Key);
  });

  it('should call onRemove via onAdd', async () => {
    jest.useFakeTimers();
    let timeoutToast = {
      content: 'Timeout Toast',
      props: {variant: 'info', timeout: 1}
    };
    let {result} = renderHook(() => useToastState());
    expect(result.current.toasts.length).toEqual(0);
    act(() => result.current.onAdd(timeoutToast.content, timeoutToast.props));
    expect(result.current.toasts.length).toEqual(1);
    expect(result.current.toasts[0].timer).not.toBe(undefined);

    act(() => jest.runAllTimers());

    expect(result.current.toasts.length).toEqual(0);
  });

  describe('timers', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });
    afterEach(() => {
      jest.useRealTimers();
    });
    it('should not call onRemove via onAdd when there is an actionLabel', async () => {
      let timeoutToast = {
        content: 'Action Toast',
        props: {variant: 'info', timeout: 1, actionLabel: 'Undo'}
      };
      let {result} = renderHook(() => useToastState());
      expect(result.current.toasts.length).toEqual(0);
      act(() => result.current.onAdd(timeoutToast.content, timeoutToast.props));

      jest.runAllTimers();

      expect(result.current.toasts.length).toEqual(1);
      expect(result.current.toasts[0].timer).toBe(undefined);
    });
  });
});
