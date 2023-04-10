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
import {DropTarget, KeyboardDelegate} from '@react-types/shared';
import {getDroppableCollectionId} from './utils';
import {HTMLAttributes, Key, RefObject} from 'react';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {useDroppableItem} from './useDroppableItem';
import {useId} from '@react-aria/utils';
import {useLocalizedStringFormatter} from '@react-aria/i18n';

export interface DropIndicatorProps {
  /** The drop target that the drop indicator represents. */
  target: DropTarget,
  /** A delegate object that implements behavior for keyboard focus movement. */
  keyboardDelegate?: KeyboardDelegate
}

export interface DropIndicatorAria {
  /** Props for the drop indicator element. */
  dropIndicatorProps: HTMLAttributes<HTMLElement>,
  /** Whether the drop indicator is currently the active drop target. */
  isDropTarget: boolean,
  /**
   * Whether the drop indicator is hidden, both visually and from assistive technology.
   * Use this to determine whether to omit the element from the DOM entirely.
   */
  isHidden: boolean
}

/**
 * Handles drop interactions for a target within a droppable collection.
 */
export function useDropIndicator(props: DropIndicatorProps, state: DroppableCollectionState, ref: RefObject<HTMLElement>): DropIndicatorAria {
  let {target, keyboardDelegate} = props;
  let {collection} = state;

  let stringFormatter = useLocalizedStringFormatter(intlMessages);
  let dragSession = DragManager.useDragSession();
  let {dropProps} = useDroppableItem(props, state, ref);
  let id = useId();
  let getText = (key: Key) => collection.getTextValue?.(key) ?? collection.getItem(key)?.textValue;

  let label = '';
  let labelledBy: string;
  if (target.type === 'root') {
    label = stringFormatter.format('dropOnRoot');
    labelledBy = `${id} ${getDroppableCollectionId(state)}`;
  } else if (target.dropPosition === 'on') {
    label = stringFormatter.format('dropOnItem', {
      itemText: getText(target.key)
    });
  } else {
    let before: Key | null;
    let after: Key | null;
    // TODO: will I need the keyboard delegate if I change the section row not to be a item type
    // TODO: get opinions here, should we accept keyboard delegate here or modify the collection key getters
    // In general there is some disparity now where collection keygetters won't skip sections (and shouldn't since it isn't the keyboard delegate) but
    // the keyboardDelegate does (which it should since it handles where focus should go in response to keyboard navigation). However, there are various areas
    // where we use layout/keyboard delegate interchangably when they shouldn't. Or maybe they should? Perhaps layout/keyboard delegate getKeyAfter/Before should
    // reflect keyboard focus behavior and collection shouldn't (aka maybe I should modify table layout to have its own get keyafter/before instead of relying on listlayout )
    let keyGetter = keyboardDelegate ?? collection;

    // TODO: I've changed it so it will announce "insert after"/"insert before" target if the drop position is between the target and a following/preceeding section
    // instead of announcing "insert between target and NEXT/PREV_SECTION_ROW". Gather opinions
    let keyBefore = keyboardDelegate != null ? keyboardDelegate.getKeyAbove(target.key) : collection.getKeyBefore(target.key);
    if (target.dropPosition === 'before') {
      if (keyGetter.getFirstKey() === target.key || collection.getItem(keyBefore)?.parentKey !== collection.getItem(target.key)?.parentKey) {
        before = null;
      } else {
        before = keyBefore;
      }
    } else {
      before = target.key;
    }

    let keyAfter = keyboardDelegate != null ? keyboardDelegate.getKeyBelow(target.key) : collection.getKeyAfter(target.key);
    if (target.dropPosition === 'after') {
      if (keyGetter.getLastKey() === target.key || collection.getItem(keyAfter)?.parentKey !== collection.getItem(target.key)?.parentKey) {
        after = null;
      } else {
        after = keyAfter;
      }
    } else {
      after = target.key;
    }

    if (before && after) {
      label = stringFormatter.format('insertBetween', {
        beforeItemText: getText(before),
        afterItemText: getText(after)
      });
    } else if (before) {
      label = stringFormatter.format('insertAfter', {
        itemText: getText(before)
      });
    } else if (after) {
      label = stringFormatter.format('insertBefore', {
        itemText: getText(after)
      });
    }
  }

  let isDropTarget = state.isDropTarget(target);
  let ariaHidden = !dragSession ? 'true' : dropProps['aria-hidden'];
  return {
    dropIndicatorProps: {
      ...dropProps,
      id,
      'aria-roledescription': stringFormatter.format('dropIndicator'),
      'aria-label': label,
      'aria-labelledby': labelledBy,
      'aria-hidden': ariaHidden,
      tabIndex: -1
    },
    isDropTarget,
    // If aria-hidden, we are either not in a drag session or the drop target is invalid.
    // In that case, there's no need to render anything at all unless we need to show the indicator visually.
    // This can happen when dragging using the native DnD API as opposed to keyboard dragging.
    isHidden: !isDropTarget && !!ariaHidden
  };
}
