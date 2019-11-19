import {AsyncListOptions, AsyncListProps, SortDescriptor} from '@react-types/shared';
import {useEffect, useReducer} from 'react';

function reducer(state, {type, ...rest}) {
  switch (type) {
    case 'fetching':
    case 'sorting':
      return {...state, ...rest, isLoading: true};
    case 'error':
      return {...state, ...rest, isLoading: false};
    case 'success':
      return {...state, ...rest, isLoading: false};
    default: throw new Error();
  }
}

export function useAsyncList<T>(options: AsyncListOptions<T>): AsyncListProps<T> {
  const {load, loadMore, sort, defaultSortDescriptor} = options;

  let [state, dispatch] = useReducer(reducer, {
    error: null,
    isLoading: true,
    items: [] as Iterable<T>,
    sortDescriptor: defaultSortDescriptor || null,
    fetchFunction: load
  });

  const fetchData = async fn => {
    try {
      let response = await fn({...state});
      dispatch({type: 'success', ...response});
    } catch (e) {
      dispatch({type: 'error', error: e});
    }
  };

  const onLoadMore = !loadMore ? null : (() => {
    dispatch({type: 'fetching', fetchFunction: loadMore});
  });

  const onSortChange = (desc: SortDescriptor) => {
    dispatch({type: 'sorting', fetchFunction: sort || load, sortDescriptor: desc});
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
