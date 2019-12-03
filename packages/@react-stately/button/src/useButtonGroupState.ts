import {ButtonGroupStateBase, GroupNode} from './types';
import {GroupCollection} from './';
import {MultipleSelection} from '@react-types/shared';
import React from 'react';
import {SelectionManager, useMultipleSelectionState} from '@react-stately/selection';

export interface GroupState {
  buttonCollection: GroupCollection,
  selectionManager: SelectionManager
}

export function useButtonGroupState(props: ButtonGroupStateBase & MultipleSelection): GroupState {
  let selectionState = useMultipleSelectionState(props);

  let childrenaray = React.Children.toArray(props.children);
  let nodes = childrenaray.map(child => {
    let node: GroupNode = {
      isSelected: selectionState.selectedKeys.has(child.key),
      isFocused: child.key === selectionState.focusedKey,
      key: child.key,
      value: child
    };
    return node;
  });

  let buttonCollection = new GroupCollection(nodes);

  return {
    buttonCollection,
    selectionManager: new SelectionManager(buttonCollection, selectionState)
  };
}
