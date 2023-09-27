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

import {DOMAttributes, FocusableElement, Node as RSNode} from '@react-types/shared';
import {focusSafely, getFocusableTreeWalker} from '@react-aria/focus';
import {getRowId, listMap} from './utils';
import {getScrollParent, getSyntheticLinkProps, mergeProps, scrollIntoViewport, useSlotId} from '@react-aria/utils';
import {isFocusVisible} from '@react-aria/interactions';
import type {ListState} from '@react-stately/list';
import {KeyboardEvent as ReactKeyboardEvent, RefObject, useRef} from 'react';
import {SelectableItemStates, useSelectableItem} from '@react-aria/selection';
import {useLocale} from '@react-aria/i18n';

export interface AriaGridListItemOptions {
  /** An object representing the list item. Contains all the relevant information that makes up the list row. */
  node: RSNode<unknown>,
  /** Whether the list row is contained in a virtual scroller. */
  isVirtualized?: boolean,
  /** Whether selection should occur on press up instead of press down. */
  shouldSelectOnPressUp?: boolean
}

export interface GridListItemAria extends SelectableItemStates {
  /** Props for the list row element. */
  rowProps: DOMAttributes,
  /** Props for the grid cell element within the list row. */
  gridCellProps: DOMAttributes,
  /** Props for the list item description element, if any. */
  descriptionProps: DOMAttributes
}

/**
 * Provides the behavior and accessibility implementation for a row in a grid list.
 * @param props - Props for the row.
 * @param state - State of the parent list, as returned by `useListState`.
 * @param ref - The ref attached to the row element.
 */
export function useGridListItem<T>(props: AriaGridListItemOptions, state: ListState<T>, ref: RefObject<FocusableElement>): GridListItemAria {
  // Copied from useGridCell + some modifications to make it not so grid specific
  let {
    node,
    isVirtualized,
    shouldSelectOnPressUp
  } = props;

  let {direction} = useLocale();
  let {onAction, linkBehavior} = listMap.get(state);
  let descriptionId = useSlotId();

  // We need to track the key of the item at the time it was last focused so that we force
  // focus to go to the item when the DOM node is reused for a different item in a virtualizer.
  let keyWhenFocused = useRef(null);
  let focus = () => {
    // Don't shift focus to the row if the active element is a element within the row already
    // (e.g. clicking on a row button)
    if (
      (keyWhenFocused.current != null && node.key !== keyWhenFocused.current) ||
      !ref.current.contains(document.activeElement)
    ) {
      focusSafely(ref.current);
    }
  };

  let {itemProps, ...itemStates} = useSelectableItem({
    selectionManager: state.selectionManager,
    key: node.key,
    ref,
    isVirtualized,
    shouldSelectOnPressUp,
    onAction: onAction ? () => onAction(node.key) : undefined,
    focus,
    linkBehavior
  });

  let onKeyDown = (e: ReactKeyboardEvent) => {
    if (!e.currentTarget.contains(e.target as Element)) {
      return;
    }

    let walker = getFocusableTreeWalker(ref.current);
    walker.currentNode = document.activeElement;

    switch (e.key) {
      case 'ArrowLeft': {
        // Find the next focusable element within the row.
        let focusable = direction === 'rtl'
          ? walker.nextNode() as FocusableElement
          : walker.previousNode() as FocusableElement;

        if (focusable) {
          e.preventDefault();
          e.stopPropagation();
          focusSafely(focusable);
          scrollIntoViewport(focusable, {containingElement: getScrollParent(ref.current)});
        } else {
          // If there is no next focusable child, then return focus back to the row
          e.preventDefault();
          e.stopPropagation();
          if (direction === 'rtl') {
            focusSafely(ref.current);
            scrollIntoViewport(ref.current, {containingElement: getScrollParent(ref.current)});
          } else {
            walker.currentNode = ref.current;
            let lastElement = last(walker);
            if (lastElement) {
              focusSafely(lastElement);
              scrollIntoViewport(lastElement, {containingElement: getScrollParent(ref.current)});
            }
          }
        }
        break;
      }
      case 'ArrowRight': {
        let focusable = direction === 'rtl'
          ? walker.previousNode() as FocusableElement
          : walker.nextNode() as FocusableElement;

        if (focusable) {
          e.preventDefault();
          e.stopPropagation();
          focusSafely(focusable);
          scrollIntoViewport(focusable, {containingElement: getScrollParent(ref.current)});
        } else {
          e.preventDefault();
          e.stopPropagation();
          if (direction === 'ltr') {
            focusSafely(ref.current);
            scrollIntoViewport(ref.current, {containingElement: getScrollParent(ref.current)});
          } else {
            walker.currentNode = ref.current;
            let lastElement = last(walker);
            if (lastElement) {
              focusSafely(lastElement);
              scrollIntoViewport(lastElement, {containingElement: getScrollParent(ref.current)});
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
        if (!e.altKey && ref.current.contains(e.target as Element)) {
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
    keyWhenFocused.current = node.key;
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

  let linkProps = itemStates.hasAction ? getSyntheticLinkProps(node.props) : {};
  let rowProps: DOMAttributes = mergeProps(itemProps, linkProps, {
    role: 'row',
    onKeyDownCapture: onKeyDown,
    onFocus,
    'aria-label': node.textValue || undefined,
    'aria-selected': state.selectionManager.canSelectItem(node.key) ? state.selectionManager.isSelected(node.key) : undefined,
    'aria-disabled': state.selectionManager.isDisabled(node.key) || undefined,
    'aria-labelledby': descriptionId && node.textValue ? `${getRowId(state, node.key)} ${descriptionId}` : undefined,
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
    descriptionProps: {
      id: descriptionId
    },
    ...itemStates
  };
}

function last(walker: TreeWalker) {
  let next: FocusableElement;
  let last: FocusableElement;
  do {
    last = walker.lastChild() as FocusableElement;
    if (last) {
      next = last;
    }
  } while (last);
  return next;
}
