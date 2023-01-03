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

import {ChangeEvent, Key, RefObject, useCallback, useRef} from 'react';
import {ColumnSize} from '@react-types/table';
import {DOMAttributes, MoveEndEvent, MoveMoveEvent} from '@react-types/shared';
import {focusSafely} from '@react-aria/focus';
import {focusWithoutScrolling, mergeProps, useId} from '@react-aria/utils';
import {getColumnHeaderId} from './utils';
import {GridNode} from '@react-types/grid';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {TableState} from '@react-stately/table';
import {useKeyboard, useMove, usePress} from '@react-aria/interactions';
import {useLocale, useLocalizedStringFormatter} from '@react-aria/i18n';

export interface TableColumnResizeAria {
  inputProps: DOMAttributes,
  resizerProps: DOMAttributes
}

export interface AriaTableColumnResizeProps<T> {
  /** An object representing the [column header](https://www.w3.org/TR/wai-aria-1.1/#columnheader). Contains all the relevant information that makes up the column header. */
  column: GridNode<T>,
  /** Aria label for the hidden input. Gets read when resizing. */
  label: string,
  /**
   * Ref to the trigger if resizing was started from a column header menu. If it's provided,
   * focus will be returned there when resizing is done.
   * */
  triggerRef?: RefObject<HTMLDivElement>,
  /** If resizing is disabled. */
  isDisabled?: boolean,
  /** If the resizer was moved. Different from onResize because it is always called. */
  onMove?: (e: MoveMoveEvent) => void,
  /**
   * If the resizer was moved. Different from onResizeEnd because it is always called.
   * It also carries the interaction details in the object.
   * */
  onMoveEnd?: (e: MoveEndEvent) => void,
  /** Called when resizing starts. */
  onResizeStart?: (widths: Map<Key, number | string>) => void,
  /** Called for every resize event that results in new column sizes. */
  onResize?: (widths: Map<Key, number | string>) => void,
  /** Called when resizing ends. */
  onResizeEnd?: (widths: Map<Key, number | string>) => void
}


export interface TableLayoutState {
  /** Get the current width of the specified column. */
  getColumnWidth: (key: Key) => number,
  /** Get the current min width of the specified column. */
  getColumnMinWidth: (key: Key) => number,
  /** Get the current max width of the specified column. */
  getColumnMaxWidth: (key: Key) => number,
  /** Get the currently resizing column. */
  resizingColumn: Key,
  /** Called to update the state that resizing has started. */
  onColumnResizeStart: (key: Key) => void,
  /**
   * Called to update the state that a resize event has occurred.
   * Returns the new widths for all columns based on the resized column.
   **/
  onColumnResize: (column: Key, width: number) => Map<Key, ColumnSize>,
  /** Called to update the state that resizing has ended. */
  onColumnResizeEnd: (key: Key) => void
}

export function useTableColumnResize<T>(props: AriaTableColumnResizeProps<T>, state: TableState<T>, layoutState: TableLayoutState, ref: RefObject<HTMLInputElement>): TableColumnResizeAria {
  let {column: item, triggerRef, isDisabled, onResizeStart, onResize, onResizeEnd} = props;
  const stringFormatter = useLocalizedStringFormatter(intlMessages);
  let id = useId();
  let isResizing = useRef(false);
  let lastSize = useRef(null);

  let {direction} = useLocale();
  let {keyboardProps} = useKeyboard({
    onKeyDown: (e) => {
      if (triggerRef?.current && (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ' || e.key === 'Tab')) {
        e.preventDefault();
        // switch focus back to the column header on anything that ends edit mode
        focusSafely(triggerRef.current);
      }
    }
  });

  let startResize = useCallback((item) => {
    if (!isResizing.current) {
      lastSize.current = layoutState.onColumnResize(item.key, layoutState.getColumnWidth(item.key));
      layoutState.onColumnResizeStart(item.key);
      onResizeStart?.(lastSize.current);
    }
    isResizing.current = true;
  }, [isResizing, onResizeStart, layoutState]);

  let resize = useCallback((item, newWidth) => {
    let sizes = layoutState.onColumnResize(item.key, newWidth);
    onResize?.(sizes);
    lastSize.current = sizes;
  }, [onResize, layoutState]);

  let endResize = useCallback((item) => {
    if (lastSize.current == null) {
      lastSize.current = layoutState.onColumnResize(item.key, layoutState.getColumnWidth(item.key));
    }
    if (isResizing.current) {
      layoutState.onColumnResizeEnd(item.key);
      onResizeEnd?.(lastSize.current);
    }
    isResizing.current = false;
    lastSize.current = null;
  }, [isResizing, onResizeEnd, layoutState]);

  const columnResizeWidthRef = useRef<number>(0);
  const {moveProps} = useMove({
    onMoveStart() {
      columnResizeWidthRef.current = layoutState.getColumnWidth(item.key);
      startResize(item);
    },
    onMove(e) {
      let {deltaX, deltaY, pointerType} = e;
      if (direction === 'rtl') {
        deltaX *= -1;
      }
      if (pointerType === 'keyboard') {
        if (deltaY !== 0 && deltaX === 0) {
          deltaX = deltaY * -1;
        }
        deltaX *= 10;
      }
      props.onMove?.(e);
      // if moving up/down only, no need to resize
      if (deltaX !== 0) {
        columnResizeWidthRef.current += deltaX;
        resize(item, columnResizeWidthRef.current);
      }
    },
    onMoveEnd(e) {
      let {pointerType} = e;
      columnResizeWidthRef.current = 0;
      props.onMoveEnd?.(e);
      if (pointerType === 'mouse') {
        endResize(item);
      }
    }
  });

  let min = Math.floor(layoutState.getColumnMinWidth(item.key));
  let max = Math.floor(layoutState.getColumnMaxWidth(item.key));
  if (max === Infinity) {
    max = Number.MAX_SAFE_INTEGER;
  }
  let value = Math.floor(layoutState.getColumnWidth(item.key));
  let ariaProps = {
    'aria-label': props.label,
    'aria-orientation': 'horizontal' as 'horizontal',
    'aria-labelledby': `${id} ${getColumnHeaderId(state, item.key)}`,
    'aria-valuetext': stringFormatter.format('columnSize', {value}),
    min,
    max,
    value
  };

  const focusInput = useCallback(() => {
    if (ref.current) {
      focusWithoutScrolling(ref.current);
    }
  }, [ref]);

  let onChange = (e: ChangeEvent<HTMLInputElement>) => {
    let currentWidth = layoutState.getColumnWidth(item.key);
    let nextValue = parseFloat(e.target.value);

    if (nextValue > currentWidth) {
      nextValue = currentWidth + 10;
    } else {
      nextValue = currentWidth - 10;
    }
    props.onMove({pointerType: 'virtual'} as MoveMoveEvent);
    props.onMoveEnd({pointerType: 'virtual'} as MoveEndEvent);
    resize(item, nextValue);
  };

  let {pressProps} = usePress({
    onPressStart: (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey || e.pointerType === 'keyboard') {
        return;
      }
      if (e.pointerType === 'virtual' && layoutState.resizingColumn != null) {
        endResize(item);
        if (triggerRef?.current) {
          focusSafely(triggerRef.current);
        }
        return;
      }
      focusInput();
    },
    onPress: (e) => {
      if (e.pointerType === 'touch') {
        focusInput();
      } else if (e.pointerType !== 'virtual') {
        if (triggerRef?.current) {
          focusSafely(triggerRef.current);
        }
      }
    }
  });

  return {
    resizerProps: mergeProps(
      keyboardProps,
      moveProps,
      pressProps
    ),
    inputProps: mergeProps(
      {
        id,
        onFocus: () => {
          // useMove calls onMoveStart for every keypress, but we want resize start to only be called when we start resize mode
          // call instead during focus and blur
          startResize(item);
          state.setKeyboardNavigationDisabled(true);
        },
        onBlur: () => {
          endResize(item);
          state.setKeyboardNavigationDisabled(false);
        },
        onChange,
        disabled: isDisabled
      },
      ariaProps
    )
  };
}
