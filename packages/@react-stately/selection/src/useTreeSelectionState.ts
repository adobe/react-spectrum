import {Key} from '@react-types/shared';
import {MultipleSelectionStateProps, useMultipleSelectionState} from './useMultipleSelectionState';
import {TreeSelectionState} from './types';
import {useMemo} from 'react';

export interface TreeSelectionStateProps extends MultipleSelectionStateProps {
  indeterminateKeys?: Iterable<Key>
}

export function useTreeSelectionState(props: TreeSelectionStateProps): TreeSelectionState {
  const selectionState = useMultipleSelectionState(props);
  const indeterminateKeys = useMemo(() => (props.indeterminateKeys ? new Set(props.indeterminateKeys) : new Set<Key>()), [props.indeterminateKeys]);

  return useMemo(
    () =>
      Object.defineProperties(
        {
          indeterminateKeys
        },
        Object.getOwnPropertyDescriptors(selectionState)
      ) as TreeSelectionState,
    [indeterminateKeys, selectionState]
  );
}
