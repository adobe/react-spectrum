import {AsyncListOptions, AsyncListProps, SortDescriptor} from '@react-types/shared';
import {useCallback, useEffect, useState} from 'react';

export function useAsyncList<T>(options: AsyncListOptions<T>): AsyncListProps<T> {
  const {load, loadMore, sort, defaultSortDescriptor} = options;

  let [state, setState] = useState({
    error: null,
    isLoading: true,
    items: [] as Iterable<T>,
    sortDescriptor: defaultSortDescriptor || null,
    fetchFunction: load
  });

  const updateState = useCallback(
    (newState) => setState(prevState => ({...prevState, ...newState})),
    []
  );
  const fetchData = useCallback(async (fn) => {
    try {
      let response = await fn({...state});
      updateState({isLoading: false, ...response});
    } catch (e) {
      updateState({isLoading: false, error: e});
    }
  }, [state, updateState]);

  const onLoadMore = !loadMore ? null : (() => {
    updateState({isLoading: true, fetchFunction: loadMore});
  });

  const onSortChange = (desc: SortDescriptor) => {
    updateState({isLoading: true, fetchFunction: sort || load, sortDescriptor: desc});
  };

  let {fetchFunction, ...otherState} = state;
  useEffect(() => {
    if (state.isLoading) {
      fetchData(fetchFunction);
    }
  });

  return {
    ...otherState,
    onLoadMore,
    onSortChange
  };
}
