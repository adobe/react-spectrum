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
import {useDrag} from './useDrag';
import {useMessageFormatter} from '@react-aria/i18n';

interface DraggableItemProps {
  key: Key
}

interface DraggableItemResult {
  dragProps: HTMLAttributes<HTMLElement>,
  dragButtonProps: AriaButtonProps
}

export function useDraggableItem(props: DraggableItemProps, state: DraggableCollectionState): DraggableItemResult {
  let formatMessage = useMessageFormatter(intlMessages);
  let {dragProps, dragButtonProps} = useDrag({
    getItems() {
      return state.getItems(props.key);
    },
    renderPreview() {
      return state.renderPreview(props.key);
    },
    onDragStart(e) {
      state.startDrag(props.key, e);
    },
    onDragMove(e) {
      state.moveDrag(e);
    },
    onDragEnd(e) {
      state.endDrag(e);
    }
  });

  let item = state.collection.getItem(props.key);
  let numSelectedKeys = state.selectionManager.selectedKeys.size;
  let isSelected = state.selectionManager.isSelected(props.key);
  let message: string;
  if (isSelected && numSelectedKeys > 1) {
    message = formatMessage('dragSelectedItems', {count: numSelectedKeys});
  } else {
    message = formatMessage('dragItem', {itemText: item?.textValue ?? ''});
  }

  return {
    dragProps,
    dragButtonProps: {
      ...dragButtonProps,
      'aria-label': message
    }
  };
}
