/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {focusSafely, getFocusableTreeWalker} from '@react-aria/focus';
import {getRowId, listMap} from './utils';
import {HTMLAttributes, KeyboardEvent as ReactKeyboardEvent, RefObject} from 'react';
import {isFocusVisible} from '@react-aria/interactions';
import type {ListState} from '@react-stately/list';
import {mergeProps} from '@react-aria/utils';
import {Node as RSNode} from '@react-types/shared';
import {useLocale} from '@react-aria/i18n';
import {useSelectableItem} from '@react-aria/selection';

export interface AriaListItemOptions {
  /** An object representing the list item. Contains all the relevant information that makes up the list row. */
  node: RSNode<unknown>,
  /** Whether the list row is contained in a virtual scroller. */
  isVirtualized?: boolean,
  /** Whether selection should occur on press up instead of press down. */
  shouldSelectOnPressUp?: boolean
}

export interface ListItemAria {
  /** Props for the list row element. */
  rowProps: HTMLAttributes<HTMLElement>,
  /** Props for the grid cell element within the list row. */
  gridCellProps: HTMLAttributes<HTMLElement>,
  /** Whether the row is currently pressed. */
  isPressed: boolean
}

/**
 * Provides the behavior and accessibility implementation for a row in a list.
 * @param props - Props for the row.
 * @param state - State of the parent list, as returned by `useListState`.
 * @param ref - The ref attached to the row element.
 */
export function useListItem<T>(props: AriaListItemOptions, state: ListState<T>, ref: RefObject<HTMLElement>): ListItemAria {
  // Copied from useGridCell + some modifications to make it not so grid specific
  let {
    node,
    isVirtualized,
    shouldSelectOnPressUp
  } = props;

  let {direction} = useLocale();
  let {onAction} = listMap.get(state);
  let focus = () => {
    // Don't shift focus to the row if the active element is a element within the row already
    // (e.g. clicking on a row button)
    if (!ref.current.contains(document.activeElement)) {
      focusSafely(ref.current);
    }
  };

  let {itemProps, isPressed} = useSelectableItem({
    selectionManager: state.selectionManager,
    key: node.key,
    ref,
    isVirtualized,
    shouldSelectOnPressUp,
    onAction: onAction ? () => onAction(node.key) : undefined,
    focus
  });

  let onKeyDown = (e: ReactKeyboardEvent) => {
    if (!e.currentTarget.contains(e.target as HTMLElement)) {
      return;
    }

    let walker = getFocusableTreeWalker(ref.current);
    walker.currentNode = document.activeElement;

    switch (e.key) {
      case 'ArrowLeft': {
        // Find the next focusable element within the row.
        let focusable = direction === 'rtl'
          ? walker.nextNode() as HTMLElement
          : walker.previousNode() as HTMLElement;

        if (focusable) {
          e.preventDefault();
          e.stopPropagation();
          focusSafely(focusable);
        } else {
          // If there is no next focusable child, then return focus back to the row
          e.preventDefault();
          e.stopPropagation();
          if (direction === 'rtl') {
            focusSafely(ref.current);
          } else {
            walker.currentNode = ref.current;
            let lastElement = last(walker);
            if (lastElement) {
              focusSafely(lastElement);
            }
          }
        }
        break;
      }
      case 'ArrowRight': {
        let focusable = direction === 'rtl'
          ? walker.previousNode() as HTMLElement
          : walker.nextNode() as HTMLElement;

        if (focusable) {
          e.preventDefault();
          e.stopPropagation();
          focusSafely(focusable);
        } else {
          e.preventDefault();
          e.stopPropagation();
          if (direction === 'ltr') {
            focusSafely(ref.current);
          } else {
            walker.currentNode = ref.current;
            let lastElement = last(walker);
            if (lastElement) {
              focusSafely(lastElement);
            }
          }
        }
        break;
      }
      case 'ArrowUp':
      case 'ArrowDown':
        // Prevent this event from reaching row children, e.g. menu buttons. We want arrow keys to navigate
        // to the row above/below instead. We need to re-dispatch the event from a higher parent so it still
        // bubbles and gets handled by useSelectableCollection.
        if (!e.altKey && ref.current.contains(e.target as HTMLElement)) {
          e.stopPropagation();
          e.preventDefault();
          ref.current.parentElement.dispatchEvent(
            new KeyboardEvent(e.nativeEvent.type, e.nativeEvent)
          );
        }
        break;
    }
  };

  let onFocus = (e) => {
    if (e.target !== ref.current) {
      // useSelectableItem only handles setting the focused key when
      // the focused element is the row itself. We also want to
      // set the focused key when a child element receives focus.
      // If focus is currently visible (e.g. the user is navigating with the keyboard),
      // then skip this. We want to restore focus to the previously focused row
      // in that case since the list should act like a single tab stop.
      if (!isFocusVisible()) {
        state.selectionManager.setFocusedKey(node.key);
      }
      return;
    }
  };

  let rowProps: HTMLAttributes<HTMLElement> = mergeProps(itemProps, {
    role: 'row',
    onKeyDownCapture: onKeyDown,
    onFocus,
    'aria-label': node.textValue,
    'aria-selected': state.selectionManager.selectionMode !== 'none' ? state.selectionManager.isSelected(node.key) : undefined,
    id: getRowId(state, node.key)
  });

  if (isVirtualized) {
    rowProps['aria-rowindex'] = node.index + 1;
  }

  let gridCellProps = {
    role: 'gridcell',
    'aria-colindex': 1
  };

  return {
    rowProps,
    gridCellProps,
    isPressed
  };
}

function last(walker: TreeWalker) {
  let next: HTMLElement;
  let last: HTMLElement;
  do {
    last = walker.lastChild() as HTMLElement;
    if (last) {
      next = last;
    }
  } while (last);
  return next;
}
