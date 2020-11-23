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

import {Collection, Node} from '@react-types/shared';
import * as DragManager from './DragManager';
import {DroppableCollectionState} from '@react-stately/dnd';
import {DropTarget} from '@react-types/shared';
import {HTMLAttributes, Key, RefObject, useEffect} from 'react';
import {useDroppableItem} from './useDroppableItem';

interface InsertionIndicatorProps {
  collection: Collection<Node<unknown>>,
  target: DropTarget
}

interface InsertionIndicatorAria {
  insertionIndicatorProps: HTMLAttributes<HTMLElement>
}

export function useInsertionIndicator(props: InsertionIndicatorProps, state: DroppableCollectionState, ref: RefObject<HTMLElement>): InsertionIndicatorAria {
  let {collection, target} = props;

  let dragSession = DragManager.useDragSession();
  let {dropProps} = useDroppableItem(props, state, ref);

  let before = target.dropPosition === 'before'
    ? collection.getKeyBefore(target.key)
    : target.key;
  let after = target.dropPosition === 'after'
    ? collection.getKeyAfter(target.key)
    : target.key;

  let getText = (key: Key) => collection.getItem(key)?.textValue;
  let label = '';
  if (before && after) {
    label = `Insert between ${getText(before)} and ${getText(after)}`;
  } else if (before) {
    label = `Insert after ${getText(before)}`;
  } else if (after) {
    label = `Insert before ${getText(after)}`;
  }

  return {
    insertionIndicatorProps: {
      ...dropProps,
      'aria-roledescription': 'insertion indicator',
      'aria-label': label,
      'aria-hidden': !dragSession ? 'true' : dropProps['aria-hidden'],
      tabIndex: -1
    }
  };
}
