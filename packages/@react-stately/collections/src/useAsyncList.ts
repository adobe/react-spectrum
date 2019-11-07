import {AsyncListOptions, AsyncListProps, SortDescriptor} from '@react-types/shared';
import {useCallback, useEffect, useState} from 'react';

export function useAsyncList<T>(options: AsyncListOptions<T>): AsyncListProps<T> {
  const {load, loadMore, sort, defaultSortDescriptor} = options;

  let [state, setState] = useState({
    isLoading: true,
    items: [] as Iterable<T>,
    sortDescriptor: defaultSortDescriptor || null,
    callbackFn: load
  });

  const updateState = useCallback(
    (newState) => setState(prevState => ({...prevState, ...newState})),
    []
  );
  const fetchData = useCallback(async (fn: Function, additionalState?: object) => {
    let response = await fn({...state});
    updateState({isLoading: false, ...response, ...additionalState});
  }, [state, updateState]);

  const onLoadMore = !loadMore ? null : (() => {
    updateState({isLoading: true, callbackFn: loadMore});
  });

  const onSortChange = (desc: SortDescriptor) => {
    updateState({isLoading: true, callbackFn: sort || load, sortDescriptor: desc});
  };

  let {callbackFn, ...otherState} = state;
  useEffect(() => {
    if (state.isLoading) {
      fetchData(callbackFn)
        .catch(() => updateState({isLoading: false, items: []})); // how to handle errors?
    }
  }, [state.isLoading, callbackFn, fetchData, updateState]);

  return {
    ...otherState,
    onLoadMore,
    onSortChange
  };
}
