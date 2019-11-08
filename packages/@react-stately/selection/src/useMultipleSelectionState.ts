import {MultipleSelection} from '@react-types/shared';
import {MultipleSelectionState} from './types';
import {Selection} from './Selection';
import {useControlledState} from '@react-stately/utils';
import {useState} from 'react';

export function useMultipleSelectionState(props: MultipleSelection): MultipleSelectionState  {
  let [focusedKey, setFocusedKey] = useState(null);
  let [selectedKeys, setSelectedKeys] = useControlledState(
    props.selectedKeys ? new Selection(props.selectedKeys) : undefined,
    props.defaultSelectedKeys ? new Selection(props.defaultSelectedKeys) : new Selection(),
    props.onSelectionChange
  );

  return {
    selectionMode: props.selectionMode || 'multiple',
    focusedKey,
    setFocusedKey,
    selectedKeys,
    setSelectedKeys
  };
}
