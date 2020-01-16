import {ButtonGroupCollection} from './';
import {ButtonGroupStateBase} from './types';
import {MultipleSelection} from '@react-types/shared';
import React, {ReactElement, useMemo} from 'react';
import {SelectionManager, useMultipleSelectionState} from '@react-stately/selection';

export interface ButtonGroupState {
  buttonCollection: ButtonGroupCollection<ReactElement>,
  selectionManager: SelectionManager
}

export function useButtonGroupState(props: ButtonGroupStateBase & MultipleSelection): ButtonGroupState {
  let selectionState = useMultipleSelectionState(props);

  let buttonCollection = useMemo(() => {
    let childrenArray = React.Children.toArray(props.children);
    childrenArray = childrenArray.map(child => React.cloneElement(child, {
      isSelected: selectionState.selectedKeys.has(child.key)
    }));

    return new ButtonGroupCollection(childrenArray);

  }, [props, selectionState.selectedKeys]);

  return {
    buttonCollection,
    selectionManager: new SelectionManager(buttonCollection, selectionState)
  };
}
