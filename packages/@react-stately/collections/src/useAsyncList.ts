import {AsyncListOptions, AsyncListProps} from '@react-types/shared';
import {useCallback, useEffect, useState} from 'react';

export function useAsyncList<T>(options: AsyncListOptions<T>): AsyncListProps<T> {
  const {load, loadMore, sort, defaultSortDescriptor} = options;

  let [state, setState] = useState({
    isLoading: true,
    items: [] as Iterable<T>,
    sortDescriptor: defaultSortDescriptor || null
  });

  const updateState = useCallback(
    (newState) => setState(prevState => ({...prevState, ...newState})),
    []
  );
  const fetchData = useCallback(async (fn: Function, additionalState?: object) => {
    updateState({isLoading: true});
    let response = await fn({...state});
    console.log('AFTER FETCHING -------> ', response);
    updateState({isLoading: false, items: response.items, ...additionalState});
  }, [state, updateState]);

  const onLoadMore = !loadMore ? null : (() => {
    fetchData(loadMore)
      .catch(() => updateState({isLoading: false, items: state.items}));
  });

  const onSortChange = (desc) => {
    fetchData(sort || load, {sortDescriptor: desc});
  };

  useEffect(() => {
    fetchData(load)
      .catch(() => updateState({isLoading: false, items: []})); // how to handle errors?
  }, []);

  return {
    ...state,
    onLoadMore,
    onSortChange
  };
}
