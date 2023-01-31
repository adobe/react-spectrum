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
import {DOMAttributes} from '@react-types/shared';
import {focusSafely} from '@react-aria/focus';
import {focusWithoutScrolling, mergeProps, useId} from '@react-aria/utils';
import {getColumnHeaderId} from './utils';
import {GridNode} from '@react-types/grid';
// @ts-ignore
import intlMessages from '../intl/*.json';
import {TableColumnResizeState} from '@react-stately/table';
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
  /** Called when resizing starts. */
  onResizeStart?: (widths: Map<Key, number | string>) => void,
  /** Called for every resize event that results in new column sizes. */
  onResize?: (widths: Map<Key, number | string>) => void,
  /** Called when resizing ends. */
  onResizeEnd?: (widths: Map<Key, number | string>) => void
}

export interface AriaTableColumnResizeState<T> extends Omit<TableColumnResizeState<T>, 'widths'> {}

export function useTableColumnResize<T>(props: AriaTableColumnResizeProps<T>, state: AriaTableColumnResizeState<T>, ref: RefObject<HTMLInputElement>): TableColumnResizeAria {
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
      lastSize.current = state.onColumnResize(item.key, state.getColumnWidth(item.key));
      state.onColumnResizeStart(item.key);
      onResizeStart?.(lastSize.current);
    }
    isResizing.current = true;
  }, [isResizing, onResizeStart, state]);

  let resize = useCallback((item, newWidth) => {
    let sizes = state.onColumnResize(item.key, newWidth);
    onResize?.(sizes);
    lastSize.current = sizes;
  }, [onResize, state]);

  let endResize = useCallback((item) => {
    if (lastSize.current == null) {
      lastSize.current = state.onColumnResize(item.key, state.getColumnWidth(item.key));
    }
    if (isResizing.current) {
      state.onColumnResizeEnd();
      onResizeEnd?.(lastSize.current);
    }
    isResizing.current = false;
    lastSize.current = null;
  }, [isResizing, onResizeEnd, state]);

  const columnResizeWidthRef = useRef<number>(0);
  const {moveProps} = useMove({
    onMoveStart() {
      columnResizeWidthRef.current = state.getColumnWidth(item.key);
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
      // if moving up/down only, no need to resize
      if (deltaX !== 0) {
        columnResizeWidthRef.current += deltaX;
        resize(item, columnResizeWidthRef.current);
      }
    },
    onMoveEnd(e) {
      let {pointerType} = e;
      columnResizeWidthRef.current = 0;
      if (pointerType === 'mouse') {
        endResize(item);
      }
    }
  });

  let min = Math.floor(state.getColumnMinWidth(item.key));
  let max = Math.floor(state.getColumnMaxWidth(item.key));
  if (max === Infinity) {
    max = Number.MAX_SAFE_INTEGER;
  }
  let value = Math.floor(state.getColumnWidth(item.key));
  let ariaProps = {
    'aria-label': props.label,
    'aria-orientation': 'horizontal' as 'horizontal',
    'aria-labelledby': `${id} ${getColumnHeaderId(state.tableState, item.key)}`,
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
    let currentWidth = state.getColumnWidth(item.key);
    let nextValue = parseFloat(e.target.value);

    if (nextValue > currentWidth) {
      nextValue = currentWidth + 10;
    } else {
      nextValue = currentWidth - 10;
    }
    resize(item, nextValue);
  };

  let {pressProps} = usePress({
    onPressStart: (e) => {
      if (e.ctrlKey || e.altKey || e.metaKey || e.shiftKey || e.pointerType === 'keyboard') {
        return;
      }
      if (e.pointerType === 'virtual' && state.resizingColumn != null) {
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
          state.tableState.setKeyboardNavigationDisabled(true);
        },
        onBlur: () => {
          endResize(item);
          state.tableState.setKeyboardNavigationDisabled(false);
        },
        onChange,
        disabled: isDisabled
      },
      ariaProps
    )
  };
}
