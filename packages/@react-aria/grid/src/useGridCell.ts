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

import {DOMAttributes, FocusableElement, RefObject} from '@react-types/shared';
import {focusSafely, getFocusableTreeWalker} from '@react-aria/focus';
import {getCellId, gridMap} from './utils';
import {getScrollParent, mergeProps, scrollIntoViewport} from '@react-aria/utils';
import {GridCollection, GridNode} from '@react-types/grid';
import {GridState} from '@react-stately/grid';
import {isFocusVisible} from '@react-aria/interactions';
import {KeyboardEvent as ReactKeyboardEvent, useRef} from 'react';
import {SelectableItemStates, useSelectableItem} from '@react-aria/selection';
import {useLocale} from '@react-aria/i18n';

export interface GridCellProps {
  /** An object representing the grid cell. Contains all the relevant information that makes up the grid cell. */
  node: GridNode<unknown>,
  /** Whether the grid cell is contained in a virtual scroller. */
  isVirtualized?: boolean,
  /** Whether the cell or its first focusable child element should be focused when the grid cell is focused. */
  focusMode?: 'child' | 'cell',
  /**
   * Whether keyboard navigation to focusable elements within the grid cell is
   * via the left/right arrow keys or the tab key.
   * @default 'arrow'
   */
  keyboardNavigationBehavior?: 'arrow' | 'tab',
  /** Whether selection should occur on press up instead of press down. */
  shouldSelectOnPressUp?: boolean,
  /**
   * Handler that is called when a user performs an action on the cell.
   * Please use onCellAction at the collection level instead.
   * @deprecated
   **/
  onAction?: () => void
}

export interface GridCellAria extends SelectableItemStates {
  /** Props for the grid cell element. */
  gridCellProps: DOMAttributes,
  /** Whether the cell content is being edited. */
  isEditing: boolean,
  /** Whether the cell is disabled. */
  isDisabled: boolean,
  /** Whether the cell is read only. */
  isReadOnly: boolean
}

const INPUT_TYPES = new Set(['color', 'date', 'datetime', 'datetime-local', 'email', 'month', 'number', 'password', 'range', 'search', 'tel', 'text', 'time', 'url', 'week']);
const NAVIGATION_KEYS = new Set(['Home', 'End', 'PageUp', 'PageDown', 'ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown']);

/**
 * Provides the behavior and accessibility implementation for a cell in a grid.
 * @param props - Props for the cell.
 * @param state - State of the parent grid, as returned by `useGridState`.
 */
export function useGridCell<T, C extends GridCollection<T>>(props: GridCellProps, state: GridState<T, C>, ref: RefObject<FocusableElement | null>): GridCellAria {
  let {
    node,
    focusMode,
    isVirtualized,
    shouldSelectOnPressUp,
    onAction
  } = props;

  let {direction} = useLocale();
  let {id, keyboardDelegate, actions: {onCellAction}} = gridMap.get(state);

  let isEditing = state.selectionManager.editKey === node.key;
  let isEditable = state.selectionManager.canEditItem(node.key);
  let isReadOnly = state.selectionManager.isReadOnly(node.key);
  let isDisabled = state.selectionManager.isDisabled(node.key) || state.collection.size === 0;
  let isArrowKeyNavigation = state.selectionManager.keyboardNavigationBehavior === 'arrow';

  focusMode ??= isEditable || !isArrowKeyNavigation ? 'cell' : 'child';

  // We need to track the key of the item at the time it was last focused so that we force
  // focus to go to the item when the DOM node is reused for a different item in a virtualizer.
  let keyWhenFocused = useRef(null);

  // Handles focusing the cell. If there is a focusable child,
  // it is focused, otherwise the cell itself is focused.
  let focus = () => {
    let treeWalker = getFocusableTreeWalker(ref.current, {tabbable: true});
    if (focusMode === 'child') {
      // If focus is already on a focusable child within the cell, early return so we don't shift focus
      if (ref.current.contains(document.activeElement) && ref.current !== document.activeElement) {
        return;
      }

      let focusable = state.selectionManager.childFocusStrategy === 'last'
        ? last(treeWalker)
        : treeWalker.firstChild() as FocusableElement;
      if (focusable) {
        focusSafely(focusable);
        return;
      }
    }

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
    focus,
    shouldSelectOnPressUp,
    onAction: onCellAction ? () => onCellAction(node.key) : onAction,
    isDisabled: isDisabled || isEditable
  });

  let onKeyDown = (e: ReactKeyboardEvent) => {
    if (!e.currentTarget.contains(e.target as Element)) {
      return;
    }

    if (!isArrowKeyNavigation && ref.current !== e.target && (NAVIGATION_KEYS.has(e.key) || (e.altKey && e.key === 'Tab'))) {
      e.stopPropagation();
    }

    let walker = getFocusableTreeWalker(ref.current, {tabbable: true});
    walker.currentNode = e.target as FocusableElement;
    
    switch (e.key) {
      case 'ArrowLeft': {
        if (!isArrowKeyNavigation) {
          break;
        };

        // Find the next focusable element within the cell.
        let focusable = direction === 'rtl'
          ? walker.nextNode() as FocusableElement
          : walker.previousNode() as FocusableElement;

        let isCellFocusable = focusable === ref.current;

        // Don't focus the cell itself if focusMode is "child"
        if (focusMode === 'child' && isCellFocusable) {
          focusable = null;
        }

        e.preventDefault();
        e.stopPropagation();
        if ((focusable || isEditing) && !(isEditable && e.target === ref.current)) {
          let [, end] = wrap(walker);

          focusSafely(isCellFocusable && isEditing ? end : focusable);
          scrollIntoViewport(isCellFocusable && isEditing ? end : focusable, {containingElement: getScrollParent(ref.current)});
        } else {
          // If there is no next focusable child, then move to the next cell to the left of this one.
          // This will be handled by useSelectableCollection. However, if there is no cell to the left
          // of this one, only one column, and the grid doesn't focus rows, then the next key will be the
          // same as this one. In that case we need to handle focusing either the cell or the first/last
          // child, depending on the focus mode.
          let prev = keyboardDelegate.getKeyLeftOf(node.key);
          if (prev !== node.key) {
            // We prevent the capturing event from reaching children of the cell, e.g. pickers.
            // We want arrow keys to navigate to the next cell instead. We need to re-dispatch
            // the event from a higher parent so it still bubbles and gets handled by useSelectableCollection.
            ref.current.parentElement.dispatchEvent(
              new KeyboardEvent(e.nativeEvent.type, e.nativeEvent)
            );
            break;
          }

          if (focusMode === 'cell' && direction === 'rtl') {
            focusSafely(ref.current);
            scrollIntoViewport(ref.current, {containingElement: getScrollParent(ref.current)});
          } else {
            walker.currentNode = ref.current;
            focusable = direction === 'rtl'
              ? walker.firstChild() as FocusableElement
              : last(walker);
            if (focusable) {
              focusSafely(focusable);
              scrollIntoViewport(focusable, {containingElement: getScrollParent(ref.current)});
            }
          }
        }
        break;
      }
      case 'ArrowRight': {
        if (!isArrowKeyNavigation) {
          break;
        };

        let focusable = direction === 'rtl'
          ? walker.previousNode() as FocusableElement
          : walker.nextNode() as FocusableElement;

        if (focusMode === 'child' && focusable === ref.current) {
          focusable = null;
        }

        e.preventDefault();
        e.stopPropagation();
        if ((focusable || isEditing) && !(isEditable && e.target === ref.current)) {
          let [start] = wrap(walker);

          focusSafely(focusable ?? start);
          scrollIntoViewport(focusable ?? start, {containingElement: getScrollParent(ref.current)});
        } else {
          let next = keyboardDelegate.getKeyRightOf(node.key);
          if (next !== node.key) {
            // We prevent the capturing event from reaching children of the cell, e.g. pickers.
            // We want arrow keys to navigate to the next cell instead. We need to re-dispatch
            // the event from a higher parent so it still bubbles and gets handled by useSelectableCollection.
            ref.current.parentElement.dispatchEvent(
              new KeyboardEvent(e.nativeEvent.type, e.nativeEvent)
            );
            break;
          }

          if (focusMode === 'cell' && direction === 'ltr') {
            focusSafely(ref.current);
            scrollIntoViewport(ref.current, {containingElement: getScrollParent(ref.current)});
          } else {
            walker.currentNode = ref.current;
            focusable = direction === 'rtl'
              ? last(walker)
              : walker.firstChild() as FocusableElement;
            if (focusable) {
              focusSafely(focusable);
              scrollIntoViewport(focusable, {containingElement: getScrollParent(ref.current)});
            }
          }
        }
        break;
      }
      case 'ArrowUp':
      case 'ArrowDown': {
        // Prevent this event from reaching cell children, e.g. menu buttons. We want arrow keys to navigate
        // to the cell above/below instead. We need to re-dispatch the event from a higher parent so it still
        // bubbles and gets handled by useSelectableCollection.
        if (isArrowKeyNavigation && !e.altKey && ref.current.contains(e.target as Element)) {
          e.stopPropagation();
          e.preventDefault();

          let key = e.key === 'ArrowUp' ? 'ArrowLeft' : 'ArrowRight';
          let target = isEditing ? ref.current : ref.current.parentElement;
          
          target.dispatchEvent(new KeyboardEvent(e.nativeEvent.type, isEditing ? {...e.nativeEvent, key} : e.nativeEvent));
        }
        break;
      }
      case 'F2':
      case 'Enter': {
        if (isEditing && (isSingleLineTextInput(e.target as Element) || e.key === 'F2')) {
          focusSafely(ref.current);
          return;
        }

        if (isEditable) {
          let focusable = walker.nextNode() as FocusableElement;

          if (focusable && e.target === ref.current) {
            focusSafely(focusable);
          }
        }
        break;
      }
      case 'Escape': {
        if (isEditing || !isArrowKeyNavigation) {
          focusSafely(ref.current);
        }
        break;
      }
      case 'Tab': {
        if (isEditing || !isArrowKeyNavigation) {
          // If there is another focusable element within this item, stop propagation so the tab key
          // is handled by the browser and not by useSelectableCollection (which would take us out of the list).
          walker.currentNode = e.target as FocusableElement;
          let next = e.shiftKey ? walker.previousNode() : walker.nextNode();

          if (isEditing || next) {
            e.stopPropagation();
          }

          let [start, end] = wrap(walker);

          if (isEditing && ((e.target === end && !e.shiftKey) || (e.target === start && e.shiftKey))) {
            e.preventDefault();
            focusSafely(e.shiftKey ? end : start);
          }
        }
        break;
      }
      default: {
        if (!isReadOnly && e.target === ref.current && /^[a-zA-Z0-9]$/.test(e.key)) {
          let focusable = first(walker);

          if (focusable) {
            focusSafely(focusable);
          }
        }
        break;
      }
    }
  };

  let onBlur = (e) => {
    let comparedPosition = ref.current.compareDocumentPosition(e.relatedTarget ?? ref.current);
    let isFocusWithin = Boolean(comparedPosition & Node.DOCUMENT_POSITION_CONTAINED_BY);

    if (!isFocusWithin) {
      state.selectionManager.setEditKey(null);
    }

    if (isSingleLineTextInputCell(ref.current)) {
      state.selectionManager.enableKeyboardNavigation();
    }
  };

  // Grid cells can have focusable elements inside them. In this case, focus should
  // be marshalled to that element rather than focusing the cell itself.
  let onFocus = (e) => {
    keyWhenFocused.current = node.key;
    if (e.target !== ref.current) {
      // useSelectableItem only handles setting the focused key when
      // the focused element is the gridcell itself. We also want to
      // set the focused key when a child element receives focus.
      // If focus is currently visible (e.g. the user is navigating with the keyboard),
      // then skip this. We want to restore focus to the previously focused row/cell
      // in that case since the table should act like a single tab stop.
      if (!isFocusVisible()) {
        state.selectionManager.setFocusedKey(node.key);
      }

      if (isEditable && ref.current.contains(e.target)) {
        state.selectionManager.setEditKey(node.key);
      }

      if (isEditable && !isEditing && isSingleLineTextInputCell(ref.current)) {
        state.selectionManager.disableKeyboardNavigation();
      }

      return;
    }

    // If the cell itself is focused, wait a frame so that focus finishes propagatating
    // up to the tree, and move focus to a focusable child if possible.
    requestAnimationFrame(() => {
      if (e.relatedTarget && !isArrowKeyNavigation) {
        let ariaRole = e.relatedTarget.getAttribute('role');
        let comparedPosition = ref.current.compareDocumentPosition(e.relatedTarget);
  
        let isFocusWithin = Boolean(comparedPosition & Node.DOCUMENT_POSITION_CONTAINED_BY);
        let isShiftTab = isFocusVisible() && Boolean(comparedPosition & Node.DOCUMENT_POSITION_FOLLOWING);
        let isSibling = (ariaRole === 'gridcell' || ariaRole === 'rowheader' || ariaRole === 'columnheader') && e.relatedTarget.id.startsWith(id);
  
        if (isShiftTab && !isFocusWithin && !isSibling) {
          let walker = getFocusableTreeWalker(ref.current, {tabbable: true});
          let focusable = last(walker);
          
          if (focusable) {
            focusSafely(focusable);
          }
        }
      }
    });
  };

  // We need to prevent rows from receiving the bubbled select event when editable.
  // This flags select key and pointer events and attempts to catch them on their way up.
  let selectProps = {
    onKeyDown(e) {
      if (e.nativeEvent.shouldStopPropagation) {
        e.stopPropagation();
      }
    },
    onKeyDownCapture(e) {
      if (isEditable && (e.key === 'Enter' || e.key === 'Escape')) {
        e.nativeEvent.shouldStopPropagation = true;
      }
    },
    onPointerDown(e) {
      if (e.nativeEvent.shouldStopPropagation) {
        e.stopPropagation();
      }
    },
    onPointerDownCapture(e) {
      let comparedPosition = ref.current.compareDocumentPosition(e.target);
      let isTargetWithin = Boolean(comparedPosition & Node.DOCUMENT_POSITION_CONTAINED_BY);

      if (isEditable && isTargetWithin) {
        e.nativeEvent.shouldStopPropagation = true;
        focusSafely(e.target);
      }
    }
  };

  let gridCellProps: DOMAttributes = mergeProps(itemProps, selectProps, {
    role: 'gridcell',
    tabIndex: node.key === state.selectionManager.focusedKey && !isDisabled ? 0 : -1,
    onKeyDown: isArrowKeyNavigation ? undefined : onKeyDown,
    onKeyDownCapture: isArrowKeyNavigation ? onKeyDown : undefined,
    onBlur: isEditing ? onBlur : undefined,
    onFocus,
    // 'aria-label': node.textValue || undefined,
    // 'aria-selected': itemStates.allowsSelection ? itemStates.isSelected : undefined,
    'aria-readonly': isReadOnly || undefined,
    'aria-disabled': isDisabled || undefined,
    id: getCellId(state, node.parentKey, node.key)
  });

  if (isVirtualized) {
    gridCellProps['aria-colindex'] = (node.colIndex ?? node.index) + 1; // aria-colindex is 1-based
  }

  // When pressing with a pointer and cell selection is not enabled, usePress will be applied to the
  // row rather than the cell. However, when the row is draggable, usePress cannot preventDefault
  // on pointer down, so the browser will try to focus the cell which has a tabIndex applied.
  // To avoid this, remove the tabIndex from the cell briefly on pointer down.
  if (shouldSelectOnPressUp && gridCellProps.tabIndex != null && gridCellProps.onPointerDown == null) {
    gridCellProps.onPointerDown = (e) => {
      let el = e.currentTarget;
      let tabindex = el.getAttribute('tabindex');
      el.removeAttribute('tabindex');
      requestAnimationFrame(() => {
        el.setAttribute('tabindex', tabindex);
      });
    };
  }

  return {
    gridCellProps,
    ...itemStates,
    isEditing,
    isReadOnly,
    isDisabled
  };
}

function first(walker: TreeWalker) {
  let first = walker.nextNode() as FocusableElement;
  let next = first;

  while (next !== null && !isSingleLineTextInput(next)) {
    next = walker.nextNode() as FocusableElement;
  }
  return next;
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

function wrap(walker: TreeWalker) {
  walker.currentNode = walker.root;
  let start = walker.firstChild() as FocusableElement;
  walker.currentNode = walker.root;
  let end = last(walker);
  return [start, end];
}

function isSingleLineTextInput(element: Element) {
  let type = element.getAttribute('type');
  return element.tagName === 'INPUT' && type && INPUT_TYPES.has(type);
}

function isSingleLineTextInputCell(element: Element) {
  let walker = getFocusableTreeWalker(element, {tabbable: true});
  let node = walker.nextNode() as FocusableElement;
  if (!node || !isSingleLineTextInput(node)) {
    return false;
  }
  return walker.nextNode() === null;
}
