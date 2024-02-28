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

import {actHook as act, renderHook} from '@react-spectrum/test-utils-internal';
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

function getItemsEnd() {
  return new Promise(resolve => {
    setTimeout(() => resolve({items: ITEMS, cursor: null}), 100);
  });
}

describe('useAsyncList', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  it('should call load function on init', async () => {
    let load = jest.fn().mockImplementation(getItems);
    let {result} = renderHook(() => useAsyncList({load}));

    expect(load).toHaveBeenCalledTimes(1);
    let args = load.mock.calls[0][0];
    expect(args.items).toEqual([]);
    expect(args.selectedKeys).toEqual(new Set());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.loadingState).toBe('loading');
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.loadingState).toBe('idle');
    expect(result.current.items).toEqual(ITEMS);
  });

  it('should call load function when loadMore is called', async () => {
    let load = jest.fn().mockImplementation(getItems);
    let {result} = renderHook(
      () => useAsyncList({load})
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.loadingState).toBe('loading');
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(result.current.loadingState).toBe('idle');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);

    await act(async () => {
      result.current.loadMore();
    });

    expect(result.current.loadingState).toBe('loadingMore');
    expect(load).toHaveBeenCalledTimes(2);
    let args = load.mock.calls[1][0];
    expect(args.items).toStrictEqual(ITEMS);
    expect(args.cursor).toStrictEqual(3);

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(result.current.loadingState).toBe('idle');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual([...ITEMS, ...ITEMS]);
  });

  it('should call load if sort callback function is not provided', async () => {
    let load = jest.fn().mockImplementation(getItems);
    let {result} = renderHook(
      () => useAsyncList({load})
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.loadingState).toBe('loading');
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(result.current.loadingState).toBe('idle');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);

    load.mockImplementation(getItems2);

    await act(async () => {
      result.current.sort({column: 'name'});
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.loadingState).toBe('sorting');
    expect(result.current.items).toEqual(ITEMS);

    expect(load).toHaveBeenCalledTimes(2);
    let args = load.mock.calls[1][0];
    expect(args.items).toStrictEqual(ITEMS);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.loadingState).toBe('idle');
    expect(result.current.items).toEqual(ITEMS2);
  });

  it('should call sort callback function', async () => {
    let load = jest.fn().mockImplementation(getItems);
    let sort = jest.fn().mockImplementation(getItems2);
    let {result} = renderHook(() => useAsyncList({
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
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);

    await act(async () => {
      result.current.sort({column: 'name'});
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS);

    expect(sort).toHaveBeenCalledTimes(1);
    args = sort.mock.calls[0][0];
    expect(args.items).toStrictEqual(ITEMS);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS2);
  });

  it('should return error in case fetch throws an error', async () => {
    let loadSpyThatThrows = jest.fn().mockRejectedValue(new Error('error'));
    let {result} = renderHook(() => useAsyncList({
      load: loadSpyThatThrows
    }));

    expect(result.current.loadingState).toBe('loading');

    await act(async () => Promise.resolve());

    expect(result.current.loadingState).toBe('error');
    expect(loadSpyThatThrows).toHaveBeenCalled();
    expect(result.current.error).toBeDefined();
    expect(result.current.error.message).toBe('error');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.items.length).toBe(0);
  });

  it('should return error in case fetch throws an error during loadMore', async () => {
    let load = jest.fn().mockImplementation(getItems);
    let {result} = renderHook(() => useAsyncList({
      load
    }));

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);

    load.mockRejectedValue(new Error('error'));

    await act(async () => {
      result.current.loadMore();
    });

    expect(load).toHaveBeenCalledTimes(2);
    expect(result.current.error).toBeDefined();
    expect(result.current.error.message).toBe('error');
    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);
  });

  it('should support reloading data', async () => {
    let load = jest.fn().mockImplementation(getItems);
    let {result} = renderHook(
      () => useAsyncList({load})
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);

    await act(async () => {
      result.current.reload();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    expect(load).toHaveBeenCalledTimes(2);
    let args = load.mock.calls[1][0];
    expect(args.items).toStrictEqual(ITEMS);

    await act(async () => {
      jest.runAllTimers();
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

    let {result} = renderHook(
      () => useAsyncList({load, sort})
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS2);

    await act(async () => {
      result.current.sort({column: 'name'});
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS2);
    expect(isAborted).toBe(false);

    sort.mockImplementation(getItems);

    await act(async () => {
      result.current.sort({column: 'id'});
    });

    expect(isAborted).toBe(true);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS2);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);
  });

  it('should ignore duplicate loads where first resolves first', async () => {
    let load = jest.fn().mockImplementation(getItems2);
    let sort = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({items: ITEMS2}), 100)));
    let {result} = renderHook(
      () => useAsyncList({load, sort})
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS2);

    await act(async () => {
      result.current.sort({column: 'name'});
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS2);

    sort.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({items: ITEMS}), 500)));

    await act(async () => {
      result.current.sort({column: 'id'});
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS2);

    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    // Should ignore the first load since there is a newer one
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS2);

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);
  });

  it('should ignore duplicate loads where second resolves first', async () => {
    let load = jest.fn().mockImplementation(getItems2);
    let sort = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({items: ITEMS2}), 500)));
    let {result} = renderHook(
      () => useAsyncList({load, sort})
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS2);

    await act(async () => {
      result.current.sort({column: 'name'});
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS2);

    sort.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({items: ITEMS}), 100)));

    await act(async () => {
      result.current.sort({column: 'id'});
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS2);

    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    // Should ignore this load, since the second one loaded first
    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);
  });

  it('should abort loadMore when a sort happens', async () => {
    let load = jest.fn().mockImplementation(getItems2);
    let sort = jest.fn().mockImplementation(getItems);
    let {result} = renderHook(
      () => useAsyncList({load, sort})
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
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
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS2);
    expect(isAborted).toBe(false);

    sort.mockImplementation(getItems);

    await act(async () => {
      result.current.sort({column: 'id'});
    });

    expect(isAborted).toBe(true);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS2);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);
  });

  it('should ignore loadMore when a sort happens and the sort loads first', async () => {
    let load = jest.fn().mockImplementation(getItems2);
    let sort = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({items: ITEMS}), 100)));
    let {result} = renderHook(
      () => useAsyncList({load, sort})
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS2);

    load.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({items: ITEMS}), 500)));

    await act(async () => {
      result.current.loadMore();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS2);

    await act(async () => {
      result.current.sort({column: 'id'});
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS2);

    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    // Should ignore the loadMore because the sort resolved first
    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);
  });

  it('should ignore loadMore when a sort happens and the loadMore loads first', async () => {
    let load = jest.fn().mockImplementation(getItems2);
    let sort = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({items: ITEMS}), 500)));
    let {result} = renderHook(
      () => useAsyncList({load, sort})
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS2);

    load.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({items: ITEMS}), 100)));

    await act(async () => {
      result.current.loadMore();
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS2);

    await act(async () => {
      result.current.sort({column: 'id'});
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS2);

    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    // Should ignore the loadMore since the sort is still loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS2);

    await act(async () => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);
  });

  it('should support updating the list', async () => {
    let load = jest.fn().mockImplementation(getItems);
    let {result} = renderHook(
      () => useAsyncList({load})
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);

    await act(async () => {
      result.current.insert(1, {name: 'Test', id: 5});
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual([ITEMS[0], {name: 'Test', id: 5}, ...ITEMS.slice(1)]);
  });

  it('should get an item by key', async function () {
    let load = jest.fn().mockImplementation(getItems);
    let {result} = renderHook(
      () => useAsyncList({load})
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);
    expect(result.current.getItem(1)).toBe(ITEMS[0]);
  });

  it('should allow updates to the list while loading', async () => {
    let load = jest.fn().mockImplementation(getItems);
    let {result} = renderHook(
      () => useAsyncList({load})
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    act(() => {
      result.current.insert(1, {name: 'Test', id: 5});
      result.current.setSelectedKeys(new Set(['selected key']));
    });

    await act(async () => {
      jest.runAllTimers();
    });

    // Since it is a load operation, previous item is overwritten
    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);
    expect(result.current.getItem(1)).toBe(ITEMS[0]);
    expect(result.current.selectedKeys).toEqual(new Set(['selected key']));
  });

  it('should allow updates to the list while loading more', async () => {
    let load = jest.fn()
      .mockImplementationOnce(getItems)
      .mockImplementationOnce(getItems2);
    let {result} = renderHook(
      () => useAsyncList({load})
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);

    await act(async () => {
      result.current.loadMore();
    });

    expect(load).toHaveBeenCalledTimes(2);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual(ITEMS);

    await act(async() => {
      result.current.insert(1, {name: 'Test', id: 5});
      result.current.setSelectedKeys(new Set(['selected key']));
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.items[1]).toStrictEqual({name: 'Test', id: 5});
    expect(result.current.selectedKeys).toEqual(new Set(['selected key']));

    await act(async () => {
      jest.runAllTimers();
    });

    let finalItems = ITEMS.concat(ITEMS2);
    finalItems.splice(1, 0, {name: 'Test', id: 5});
    // Since it is a loadMore operation, new items are appended to the end
    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(finalItems);
    expect(result.current.selectedKeys).toEqual(new Set(['selected key']));
  });

  it('should handle multiple loadMore operations called in quick succession', async () => {
    let load = jest.fn()
      .mockImplementationOnce(getItems)
      .mockImplementationOnce(({signal}) => new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => {
          reject();
        });

        setTimeout(() => resolve({items: ITEMS2}), 100);
      }))
      .mockImplementationOnce(getItems)
      .mockImplementationOnce(getItems);
    let {result} = renderHook(
      () => useAsyncList({load})
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);

    await act(async () => {
      result.current.loadMore();
      result.current.loadMore();
      result.current.loadMore();
      jest.runAllTimers();
    });

    // Only the first loadMore is handled, the others are canceled
    expect(load).toHaveBeenCalledTimes(4);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS.concat(ITEMS2));
  });

  it('should handle multiple loadMore/filtering operations called in quick succession', async () => {
    let load = jest.fn()
      .mockImplementationOnce(getItems)
      .mockImplementationOnce(({signal}) => new Promise((resolve, reject) => {
        signal.addEventListener('abort', () => {
          reject();
        });

        setTimeout(() => resolve({items: ITEMS}), 100);
      }))
      .mockImplementationOnce(getItems2)
      .mockImplementationOnce(getItems);
    let {result} = renderHook(
      () => useAsyncList({load})
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS);

    await act(async () => {
      result.current.loadMore();
      jest.advanceTimersByTime(20);
      result.current.setFilterText('blah');
      jest.advanceTimersByTime(20);
    });

    await act(async () => {
      result.current.loadMore();
      jest.runAllTimers();
    });

    // Only the first loadMore and filtering operation is handled (first loadMore is canceled by filter),
    // subsequent loadMores are never called because filtering operation is happening
    expect(load).toHaveBeenCalledTimes(3);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual(ITEMS2);
  });

  it('should maintain all selection through a loadMore call', async () => {
    let load = jest.fn()
      .mockImplementationOnce(getItems)
      .mockImplementationOnce(getItems2);
    let {result} = renderHook(
      () => useAsyncList({load})
    );

    expect(load).toHaveBeenCalledTimes(1);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.items).toEqual([]);

    await act(async () => {
      jest.runAllTimers();
      result.current.setSelectedKeys('all');
    });

    expect(result.current.selectedKeys).toEqual('all');

    await act(async () => {
      result.current.loadMore();
      jest.runAllTimers();
    });

    expect(load).toHaveBeenCalledTimes(2);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.items).toEqual([...ITEMS, ...ITEMS2]);
    expect(result.current.selectedKeys).toEqual('all');
  });

  it('should accept all for initialSelectedKeys', () => {
    let load = jest.fn()
      .mockImplementationOnce(getItems);
    let {result} = renderHook(
      () => useAsyncList({load, initialSelectedKeys: 'all'})
    );
    expect(result.current.selectedKeys).toEqual('all');
  });

  it('should maintain all selection if last visible item removed and unloaded items still exist', async () => {
    let load = jest.fn()
      .mockImplementationOnce(getItems);
    let {result} = renderHook(
      () => useAsyncList({load})
    );
    await act(async () => {
      result.current.loadMore();
      jest.runAllTimers();
    });
    await act(async () => {
      result.current.setSelectedKeys('all');
      result.current.remove(1);
      result.current.remove(2);
      jest.runAllTimers();
    });
    expect(result.current.selectedKeys).toEqual('all');
  });

  it('should change selection to empty set if last item removed with no unloaded items left', async () => {
    let load = jest.fn()
      .mockImplementationOnce(getItemsEnd);
    let {result} = renderHook(
      () => useAsyncList({load})
    );
    await act(async () => {
      result.current.loadMore();
      jest.runAllTimers();
      result.current.setSelectedKeys('all');
      result.current.remove(1);
      result.current.remove(2);
      jest.runAllTimers();
    });
    expect(result.current.selectedKeys).toEqual(new Set());
  });

  it('should change selection to empty set if all items removed', async () => {
    let load = jest.fn()
      .mockImplementationOnce(getItemsEnd);
    let {result} = renderHook(
      () => useAsyncList({load})
    );
    await act(async () => {
      result.current.loadMore();
      jest.runAllTimers();
      result.current.setSelectedKeys('all');
      result.current.removeSelectedItems();
      jest.runAllTimers();
    });
    expect(result.current.selectedKeys).toEqual(new Set());
  });

  describe('filtering', function () {
    const filterItems = [{id: 1, name: 'Bob'}, {id: 2, name: 'Joe'}, {id: 3, name: 'Bob Joe'}];
    const itemsFirstCall = [{id: 1, name: 'Bob'}, {id: 3, name: 'Bob Joe'}];
    const itemsSecondCall = [{id: 2, name: 'Joe'}, {id: 3, name: 'Bob Joe'}];

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

    function mockCallWithUpdatedText() {
      return new Promise(resolve => {
        setTimeout(() => resolve({items: itemsFirstCall, cursor: 3, filterText: 'new text'}), 100);
      });
    }

    beforeAll(() => {
      jest.useFakeTimers();
    });

    it('should accept initial filter text', async () => {
      let load = jest.fn().mockImplementation(getFilterItems);
      let initialFilterText = 'Blah';
      let {result} = renderHook(() => useAsyncList({load, initialFilterText}));

      expect(load).toHaveBeenCalledTimes(1);
      let args = load.mock.calls[0][0];
      expect(args.items).toEqual([]);
      expect(args.selectedKeys).toEqual(new Set());

      expect(result.current.loadingState).toBe('loading');
      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual([]);

      await act(async () => {
        jest.runAllTimers();
      });

      expect(result.current.loadingState).toBe('idle');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.items).toEqual(filterItems);
      expect(result.current.filterText).toEqual('Blah');
    });

    it('should preserve all selectedKeys through filtering', async () => {
      let load = jest.fn().mockImplementation(getFilterItems);
      let initialFilterText = 'Blah';
      let {result} = renderHook(() => useAsyncList({load, initialFilterText}));

      await act(async () => {
        result.current.setSelectedKeys('all');
      });

      expect(result.current.selectedKeys).toEqual('all');

      await act(async () => {
        jest.runAllTimers();
      });

      expect(result.current.loadingState).toBe('idle');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.items).toEqual(filterItems);
      expect(result.current.filterText).toEqual('Blah');
      expect(result.current.selectedKeys).toEqual('all');
    });

    it('should update the list of items when the filter text changes (server side filtering)', async () => {
      let load = jest
        .fn()
        .mockImplementationOnce(mockFirstCall)
        .mockImplementationOnce(mockSecondCall);
      let initialFilterText = 'Bo';
      let {result} = renderHook(() => useAsyncList({load, initialFilterText}));

      expect(result.current.loadingState).toBe('loading');
      expect(load).toHaveBeenCalledTimes(1);
      let args = load.mock.calls[0][0];
      expect(args.items).toEqual([]);
      expect(args.selectedKeys).toEqual(new Set());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual([]);

      await act(async () => {
        jest.runAllTimers();
      });

      expect(result.current.loadingState).toBe('idle');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.items).toEqual(itemsFirstCall);
      expect(result.current.filterText).toEqual('Bo');
      expect(load).toHaveBeenCalledTimes(1);

      await act(async () => {
        result.current.setFilterText('Jo');
        jest.runAllTimers();
      });

      expect(result.current.loadingState).toBe('idle');
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
      let {result} = renderHook(() => useAsyncList({load}));

      expect(result.current.loadingState).toBe('loading');
      expect(load).toHaveBeenCalledTimes(1);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual([]);

      await act(async () => {
        jest.runAllTimers();
      });

      expect(result.current.loadingState).toBe('idle');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.items).toEqual(itemsFirstCall);

      await act(async () => {
        result.current.loadMore();
      });

      expect(load).toHaveBeenCalledTimes(2);
      expect(result.current.loadingState).toBe('loadingMore');
      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual(itemsFirstCall);
      expect(isAborted).toBe(false);

      await act(async () => {
        result.current.setFilterText('Jo');
      });

      expect(isAborted).toBe(true);
      expect(result.current.loadingState).toBe('filtering');
      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual(itemsFirstCall);

      await act(async () => {
        jest.runAllTimers();
      });

      expect(result.current.loadingState).toBe('idle');
      expect(load).toHaveBeenCalledTimes(3);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.items).toEqual(itemsSecondCall);
      expect(result.current.filterText).toBe('Jo');
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

      let {result} = renderHook(() => useAsyncList({load}));
      expect(result.current.loadingState).toBe('loading');

      await act(async () => {
        jest.runAllTimers();
      });

      expect(load).toHaveBeenCalledTimes(1);
      expect(result.current.loadingState).toBe('idle');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.items).toEqual(filterItems);

      await act(async () => {
        result.current.setFilterText('Jo');
      });

      expect(load).toHaveBeenCalledTimes(2);
      expect(result.current.loadingState).toBe('filtering');
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
      expect(result.current.loadingState).toBe('idle');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.items).toEqual(itemsSecondCall);
      expect(result.current.filterText).toBe('Jo');
    });

    it('should update the filter text and perform a new filter operation if previous load returns updated filter text', async () => {
      let load = jest
        .fn()
        .mockImplementationOnce(getFilterItems)
        .mockImplementationOnce(mockCallWithUpdatedText)
        .mockImplementationOnce(mockSecondCall);
      let initialFilterText = 'Bo';
      let {result} = renderHook(() => useAsyncList({load, initialFilterText}));

      expect(result.current.loadingState).toBe('loading');
      expect(load).toHaveBeenCalledTimes(1);
      let args = load.mock.calls[0][0];
      expect(args.items).toEqual([]);
      expect(args.selectedKeys).toEqual(new Set());

      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual([]);

      await act(async () => {
        jest.runAllTimers();
      });

      expect(result.current.loadingState).toBe('idle');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.items).toEqual(filterItems);
      expect(result.current.filterText).toEqual('Bo');
      expect(load).toHaveBeenCalledTimes(1);

      await act(async () => {
        result.current.setFilterText('Jo');
      });

      expect(result.current.loadingState).toBe('filtering');
      expect(load).toHaveBeenCalledTimes(2);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual(filterItems);
      expect(result.current.filterText).toEqual('Jo');

      await act(async () => {
        jest.runAllTimers();
      });

      // New filter text was returned in this load. As a result, a new filter fetch is
      // dispatched with the new filter text so we get a up to date filtered list.
      expect(result.current.loadingState).toBe('filtering');
      expect(load).toHaveBeenCalledTimes(3);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.items).toEqual(itemsFirstCall);
      expect(result.current.filterText).toEqual('new text');

      await act(async () => {
        jest.runAllTimers();
      });

      // New items are returned
      expect(result.current.loadingState).toBe('idle');
      expect(load).toHaveBeenCalledTimes(3);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.items).toEqual(itemsSecondCall);
      expect(result.current.filterText).toEqual('new text');
    });
  });
});
