/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {getChildNodes} from '@react-stately/collections';
import {MenuItem} from './MenuItem';
import {Node, SelectionGroupProps} from '@react-types/shared';
import React, {Key, useEffect, useMemo} from 'react';
import {
  SelectionManager,
  useMultipleSelectionState
} from '@react-stately/selection';
import {TreeState} from '@react-stately/tree';

interface MenuSelectionGroupProps<T>
  extends SelectionGroupProps<T> {
  item: Node<T>,
  state: TreeState<T>,
  onAction?: (key: Key) => void
}

export function MenuSelectionGroup<T extends object>(
  props: MenuSelectionGroupProps<T>
) {
  const {item, state, onAction} = props;
  const {
    collection: tree,
    selectionManager: menuSelectionManager
  } = state;

  let selectionState = useMultipleSelectionState(props);

  const selectionManager = useMemo(
    () => new SelectionManager(tree, selectionState),
    [tree, selectionState]
  );

  const newState = {
    ...state,
    selectionManager
  };

  useEffect(() => {
    selectionManager.setFocused(menuSelectionManager.isFocused);
    selectionManager.setFocusedKey(menuSelectionManager.focusedKey);
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [menuSelectionManager.focusedKey, menuSelectionManager.isFocused]);

  return (
    <>
      {[...getChildNodes(item, newState.collection)].map((node) => {
        let item = (
          <MenuItem
            key={node.key}
            item={node}
            state={newState}
            onAction={onAction} />
        );

        if (node.wrapper) {
          item = node.wrapper(item);
        }

        return item;
      })}
    </>
  );
}
