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

import {act, renderHook} from '@testing-library/react-hooks';
import React from 'react';
import {useAsyncList} from '../src';

const ITEMS = [{id: 1, name: '1'}, {id: 2, name: '2'}];
const ITEMS2 = [{id: 2, name: '1'}, {id: 1, name: '2'}];

function getItems() {
  return new Promise(resolve => {
    setTimeout(() => resolve({items: ITEMS, cursor: 3}), 100);
  });
}

function getItems2() {
  return new Promise(resolve => {
    setTimeout(() => resolve({items: ITEMS2, cursor: 0}), 100);
  });
}

describe('useAsyncList', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  it('should call load function on init', async () => {
    let load = jest.fn().mockImplementation(getItems);
    let {result, waitForNextUpdate} = renderHook(() => useAsyncList({load}));

    expect(load).toHaveBeenCalledTimes(1);
    let args = load.mock.calls[0][0];
    expect(args.items).toEqual([]);
    expect(args.selectedKeys).toEqual(new Set());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.state).toBe('loading');
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.state).toBe('idle');
    expect(result.current.items).toEqual(ITEMS);
  });

  it('should call load function when loadMore is called', async () => {
    let load = jest.fn().mockImplementation(getItems);
    let {result, waitForNextUpdate} = renderHook(
      () => useAsyncList({load})
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.state).toBe('loading');
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
      await waitForNextUpdate();
    });

    expect(result.current.state).toBe('idle');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);

    await act(async () => {
      result.current.loadMore();
      await waitForNextUpdate();
    });

    expect(result.current.state).toBe('loadingMore');
    expect(load).toHaveBeenCalledTimes(2);
    let args = load.mock.calls[1][0];
    expect(args.items).toStrictEqual(ITEMS);
    expect(args.cursor).toStrictEqual(3);

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS);

    await act(async () => {
      jest.runAllTimers();
      await waitForNextUpdate();
    });

    expect(result.current.state).toBe('idle');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual([...ITEMS, ...ITEMS]);
  });

  it('should call load if sort callback function is not provided', async () => {
    let load = jest.fn().mockImplementation(getItems);
    let {result, waitForNextUpdate} = renderHook(
      () => useAsyncList({load})
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.state).toBe('loading');
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
      await waitForNextUpdate();
    });

    expect(result.current.state).toBe('idle');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);

    load.mockImplementation(getItems2);

    await act(async () => {
      result.current.sort({column: 'name'});
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.state).toBe('sorting');
    expect(result.current.items).toEqual(ITEMS);

    expect(load).toHaveBeenCalledTimes(2);
    let args = load.mock.calls[1][0];
    expect(args.items).toStrictEqual(ITEMS);

    await act(async () => {
      jest.runAllTimers();
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.state).toBe('idle');
    expect(result.current.items).toEqual(ITEMS2);
  });

  it('should call sort callback function', async () => {
    let load = jest.fn().mockImplementation(getItems);
    let sort = jest.fn().mockImplementation(getItems2);
    let {result, waitForNextUpdate} = renderHook(() => useAsyncList({
      load,
      sort,
      initialSortDescriptor: {direction: 'ASC'}
    }));

    expect(load).toHaveBeenCalledTimes(1);
    let args = load.mock.calls[0][0];
    expect(args.sortDescriptor).toEqual({direction: 'ASC'});

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);

    await act(async () => {
      result.current.sort({column: 'name'});
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS);

    expect(sort).toHaveBeenCalledTimes(1);
    args = sort.mock.calls[0][0];
    expect(args.items).toStrictEqual(ITEMS);

    await act(async () => {
      jest.runAllTimers();
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS2);
  });

  it('should return error in case fetch throws an error', async () => {
    let loadSpyThatThrows = jest.fn().mockRejectedValue(new Error('error'));
    let {result, waitForNextUpdate} = renderHook(() => useAsyncList({
      load: loadSpyThatThrows
    }));

    expect(result.current.state).toBe('loading');

    await act(async () => {
      await waitForNextUpdate();
    });

    expect(result.current.state).toBe('error');
    expect(loadSpyThatThrows).toHaveBeenCalled();
    expect(result.current.error).toBeDefined();
    expect(result.current.error.message).toBe('error');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.items.length).toBe(0);
  });

  it('should return error in case fetch throws an error during loadMore', async () => {
    let load = jest.fn().mockImplementation(getItems);
    let {result, waitForNextUpdate} = renderHook(() => useAsyncList({
      load
    }));

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);

    load.mockRejectedValue(new Error('error'));

    await act(async () => {
      result.current.loadMore();
      await waitForNextUpdate();
    });

    expect(load).toHaveBeenCalledTimes(2);
    expect(result.current.error).toBeDefined();
    expect(result.current.error.message).toBe('error');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);
  });

  it('should support reloading data', async () => {
    let load = jest.fn().mockImplementation(getItems);
    let {result, waitForNextUpdate} = renderHook(
      () => useAsyncList({load})
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);

    await act(async () => {
      result.current.reload();
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    expect(load).toHaveBeenCalledTimes(2);
    let args = load.mock.calls[1][0];
    expect(args.items).toStrictEqual(ITEMS);

    await act(async () => {
      jest.runAllTimers();
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);
  });

  it('should abort duplicate concurrent loads', async () => {
    let load = jest.fn().mockImplementation(getItems2);
    let isAborted;
    let sort = jest.fn().mockImplementation(({signal}) => new Promise((resolve, reject) => {
      isAborted = false;
      signal.addEventListener('abort', () => {
        isAborted = true;
        reject();
      });

      setTimeout(() => resolve({items: ITEMS}), 100);
    }));

    let {result, waitForNextUpdate} = renderHook(
      () => useAsyncList({load, sort})
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS2);

    await act(async () => {
      result.current.sort({column: 'name'});
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS2);
    expect(isAborted).toBe(false);

    sort.mockImplementation(getItems);

    await act(async () => {
      result.current.sort({column: 'id'});
      await waitForNextUpdate();
    });

    expect(isAborted).toBe(true);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS2);

    await act(async () => {
      jest.runAllTimers();
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);
  });

  it('should ignore duplicate loads where first resolves first', async () => {
    let load = jest.fn().mockImplementation(getItems2);
    let sort = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({items: ITEMS2}), 100)));
    let {result, waitForNextUpdate} = renderHook(
      () => useAsyncList({load, sort})
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS2);

    await act(async () => {
      result.current.sort({column: 'name'});
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS2);

    sort.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({items: ITEMS}), 500)));

    await act(async () => {
      result.current.sort({column: 'id'});
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS2);

    await act(async () => {
      jest.advanceTimersByTime(200);
      await waitForNextUpdate();
    });

    // Should ignore the first load since there is a newer one
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS2);

    await act(async () => {
      jest.advanceTimersByTime(500);
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);
  });

  it('should ignore duplicate loads where second resolves first', async () => {
    let load = jest.fn().mockImplementation(getItems2);
    let sort = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({items: ITEMS2}), 500)));
    let {result, waitForNextUpdate} = renderHook(
      () => useAsyncList({load, sort})
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS2);

    await act(async () => {
      result.current.sort({column: 'name'});
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS2);

    sort.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({items: ITEMS}), 100)));

    await act(async () => {
      result.current.sort({column: 'id'});
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS2);

    await act(async () => {
      jest.advanceTimersByTime(200);
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);

    await act(async () => {
      jest.advanceTimersByTime(500);
      await waitForNextUpdate();
    });

    // Should ignore this load, since the second one loaded first
    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);
  });

  it('should abort loadMore when a sort happens', async () => {
    let load = jest.fn().mockImplementation(getItems2);
    let sort = jest.fn().mockImplementation(getItems);
    let {result, waitForNextUpdate} = renderHook(
      () => useAsyncList({load, sort})
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS2);

    let isAborted = false;
    load.mockImplementation(({signal}) => new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => {
        isAborted = true;
        reject();
      });

      setTimeout(() => resolve({items: ITEMS}), 100);
    }));

    await act(async () => {
      result.current.loadMore();
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS2);
    expect(isAborted).toBe(false);

    sort.mockImplementation(getItems);

    await act(async () => {
      result.current.sort({column: 'id'});
      await waitForNextUpdate();
    });

    expect(isAborted).toBe(true);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS2);

    await act(async () => {
      jest.runAllTimers();
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);
  });

  it('should ignore loadMore when a sort happens and the sort loads first', async () => {
    let load = jest.fn().mockImplementation(getItems2);
    let sort = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({items: ITEMS}), 100)));
    let {result, waitForNextUpdate} = renderHook(
      () => useAsyncList({load, sort})
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS2);

    load.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({items: ITEMS}), 500)));

    await act(async () => {
      result.current.loadMore();
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS2);

    await act(async () => {
      result.current.sort({column: 'id'});
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS2);

    await act(async () => {
      jest.advanceTimersByTime(200);
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);

    await act(async () => {
      jest.advanceTimersByTime(500);
      await waitForNextUpdate();
    });

    // Should ignore the loadMore because the sort resolved first
    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);
  });

  it('should ignore loadMore when a sort happens and the loadMore loads first', async () => {
    let load = jest.fn().mockImplementation(getItems2);
    let sort = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({items: ITEMS}), 500)));
    let {result, waitForNextUpdate} = renderHook(
      () => useAsyncList({load, sort})
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS2);

    load.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({items: ITEMS}), 100)));

    await act(async () => {
      result.current.loadMore();
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS2);

    await act(async () => {
      result.current.sort({column: 'id'});
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS2);

    await act(async () => {
      jest.advanceTimersByTime(200);
      await waitForNextUpdate();
    });

    // Should ignore the loadMore since the sort is still loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS2);

    await act(async () => {
      jest.advanceTimersByTime(500);
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);
  });

  it('should support updating the list', async () => {
    let load = jest.fn().mockImplementation(getItems);
    let {result, waitForNextUpdate} = renderHook(
      () => useAsyncList({load})
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);

    await act(async () => {
      result.current.insert(1, {name: 'Test', id: 5});
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual([ITEMS[0], {name: 'Test', id: 5}, ...ITEMS.slice(1)]);
  });

  describe('unwanted error', function () {
    // temporarily disable console error https://github.com/facebook/react/issues/15520
    // https://github.com/testing-library/react-hooks-testing-library/issues/43
    const consoleError = console.error;
    beforeEach(() => {
      console.error = () => {};
    });

    afterEach(() => {
      console.error = consoleError;
    });

    it('should throw if updating the list while loading', async () => {
      let load = jest.fn().mockImplementation(getItems);
      let {result} = renderHook(
        () => useAsyncList({load})
      );

      expect(load).toHaveBeenCalledTimes(1);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual([]);

      // Ignore fewer hooks than expected error from react, it happens because we throw in the reducer
      // and since we're testing that, we can safely ignore the react warning
      try {
        act(() => {
          result.current.insert(1, {name: 'Test', id: 5});
        });
      } catch (err) {
        // ignore
      }

      expect(result.error).toEqual(new Error('Invalid action "update" in state "loading"'));
      await act(async () => {
        jest.runAllTimers();
      });
    });
  });

  it('should get an item by key', async function () {
    let load = jest.fn().mockImplementation(getItems);
    let {result, waitForNextUpdate} = renderHook(
      () => useAsyncList({load})
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
      await waitForNextUpdate();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);
    expect(result.current.getItem(1)).toBe(ITEMS[0]);
  });

  describe('filtering', function () {
    const filterItems = [{id: 1, name: 'Bob'}, {id: 2, name: 'Joe'}, {id: 3, name: 'Bob Joe'}];
    const itemsFirstCall = [{id: 1, name: 'Bob'}, {id: 3, name: 'Bob Joe'}];
    const itemsSecondCall = [{id: 2, name: 'Joe'}, {id: 3, name: 'Bob Joe'}];
    const filterFn = (item, text) => item.name.includes(text);

    function getFilterItems() {
      return new Promise(resolve => {
        setTimeout(() => resolve({items: filterItems, cursor: 3}), 100);
      });
    }

    function mockFirstCall() {
      return new Promise(resolve => {
        setTimeout(() => resolve({items: itemsFirstCall, cursor: 3}), 100);
      });
    }

    function mockSecondCall() {
      return new Promise(resolve => {
        setTimeout(() => resolve({items: itemsSecondCall, cursor: 3}), 100);
      });
    }

    beforeAll(() => {
      jest.useFakeTimers();
    });

    it('should accept initial filter text', async () => {
      let load = jest.fn().mockImplementation(getFilterItems);
      let initialFilterText = 'Blah';
      let {result, waitForNextUpdate} = renderHook(() => useAsyncList({load, initialFilterText}));

      expect(load).toHaveBeenCalledTimes(1);
      let args = load.mock.calls[0][0];
      expect(args.items).toEqual([]);
      expect(args.selectedKeys).toEqual(new Set());

      expect(result.current.state).toBe('loading');
      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual([]);

      await act(async () => {
        jest.runAllTimers();
        await waitForNextUpdate();
      });

      expect(result.current.state).toBe('idle');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.items).toEqual(filterItems);
      expect(result.current.filterText).toEqual('Blah');
    });

    it('should accept a user specified filter function for client side filtering', async () => {
      let load = jest.fn().mockImplementation(getFilterItems);
      let initialFilterText = 'Bo';
      let {result, waitForNextUpdate} = renderHook(() => useAsyncList({load, initialFilterText, filter: filterFn}));

      expect(load).toHaveBeenCalledTimes(1);
      let args = load.mock.calls[0][0];
      expect(args.items).toEqual([]);
      expect(args.selectedKeys).toEqual(new Set());

      expect(result.current.state).toBe('loading');
      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual([]);

      await act(async () => {
        jest.runAllTimers();
        await waitForNextUpdate();
      });

      expect(result.current.state).toBe('idle');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.items).toEqual([{id: 1, name: 'Bob'}, {id: 3, name: 'Bob Joe'}]);
      expect(result.current.filterText).toEqual('Bo');
    });

    it('should update the list of items when the filter text changes (client side filtering)', async () => {
      let load = jest.fn().mockImplementation(getFilterItems);
      let initialFilterText = 'Bo';
      let {result, waitForNextUpdate} = renderHook(() => useAsyncList({load, initialFilterText, filter: filterFn}));

      expect(load).toHaveBeenCalledTimes(1);
      let args = load.mock.calls[0][0];
      expect(args.items).toEqual([]);
      expect(args.selectedKeys).toEqual(new Set());

      expect(result.current.state).toBe('loading');
      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual([]);

      await act(async () => {
        jest.runAllTimers();
        await waitForNextUpdate();
      });

      expect(result.current.state).toBe('idle');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.items).toEqual([{id: 1, name: 'Bob'}, {id: 3, name: 'Bob Joe'}]);
      expect(result.current.filterText).toEqual('Bo');
      expect(load).toHaveBeenCalledTimes(1);

      // No async call is made since client side filtering
      act(() => {
        result.current.setFilterText('Jo');
      });

      expect(result.current.state).toBe('idle');
      expect(load).toHaveBeenCalledTimes(1);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.items).toEqual([{id: 2, name: 'Joe'}, {id: 3, name: 'Bob Joe'}]);
      expect(result.current.filterText).toEqual('Jo');
    });

    it('should update the list of items when the filter text changes (server side filtering)', async () => {
      let load = jest
        .fn()
        .mockImplementationOnce(mockFirstCall)
        .mockImplementationOnce(mockSecondCall);
      let initialFilterText = 'Bo';
      let {result, waitForNextUpdate} = renderHook(() => useAsyncList({load, initialFilterText}));

      expect(result.current.state).toBe('loading');
      expect(load).toHaveBeenCalledTimes(1);
      let args = load.mock.calls[0][0];
      expect(args.items).toEqual([]);
      expect(args.selectedKeys).toEqual(new Set());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual([]);

      await act(async () => {
        jest.runAllTimers();
        await waitForNextUpdate();
      });

      expect(result.current.state).toBe('idle');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.items).toEqual(itemsFirstCall);
      expect(result.current.filterText).toEqual('Bo');
      expect(load).toHaveBeenCalledTimes(1);

      await act(async () => {
        result.current.setFilterText('Jo');
        jest.runAllTimers();
        await waitForNextUpdate();
      });

      expect(result.current.state).toBe('idle');
      expect(load).toHaveBeenCalledTimes(2);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.items).toEqual(itemsSecondCall);
      expect(result.current.filterText).toEqual('Jo');
    });


    it('should abort previous loads when the filter text changes (server side filtering)', async () => {
      let isAborted = false;
      let load = jest
        .fn()
        .mockImplementationOnce(mockFirstCall)
        .mockImplementationOnce(({signal}) => new Promise((resolve, reject) => {
          signal.addEventListener('abort', () => {
            isAborted = true;
            reject();
          });

          setTimeout(() => resolve({items: filterItems}), 100);
        }))
        .mockImplementationOnce(mockSecondCall);
      let {result, waitForNextUpdate} = renderHook(() => useAsyncList({load}));

      expect(result.current.state).toBe('loading');
      expect(load).toHaveBeenCalledTimes(1);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual([]);

      await act(async () => {
        jest.runAllTimers();
        await waitForNextUpdate();
      });

      expect(result.current.state).toBe('idle');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.items).toEqual(itemsFirstCall);

      await act(async () => {
        result.current.loadMore();
        await waitForNextUpdate();
      });

      expect(load).toHaveBeenCalledTimes(2);
      expect(result.current.state).toBe('loadingMore');
      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual(itemsFirstCall);
      expect(isAborted).toBe(false);

      await act(async () => {
        result.current.setFilterText('Jo');
        await waitForNextUpdate();
      });

      expect(isAborted).toBe(true);
      expect(result.current.state).toBe('filtering');
      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual(itemsFirstCall);

      await act(async () => {
        jest.runAllTimers();
        await waitForNextUpdate();
      });

      expect(result.current.state).toBe('idle');
      expect(load).toHaveBeenCalledTimes(3);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.items).toEqual(itemsSecondCall);
      expect(result.current.filterText).toBe('Jo');
    });

    it('shouldn\'t abort previous loads when the filter text changes (client side filtering)', async () => {
      let isAborted = false;
      let additionalItems = [{id: '10', name: 'Yoyoyo'}];
      let initialFilterText = 'Jo';
      let load = jest
        .fn()
        .mockImplementationOnce(getFilterItems)
        .mockImplementationOnce(({signal}) => new Promise((resolve, reject) => {
          signal.addEventListener('abort', () => {
            isAborted = true;
            reject();
          });

          setTimeout(() => resolve({items: additionalItems}), 100);
        }))
        // This one will never be called
        .mockImplementationOnce(mockSecondCall);
      let {result, waitForNextUpdate} = renderHook(() => useAsyncList({load, initialFilterText, filter: filterFn}));

      expect(result.current.state).toBe('loading');
      expect(load).toHaveBeenCalledTimes(1);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual([]);

      await act(async () => {
        jest.runAllTimers();
        await waitForNextUpdate();
      });

      expect(result.current.state).toBe('idle');
      expect(result.current.isLoading).toBe(false);
      // Should be all items from the original filter list that contain 'Jo'
      expect(result.current.items).toEqual(itemsSecondCall);

      await act(async () => {
        result.current.loadMore();
        await waitForNextUpdate();
      });

      expect(load).toHaveBeenCalledTimes(2);
      expect(result.current.state).toBe('loadingMore');
      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual(itemsSecondCall);
      expect(isAborted).toBe(false);

      await act(async () => {
        result.current.setFilterText('');
        await waitForNextUpdate();
      });

      expect(isAborted).toBe(false);
      expect(result.current.state).toBe('loadingMore');
      expect(result.current.isLoading).toBe(true);
      // items should be back to original set since filterText is now ''
      expect(result.current.items).toEqual(filterItems);

      await act(async () => {
        jest.runAllTimers();
        await waitForNextUpdate();
      });

      // Load isn't called again because it is client side filtering
      expect(load).toHaveBeenCalledTimes(2);
      expect(result.current.state).toBe('idle');
      expect(result.current.isLoading).toBe(false);
      // Should have the original set of items + the newly loaded ones
      expect(result.current.items).toEqual(filterItems.concat(additionalItems));
      expect(result.current.filterText).toBe('');
    });

    it('shouldn\'t call loadMore if filtering is happening (server side filtering)', async () => {
      let isAborted = false;
      let load = jest
        .fn()
        .mockImplementationOnce(getFilterItems)
        .mockImplementationOnce(({signal}) => new Promise((resolve, reject) => {
          signal.addEventListener('abort', () => {
            isAborted = true;
            reject();
          });

          setTimeout(() => resolve({items: itemsSecondCall}), 100);
        }))
        .mockImplementationOnce(mockFirstCall);

      let {result, waitForNextUpdate} = renderHook(() => useAsyncList({load}));
      expect(result.current.state).toBe('loading');

      await act(async () => {
        jest.runAllTimers();
        await waitForNextUpdate();
      });

      expect(load).toHaveBeenCalledTimes(1);
      expect(result.current.state).toBe('idle');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.items).toEqual(filterItems);

      await act(async () => {
        result.current.setFilterText('Jo');
        await waitForNextUpdate();
      });

      expect(load).toHaveBeenCalledTimes(2);
      expect(result.current.state).toBe('filtering');
      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual(filterItems);
      expect(isAborted).toBe(false);

      await act(async () => {
        result.current.loadMore();
        jest.runAllTimers();
      });

      // loadMore calls are ignored if filtering is happening
      // so load is only called twice, abort isnt' called, and the items from the
      // original filtering fetch are returned
      expect(isAborted).toBe(false);
      expect(load).toHaveBeenCalledTimes(2);
      expect(result.current.state).toBe('idle');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.items).toEqual(itemsSecondCall);
      expect(result.current.filterText).toBe('Jo');
    });

    it('should call loadMore if filtering is happening (client side filtering)', async () => {
      let additionalItems = [{id: '10', name: 'Yoyoyo'}];
      let initialFilterText = 'Jo';
      let load = jest
        .fn()
        .mockImplementationOnce(getFilterItems)
        .mockImplementationOnce(() => new Promise((resolve) => {
          setTimeout(() => resolve({items: additionalItems}), 100);
        }))
        // This one will never be called
        .mockImplementationOnce(mockSecondCall);
      let {result, waitForNextUpdate} = renderHook(() => useAsyncList({load, initialFilterText, filter: filterFn}));

      expect(load).toHaveBeenCalledTimes(1);
      expect(result.current.state).toBe('loading');
      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual([]);

      await act(async () => {
        jest.runAllTimers();
        await waitForNextUpdate();
      });

      expect(result.current.state).toBe('idle');
      expect(result.current.isLoading).toBe(false);
      // Should be all items from the original filter list that contain 'Jo'
      expect(result.current.items).toEqual(itemsSecondCall);

      await act(async () => {
        result.current.setFilterText('');
        await waitForNextUpdate();
      });

      // No load is called and loading state doesn't change because it is client side filtering
      expect(load).toHaveBeenCalledTimes(1);
      expect(result.current.state).toBe('idle');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.items).toEqual(filterItems);
      expect(result.current.filterText).toBe('');

      await act(async () => {
        result.current.loadMore();
        await waitForNextUpdate();
      });

      expect(load).toHaveBeenCalledTimes(2);
      expect(result.current.state).toBe('loadingMore');
      expect(result.current.isLoading).toBe(true);
      // items should still be filterItems because loadMore hasn't finished
      expect(result.current.items).toEqual(filterItems);
      expect(result.current.filterText).toBe('');

      await act(async () => {
        jest.runAllTimers();
        await waitForNextUpdate();
      });

      // Load isn't called again because it is client side filtering
      expect(load).toHaveBeenCalledTimes(2);
      expect(result.current.state).toBe('idle');
      expect(result.current.isLoading).toBe(false);
      // Should have the original set of items + the newly loaded ones
      expect(result.current.items).toEqual(filterItems.concat(additionalItems));
      expect(result.current.filterText).toBe('');
    });
  });
});
