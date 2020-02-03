import {ButtonGroupCollection} from './';
import {ButtonGroupState, ButtonGroupStateBase} from './types';
import {MultipleSelection} from '@react-types/shared';
import React, {ReactElement, useMemo} from 'react';
import {SelectionManager, useMultipleSelectionState} from '@react-stately/selection';

export function useButtonGroupState(props: ButtonGroupStateBase & MultipleSelection): ButtonGroupState {
  let selectionState = useMultipleSelectionState(props);

  let buttonCollection = useMemo(() => {
    let childrenArray = React.Children.toArray(props.children) as ReactElement[];
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
