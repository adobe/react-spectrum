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
import React from 'react';
import {useAsyncList} from '../src';

const ITEMS = [{id: 1, name: '1'}, {id: 2, name: '2'}];
describe('useAsyncList', () => {
  let loadSpy = jest.fn().mockImplementation(() => ({items: ITEMS}));
  let loadMoreSpy = jest.fn().mockImplementation(({items}) => ({items: [...items, ...ITEMS]}));
  let sortSpy = jest.fn();

  afterEach(() => {
    loadMoreSpy.mockClear();
    loadSpy.mockClear();
    sortSpy.mockClear();
  });

  it('will call load function on init', async () => {
    let {result, waitForNextUpdate} = renderHook(() => useAsyncList({load: loadSpy}));
    await act(async () => {
      await waitForNextUpdate();
    });
    let args = loadSpy.mock.calls[0][0];
    expect(args.isLoading).toBe(true);
    expect(args.items).toStrictEqual([]);

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items.length).toBe(2);
    expect(result.current.onSortChange).toBeDefined();
    expect(result.current.onLoadMore).toBeFalsy();
  });

  it('will call loadMore function when onLoadMore is called', async () => {
    let {result, waitForNextUpdate} = renderHook(
      () => useAsyncList({
        load: loadSpy,
        loadMore: loadMoreSpy
      })
    );
    await act(async () => {
      await waitForNextUpdate();
    });
    expect(loadSpy).toHaveBeenCalled();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items.length).toBe(2);
    expect(result.current.onLoadMore).toBeDefined();

    await act(async () => {
      result.current.onLoadMore();
      await waitForNextUpdate();
    });
    let args = loadMoreSpy.mock.calls[0][0];
    expect(args.isLoading).toBe(true);
    expect(args.items).toStrictEqual(ITEMS);

    expect(result.current.items.length).toBe(4);
    expect(result.current.isLoading).toBe(false);
  });

  it('will call load if sort callback function is not provided', async () => {
    let {result, waitForNextUpdate} = renderHook(() => useAsyncList({
      load: loadSpy
    }));
    await act(async () => {
      await waitForNextUpdate();
    });
    expect(loadSpy).toHaveBeenCalled();
    loadSpy.mockReset();
    await act(async () => {
      result.current.onSortChange({});
      await waitForNextUpdate();
    });
    expect(loadSpy).toHaveBeenCalled();
    expect(sortSpy).not.toHaveBeenCalled();
  });

  it('will call sort callback function when onSortChange is called', async () => {
    let {result, waitForNextUpdate} = renderHook(() => useAsyncList({
      load: loadSpy,
      sort: sortSpy,
      defaultSortDescriptor: {direction: 'ASC'}
    }));
    await act(async () => {
      await waitForNextUpdate();
    });
    expect(loadSpy).toHaveBeenCalled();
    loadSpy.mockReset();
    await act(async () => {
      result.current.onSortChange({});
      await waitForNextUpdate();
    });
    expect(sortSpy).toHaveBeenCalled();
    expect(loadSpy).not.toHaveBeenCalled();
    expect(result.current.sortDescriptor).toStrictEqual({});
  });

  it('will return error in case fetch throws an error', async () => {
    let loadSpyThatThrows = jest.fn().mockRejectedValue(new Error('error'));
    let {result, waitForNextUpdate} = renderHook(() => useAsyncList({
      load: loadSpyThatThrows
    }));

    await act(async () => {
      await waitForNextUpdate();
    });

    expect(loadSpyThatThrows).toHaveBeenCalled();
    expect(result.current.error).toBeDefined();
    expect(result.current.error.message).toBe('error');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.items.length).toBe(0);
  });
});
