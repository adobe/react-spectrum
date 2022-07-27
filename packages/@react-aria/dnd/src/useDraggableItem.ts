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

import {AriaButtonProps} from '@react-types/button';
import {DraggableCollectionState} from '@react-stately/dnd';
import {HTMLAttributes, Key} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {getDraggedCollection, getDroppedCollection, setDraggedCollection, setDroppedCollection} from './utils';
import {useDrag} from './useDrag';
import {useLocalizedStringFormatter} from '@react-aria/i18n';


export interface DraggableItemProps {
  key: Key
}

export interface DraggableItemResult {
  dragProps: HTMLAttributes<HTMLElement>,
  dragButtonProps: AriaButtonProps
}

export function useDraggableItem(props: DraggableItemProps, state: DraggableCollectionState): DraggableItemResult {
  let stringFormatter = useLocalizedStringFormatter(intlMessages);
  let {dragProps, dragButtonProps} = useDrag({
    getItems() {
      return state.getItems(props.key);
    },
    preview: state.preview,
    onDragStart(e) {
      console.log('in dragstart, dragged and dropped collection', getDraggedCollection(), getDroppedCollection());
      // TODO only need to set once, this will trigger on every single one
      setDraggedCollection(state.collection);
      state.startDrag(props.key, e);
    },
    onDragMove(e) {
      state.moveDrag(e);
    },
    onDragEnd(e) {
      console.log('in dragend, dragged and dropped collection', getDraggedCollection(), getDroppedCollection());
      console.log('is equal', getDraggedCollection() === getDroppedCollection())
      setDraggedCollection(null);
      state.endDrag(e);
      setDroppedCollection(null);
    }
  });

  let item = state.collection.getItem(props.key);
  let numKeysForDrag = state.getKeysForDrag(props.key).size;
  let isSelected = state.selectionManager.isSelected(props.key);
  let message: string;
  if (isSelected && numKeysForDrag > 1) {
    message = stringFormatter.format('dragSelectedItems', {count: numKeysForDrag});
  } else {
    message = stringFormatter.format('dragItem', {itemText: item?.textValue ?? ''});
  }

  return {
    dragProps,
    dragButtonProps: {
      ...dragButtonProps,
      'aria-label': message
    }
  };
}
