/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {ActionGroupCollection} from './';
import {ActionGroupState, ActionGroupStateBase} from './types';
import {MultipleSelection} from '@react-types/shared';
import React, {useMemo} from 'react';
import {SelectionManager, useMultipleSelectionState} from '@react-stately/selection';

export function useActionGroupState(props: ActionGroupStateBase & MultipleSelection): ActionGroupState {
  let selectionState = useMultipleSelectionState(props);

  let collection = useMemo(() => {
    let childrenArray = React.Children.toArray(props.children);
    childrenArray = childrenArray.map(child => React.cloneElement(child, {
      isSelected: selectionState.selectedKeys.has(child.key)
    }));

    return new ActionGroupCollection(childrenArray);

  }, [props, selectionState.selectedKeys]);

  return {
    collection,
    selectionManager: new SelectionManager(collection, selectionState)
  };
}
