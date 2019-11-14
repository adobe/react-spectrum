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
      sort: sortSpy
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
  });
});
