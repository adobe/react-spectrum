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

import * as DragManager from './DragManager';
import {DroppableCollectionState} from '@react-stately/dnd';
import {DropTarget} from '@react-types/shared';
import {getDroppableCollectionId} from './utils';
import {HTMLAttributes, Key, RefObject} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {useDroppableItem} from './useDroppableItem';
import {useId} from '@react-aria/utils';
import {useMessageFormatter} from '@react-aria/i18n';

interface DropIndicatorProps {
  target: DropTarget
}

interface DropIndicatorAria {
  dropIndicatorProps: HTMLAttributes<HTMLElement>
}

export function useDropIndicator(props: DropIndicatorProps, state: DroppableCollectionState, ref: RefObject<HTMLElement>): DropIndicatorAria {
  let {target} = props;
  let {collection} = state;

  let formatMessage = useMessageFormatter(intlMessages);
  let dragSession = DragManager.useDragSession();
  let {dropProps} = useDroppableItem(props, state, ref);
  let id = useId();
  let getText = (key: Key) => collection.getItem(key)?.textValue;

  let label = '';
  let labelledBy: string;
  if (target.type === 'root') {
    label = formatMessage('dropOnRoot');
    labelledBy = `${id} ${getDroppableCollectionId(state)}`;
  } else if (target.dropPosition === 'on') {
    label = formatMessage('dropOnItem', {
      itemText: getText(target.key)
    });
  } else {
    let before = target.dropPosition === 'before'
      ? collection.getKeyBefore(target.key)
      : target.key;
    let after = target.dropPosition === 'after'
      ? collection.getKeyAfter(target.key)
      : target.key;

    if (before && after) {
      label = formatMessage('insertBetween', {
        beforeItemText: getText(before),
        afterItemText: getText(after)
      });
    } else if (before) {
      label = formatMessage('insertAfter', {
        itemText: getText(before)
      });
    } else if (after) {
      label = formatMessage('insertBefore', {
        itemText: getText(after)
      });
    }
  }

  return {
    dropIndicatorProps: {
      ...dropProps,
      id,
      'aria-roledescription': formatMessage('dropIndicator'),
      'aria-label': label,
      'aria-labelledby': labelledBy,
      'aria-hidden': !dragSession ? 'true' : dropProps['aria-hidden'],
      tabIndex: -1
    }
  };
}
